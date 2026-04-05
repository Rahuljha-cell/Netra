import cron from 'node-cron';
import { QUERY_GROUPS, getQueriesForCycle } from './searchQueries';
import { fetchGoogleNews, RawArticle } from './googleNewsFetcher';
import { fetchGDELT } from './gdeltFetcher';
import { fetchDirectRssFeeds } from './directRssFetcher';
import { scrapeArticlePage } from './articleScraper';
import { resolveImage } from './imageResolver';
import { isDuplicate, hashUrl, hashTitle } from './deduplicator';
import { geocodeLocation, extractLocationFromText } from './geocoder';
import { aiService } from '../aiService';
import { classifyIncident } from './classifier';
import Incident from '../../models/Incident';
import { getIO } from '../../config/socket';
import { scraperLogger as log } from './logger';

let cycleIndex = 0;
let isRunning = false;
let lastRunAt: Date | null = null;
let lastRunStats = { total: 0, new: 0, duplicates: 0, errors: 0 };

const CONCURRENCY_LIMIT = 5;

// Filter out non-safety articles that match keywords by coincidence
const JUNK_PATTERNS = [
  /stock market|sensex|nifty|BSE|NSE|share price|mutual fund|portfolio|investor/i,
  /bear attack.*market|bear.*stock|bull.*bear.*market|bear.*rally|bearish/i,
  /lone.?wolf.*terror|lone.?wolf.*ISIS|lone.?wolf.*threat|lone.?wolf.*plot|lone.?wolf.*attack(?!.*animal)/i,
  /cricket|world cup|IPL|T20|football|sports|match|tournament/i,
  /film|movie|series|trailer|review|box office|bollywood|netflix|OTT|web series/i,
  /AI.?generated|fake video|deepfake|fact.?check|hoax|viral video/i,
  /opinion|editorial|column|analysis.*market|forecast|prediction.*market/i,
  /Japan|China|Pakistan|USA|UK|Australia|Thailand|Alaska|Korea|Taiwan|Indonesia|Sri Lanka/i,
  /Harvard|MIT|Stanford|university.*course|online course|free course/i,
  /Instagram|TikTok|YouTube|social media trend|selfie/i,
  /shades of|colour|color palette|fashion|lifestyle|recipe/i,
  /Amaranth|coral|art|painting|sculpture|museum|gallery/i,
];

function isJunkArticle(title: string): boolean {
  return JUNK_PATTERNS.some(pattern => pattern.test(title));
}

async function processArticle(article: RawArticle): Promise<boolean> {
  try {
    // Filter junk articles (stock market, politics, international, entertainment)
    if (isJunkArticle(article.title)) {
      return false;
    }

    // Check duplicate
    if (await isDuplicate(article.link, article.title)) {
      return false;
    }

    // Scrape article page for og:image and full text
    const scraped = await scrapeArticlePage(article.link, article.sourceName);

    // Classification: AI service (Python ML model) → smart keyword fallback
    const fullText = `${article.title}. ${article.description}`;
    let category = article.category;
    let subCategory = article.subCategory;
    let severity: string = 'medium';
    let aiConfidence = 0.5;

    try {
      const aiResult = await aiService.classifyText(fullText.slice(0, 500)) as any;
      if (aiResult && aiResult.category && aiResult.category !== 'junk') {
        category = aiResult.category;
        subCategory = aiResult.subCategory || article.subCategory;
        severity = aiResult.severity || 'medium';
        aiConfidence = aiResult.confidence || 0.7;
      } else if (aiResult?.isJunk || aiResult?.category === 'junk') {
        // AI says it's junk — skip
        return false;
      }
    } catch {
      // AI service not running — use keyword classifier as fallback
      const classified = classifyIncident(article.title, article.description);
      if (classified) {
        category = classified.category;
        subCategory = classified.subCategory;
        severity = classified.severity;
        aiConfidence = classified.confidence;
      }
    }

    // Extract and geocode location — try multiple candidates
    const locationCandidates = [
      ...extractLocationFromText(article.title),
      ...scraped.locationHints,
      ...extractLocationFromText(fullText),
    ];

    // Remove duplicates
    const uniqueCandidates = [...new Set(locationCandidates)];

    let location = null;
    for (const candidate of uniqueCandidates) {
      location = await geocodeLocation(candidate);
      if (location) break;
    }

    if (!location) {
      log.debug(`Skipping article (no location found from ${uniqueCandidates.length} candidates): ${article.title.slice(0, 60)}`);
      return false;
    }

    // Resolve best image (passes city, state, title for smart fallback)
    const image = await resolveImage(
      scraped.ogImage,
      article.thumbnailUrl,
      undefined,
      category,
      location.city,
      location.state,
      article.title
    );

    // Create incident
    const incident = new Incident({
      title: article.title,
      description: (article.description || article.title).slice(0, 2000),
      category,
      subCategory,
      specificType: article.specificTypes?.[0],
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
      address: {
        city: location.city,
        state: location.state,
        area: location.area,
      },
      severity,
      source: 'news',
      sourceUrl: article.link,
      sourceName: article.sourceName,
      sourcePublishedAt: new Date(article.pubDate),
      imageUrl: image.imageUrl,
      imageThumbnail: image.imageThumbnail,
      imageSource: image.imageSource,
      urlHash: hashUrl(article.link),
      titleHash: hashTitle(article.title),
      aiConfidence,
      status: 'verified',
      riskScore: severity === 'critical' ? 80 : severity === 'high' ? 60 : severity === 'medium' ? 40 : 20,
    });

    await incident.save();

    // Broadcast via Socket.IO
    try {
      const io = getIO();
      io.emit('incident:new', {
        id: incident._id,
        title: incident.title,
        category: incident.category,
        subCategory: incident.subCategory,
        severity: incident.severity,
        location: incident.location,
        imageUrl: incident.imageUrl,
        imageThumbnail: incident.imageThumbnail,
        sourceName: incident.sourceName,
        source: incident.source,
      });
    } catch {
      // Socket not initialized
    }

    log.info(`New incident: ${article.title}`, {
      category,
      subCategory: article.subCategory,
      city: location.city,
      source: article.sourceName,
    });

    return true;
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key (urlHash) — expected race condition
      return false;
    }
    log.error(`Failed to process article: ${article.title}`, { error: error.message });
    return false;
  }
}

async function runScrapeCycle(): Promise<void> {
  if (isRunning) {
    log.warn('Skipping cycle — previous still running');
    return;
  }

  isRunning = true;
  const startTime = Date.now();
  const stats = { total: 0, new: 0, duplicates: 0, errors: 0 };

  try {
    const groups = getQueriesForCycle(cycleIndex);
    log.info(`Starting scraper cycle ${cycleIndex}`, {
      groups: groups.map(g => g.name),
    });

    // Collect articles from multiple sources in parallel
    const allArticles: RawArticle[] = [];

    // Source 1: Direct RSS feeds from Indian news sites (NDTV, TOI, HT, IE etc.)
    // These provide images directly — best quality
    try {
      const directArticles = await fetchDirectRssFeeds();
      allArticles.push(...directArticles);
      log.info(`Direct RSS: ${directArticles.length} safety articles from Indian news feeds`);
    } catch (err) {
      log.error('Direct RSS fetch failed', { error: err });
    }

    // Source 2: Google News keyword search (broader coverage, no images)
    for (const group of groups) {
      const fetchPromises = group.queries.map(async (query) => {
        const [googleResults, gdeltResults] = await Promise.all([
          fetchGoogleNews(query.term, group.category, query.subCategory, query.specificTypes),
          fetchGDELT(query.term, group.category, query.subCategory, query.specificTypes),
        ]);
        return [...googleResults, ...gdeltResults];
      });

      const results = await Promise.all(fetchPromises);
      results.forEach(r => allArticles.push(...r));

      await new Promise(r => setTimeout(r, 1000));
    }

    stats.total = allArticles.length;
    log.info(`Fetched ${allArticles.length} articles`);

    // Process articles with concurrency limit
    for (let i = 0; i < allArticles.length; i += CONCURRENCY_LIMIT) {
      const batch = allArticles.slice(i, i + CONCURRENCY_LIMIT);
      const results = await Promise.allSettled(batch.map(processArticle));

      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (result.value) stats.new++;
          else stats.duplicates++;
        } else {
          stats.errors++;
        }
      }
    }

    cycleIndex++;
    lastRunAt = new Date();
    lastRunStats = stats;

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log.info(`Cycle ${cycleIndex - 1} complete in ${elapsed}s`, stats);
  } catch (error) {
    log.error('Scraper cycle failed', { error });
  } finally {
    isRunning = false;
  }
}

async function runFullSweep(): Promise<void> {
  log.info('Starting full sweep — ALL query groups');
  for (let i = 0; i < QUERY_GROUPS.length; i++) {
    cycleIndex = i;
    await runScrapeCycle();
    // Small delay between groups to avoid rate limiting
    await new Promise(r => setTimeout(r, 3000));
  }
  log.info('Full sweep complete');
}

export function startScraper(): void {
  log.info('Starting Netra news scraper', {
    totalQueryGroups: QUERY_GROUPS.length,
    totalQueries: QUERY_GROUPS.reduce((sum, g) => sum + g.queries.length, 0),
    schedule: 'every 15 minutes',
  });

  // On startup: run ALL query groups (animals, crime, women safety, accidents, environmental — everything)
  runFullSweep();

  // Schedule rotating cycles every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    runScrapeCycle();
  });

  // Full sweep every 6 hours
  cron.schedule('0 */6 * * *', () => {
    runFullSweep();
  });
}

export function getScraperStatus() {
  return {
    isRunning,
    lastRunAt,
    lastRunStats,
    currentCycleIndex: cycleIndex,
    totalQueryGroups: QUERY_GROUPS.length,
  };
}

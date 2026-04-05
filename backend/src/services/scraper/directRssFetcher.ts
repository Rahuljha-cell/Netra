import Parser from 'rss-parser';
import { RawArticle } from './googleNewsFetcher';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
      ['content:encoded', 'contentEncoded'],
    ],
  },
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; Netra-SafetyBot/1.0)',
  },
});

// Indian news RSS feeds that include images directly
const DIRECT_RSS_FEEDS = [
  // NDTV — has media:content with images
  { name: 'NDTV', url: 'https://feeds.feedburner.com/ndtvnews-india-news', categories: ['all'] },
  { name: 'NDTV Cities', url: 'https://feeds.feedburner.com/ndtvnews-cities-news', categories: ['all'] },

  // Times of India — has enclosure images
  { name: 'TOI India', url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', categories: ['all'] },
  { name: 'TOI City', url: 'https://timesofindia.indiatimes.com/rssfeeds/913168846.cms', categories: ['all'] },

  // Hindustan Times
  { name: 'HT India', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', categories: ['all'] },
  { name: 'HT Cities', url: 'https://www.hindustantimes.com/feeds/rss/cities/rssfeed.xml', categories: ['all'] },

  // Indian Express
  { name: 'Indian Express', url: 'https://indianexpress.com/section/india/feed/', categories: ['all'] },
  { name: 'IE Cities', url: 'https://indianexpress.com/section/cities/feed/', categories: ['all'] },

  // The Hindu
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss', categories: ['all'] },

  // Deccan Herald
  { name: 'Deccan Herald', url: 'https://www.deccanherald.com/rss/india.rss', categories: ['all'] },

  // India Today
  { name: 'India Today', url: 'https://www.indiatoday.in/rss/home', categories: ['all'] },

  // Scroll.in
  { name: 'Scroll', url: 'https://scroll.in/rss/feed', categories: ['all'] },
];

// Safety-related keywords — balanced between coverage and accuracy
const SAFETY_KEYWORDS = [
  // Animals
  'leopard', 'tiger', 'bear', 'snake', 'cobra', 'python', 'viper', 'krait',
  'crocodile', 'elephant', 'monkey', 'stray dog', 'dog bite', 'dog attack',
  'wild boar', 'wolf', 'animal attack', 'mauled', 'wildlife',
  // Crime
  'murder', 'robbery', 'theft', 'snatching', 'assault', 'stabbed', 'shot dead',
  'kidnapped', 'abducted', 'loot', 'burglary', 'carjacking', 'dacoity', 'arrested',
  // Women safety
  'molested', 'molestation', 'eve teasing', 'stalking', 'acid attack',
  'domestic violence', 'dowry', 'sexual assault', 'gang rape', 'rape',
  'woman attacked', 'girl attacked', 'harassment',
  // Accidents
  'accident', 'crash', 'collision', 'hit and run', 'overturns', 'derail',
  'pothole', 'drunk driving', 'pile-up', 'electrocuted', 'drowned',
  'building collapse', 'bridge collapse', 'wall collapse',
  // Environmental
  'flood', 'cyclone', 'earthquake', 'landslide', 'fire', 'blaze',
  'heatwave', 'heat stroke', 'gas leak', 'chemical leak', 'lightning',
  'storm', 'tornado', 'cloudburst',
  // Personal safety
  'missing', 'mob lynching', 'mob attack', 'communal', 'riot',
];

function classifyArticle(title: string, desc: string): { category: string; subCategory: string } | null {
  const text = (title + ' ' + desc).toLowerCase();

  // Animals
  if (text.match(/leopard|panther/)) return { category: 'animal', subCategory: 'leopard' };
  if (text.match(/tiger|tigress/)) return { category: 'animal', subCategory: 'tiger' };
  if (text.match(/bear|sloth bear/)) return { category: 'animal', subCategory: 'bear' };
  if (text.match(/snake|cobra|python|viper|krait/)) return { category: 'animal', subCategory: 'snake' };
  if (text.match(/crocodile|croc/)) return { category: 'animal', subCategory: 'crocodile' };
  if (text.match(/elephant/)) return { category: 'animal', subCategory: 'elephant' };
  if (text.match(/monkey|macaque|langur/)) return { category: 'animal', subCategory: 'monkey' };
  if (text.match(/stray dog|dog bite|dog attack|dog mauled/)) return { category: 'animal', subCategory: 'stray_dog' };
  if (text.match(/wild boar|boar/)) return { category: 'animal', subCategory: 'wild_boar' };
  if (text.match(/wolf|wolves/)) return { category: 'animal', subCategory: 'wolf' };

  // Women safety
  if (text.match(/molestation|molested|groping/)) return { category: 'women_safety', subCategory: 'molestation' };
  if (text.match(/harassment|eve teasing|stalking/)) return { category: 'women_safety', subCategory: 'harassment' };
  if (text.match(/acid attack/)) return { category: 'women_safety', subCategory: 'acid_attack' };
  if (text.match(/domestic violence|dowry/)) return { category: 'women_safety', subCategory: 'domestic_violence' };
  if (text.match(/sexual assault|rape/)) return { category: 'women_safety', subCategory: 'sexual_assault' };

  // Crime
  if (text.match(/murder|killed|homicide|hacked to death/)) return { category: 'crime', subCategory: 'murder' };
  if (text.match(/robbery|robbed|loot|dacoity/)) return { category: 'crime', subCategory: 'robbery' };
  if (text.match(/snatching|snatcher|snatched/)) return { category: 'crime', subCategory: 'snatching' };
  if (text.match(/stabbing|stabbed/)) return { category: 'crime', subCategory: 'stabbing' };
  if (text.match(/shot dead|shooting|gunshot|fired upon/)) return { category: 'crime', subCategory: 'shooting' };
  if (text.match(/kidnapped|abducted|kidnapping/)) return { category: 'crime', subCategory: 'kidnapping' };
  if (text.match(/theft|stolen|burglary|break.?in/)) return { category: 'crime', subCategory: 'theft' };
  if (text.match(/arrested|accused|booked|nabbed/)) return { category: 'crime', subCategory: 'arrest' };

  // Accidents
  if (text.match(/accident|crash|collision/)) return { category: 'accident', subCategory: 'vehicle_collision' };
  if (text.match(/hit.?and.?run/)) return { category: 'accident', subCategory: 'hit_and_run' };
  if (text.match(/bus.*overturn|bus.*fall|bus.*plunge/)) return { category: 'accident', subCategory: 'bus_accident' };
  if (text.match(/truck.*overturn|lorry/)) return { category: 'accident', subCategory: 'truck_accident' };
  if (text.match(/derail/)) return { category: 'accident', subCategory: 'train_accident' };
  if (text.match(/pothole/)) return { category: 'accident', subCategory: 'pothole' };
  if (text.match(/drunk driv/)) return { category: 'accident', subCategory: 'drunk_driving' };
  if (text.match(/electrocuted|electric shock/)) return { category: 'accident', subCategory: 'electrocution' };
  if (text.match(/drown/)) return { category: 'accident', subCategory: 'drowning' };
  if (text.match(/collapse/)) return { category: 'accident', subCategory: 'building_collapse' };
  if (text.match(/pile.?up|overturn/)) return { category: 'accident', subCategory: 'vehicle_collision' };

  // Environmental
  if (text.match(/flood/)) return { category: 'environmental', subCategory: 'flood' };
  if (text.match(/cyclone/)) return { category: 'environmental', subCategory: 'cyclone' };
  if (text.match(/earthquake|quake|tremor/)) return { category: 'environmental', subCategory: 'earthquake' };
  if (text.match(/landslide|mudslide/)) return { category: 'environmental', subCategory: 'landslide' };
  if (text.match(/fire|blaze|gutted|inferno/)) return { category: 'environmental', subCategory: 'fire' };
  if (text.match(/heatwave|heat stroke|heat wave/)) return { category: 'environmental', subCategory: 'heatwave' };
  if (text.match(/gas leak|chemical leak|ammonia/)) return { category: 'environmental', subCategory: 'gas_leak' };
  if (text.match(/lightning|thunderstorm|cloudburst|storm/)) return { category: 'environmental', subCategory: 'storm' };

  // Personal safety
  if (text.match(/missing|went missing/)) return { category: 'personal_safety', subCategory: 'missing_person' };
  if (text.match(/mob.*lynch|lynched|mob.*attack|mob.*beat/)) return { category: 'personal_safety', subCategory: 'mob_violence' };
  if (text.match(/communal|riot/)) return { category: 'personal_safety', subCategory: 'communal_violence' };

  return null;
}

function extractImageFromItem(item: any): string | undefined {
  // Method 1: media:content
  if (item.mediaContent?.$?.url) return item.mediaContent.$.url;
  if (typeof item.mediaContent === 'string' && item.mediaContent.startsWith('http')) return item.mediaContent;

  // Method 2: media:thumbnail
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;

  // Method 3: enclosure
  if (item.enclosure?.url && item.enclosure?.type?.startsWith('image')) return item.enclosure.url;
  if (item.enclosure?.url) return item.enclosure.url;

  // Method 4: extract from content:encoded or description HTML
  const html = item.contentEncoded || item.content || item['content:encoded'] || '';
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];

  // Method 5: extract from description
  const descMatch = (item.contentSnippet || item.description || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  if (descMatch) return descMatch[1];

  return undefined;
}

// Junk patterns — articles that match keywords by coincidence
const JUNK_ARTICLE_PATTERNS = [
  /stock market|sensex|nifty|BSE|NSE|share price|portfolio|investor|trading/i,
  /bearish|bullish|bear.*market|bull.*market|rally|correction/i,
  /cricket|IPL|T20|world cup|football|sports|match result/i,
  /film|movie|series|trailer|review|box office|bollywood|OTT|netflix/i,
  /AI.?generated|deepfake|fact.?check|hoax|viral.*fake/i,
  /opinion|editorial|analysis.*economy|forecast.*market/i,
  /Harvard|MIT|Stanford|online course|free course/i,
  /Instagram|TikTok|YouTube|social media|selfie/i,
  /fashion|lifestyle|recipe|beauty|skincare/i,
  /Japan|China|Pakistan|USA|UK|Australia|Thailand|Alaska|Korea/i,
  /painting|sculpture|museum|gallery|exhibition/i,
];

function isSafetyRelated(title: string, desc: string): boolean {
  const text = (title + ' ' + desc).toLowerCase();
  const fullText = title + ' ' + desc;

  // First check if it's junk
  if (JUNK_ARTICLE_PATTERNS.some(p => p.test(fullText))) return false;

  return SAFETY_KEYWORDS.some(keyword => text.includes(keyword));
}

export async function fetchDirectRssFeeds(): Promise<RawArticle[]> {
  const allArticles: RawArticle[] = [];

  for (const feed of DIRECT_RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);

      for (const item of parsed.items || []) {
        if (!item.title || !item.link) continue;

        const title = item.title.trim();
        const desc = item.contentSnippet || item.content || '';

        // Only include safety-related articles
        if (!isSafetyRelated(title, desc)) continue;

        // Classify the article
        const classification = classifyArticle(title, desc);
        if (!classification) continue;

        const imageUrl = extractImageFromItem(item);

        allArticles.push({
          title,
          description: desc.slice(0, 500),
          link: item.link,
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          sourceName: feed.name,
          thumbnailUrl: imageUrl,
          query: 'direct-rss',
          category: classification.category,
          subCategory: classification.subCategory,
        });
      }
    } catch {
      // Silently skip failed feeds
    }
  }

  return allArticles;
}

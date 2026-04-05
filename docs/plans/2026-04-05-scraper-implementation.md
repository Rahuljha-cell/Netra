# Real-Time News Scraper Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a real-time news scraper that ingests safety incidents from all Indian news outlets via Google News RSS + GDELT, classifies them with AI, extracts real images, and serves them to the frontend with live updates.

**Architecture:** Scraper service runs every 15 min via node-cron, rotating through 60+ keyword queries (animals, crime, women's safety, personal safety, accidents, environmental). Google News RSS aggregates 10,000+ Indian sources automatically. Articles are deduplicated, images extracted via og:image scraping, classified by AI service, geocoded, and saved to MongoDB. Socket.IO broadcasts new incidents in real-time.

**Tech Stack:** Express.js, MongoDB/Mongoose, Redis, Socket.IO, node-cron, rss-parser, cheerio, winston, Cloudinary, Nominatim geocoding

---

## Task 1: Install Dependencies

**Files:**
- Modify: `backend/package.json`

**Step 1: Install scraper dependencies**

```bash
cd backend && npm install rss-parser cheerio node-cron winston crypto-js && npm install -D @types/node-cron
```

**Step 2: Verify installation**

```bash
node -e "require('rss-parser'); require('cheerio'); require('node-cron'); require('winston'); console.log('OK')"
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add scraper dependencies (rss-parser, cheerio, node-cron, winston)"
```

---

## Task 2: Update Incident Model

**Files:**
- Modify: `backend/src/models/Incident.ts`

**Step 1: Add news scraper fields to the Incident schema**

Add these fields after the existing `media` field:

```typescript
// After the media field, add:
sourceUrl: { type: String, trim: true },
sourceName: { type: String, trim: true },
sourcePublishedAt: { type: Date },
imageUrl: { type: String },
imageThumbnail: { type: String },
imageSource: {
  type: String,
  enum: ['og_image', 'google_thumbnail', 'gdelt', 'cloudinary', 'placeholder'],
},
specificType: { type: String, trim: true },
aiConfidence: { type: Number, min: 0, max: 1 },
urlHash: { type: String, index: true },
titleHash: { type: String },
viewCount: { type: Number, default: 0 },
```

Update the `category` enum to include new categories:

```typescript
category: {
  type: String,
  required: true,
  enum: ['animal', 'crime', 'women_safety', 'personal_safety', 'accident', 'environmental'],
},
```

Update the `source` enum:

```typescript
source: {
  type: String,
  required: true,
  enum: ['user', 'news', 'government', 'sensor', 'gdelt'],
  default: 'user',
},
```

Make `reportedBy` optional (news articles have no user):

```typescript
reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },  // remove required
```

Add new indexes:

```typescript
IncidentSchema.index({ urlHash: 1 }, { unique: true, sparse: true });
IncidentSchema.index({ source: 1, createdAt: -1 });
IncidentSchema.index({ 'address.city': 1, category: 1, createdAt: -1 });
```

Also add the `IIncident` interface fields:

```typescript
sourceUrl?: string;
sourceName?: string;
sourcePublishedAt?: Date;
imageUrl?: string;
imageThumbnail?: string;
imageSource?: 'og_image' | 'google_thumbnail' | 'gdelt' | 'cloudinary' | 'placeholder';
specificType?: string;
aiConfidence?: number;
urlHash?: string;
titleHash?: string;
viewCount: number;
```

**Step 2: Commit**

```bash
git add src/models/Incident.ts
git commit -m "feat: add news scraper fields to Incident model"
```

---

## Task 3: Search Queries Configuration

**Files:**
- Create: `backend/src/services/scraper/searchQueries.ts`

**Step 1: Create the search queries file**

```typescript
export interface QueryGroup {
  name: string;
  category: string;
  queries: { term: string; subCategory: string; specificTypes?: string[] }[];
}

export const QUERY_GROUPS: QueryGroup[] = [
  {
    name: 'animals_predators',
    category: 'animal',
    queries: [
      { term: '"leopard attack" OR "leopard spotted" India', subCategory: 'leopard', specificTypes: ['Indian leopard'] },
      { term: '"tiger attack" OR "tiger spotted" India', subCategory: 'tiger', specificTypes: ['Bengal tiger'] },
      { term: '"bear attack" OR "bear spotted" India', subCategory: 'bear', specificTypes: ['sloth bear', 'Himalayan bear'] },
      { term: '"wolf attack" India', subCategory: 'wolf' },
      { term: '"wild boar attack" OR "wild boar" India', subCategory: 'wild_boar' },
      { term: '"crocodile attack" OR "crocodile spotted" India', subCategory: 'crocodile', specificTypes: ['mugger crocodile', 'saltwater crocodile'] },
    ],
  },
  {
    name: 'animals_snakes',
    category: 'animal',
    queries: [
      { term: '"snake bite" OR "cobra" OR "cobra spotted" India', subCategory: 'snake', specificTypes: ['king cobra', 'Indian cobra', 'spectacled cobra'] },
      { term: '"python" OR "python spotted" OR "python rescued" India', subCategory: 'snake', specificTypes: ['Indian python', 'rock python'] },
      { term: '"viper bite" OR "krait bite" India', subCategory: 'snake', specificTypes: ['Russell viper', 'common krait', 'saw-scaled viper'] },
    ],
  },
  {
    name: 'animals_urban',
    category: 'animal',
    queries: [
      { term: '"stray dog attack" OR "dog bite" OR "stray dogs" India', subCategory: 'stray_dog' },
      { term: '"monkey attack" OR "monkey menace" OR "monkey bite" India', subCategory: 'monkey', specificTypes: ['rhesus macaque', 'langur'] },
      { term: '"elephant attack" OR "elephant rampage" OR "elephant corridor" India', subCategory: 'elephant', specificTypes: ['Asian elephant'] },
      { term: '"scorpion sting" OR "scorpion bite" India', subCategory: 'scorpion' },
      { term: '"bee attack" OR "hornet attack" OR "wasp attack" India', subCategory: 'insect' },
    ],
  },
  {
    name: 'crime_theft',
    category: 'crime',
    queries: [
      { term: '"chain snatching" OR "chain snatcher" India', subCategory: 'chain_snatching' },
      { term: '"phone snatching" OR "mobile theft" OR "mobile snatched" India', subCategory: 'phone_theft' },
      { term: '"robbery" OR "loot" OR "robbed" India', subCategory: 'robbery' },
      { term: '"burglary" OR "house break-in" OR "home burglary" India', subCategory: 'burglary' },
      { term: '"ATM robbery" OR "ATM loot" India', subCategory: 'atm_robbery' },
      { term: '"carjacking" OR "vehicle theft" India', subCategory: 'vehicle_theft' },
    ],
  },
  {
    name: 'crime_violent',
    category: 'crime',
    queries: [
      { term: '"murder" OR "killed" OR "homicide" India -film -movie -series', subCategory: 'murder' },
      { term: '"stabbing" OR "stabbed" India -film -movie', subCategory: 'stabbing' },
      { term: '"shooting" OR "gunshot" OR "fired upon" India -film -cricket', subCategory: 'shooting' },
      { term: '"kidnapping" OR "kidnapped" OR "abducted" India -film -movie', subCategory: 'kidnapping' },
      { term: '"assault" OR "beaten" OR "attacked" India -film -movie -animal', subCategory: 'assault' },
    ],
  },
  {
    name: 'women_safety',
    category: 'women_safety',
    queries: [
      { term: '"eve teasing" OR "harassment women" OR "stalking" India', subCategory: 'harassment' },
      { term: '"molestation" OR "molested" OR "groping" India', subCategory: 'molestation' },
      { term: '"acid attack" India', subCategory: 'acid_attack' },
      { term: '"dowry death" OR "dowry violence" OR "dowry harassment" India', subCategory: 'dowry_violence' },
      { term: '"domestic violence" OR "wife beaten" India', subCategory: 'domestic_violence' },
      { term: '"sexual harassment" OR "workplace harassment" India -film', subCategory: 'sexual_harassment' },
      { term: '"women safety" OR "unsafe for women" India', subCategory: 'general_safety' },
    ],
  },
  {
    name: 'personal_safety',
    category: 'personal_safety',
    queries: [
      { term: '"missing person" OR "person missing" OR "went missing" India', subCategory: 'missing_person' },
      { term: '"mob lynching" OR "mob violence" OR "mob attack" India', subCategory: 'mob_violence' },
      { term: '"communal violence" OR "communal clash" OR "riot" India -politics', subCategory: 'communal_violence' },
      { term: '"gang violence" OR "gang war" India -film', subCategory: 'gang_violence' },
      { term: '"fraud" OR "scam" OR "cheated" India -stock -market', subCategory: 'fraud' },
      { term: '"cybercrime" OR "online fraud" OR "cyber attack" India', subCategory: 'cybercrime' },
    ],
  },
  {
    name: 'accidents_road',
    category: 'accident',
    queries: [
      { term: '"road accident" OR "car accident" OR "car crash" India', subCategory: 'vehicle_collision' },
      { term: '"hit and run" OR "hit-and-run" India', subCategory: 'hit_and_run' },
      { term: '"bus accident" OR "bus overturns" OR "bus crash" India', subCategory: 'bus_accident' },
      { term: '"truck accident" OR "truck overturns" OR "lorry accident" India', subCategory: 'truck_accident' },
      { term: '"bike accident" OR "two wheeler accident" India', subCategory: 'bike_accident' },
      { term: '"drunk driving" OR "drunk driver" India', subCategory: 'drunk_driving' },
      { term: '"pothole accident" OR "pothole death" India', subCategory: 'pothole' },
      { term: '"train accident" OR "rail accident" OR "train derail" India', subCategory: 'train_accident' },
    ],
  },
  {
    name: 'accidents_other',
    category: 'accident',
    queries: [
      { term: '"bridge collapse" OR "flyover collapse" India', subCategory: 'bridge_collapse' },
      { term: '"building collapse" OR "wall collapse" OR "roof collapse" India', subCategory: 'building_collapse' },
      { term: '"electrocution" OR "electric shock death" India', subCategory: 'electrocution' },
      { term: '"drowning" OR "drowned" India -film', subCategory: 'drowning' },
    ],
  },
  {
    name: 'environmental_water',
    category: 'environmental',
    queries: [
      { term: '"flood" OR "flooding" OR "flood warning" India', subCategory: 'flood' },
      { term: '"cyclone" OR "cyclone warning" OR "cyclone alert" India', subCategory: 'cyclone' },
      { term: '"landslide" OR "mudslide" OR "land slide" India', subCategory: 'landslide' },
      { term: '"water contamination" OR "water pollution" OR "toxic water" India', subCategory: 'water_contamination' },
    ],
  },
  {
    name: 'environmental_other',
    category: 'environmental',
    queries: [
      { term: '"earthquake" India', subCategory: 'earthquake' },
      { term: '"fire" OR "blaze" OR "fire breaks out" India -firing -gunfire', subCategory: 'fire' },
      { term: '"heatwave" OR "heat wave" OR "heat stroke death" India', subCategory: 'heatwave' },
      { term: '"gas leak" OR "chemical leak" OR "toxic gas" India', subCategory: 'gas_leak' },
      { term: '"air pollution" OR "AQI dangerous" OR "smog" India', subCategory: 'air_pollution' },
    ],
  },
];

// Returns a rotation of query groups for a given cycle index
export function getQueriesForCycle(cycleIndex: number): QueryGroup[] {
  const groupsPerCycle = 3;
  const totalGroups = QUERY_GROUPS.length;
  const startIdx = (cycleIndex * groupsPerCycle) % totalGroups;

  const groups: QueryGroup[] = [];
  for (let i = 0; i < groupsPerCycle; i++) {
    groups.push(QUERY_GROUPS[(startIdx + i) % totalGroups]);
  }
  return groups;
}
```

**Step 2: Commit**

```bash
git add src/services/scraper/searchQueries.ts
git commit -m "feat: add 60+ search query definitions for news scraper"
```

---

## Task 4: Google News RSS Fetcher

**Files:**
- Create: `backend/src/services/scraper/googleNewsFetcher.ts`

**Step 1: Create the fetcher**

```typescript
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
    ],
  },
  timeout: 15000,
});

export interface RawArticle {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  sourceName: string;
  thumbnailUrl?: string;
  query: string;
  category: string;
  subCategory: string;
  specificTypes?: string[];
}

function extractSourceName(title: string): { cleanTitle: string; sourceName: string } {
  // Google News format: "Article Title - Source Name"
  const match = title.match(/^(.+)\s-\s([^-]+)$/);
  if (match) {
    return { cleanTitle: match[1].trim(), sourceName: match[2].trim() };
  }
  return { cleanTitle: title, sourceName: 'Unknown' };
}

function extractThumbnail(item: any): string | undefined {
  // Try media:content
  if (item.mediaContent?.$.url) return item.mediaContent.$.url;
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url;
  // Try enclosure
  if (item.enclosure?.url) return item.enclosure.url;
  return undefined;
}

export async function fetchGoogleNews(
  searchTerm: string,
  category: string,
  subCategory: string,
  specificTypes?: string[]
): Promise<RawArticle[]> {
  const encodedQuery = encodeURIComponent(searchTerm);
  const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-IN&gl=IN&ceid=IN:en`;

  try {
    const feed = await parser.parseURL(url);
    const articles: RawArticle[] = [];

    for (const item of feed.items || []) {
      if (!item.title || !item.link) continue;

      const { cleanTitle, sourceName } = extractSourceName(item.title);

      articles.push({
        title: cleanTitle,
        description: item.contentSnippet || item.content || '',
        link: item.link,
        pubDate: item.pubDate || new Date().toISOString(),
        sourceName,
        thumbnailUrl: extractThumbnail(item),
        query: searchTerm,
        category,
        subCategory,
        specificTypes,
      });
    }

    return articles;
  } catch (error) {
    console.error(`[GoogleNews] Failed to fetch: ${searchTerm}`, error);
    return [];
  }
}
```

**Step 2: Commit**

```bash
git add src/services/scraper/googleNewsFetcher.ts
git commit -m "feat: add Google News RSS fetcher with source extraction"
```

---

## Task 5: GDELT Fetcher

**Files:**
- Create: `backend/src/services/scraper/gdeltFetcher.ts`

**Step 1: Create the GDELT fetcher**

```typescript
import { RawArticle } from './googleNewsFetcher';

const GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc';

export async function fetchGDELT(
  searchTerm: string,
  category: string,
  subCategory: string,
  specificTypes?: string[]
): Promise<RawArticle[]> {
  const params = new URLSearchParams({
    query: `${searchTerm} sourcelang:eng sourcecountry:IN`,
    mode: 'ArtList',
    maxrecords: '25',
    format: 'json',
    sort: 'DateDesc',
    timespan: '15min',
  });

  try {
    const response = await fetch(`${GDELT_API}?${params}`, {
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) return [];

    const data = await response.json() as { articles?: any[] };
    if (!data.articles) return [];

    return data.articles.map((article: any) => ({
      title: article.title || '',
      description: article.seendate || '',
      link: article.url || '',
      pubDate: article.seendate ? new Date(article.seendate).toISOString() : new Date().toISOString(),
      sourceName: article.domain || 'Unknown',
      thumbnailUrl: article.socialimage || undefined,
      query: searchTerm,
      category,
      subCategory,
      specificTypes,
    }));
  } catch (error) {
    console.error(`[GDELT] Failed to fetch: ${searchTerm}`, error);
    return [];
  }
}
```

**Step 2: Commit**

```bash
git add src/services/scraper/gdeltFetcher.ts
git commit -m "feat: add GDELT API fetcher for global event monitoring"
```

---

## Task 6: Article Scraper (og:image extraction)

**Files:**
- Create: `backend/src/services/scraper/articleScraper.ts`

**Step 1: Create the article page scraper**

```typescript
import * as cheerio from 'cheerio';

export interface ScrapedArticle {
  ogImage?: string;
  articleText?: string;
  locationHints: string[];
}

export async function scrapeArticlePage(url: string): Promise<ScrapedArticle> {
  try {
    // Follow Google News redirect to actual article
    const actualUrl = await resolveGoogleNewsUrl(url);

    const response = await fetch(actualUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Netra-SafetyBot/1.0; +https://netra.in)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    });

    if (!response.ok) return { locationHints: [] };

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract og:image (primary)
    let ogImage = $('meta[property="og:image"]').attr('content')
      || $('meta[name="twitter:image"]').attr('content')
      || $('meta[property="og:image:url"]').attr('content');

    // Validate image URL
    if (ogImage && !ogImage.startsWith('http')) {
      const baseUrl = new URL(actualUrl);
      ogImage = `${baseUrl.origin}${ogImage}`;
    }

    // Validate image is not a logo/icon (must be > 200px concept)
    if (ogImage) {
      const width = parseInt($('meta[property="og:image:width"]').attr('content') || '0');
      if (width > 0 && width < 200) ogImage = undefined;
    }

    // Extract article text for AI classification
    const articleText = $('article').text()
      || $('[class*="article-body"]').text()
      || $('[class*="story-content"]').text()
      || $('[class*="content"]').first().text()
      || '';

    // Extract location hints from article
    const locationHints: string[] = [];
    const locationMeta = $('meta[name="geo.placename"]').attr('content')
      || $('meta[name="geo.region"]').attr('content');
    if (locationMeta) locationHints.push(locationMeta);

    return {
      ogImage: ogImage || undefined,
      articleText: articleText.slice(0, 2000), // limit for AI
      locationHints,
    };
  } catch (error) {
    console.error(`[ArticleScraper] Failed: ${url}`, error);
    return { locationHints: [] };
  }
}

async function resolveGoogleNewsUrl(url: string): Promise<string> {
  if (!url.includes('news.google.com')) return url;

  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const redirectUrl = response.headers.get('location');
    if (redirectUrl) return redirectUrl;
  } catch {}

  return url;
}
```

**Step 2: Commit**

```bash
git add src/services/scraper/articleScraper.ts
git commit -m "feat: add article page scraper for og:image and text extraction"
```

---

## Task 7: Image Resolver Pipeline

**Files:**
- Create: `backend/src/services/scraper/imageResolver.ts`

**Step 1: Create 3-tier image resolver with Cloudinary upload**

```typescript
import { v2 as cloudinary } from 'cloudinary';

export interface ResolvedImage {
  imageUrl: string;
  imageThumbnail: string;
  imageSource: 'og_image' | 'google_thumbnail' | 'gdelt' | 'placeholder';
}

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  animal: '/placeholders/animal.jpg',
  crime: '/placeholders/crime.jpg',
  women_safety: '/placeholders/safety.jpg',
  personal_safety: '/placeholders/safety.jpg',
  accident: '/placeholders/accident.jpg',
  environmental: '/placeholders/environmental.jpg',
};

async function isImageValid(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    const contentType = response.headers.get('content-type') || '';
    return response.ok && contentType.startsWith('image/');
  } catch {
    return false;
  }
}

async function uploadToCloudinary(imageUrl: string): Promise<{ full: string; thumb: string } | null> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'netra/incidents',
      transformation: [{ width: 800, height: 500, crop: 'fill', quality: 'auto' }],
    });

    const thumbUrl = cloudinary.url(result.public_id, {
      width: 300, height: 200, crop: 'fill', quality: 'auto', format: 'webp',
    });

    return { full: result.secure_url, thumb: thumbUrl };
  } catch (error) {
    console.error('[ImageResolver] Cloudinary upload failed:', error);
    return null;
  }
}

export async function resolveImage(
  ogImage?: string,
  googleThumbnail?: string,
  gdeltImage?: string,
  category: string = 'crime'
): Promise<ResolvedImage> {
  // Tier 1: og:image from article page
  if (ogImage && await isImageValid(ogImage)) {
    const uploaded = await uploadToCloudinary(ogImage);
    if (uploaded) {
      return { imageUrl: uploaded.full, imageThumbnail: uploaded.thumb, imageSource: 'og_image' };
    }
  }

  // Tier 2: Google News thumbnail
  if (googleThumbnail && await isImageValid(googleThumbnail)) {
    const uploaded = await uploadToCloudinary(googleThumbnail);
    if (uploaded) {
      return { imageUrl: uploaded.full, imageThumbnail: uploaded.thumb, imageSource: 'google_thumbnail' };
    }
  }

  // Tier 3: GDELT social image
  if (gdeltImage && await isImageValid(gdeltImage)) {
    const uploaded = await uploadToCloudinary(gdeltImage);
    if (uploaded) {
      return { imageUrl: uploaded.full, imageThumbnail: uploaded.thumb, imageSource: 'gdelt' };
    }
  }

  // Tier 4: Category placeholder
  const placeholder = CATEGORY_PLACEHOLDERS[category] || CATEGORY_PLACEHOLDERS.crime;
  return { imageUrl: placeholder, imageThumbnail: placeholder, imageSource: 'placeholder' };
}
```

**Step 2: Commit**

```bash
git add src/services/scraper/imageResolver.ts
git commit -m "feat: add 3-tier image resolver with Cloudinary upload"
```

---

## Task 8: Deduplicator

**Files:**
- Create: `backend/src/services/scraper/deduplicator.ts`

**Step 1: Create deduplication service**

```typescript
import { createHash } from 'crypto';
import Incident from '../../models/Incident';

export function hashUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

export function hashTitle(title: string): string {
  const normalized = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  return createHash('md5').update(normalized).digest('hex');
}

function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size; // Jaccard similarity
}

export async function isDuplicate(url: string, title: string): Promise<boolean> {
  const urlH = hashUrl(url);

  // Exact URL match
  const existingUrl = await Incident.findOne({ urlHash: urlH }).lean();
  if (existingUrl) return true;

  // Title similarity check against recent incidents (last 48 hours)
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const recent = await Incident.find(
    { createdAt: { $gte: since }, source: { $in: ['news', 'gdelt'] } },
    { title: 1 }
  ).lean();

  for (const existing of recent) {
    if (titleSimilarity(title, existing.title) > 0.85) {
      return true;
    }
  }

  return false;
}
```

**Step 2: Commit**

```bash
git add src/services/scraper/deduplicator.ts
git commit -m "feat: add deduplication with URL hash and title similarity"
```

---

## Task 9: Geocoder

**Files:**
- Create: `backend/src/services/scraper/geocoder.ts`

**Step 1: Create Nominatim geocoder**

```typescript
export interface GeocodedLocation {
  lat: number;
  lng: number;
  city: string;
  state: string;
  area?: string;
}

// Rate limit: max 1 request per second (Nominatim policy)
let lastGeocodedAt = 0;

async function rateLimitedWait(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastGeocodedAt;
  if (elapsed < 1100) {
    await new Promise(r => setTimeout(r, 1100 - elapsed));
  }
  lastGeocodedAt = Date.now();
}

export async function geocodeLocation(locationText: string): Promise<GeocodedLocation | null> {
  await rateLimitedWait();

  const query = locationText.includes('India') ? locationText : `${locationText}, India`;

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      countrycodes: 'in',
      addressdetails: '1',
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        'User-Agent': 'Netra-SafetyIntelligence/1.0 (contact@netra.in)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const results = await response.json() as any[];
    if (!results.length) return null;

    const result = results[0];
    const address = result.address || {};

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      city: address.city || address.town || address.village || address.county || locationText,
      state: address.state || '',
      area: address.suburb || address.neighbourhood || undefined,
    };
  } catch (error) {
    console.error(`[Geocoder] Failed for: ${locationText}`, error);
    return null;
  }
}

// Extract location from article title/text using common Indian patterns
export function extractLocationFromText(text: string): string | null {
  // Match patterns like "in Mumbai", "at Delhi", "near Pune", "from Kolkata"
  const patterns = [
    /(?:in|at|near|from)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g,
    /([A-Z][a-z]+),\s*(?:India|Maharashtra|Karnataka|Tamil Nadu|Kerala|Delhi|UP|MP|Gujarat|Rajasthan|West Bengal|Bihar|Odisha|Assam|Punjab|Haryana|Uttarakhand|Himachal Pradesh|Jharkhand|Chhattisgarh|Goa|Telangana|Andhra Pradesh)/g,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) return match[1];
  }

  return null;
}
```

**Step 2: Commit**

```bash
git add src/services/scraper/geocoder.ts
git commit -m "feat: add Nominatim geocoder with location extraction"
```

---

## Task 10: Logger Setup

**Files:**
- Create: `backend/src/services/scraper/logger.ts`

**Step 1: Create structured logger**

```typescript
import winston from 'winston';

export const scraperLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'netra-scraper' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}] ${message}${metaStr}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: 'logs/scraper-error.log',
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/scraper.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
  ],
});
```

**Step 2: Commit**

```bash
mkdir -p logs && git add src/services/scraper/logger.ts
git commit -m "feat: add structured winston logger for scraper"
```

---

## Task 11: Main Scraper Orchestrator

**Files:**
- Create: `backend/src/services/scraper/scraperService.ts`

**Step 1: Create the main orchestrator**

```typescript
import cron from 'node-cron';
import { QUERY_GROUPS, getQueriesForCycle } from './searchQueries';
import { fetchGoogleNews, RawArticle } from './googleNewsFetcher';
import { fetchGDELT } from './gdeltFetcher';
import { scrapeArticlePage } from './articleScraper';
import { resolveImage } from './imageResolver';
import { isDuplicate, hashUrl, hashTitle } from './deduplicator';
import { geocodeLocation, extractLocationFromText } from './geocoder';
import { aiService } from '../aiService';
import Incident from '../../models/Incident';
import { getIO } from '../../config/socket';
import { scraperLogger as log } from './logger';

let cycleIndex = 0;
let isRunning = false;
let lastRunAt: Date | null = null;
let lastRunStats = { total: 0, new: 0, duplicates: 0, errors: 0 };

const CONCURRENCY_LIMIT = 5;

async function processArticle(article: RawArticle): Promise<boolean> {
  try {
    // Check duplicate
    if (await isDuplicate(article.link, article.title)) {
      return false;
    }

    // Scrape article page for og:image and full text
    const scraped = await scrapeArticlePage(article.link);

    // AI classification (use existing service)
    const fullText = `${article.title}. ${article.description}. ${scraped.articleText || ''}`;
    const classification = await aiService.classifyText(fullText.slice(0, 1000));

    // Determine category and severity
    const category = classification?.category || article.category;
    const severity = classification?.severity || 'medium';

    // Extract and geocode location
    const locationText = extractLocationFromText(fullText)
      || scraped.locationHints[0]
      || extractLocationFromText(article.title);

    let location = null;
    if (locationText) {
      location = await geocodeLocation(locationText);
    }

    if (!location) {
      log.debug(`Skipping article (no location): ${article.title}`);
      return false;
    }

    // Resolve best image
    const image = await resolveImage(
      scraped.ogImage,
      article.thumbnailUrl,
      undefined,
      category
    );

    // Create incident
    const incident = new Incident({
      title: article.title,
      description: article.description.slice(0, 2000) || article.title,
      category,
      subCategory: article.subCategory,
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
      severity: severity as any,
      source: 'news',
      sourceUrl: article.link,
      sourceName: article.sourceName,
      sourcePublishedAt: new Date(article.pubDate),
      imageUrl: image.imageUrl,
      imageThumbnail: image.imageThumbnail,
      imageSource: image.imageSource,
      urlHash: hashUrl(article.link),
      titleHash: hashTitle(article.title),
      aiConfidence: 0.7,
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
    } catch {}

    log.info(`New incident: ${article.title}`, {
      category,
      subCategory: article.subCategory,
      city: location.city,
      source: article.sourceName,
    });

    return true;
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key (urlHash) - expected race condition
      return false;
    }
    log.error(`Failed to process article: ${article.title}`, { error: error.message });
    return false;
  }
}

async function runScrapeyCycle(): Promise<void> {
  if (isRunning) {
    log.warn('Skipping cycle - previous still running');
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

    // Collect all articles from all queries in parallel
    const allArticles: RawArticle[] = [];

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

      // Small delay between query groups
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

export function startScraper(): void {
  log.info('Starting Netra news scraper', {
    totalQueryGroups: QUERY_GROUPS.length,
    totalQueries: QUERY_GROUPS.reduce((sum, g) => sum + g.queries.length, 0),
    schedule: 'every 15 minutes',
  });

  // Run immediately on start
  runScrapeyCycle();

  // Schedule every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    runScrapeyCycle();
  });

  // Full sweep every 6 hours (all query groups)
  cron.schedule('0 */6 * * *', async () => {
    log.info('Starting full sweep (all query groups)');
    const savedIndex = cycleIndex;
    for (let i = 0; i < QUERY_GROUPS.length; i++) {
      cycleIndex = i;
      await runScrapeyCycle();
      await new Promise(r => setTimeout(r, 5000));
    }
    cycleIndex = savedIndex;
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
```

**Step 2: Commit**

```bash
git add src/services/scraper/scraperService.ts
git commit -m "feat: add main scraper orchestrator with cron scheduling"
```

---

## Task 12: Wire Scraper into Server Startup

**Files:**
- Modify: `backend/src/server.ts`
- Modify: `backend/src/app.ts`

**Step 1: Read current server.ts and add scraper start**

Add to `server.ts` after database connection:

```typescript
import { startScraper } from './services/scraper/scraperService';

// After connectDB() and server.listen():
if (process.env.ENABLE_SCRAPER !== 'false') {
  startScraper();
}
```

**Step 2: Add health check for scraper in app.ts**

Add before the error handler:

```typescript
import { getScraperStatus } from './services/scraper/scraperService';

app.get('/api/health/scraper', (_req, res) => {
  const status = getScraperStatus();
  res.json({ ...status, timestamp: new Date().toISOString() });
});
```

**Step 3: Add feed and map-dots endpoints**

Add to `backend/src/controllers/incident.controller.ts`:

```typescript
export const getFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const cursor = req.query.cursor as string;
    const category = req.query.category as string;
    const source = req.query.source as string;

    const query: Record<string, any> = { status: { $ne: 'rejected' } };
    if (category && category !== 'all') query.category = category;
    if (source) query.source = source;
    if (cursor) query._id = { $lt: cursor };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [incidents, total] = await Promise.all([
      Incident.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title category subCategory location address severity source sourceName imageUrl imageThumbnail sourceUrl sourcePublishedAt viewCount createdAt')
        .lean(),
      Incident.countDocuments({ ...query, createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    const lastUpdated = await Incident.findOne({ source: { $in: ['news', 'gdelt'] } })
      .sort({ createdAt: -1 }).select('createdAt').lean();

    res.json({
      total,
      lastUpdated: lastUpdated?.createdAt || new Date(),
      incidents,
      nextCursor: incidents.length === limit ? incidents[incidents.length - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getMapDots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = req.query.category as string;
    const timeRange = req.query.timeRange as string || '30d';

    const query: Record<string, any> = { status: { $ne: 'rejected' } };
    if (category && category !== 'all') query.category = category;

    const timeMs: Record<string, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    };
    if (timeMs[timeRange]) {
      query.createdAt = { $gte: new Date(Date.now() - timeMs[timeRange]) };
    }

    const dots = await Incident.find(query)
      .select('location category subCategory severity')
      .lean();

    const mapped = dots.map(d => ({
      id: d._id,
      lat: d.location.coordinates[1],
      lng: d.location.coordinates[0],
      category: d.category,
      subCategory: d.subCategory,
      severity: d.severity,
    }));

    res.json({ dots: mapped, count: mapped.length });
  } catch (error) {
    next(error);
  }
};

export const incrementView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Incident.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
```

Add routes to `backend/src/routes/incident.routes.ts`:

```typescript
import { getFeed, getMapDots, incrementView } from '../controllers/incident.controller';

// Add before the /:id route:
router.get('/feed', getFeed);
router.get('/map-dots', getMapDots);
router.patch('/:id/view', incrementView);
```

**Step 4: Commit**

```bash
git add src/server.ts src/app.ts src/controllers/incident.controller.ts src/routes/incident.routes.ts
git commit -m "feat: wire scraper to server startup, add feed/map-dots/view endpoints"
```

---

## Task 13: Update Frontend to Use Real API

**Files:**
- Modify: `frontend/src/app/[locale]/map/page.tsx`
- Modify: `frontend/src/app/[locale]/page.tsx`
- Modify: `frontend/src/lib/constants.ts`

**Step 1: Add API fetch utilities**

Create `frontend/src/lib/api.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchFeed(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/incidents/feed?${query}`);
  if (!res.ok) return { total: 0, lastUpdated: new Date(), incidents: [], nextCursor: null };
  return res.json();
}

export async function fetchMapDots(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/incidents/map-dots?${query}`);
  if (!res.ok) return { dots: [], count: 0 };
  return res.json();
}

export async function incrementView(id: string) {
  fetch(`${API_BASE}/incidents/${id}/view`, { method: 'PATCH' }).catch(() => {});
}
```

**Step 2: Update map page to fetch from API with fallback to mock data**

In the map page, replace `MOCK_MAP_INCIDENTS` import with an `useEffect` that calls `fetchFeed` and `fetchMapDots`. Keep mock data as fallback when API is unreachable.

**Step 3: Update homepage to fetch from API with fallback**

In the homepage, add `useEffect` to load real incidents from `/api/incidents/feed?limit=8` for the Recent Activity section, falling back to mock data if API is down.

**Step 4: Commit**

```bash
git add frontend/src/lib/api.ts frontend/src/app/\[locale\]/map/page.tsx frontend/src/app/\[locale\]/page.tsx
git commit -m "feat: connect frontend to real API with mock data fallback"
```

---

## Task 14: Add Environment Variables

**Files:**
- Modify: `backend/.env.example`

**Step 1: Add scraper config**

```env
# Scraper
ENABLE_SCRAPER=true
SCRAPER_CONCURRENCY=5
SCRAPER_INTERVAL_MINUTES=15
```

**Step 2: Commit**

```bash
git add backend/.env.example
git commit -m "chore: add scraper environment variables"
```

---

Plan complete and saved to `docs/plans/2026-04-05-scraper-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

Which approach?
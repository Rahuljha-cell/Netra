# Real-Time News Scraper & Incident Intelligence System

## Problem
Netra currently uses hardcoded mock data. To match the quality of Kumamap (which shows real bear incidents with photos from across Japan), we need to ingest real Indian safety incidents from news sources with actual images.

## Architecture

### Data Sources
- **Google News RSS** — Keyword-based search feeds covering all Indian news outlets (10,000+ sources indexed automatically). Free, unlimited.
- **GDELT Project API** — Global event monitoring system. Free real-time API with pre-extracted locations, themes, and images. Covers Indian regional media in 15+ languages.
- **Community Reports** — Existing user POST endpoint for direct incident reporting.

### Scraper Service

Runs every 15 minutes via `node-cron`. Uses 50+ keyword queries organized by incident type, rotated across 4 cycles per hour so all queries are covered every hour.

**Query groups:**
- Animals: leopard, cobra, python, stray dog, monkey, elephant, wild boar, crocodile, snake bite, bear attack (12+ queries)
- Crime: robbery, theft, chain snatching, murder, assault, kidnapping, carjacking, ATM robbery, burglary (12+ queries)
- Women's Safety: eve teasing, stalking, molestation, dowry violence, acid attack, women harassment, domestic violence (10+ queries)
- Personal Safety: missing person, mob lynching, communal violence, stabbing, shooting, gang violence (8+ queries)
- Accidents: road accident, hit and run, pothole, drunk driving, bus crash, truck overturns, train accident, bridge collapse (12+ queries)
- Environmental: flood, landslide, cyclone, earthquake, fire, heatwave, building collapse, gas leak, water contamination (12+ queries)

**Pipeline per cycle:**
1. Pick 10-15 queries from rotation
2. Fetch Google News RSS + GDELT API in parallel
3. Deduplicate: URL hash (exact match) + title similarity (>85% = duplicate)
4. Scrape article page: extract og:image, article body text
5. AI classification via existing AI service: specific incident type, severity, location extraction
6. Geocode location text to lat/lng using Nominatim (OpenStreetMap, free)
7. Image resolution: og:image → Google thumbnail → GDELT image → category placeholder
8. Upload resolved image to Cloudinary, generate thumbnail (300x200) + full (800x500)
9. Save to MongoDB with `source: "news"`, unique `urlHash` index
10. Broadcast via Socket.IO `incident:new` event

### File Structure
```
backend/src/services/scraper/
├── scraperService.ts        # Orchestrator, cron scheduling
├── googleNewsFetcher.ts     # Google News RSS keyword search
├── gdeltFetcher.ts          # GDELT API event fetcher
├── articleScraper.ts        # HTML scraping for og:image + text
├── imageResolver.ts         # 3-tier image pipeline + Cloudinary upload
├── deduplicator.ts          # URL hash + title similarity
├── geocoder.ts              # Nominatim geocoding
└── searchQueries.ts         # 50+ queries organized by type
```

### Data Model Updates

New fields on Incident model:
- `sourceUrl` (String) — original article URL
- `sourceName` (String) — "Times of India", "NDTV", etc.
- `sourcePublishedAt` (Date) — article publish date
- `imageUrl` (String) — best resolved image (Cloudinary CDN)
- `imageThumbnail` (String) — 300x200 thumbnail
- `imageSource` (enum) — og_image | google_thumbnail | gdelt | placeholder
- `specificType` (String) — granular type ("king cobra", "Indian python")
- `aiConfidence` (Number) — classifier confidence 0-1
- `urlHash` (String, indexed, unique) — SHA256 of sourceUrl
- `titleHash` (String) — for similarity matching
- `viewCount` (Number, default: 0)

New indexes:
- `{ urlHash: 1 }` — deduplication
- `{ source: 1, createdAt: -1 }` — source filtering

### API Updates

**GET /api/incidents/feed** — Paginated bulletin list with images for sidebar
- Cursor-based pagination, filters: category, source, timeRange, map bounds
- Returns totalCount for "X in last 30 days" header

**GET /api/incidents/map-dots** — Lightweight markers for map rendering
- Returns `[{ lat, lng, category, severity, id }]` only
- Redis cached, 2 min TTL

**PATCH /api/incidents/:id/view** — Increment view count

### Frontend Changes
- Map page: replace mock imports with API calls, add infinite-scroll sidebar with real images
- Homepage: fetch from `/api/incidents/feed` and `/api/incidents/map-dots` instead of mock constants
- Socket.IO: listen for `incident:new` to prepend new bulletins in real-time

### Reliability
- Per-article try/catch (one failure doesn't kill the batch)
- Exponential backoff on source failures
- Redis dead letter queue for retry on next cycle
- Max 5 concurrent article page scrapes
- 1s delay between Google News requests
- Structured JSON logging with winston
- Health check: GET /api/health/scraper

### Dependencies to Add
- `rss-parser` — RSS feed parsing
- `cheerio` — HTML scraping (og:image extraction)
- `node-cron` — Job scheduling
- `crypto` (built-in) — URL hashing
- `winston` — Structured logging

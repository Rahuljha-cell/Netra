# Netra — Future Roadmap (Phased)

Inspired by Kumamap.com. Priority: highly polished user experience and functional UI.

---

## Phase 1: Polish & Make It Real (1-2 sessions)
**Goal:** Zero demo feel. Every element functional, every click meaningful, every image real.

### Data & Images
- [ ] **Real article images everywhere** — Fix og:image extraction chain, Cloudinary CDN upload, Unsplash city photo fallback. No broken images, no Google logos, no emoji icons anywhere.
- [ ] **Real-time incident count** — Replace hardcoded "52,847" with live count from `/api/incidents/stats`
- [ ] **Homepage hero map** — Show real scraped incident dots from `/api/incidents/map-dots` instead of hardcoded positions
- [ ] **Time display** — "2 months ago" not "65d", articles limited to last 3 months in feed

### UI Polish & Animations
- [ ] **Skeleton loaders** — Shimmer loading states for map sidebar, homepage feed, area cards (no blank screens)
- [ ] **Micro-animations** — Fade-in on scroll (Intersection Observer), smooth card hover transitions, dot pulse on map
- [ ] **Framer Motion** — Page transitions, list item stagger animations, modal enter/exit
- [ ] **Visual density** — Fill empty spaces with stats cards, mini-charts, trending badges
- [ ] **Dark mode** — Toggle between light/dark theme
- [ ] **Better category icons** — Custom SVG icons instead of emojis for professional feel

### Functional Completeness
- [ ] **Incident detail page** (`/incident/:id`) — Full page with article image, text, map pin, source link, severity badge, similar incidents nearby, share buttons
- [ ] **Clickable map dots** — Click a dot, see popup with image + title + link to detail page
- [ ] **Area filtering on map** — Click "Mumbai" in Explore Areas, map zooms to Mumbai and shows only Mumbai incidents
- [ ] **Category filtering** — Click "Animal Attacks" tab, sidebar + map + count all update
- [ ] **Search functional** — Type "Pune" in search bar, map zooms to Pune, sidebar shows Pune incidents
- [ ] **Infinite scroll** — Sidebar loads more incidents as you scroll (cursor-based pagination)

### Mobile Experience
- [ ] **Responsive map page** — Bottom sheet for incident list on mobile (swipe up), full-width map
- [ ] **Touch-friendly** — Larger tap targets, swipe gestures, pull-to-refresh
- [ ] **PWA** — Installable on mobile home screen, offline indicator

---

## Phase 2: Area Pages — The Core Feature (2-3 sessions)
**Goal:** Every Indian city/state gets a rich, data-driven page. This is what makes Netra valuable — users check an area before visiting.

### Area Page (`/areas/:slug`)
- [ ] **AI-generated area description** — Claude API summarizes safety situation using real scraped data ("Mumbai recorded 4,521 incidents in 2025, with stray dog attacks being the most common...")
- [ ] **Hero image** — Unsplash city photo, full-width banner
- [ ] **Incident map** — Leaflet map zoomed to that area with category-colored dots
- [ ] **Recent incidents sidebar** — Real news with photos, source badges, time ago
- [ ] **Monthly trend chart** (recharts) — Bar/area chart: incident frequency over 12 months by category
- [ ] **Category breakdown donut chart** — What % is animal, crime, accident, environmental
- [ ] **Severity trend line** — Curved chart showing severity changes over time
- [ ] **Year-over-year comparison** — Is this area getting safer or more dangerous?
- [ ] **Sub-area cards** — Neighborhoods/districts within the city with photo + incident count
- [ ] **FAQ section** — AI-generated ("Is Mumbai safe for tourists?", "What are common incidents in Pune?")
- [ ] **Comments section** — User discussions about the area
- [ ] **Share buttons** — Twitter, WhatsApp, Facebook, copy link
- [ ] **Breadcrumb** — Home > Areas > Maharashtra > Pune

### Area Listing (`/areas`)
- [ ] **Photo card grid** — All states/cities with Unsplash images, incident counts, risk badges (like Kumamap)
- [ ] **Search & filter** — Search cities, filter by state, sort by risk level
- [ ] **Risk legend** — Safe / Low / Moderate / High / Very High color scale

### Backend
- [ ] `GET /api/areas` — List all areas with aggregated stats
- [ ] `GET /api/areas/:slug` — Area detail with incidents, stats
- [ ] `GET /api/areas/:slug/trends` — Monthly data for charts (all historical)
- [ ] `GET /api/areas/:slug/breakdown` — Category/severity breakdown
- [ ] `GET /api/areas/:slug/comparison` — Year-over-year

---

## Phase 3: Safety Guides & AI Blog (1-2 sessions)
**Goal:** AI-written content that drives organic traffic and provides real value to travelers.

### Guide Pages (`/guides/:slug`)
- [ ] **Full article layout** — Hero image, rich text, data charts, related incidents
- [ ] **AI-generated content** — Claude API writes guides using real incident data
- [ ] **Guides**: "Animal Safety in India", "Safe Travel Tips", "Monsoon Safety", "Women's Safety Guide", "Road Safety", "Wildlife Encounter Guide"
- [ ] **Data visualizations** — Embedded charts showing real stats
- [ ] **Related incidents** — Real news articles related to the guide topic
- [ ] **Share buttons** — Social sharing

### Blog System (`/blog`)
- [ ] **Auto-generated weekly posts** — Claude API + scraped data
  - "This Week in Indian Safety: 127 incidents tracked"
  - "Monsoon 2026: Which cities are most at risk?"
  - "Leopard encounters surge 40% in Maharashtra"
  - "Safest cities to visit this summer"
- [ ] **Blog post page** — Full article with images, charts, comments
- [ ] **RSS feed** — For subscribers and SEO

---

## Phase 4: User Authentication & Community (2-3 sessions)
**Goal:** Users can report incidents, comment, and build a community.

- [ ] **Firebase Auth** — Phone OTP login (free 10K SMS/month)
- [ ] **User profile** — Dashboard with reports submitted, saved areas, reputation score
- [ ] **Report incident page** — Photo upload (camera + gallery), location picker (tap on map), category/severity selection, description
- [ ] **Community reports** — Show on map with orange "Community" badge
- [ ] **Comments on area pages** — Rich text editor, upvote/downvote comments
- [ ] **Save areas** — Bookmark cities for quick access
- [ ] **Push notifications** — "New incident near your saved location: Leopard spotted in Pune"
- [ ] **Verification system** — Verified users get green badge, higher trust score

---

## Phase 5: Advanced Intelligence Features (2-3 sessions)
**Goal:** Features that no competitor has — make Netra the go-to safety platform.

- [ ] **Predictions/Risk Map** (`/predictions`) — AI-predicted risk zones based on historical patterns, seasonal trends, weather data
- [ ] **Trip Planner** (`/plan`) — Draw route on map, get safety analysis per segment ("High risk of stray dogs between km 12-15")
- [ ] **Nearby Alerts** (`/nearby`) — GPS-based, real-time incidents within configurable radius
- [ ] **Safety Score API** — Public REST API: `GET /api/safety-score?lat=19.07&lng=72.88` returns risk level
- [ ] **WhatsApp Bot** — "Is Mumbai safe?" → instant reply with stats and recent incidents
- [ ] **Telegram Bot** — Same as WhatsApp
- [ ] **Multi-language AI content** — Auto-translate guides/blogs into Hindi, Tamil, Telugu, Bengali, Marathi

---

## Phase 6: Growth & Monetization (ongoing)
**Goal:** Sustainable platform with revenue.

- [ ] **SEO** — Dynamic meta tags, sitemap, structured data (JSON-LD), area pages indexed
- [ ] **Google Ads** — Non-intrusive display ads on high-traffic pages
- [ ] **Safety gear affiliate** — Amazon India affiliate links for bear spray, first aid kits, safety alarms
- [ ] **B2B API** — Sell safety data to insurance companies, travel apps, corporate travel teams
- [ ] **Government partnerships** — Official police/forest department data feeds
- [ ] **Analytics** — Mixpanel/PostHog for user behavior, conversion tracking
- [ ] **Newsletter** — Weekly safety digest email

---

## Technical Infrastructure (parallel with all phases)

- [ ] **Testing** — Jest unit tests for scraper, Playwright E2E tests for frontend
- [ ] **CI/CD** — GitHub Actions: lint, test, build, deploy on push
- [ ] **Monitoring** — Sentry error tracking, UptimeRobot for uptime
- [ ] **CDN** — Cloudflare for static assets + DDoS protection
- [ ] **Database** — MongoDB Atlas (managed), proper indexes, aggregation pipelines
- [ ] **Caching** — Redis TTL strategy: map-dots (2min), feed (30sec), stats (10min)
- [ ] **Rate limiting** — Per-IP and per-user limits
- [ ] **Backups** — Daily automated MongoDB backups to S3
- [ ] **Logging** — Structured JSON logs, log aggregation (Loki/ELK)
- [ ] **Deployment** — Docker Compose for dev, Kubernetes or Railway for production

---

## Priority Order
1. **Phase 1** — Fix what's broken, make it feel real (IMMEDIATE)
2. **Phase 2** — Area pages (BIGGEST value, SEO traffic, core feature)
3. **Phase 3** — AI content (organic traffic, user value)
4. **Phase 4** — Auth & community (engagement, retention)
5. **Phase 5** — Advanced features (differentiation)
6. **Phase 6** — Monetization (sustainability)

---

## Internationalization (i18n) Strategy
- [x] **Auto-translate script** — `scripts/translate.js` uses free Google Translate API to sync all 10 languages from English source
- [x] **All UI strings use translation keys** — No hardcoded English in components
- [ ] **Run `node scripts/translate.js`** after adding new English strings to auto-translate all languages
- [ ] **Human review** — Have native speakers review auto-translated strings for accuracy
- [ ] **RTL support** — Future consideration for Urdu if added
- [ ] **Content translation** — Guide articles, blog posts, FAQ auto-translated via Claude API (Phase 3)

---

## What Makes Netra Different From Kumamap
- **Multi-category** — Not just one animal, but ALL safety incidents (animals, crime, women's safety, accidents, environmental)
- **India-specific** — 10 Indian languages, Indian cities, Indian news sources
- **AI-powered** — Content generation, risk prediction, smart classification
- **Community-driven** — User reports + news scraping combined
- **Actionable** — Trip planner, nearby alerts, safety scores

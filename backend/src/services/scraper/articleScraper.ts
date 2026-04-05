import * as cheerio from 'cheerio';

export interface ScrapedArticle {
  ogImage?: string;
  articleText?: string;
  locationHints: string[];
  resolvedUrl?: string;
}

export async function scrapeArticlePage(url: string, sourceName?: string): Promise<ScrapedArticle> {
  try {
    let targetUrl = url;

    // If it's a Google News URL, try to resolve to actual article
    if (url.includes('news.google.com')) {
      const resolved = await resolveGoogleNewsUrl(url);
      if (resolved !== url) {
        targetUrl = resolved;
      } else {
        // Can't resolve — return empty, will use location image fallback
        return { locationHints: [], resolvedUrl: url };
      }
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    });

    if (!response.ok) return { locationHints: [], resolvedUrl: targetUrl };

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract og:image
    let ogImage = $('meta[property="og:image"]').attr('content')
      || $('meta[name="twitter:image"]').attr('content')
      || $('meta[name="twitter:image:src"]').attr('content')
      || $('meta[property="og:image:url"]').attr('content')
      || $('meta[property="og:image:secure_url"]').attr('content');

    // Fallback: first large image in article
    if (!ogImage) {
      $('article img, [class*="story"] img, [class*="article"] img, .main-content img, figure img').each((_, el) => {
        if (ogImage) return;
        const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
        if (src && !isBadImage(src)) ogImage = src;
      });
    }

    // Fix relative URLs
    if (ogImage && !ogImage.startsWith('http')) {
      try { ogImage = new URL(ogImage, new URL(targetUrl).origin).href; } catch { ogImage = undefined; }
    }

    if (ogImage && isBadImage(ogImage)) ogImage = undefined;

    // Extract article text
    const articleText = $('article').text()
      || $('[class*="article-body"]').text()
      || $('[class*="story-content"]').text()
      || $('[itemprop="articleBody"]').text()
      || $('main').text()
      || '';

    // Location hints
    const locationHints: string[] = [];
    const locationMeta = $('meta[name="geo.placename"]').attr('content')
      || $('meta[name="geo.region"]').attr('content');
    if (locationMeta) locationHints.push(locationMeta);

    return {
      ogImage: ogImage || undefined,
      articleText: articleText.slice(0, 2000),
      locationHints,
      resolvedUrl: targetUrl,
    };
  } catch {
    return { locationHints: [] };
  }
}

function isBadImage(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('logo') || lower.includes('favicon') || lower.includes('icon')
    || lower.includes('placeholder') || lower.includes('default')
    || lower.includes('google.com') || lower.includes('gstatic.com')
    || lower.includes('googleusercontent.com')
    || lower.includes('sprite') || lower.includes('avatar')
    || lower.includes('badge') || lower.includes('pixel')
    || lower.includes('1x1') || lower.includes('blank')
    || lower.includes('data:image');
}

async function resolveGoogleNewsUrl(url: string): Promise<string> {
  if (!url.includes('news.google.com')) return url;

  try {
    // Google News /rss/articles/ uses encoded article IDs
    // Approach: fetch the Google News page, it contains a JS redirect to the actual article
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    });

    const finalUrl = response.url;
    if (!finalUrl.includes('google.com')) return finalUrl;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Method 1: data-n-au attribute
    const dataUrl = $('[data-n-au]').attr('data-n-au');
    if (dataUrl && dataUrl.startsWith('http') && !dataUrl.includes('google.com')) return dataUrl;

    // Method 2: Find the article redirect in noscript or jscontroller
    const noscriptContent = $('noscript').html() || '';
    const noscriptMatch = noscriptContent.match(/href="(https?:\/\/(?!.*google\.com)[^\s"]+)"/);
    if (noscriptMatch) return noscriptMatch[1];

    // Method 3: c-wiz redirect URL
    const cwizMatch = html.match(/data-url="(https?:\/\/(?!.*google\.com)[^\s"]+)"/);
    if (cwizMatch) return cwizMatch[1];

    // Method 4: any non-google URL in the page
    const allUrls = html.match(/https?:\/\/(?:www\.)?(?!google\.com|googleapis|gstatic|youtube)[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-z]{2,}\/[^\s"'<>\\]{5,}/g);
    if (allUrls && allUrls.length > 0) {
      // Pick the first URL that looks like a news article
      for (const candidate of allUrls) {
        if (candidate.includes('/article') || candidate.includes('/news/')
          || candidate.includes('/story/') || candidate.includes('/india/')
          || candidate.includes('.html') || candidate.includes('/amp/')) {
          return candidate;
        }
      }
      return allUrls[0];
    }

  } catch {}

  return url;
}

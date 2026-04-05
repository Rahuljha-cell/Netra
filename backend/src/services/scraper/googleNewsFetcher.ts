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
  const match = title.match(/^(.+)\s-\s([^-]+)$/);
  if (match) {
    return { cleanTitle: match[1].trim(), sourceName: match[2].trim() };
  }
  return { cleanTitle: title, sourceName: 'Unknown' };
}

function extractThumbnail(item: any): string | undefined {
  if (item.mediaContent?.$?.url) return item.mediaContent.$.url;
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
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

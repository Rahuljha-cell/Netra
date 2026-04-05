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
    timespan: '1440',
  });

  try {
    const response = await fetch(`${GDELT_API}?${params}`, {
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) return [];

    const text = await response.text();
    let data: { articles?: any[] };
    try {
      data = JSON.parse(text);
    } catch {
      // GDELT sometimes returns non-JSON error messages
      return [];
    }
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
  } catch {
    // GDELT often times out — silently fall back to Google News only
    return [];
  }
}

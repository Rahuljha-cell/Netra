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
  return intersection.size / union.size;
}

export async function isDuplicate(url: string, title: string): Promise<boolean> {
  const urlH = hashUrl(url);

  const existingUrl = await Incident.findOne({ urlHash: urlH }).lean();
  if (existingUrl) return true;

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

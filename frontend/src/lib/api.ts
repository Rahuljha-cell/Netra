const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchFeed(params: Record<string, string> = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/incidents/feed?${query}`);
    if (!res.ok) throw new Error('API error');
    return res.json();
  } catch {
    return null; // Fallback to mock data
  }
}

export async function fetchMapDots(params: Record<string, string> = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/incidents/map-dots?${query}`);
    if (!res.ok) throw new Error('API error');
    return res.json();
  } catch {
    return null;
  }
}

export async function incrementView(id: string) {
  fetch(`${API_BASE}/incidents/${id}/view`, { method: 'PATCH' }).catch(() => {});
}

export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/incidents/stats`);
    if (!res.ok) throw new Error('API error');
    return res.json();
  } catch {
    return null;
  }
}

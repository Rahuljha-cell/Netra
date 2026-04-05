export interface GeocodedLocation {
  lat: number;
  lng: number;
  city: string;
  state: string;
  area?: string;
}

// Local coordinate database — instant lookup, no API calls
const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number; state: string }> = {
  // States & UTs
  'uttarakhand': { lat: 30.07, lng: 79.49, state: 'Uttarakhand' },
  'uttar pradesh': { lat: 26.85, lng: 80.91, state: 'Uttar Pradesh' },
  'madhya pradesh': { lat: 23.47, lng: 77.95, state: 'Madhya Pradesh' },
  'himachal pradesh': { lat: 31.10, lng: 77.17, state: 'Himachal Pradesh' },
  'andhra pradesh': { lat: 15.91, lng: 79.74, state: 'Andhra Pradesh' },
  'tamil nadu': { lat: 11.13, lng: 78.66, state: 'Tamil Nadu' },
  'west bengal': { lat: 22.99, lng: 87.85, state: 'West Bengal' },
  'maharashtra': { lat: 19.66, lng: 75.30, state: 'Maharashtra' },
  'karnataka': { lat: 15.32, lng: 75.71, state: 'Karnataka' },
  'kerala': { lat: 10.85, lng: 76.27, state: 'Kerala' },
  'rajasthan': { lat: 27.02, lng: 74.22, state: 'Rajasthan' },
  'gujarat': { lat: 22.26, lng: 71.19, state: 'Gujarat' },
  'bihar': { lat: 25.10, lng: 85.31, state: 'Bihar' },
  'odisha': { lat: 20.94, lng: 84.80, state: 'Odisha' },
  'chhattisgarh': { lat: 21.27, lng: 81.87, state: 'Chhattisgarh' },
  'jharkhand': { lat: 23.61, lng: 85.28, state: 'Jharkhand' },
  'assam': { lat: 26.20, lng: 92.94, state: 'Assam' },
  'punjab': { lat: 31.15, lng: 75.34, state: 'Punjab' },
  'haryana': { lat: 29.06, lng: 76.09, state: 'Haryana' },
  'telangana': { lat: 18.11, lng: 79.02, state: 'Telangana' },
  'goa': { lat: 15.30, lng: 74.00, state: 'Goa' },
  'manipur': { lat: 24.66, lng: 93.91, state: 'Manipur' },
  'meghalaya': { lat: 25.47, lng: 91.37, state: 'Meghalaya' },
  'tripura': { lat: 23.94, lng: 91.99, state: 'Tripura' },
  'sikkim': { lat: 27.53, lng: 88.51, state: 'Sikkim' },
  'nagaland': { lat: 26.16, lng: 94.56, state: 'Nagaland' },
  'mizoram': { lat: 23.16, lng: 92.94, state: 'Mizoram' },
  'arunachal pradesh': { lat: 28.22, lng: 94.73, state: 'Arunachal Pradesh' },
  'delhi': { lat: 28.61, lng: 77.21, state: 'Delhi' },
  'jammu and kashmir': { lat: 33.78, lng: 76.58, state: 'Jammu and Kashmir' },
  'kashmir': { lat: 34.08, lng: 74.80, state: 'Jammu and Kashmir' },
  'ladakh': { lat: 34.15, lng: 77.58, state: 'Ladakh' },
  // Major cities
  'mumbai': { lat: 19.08, lng: 72.88, state: 'Maharashtra' },
  'pune': { lat: 18.52, lng: 73.86, state: 'Maharashtra' },
  'thane': { lat: 19.22, lng: 72.98, state: 'Maharashtra' },
  'nagpur': { lat: 21.15, lng: 79.09, state: 'Maharashtra' },
  'nashik': { lat: 19.99, lng: 73.79, state: 'Maharashtra' },
  'chandrapur': { lat: 19.95, lng: 79.30, state: 'Maharashtra' },
  'kolhapur': { lat: 16.70, lng: 74.24, state: 'Maharashtra' },
  'aurangabad': { lat: 19.88, lng: 75.34, state: 'Maharashtra' },
  'solapur': { lat: 17.66, lng: 75.91, state: 'Maharashtra' },
  'shirur': { lat: 18.83, lng: 74.38, state: 'Maharashtra' },
  'junnar': { lat: 19.21, lng: 73.88, state: 'Maharashtra' },
  'bangalore': { lat: 12.97, lng: 77.59, state: 'Karnataka' },
  'bengaluru': { lat: 12.97, lng: 77.59, state: 'Karnataka' },
  'mysore': { lat: 12.30, lng: 76.66, state: 'Karnataka' },
  'mysuru': { lat: 12.30, lng: 76.66, state: 'Karnataka' },
  'mangalore': { lat: 12.87, lng: 74.84, state: 'Karnataka' },
  'hubli': { lat: 15.36, lng: 75.12, state: 'Karnataka' },
  'chamarajanagar': { lat: 11.93, lng: 76.94, state: 'Karnataka' },
  'bandipur': { lat: 11.67, lng: 76.63, state: 'Karnataka' },
  'nagarahole': { lat: 12.05, lng: 76.15, state: 'Karnataka' },
  'chennai': { lat: 13.08, lng: 80.27, state: 'Tamil Nadu' },
  'coimbatore': { lat: 11.02, lng: 76.96, state: 'Tamil Nadu' },
  'madurai': { lat: 9.92, lng: 78.12, state: 'Tamil Nadu' },
  'valparai': { lat: 10.33, lng: 76.97, state: 'Tamil Nadu' },
  'hyderabad': { lat: 17.39, lng: 78.49, state: 'Telangana' },
  'kolkata': { lat: 22.57, lng: 88.36, state: 'West Bengal' },
  'siliguri': { lat: 26.71, lng: 88.43, state: 'West Bengal' },
  'darjeeling': { lat: 27.04, lng: 88.27, state: 'West Bengal' },
  'sundarbans': { lat: 21.95, lng: 89.18, state: 'West Bengal' },
  'jaipur': { lat: 26.91, lng: 75.79, state: 'Rajasthan' },
  'udaipur': { lat: 24.59, lng: 73.71, state: 'Rajasthan' },
  'jodhpur': { lat: 26.24, lng: 73.02, state: 'Rajasthan' },
  'ranthambore': { lat: 26.02, lng: 76.50, state: 'Rajasthan' },
  'lucknow': { lat: 26.85, lng: 80.95, state: 'Uttar Pradesh' },
  'varanasi': { lat: 25.32, lng: 82.99, state: 'Uttar Pradesh' },
  'agra': { lat: 27.18, lng: 78.02, state: 'Uttar Pradesh' },
  'kanpur': { lat: 26.45, lng: 80.33, state: 'Uttar Pradesh' },
  'pilibhit': { lat: 28.63, lng: 79.80, state: 'Uttar Pradesh' },
  'bahraich': { lat: 27.57, lng: 81.60, state: 'Uttar Pradesh' },
  'lakhimpur kheri': { lat: 27.95, lng: 80.78, state: 'Uttar Pradesh' },
  'gorakhpur': { lat: 26.76, lng: 83.37, state: 'Uttar Pradesh' },
  'sitapur': { lat: 27.57, lng: 80.68, state: 'Uttar Pradesh' },
  'balrampur': { lat: 27.43, lng: 82.18, state: 'Uttar Pradesh' },
  'ahmedabad': { lat: 23.02, lng: 72.57, state: 'Gujarat' },
  'surat': { lat: 21.17, lng: 72.83, state: 'Gujarat' },
  'vadodara': { lat: 22.31, lng: 73.18, state: 'Gujarat' },
  'dang': { lat: 20.75, lng: 73.74, state: 'Gujarat' },
  'panchmahal': { lat: 22.75, lng: 73.60, state: 'Gujarat' },
  'bhopal': { lat: 23.26, lng: 77.41, state: 'Madhya Pradesh' },
  'indore': { lat: 22.72, lng: 75.86, state: 'Madhya Pradesh' },
  'balaghat': { lat: 21.81, lng: 80.19, state: 'Madhya Pradesh' },
  'khandwa': { lat: 21.82, lng: 76.35, state: 'Madhya Pradesh' },
  'pench': { lat: 21.72, lng: 79.29, state: 'Madhya Pradesh' },
  'patna': { lat: 25.61, lng: 85.14, state: 'Bihar' },
  'bagaha': { lat: 27.10, lng: 84.09, state: 'Bihar' },
  'chandigarh': { lat: 30.73, lng: 76.78, state: 'Chandigarh' },
  'shimla': { lat: 31.10, lng: 77.17, state: 'Himachal Pradesh' },
  'solan': { lat: 30.91, lng: 77.10, state: 'Himachal Pradesh' },
  'mcleodganj': { lat: 32.24, lng: 76.32, state: 'Himachal Pradesh' },
  'chamba': { lat: 32.56, lng: 76.13, state: 'Himachal Pradesh' },
  'dehradun': { lat: 30.32, lng: 78.03, state: 'Uttarakhand' },
  'haridwar': { lat: 29.95, lng: 78.16, state: 'Uttarakhand' },
  'uttarkashi': { lat: 30.73, lng: 78.45, state: 'Uttarakhand' },
  'corbett': { lat: 29.53, lng: 78.77, state: 'Uttarakhand' },
  'almora': { lat: 29.60, lng: 79.66, state: 'Uttarakhand' },
  'bageshwar': { lat: 29.84, lng: 79.77, state: 'Uttarakhand' },
  'chamoli': { lat: 30.40, lng: 79.32, state: 'Uttarakhand' },
  'pauri': { lat: 30.15, lng: 78.77, state: 'Uttarakhand' },
  'ranchi': { lat: 23.34, lng: 85.31, state: 'Jharkhand' },
  'raipur': { lat: 21.25, lng: 81.63, state: 'Chhattisgarh' },
  'guwahati': { lat: 26.14, lng: 91.74, state: 'Assam' },
  'dibrugarh': { lat: 27.47, lng: 94.91, state: 'Assam' },
  'bhubaneswar': { lat: 20.30, lng: 85.82, state: 'Odisha' },
  'jajpur': { lat: 20.84, lng: 86.34, state: 'Odisha' },
  'kochi': { lat: 9.93, lng: 76.27, state: 'Kerala' },
  'thiruvananthapuram': { lat: 8.52, lng: 76.94, state: 'Kerala' },
  'wayanad': { lat: 11.69, lng: 76.13, state: 'Kerala' },
  'munnar': { lat: 10.09, lng: 77.06, state: 'Kerala' },
  'kollam': { lat: 8.89, lng: 76.60, state: 'Kerala' },
  'srinagar': { lat: 34.08, lng: 74.80, state: 'Jammu and Kashmir' },
  'jammu': { lat: 32.73, lng: 74.87, state: 'Jammu and Kashmir' },
  'poonch': { lat: 33.77, lng: 74.09, state: 'Jammu and Kashmir' },
  'amritsar': { lat: 31.63, lng: 74.87, state: 'Punjab' },
  'visakhapatnam': { lat: 17.69, lng: 83.22, state: 'Andhra Pradesh' },
  'nandyal': { lat: 15.48, lng: 78.48, state: 'Andhra Pradesh' },
  'panaji': { lat: 15.50, lng: 73.83, state: 'Goa' },
  'imphal': { lat: 24.82, lng: 93.95, state: 'Manipur' },
  'shillong': { lat: 25.57, lng: 91.88, state: 'Meghalaya' },
  'gangtok': { lat: 27.33, lng: 88.62, state: 'Sikkim' },
  'agartala': { lat: 23.83, lng: 91.28, state: 'Tripura' },
  'noida': { lat: 28.54, lng: 77.39, state: 'Uttar Pradesh' },
  'gurugram': { lat: 28.46, lng: 77.03, state: 'Haryana' },
  'gurgaon': { lat: 28.46, lng: 77.03, state: 'Haryana' },
  'brahmapuri': { lat: 20.61, lng: 79.86, state: 'Maharashtra' },
  'sinnar': { lat: 19.85, lng: 73.99, state: 'Maharashtra' },
  'dindori': { lat: 22.95, lng: 81.08, state: 'Madhya Pradesh' },
  'nanded': { lat: 19.16, lng: 77.32, state: 'Maharashtra' },
  'pali': { lat: 25.77, lng: 73.32, state: 'Rajasthan' },
  'moran': { lat: 27.15, lng: 94.88, state: 'Assam' },
  'nilgiris': { lat: 11.40, lng: 76.73, state: 'Tamil Nadu' },
  'tenkasi': { lat: 8.96, lng: 77.32, state: 'Tamil Nadu' },
  'jalpaiguri': { lat: 26.52, lng: 88.73, state: 'West Bengal' },
  'cooch behar': { lat: 26.32, lng: 89.45, state: 'West Bengal' },
  'nugu': { lat: 11.88, lng: 76.55, state: 'Karnataka' },
  'kalikavu': { lat: 11.17, lng: 76.26, state: 'Kerala' },
  'halasagara': { lat: 14.45, lng: 75.63, state: 'Karnataka' },
  'kuno': { lat: 25.35, lng: 77.28, state: 'Madhya Pradesh' },
  'dahod': { lat: 22.84, lng: 74.25, state: 'Gujarat' },
};

export async function geocodeLocation(locationText: string): Promise<GeocodedLocation | null> {
  // 1. Try local lookup first (instant, no API call)
  const key = locationText.toLowerCase().trim();
  if (KNOWN_LOCATIONS[key]) {
    const loc = KNOWN_LOCATIONS[key];
    return { lat: loc.lat, lng: loc.lng, city: locationText, state: loc.state };
  }

  // 2. Try partial match (e.g. "south Kashmir" → "kashmir")
  for (const [name, loc] of Object.entries(KNOWN_LOCATIONS)) {
    if (key.includes(name) || name.includes(key)) {
      return { lat: loc.lat, lng: loc.lng, city: locationText, state: loc.state };
    }
  }

  // 3. Try Nominatim → OpenCage → MapTiler as fallbacks
  const result = await nominatimGeocode(locationText)
    || await opencageGeocode(locationText)
    || await maptilerGeocode(locationText);

  return result;
}

let lastGeocodedAt = 0;

async function nominatimGeocode(locationText: string): Promise<GeocodedLocation | null> {
  // Rate limit: max 1 request per second
  const now = Date.now();
  if (now - lastGeocodedAt < 1100) {
    await new Promise(r => setTimeout(r, 1100 - (now - lastGeocodedAt)));
  }
  lastGeocodedAt = Date.now();

  const query = locationText.includes('India') ? locationText : `${locationText}, India`;

  try {
    const params = new URLSearchParams({
      q: query, format: 'json', limit: '1', countrycodes: 'in', addressdetails: '1',
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': 'Netra-SafetyIntelligence/1.0 (contact@netra.in)' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;
    const results = await response.json() as any[];
    if (!results.length) return null;

    const result = results[0];
    const address = result.address || {};

    // Cache for future lookups
    const city = address.city || address.town || address.village || address.county || locationText;
    KNOWN_LOCATIONS[locationText.toLowerCase()] = {
      lat: parseFloat(result.lat), lng: parseFloat(result.lon),
      state: address.state || '',
    };

    return {
      lat: parseFloat(result.lat), lng: parseFloat(result.lon),
      city, state: address.state || '',
      area: address.suburb || address.neighbourhood || undefined,
    };
  } catch {
    return null;
  }
}

// OpenCage Geocoder — free 2,500 req/day, no key needed for low volume
async function opencageGeocode(locationText: string): Promise<GeocodedLocation | null> {
  const apiKey = process.env.OPENCAGE_API_KEY;
  // Works without key at very low volume, but key recommended
  if (!apiKey) return null;

  try {
    const query = encodeURIComponent(`${locationText}, India`);
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${query}&countrycode=in&limit=1&key=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return null;

    const data = await response.json() as any;
    const result = data.results?.[0];
    if (!result) return null;

    const city = result.components?.city || result.components?.town || result.components?.village || locationText;
    const state = result.components?.state || '';

    KNOWN_LOCATIONS[locationText.toLowerCase()] = {
      lat: result.geometry.lat, lng: result.geometry.lng, state,
    };

    return { lat: result.geometry.lat, lng: result.geometry.lng, city, state };
  } catch {
    return null;
  }
}

// MapTiler Geocoder — free 100K req/month
async function maptilerGeocode(locationText: string): Promise<GeocodedLocation | null> {
  const apiKey = process.env.MAPTILER_API_KEY;
  if (!apiKey) return null;

  try {
    const query = encodeURIComponent(`${locationText} India`);
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${query}.json?key=${apiKey}&country=in&limit=1`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return null;

    const data = await response.json() as any;
    const feature = data.features?.[0];
    if (!feature) return null;

    const [lng, lat] = feature.center;
    const city = feature.text || locationText;
    const state = feature.context?.find((c: any) => c.id?.startsWith('region'))?.text || '';

    KNOWN_LOCATIONS[locationText.toLowerCase()] = { lat, lng, state };

    return { lat, lng, city, state };
  } catch {
    return null;
  }
}

// Indian states and UTs for matching
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Dadra and Nagar Haveli', 'Lakshadweep', 'Andaman and Nicobar',
];

// State abbreviations used in news
const STATE_ABBREVS: Record<string, string> = {
  'UP': 'Uttar Pradesh', 'MP': 'Madhya Pradesh', 'HP': 'Himachal Pradesh',
  'AP': 'Andhra Pradesh', 'TN': 'Tamil Nadu', 'WB': 'West Bengal',
  'JK': 'Jammu and Kashmir', 'J&K': 'Jammu and Kashmir',
};

// Words to skip during extraction
const SKIP_WORDS = new Set([
  'The', 'India', 'Indian', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday', 'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August', 'September', 'October', 'November',
  'December', 'Police', 'Forest', 'Video', 'Watch', 'Breaking', 'Alert',
  'News', 'Report', 'CRPF', 'BSF', 'Army', 'Navy', 'Exclusive', 'Opinion',
  'Why', 'How', 'What', 'When', 'Where', 'These', 'After', 'Before',
  'During', 'About', 'Here', 'Rare', 'Pink', 'Red', 'Black', 'White',
  'Five', 'Four', 'Three', 'Two', 'One', 'Year', 'Old', 'New',
]);

export function extractLocationFromText(text: string): string[] {
  const locations: string[] = [];
  const seen = new Set<string>();

  function add(loc: string) {
    const trimmed = loc.trim();
    if (trimmed.length >= 3 && !seen.has(trimmed.toLowerCase()) && !SKIP_WORDS.has(trimmed) && !SKIP_WORDS.has(trimmed.split(' ')[0])) {
      seen.add(trimmed.toLowerCase());
      locations.push(trimmed);
    }
  }

  // 1. Match Indian states directly
  for (const state of INDIAN_STATES) {
    if (text.includes(state)) add(state);
  }

  // 2. Match state abbreviations: "UP's Lakhimpur Kheri"
  for (const [abbrev, fullState] of Object.entries(STATE_ABBREVS)) {
    const abbrPattern = new RegExp(`${abbrev}'s\\s+([A-Z][a-zA-Z\\s]+?)(?:\\s*[,;.|]|$)`, 'g');
    const match = abbrPattern.exec(text);
    if (match) add(match[1].trim());
    if (text.includes(`${abbrev}'s `) || text.includes(` ${abbrev} `)) add(fullState);
  }

  // 3. All pattern-based extractions
  const locationPatterns = [
    /(?:in|at|near|from|of)\s+(?:north|south|east|west|central)?\s*([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*)/g,
    /^([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*):/gm,
    /\bin\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)\s+(?:after|as|following|amid|during|where|village|district|forest)/g,
    /([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?),\s+(?:search|locals|police|officials|residents|people|villagers|authorities|panic|fear)/g,
    /(?:attack|spotted|killed|injured|died|found|rescued)\s+(?:in|at|near)\s+([A-Z][a-zA-Z]+(?:['']s\s+[A-Z][a-zA-Z]+)?(?:\s[A-Z][a-zA-Z]+)?)/g,
    /(?:area|region|district|village|town|city|reserve|park|forest|temple|shrine)\s+(?:of|in|at|near)\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/g,
    /([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)'s\s+(?:[A-Z][a-z])/g,
  ];

  for (const pattern of locationPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      add(match[1].trim());
    }
  }

  // 4. Extract ALL capitalized words as potential locations
  const capitalizedPattern = /\b([A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,}){0,2})\b/g;
  let match;
  while ((match = capitalizedPattern.exec(text)) !== null) {
    add(match[1]);
  }

  return locations;
}

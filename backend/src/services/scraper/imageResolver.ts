import cloudinary from '../../utils/cloudinary';

export interface ResolvedImage {
  imageUrl: string;
  imageThumbnail: string;
  imageSource: 'og_image' | 'google_thumbnail' | 'gdelt' | 'cloudinary' | 'placeholder';
}

// City-specific images — multiple per city so incidents don't all look the same
const CITY_IMAGES: Record<string, string[]> = {
  'mumbai': [
    'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e13?w=400&h=250&fit=crop',
  ],
  'delhi': [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1597040663342-45b6af3d7489?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1515091943-9d5c0ad475af?w=400&h=250&fit=crop',
  ],
  'bangalore': [
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1580581096469-8afb1df5d504?w=400&h=250&fit=crop',
  ],
  'chennai': [
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400&h=250&fit=crop',
  ],
  'kolkata': [
    'https://images.unsplash.com/photo-1558431382-27e303142255?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1536421469767-80559bb6f5a1?w=400&h=250&fit=crop',
  ],
  'hyderabad': [
    'https://images.unsplash.com/photo-1572435555646-7ad9a149ad91?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=250&fit=crop',
  ],
  'jaipur': [
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&h=250&fit=crop',
  ],
  'varanasi': [
    'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1571536802086-159b53516919?w=400&h=250&fit=crop',
  ],
  'pune': [
    'https://images.unsplash.com/photo-1572782252655-9c8e50b98e5f?w=400&h=250&fit=crop',
  ],
  'kerala': [
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=400&h=250&fit=crop',
  ],
  'uttarakhand': [
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1555554317-766fb7191589?w=400&h=250&fit=crop',
  ],
  'rajasthan': [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&h=250&fit=crop',
  ],
  'maharashtra': [
    'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e13?w=400&h=250&fit=crop',
  ],
  'karnataka': [
    'https://images.unsplash.com/photo-1600100397608-e1e0d926f662?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1580581096469-8afb1df5d504?w=400&h=250&fit=crop',
  ],
  'gujarat': [
    'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=400&h=250&fit=crop',
  ],
  'madhya pradesh': [
    'https://images.unsplash.com/photo-1590766940554-634e539e8537?w=400&h=250&fit=crop',
  ],
  'uttar pradesh': [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1585135497273-1a86d9d19a0a?w=400&h=250&fit=crop',
  ],
  'west bengal': [
    'https://images.unsplash.com/photo-1558431382-27e303142255?w=400&h=250&fit=crop',
  ],
  'tamil nadu': [
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=250&fit=crop',
  ],
  'odisha': [
    'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=400&h=250&fit=crop',
  ],
  'assam': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
  ],
  'himachal pradesh': [
    'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=250&fit=crop',
  ],
  'kashmir': [
    'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=400&h=250&fit=crop',
  ],
  'bihar': [
    'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=400&h=250&fit=crop',
  ],
  'chhattisgarh': [
    'https://images.unsplash.com/photo-1590766940554-634e539e8537?w=400&h=250&fit=crop',
  ],
};

// Category fallback images (when no city match)
const CATEGORY_IMAGES: Record<string, string[]> = {
  animal: [
    'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=400&h=250&fit=crop',
  ],
  crime: [
    'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=400&h=250&fit=crop',
  ],
  women_safety: [
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=250&fit=crop',
  ],
  personal_safety: [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
  ],
  accident: [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
  ],
  environmental: [
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1559827291-bdd12e484085?w=400&h=250&fit=crop',
  ],
};

// Generic India images as final fallback
const INDIA_IMAGES = [
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1532664189809-02133fee698d?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1585135497273-1a86d9d19a0a?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=400&h=250&fit=crop',
];

function pickRandom(arr: string[], seed: string): string {
  // Use title hash as seed so same article always gets same image
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return arr[Math.abs(hash) % arr.length];
}

function getCityImage(city: string, state: string, title: string): string {
  const cityLower = city.toLowerCase();
  const stateLower = state.toLowerCase();

  // Try exact city match
  if (CITY_IMAGES[cityLower]) return pickRandom(CITY_IMAGES[cityLower], title);

  // Try state match
  if (CITY_IMAGES[stateLower]) return pickRandom(CITY_IMAGES[stateLower], title);

  // Try partial match
  for (const [key, images] of Object.entries(CITY_IMAGES)) {
    if (cityLower.includes(key) || key.includes(cityLower) ||
        stateLower.includes(key) || key.includes(stateLower)) {
      return pickRandom(images, title);
    }
  }

  return '';
}

function isCloudinaryConfigured(): boolean {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

async function isImageValid(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const contentType = response.headers.get('content-type') || '';
    return response.ok && contentType.startsWith('image/');
  } catch {
    return false;
  }
}

function isBadImage(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('logo') || lower.includes('favicon') || lower.includes('icon')
    || lower.includes('google.com') || lower.includes('gstatic.com')
    || lower.includes('googleusercontent.com')
    || lower.includes('sprite') || lower.includes('avatar')
    || lower.includes('badge') || lower.includes('pixel')
    || lower.includes('1x1') || lower.includes('blank')
    || lower.includes('data:image');
}

async function uploadToCloudinary(imageUrl: string): Promise<{ full: string; thumb: string } | null> {
  if (!isCloudinaryConfigured()) return null;
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'netra/incidents',
      transformation: [{ width: 800, height: 500, crop: 'fill', quality: 'auto' }],
    });
    const thumbUrl = cloudinary.url(result.public_id, {
      width: 300, height: 200, crop: 'fill', quality: 'auto', format: 'webp',
    });
    return { full: result.secure_url, thumb: thumbUrl };
  } catch {
    return null;
  }
}

export async function resolveImage(
  ogImage?: string,
  googleThumbnail?: string,
  gdeltImage?: string,
  category: string = 'crime',
  locationCity?: string,
  locationState?: string,
  title?: string
): Promise<ResolvedImage> {
  const seed = title || locationCity || category;

  // Tier 1: Real article og:image
  if (ogImage && !isBadImage(ogImage) && await isImageValid(ogImage)) {
    const uploaded = await uploadToCloudinary(ogImage);
    if (uploaded) {
      return { imageUrl: uploaded.full, imageThumbnail: uploaded.thumb, imageSource: 'cloudinary' };
    }
    return { imageUrl: ogImage, imageThumbnail: ogImage, imageSource: 'og_image' };
  }

  // Tier 2: Google thumbnail (only if not a Google logo)
  if (googleThumbnail && !isBadImage(googleThumbnail) && await isImageValid(googleThumbnail)) {
    const uploaded = await uploadToCloudinary(googleThumbnail);
    if (uploaded) {
      return { imageUrl: uploaded.full, imageThumbnail: uploaded.thumb, imageSource: 'cloudinary' };
    }
    return { imageUrl: googleThumbnail, imageThumbnail: googleThumbnail, imageSource: 'google_thumbnail' };
  }

  // Tier 3: GDELT image
  if (gdeltImage && !isBadImage(gdeltImage) && await isImageValid(gdeltImage)) {
    return { imageUrl: gdeltImage, imageThumbnail: gdeltImage, imageSource: 'gdelt' };
  }

  // Tier 4: City/state-specific photo → upload to Cloudinary for CDN + thumbnails
  if (locationCity || locationState) {
    const cityImg = getCityImage(locationCity || '', locationState || '', seed);
    if (cityImg) {
      const uploaded = await uploadToCloudinary(cityImg);
      if (uploaded) {
        return { imageUrl: uploaded.full, imageThumbnail: uploaded.thumb, imageSource: 'cloudinary' };
      }
      return { imageUrl: cityImg, imageThumbnail: cityImg, imageSource: 'placeholder' };
    }
  }

  // Tier 5: Category-specific image → upload to Cloudinary
  const catImages = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.crime;
  const catImg = pickRandom(catImages, seed);
  if (catImg) {
    const uploaded = await uploadToCloudinary(catImg);
    if (uploaded) {
      return { imageUrl: uploaded.full, imageThumbnail: uploaded.thumb, imageSource: 'cloudinary' };
    }
    return { imageUrl: catImg, imageThumbnail: catImg, imageSource: 'placeholder' };
  }

  // Tier 6: Generic India image → upload to Cloudinary
  const indiaImg = pickRandom(INDIA_IMAGES, seed);
  const uploaded = await uploadToCloudinary(indiaImg);
  if (uploaded) {
    return { imageUrl: uploaded.full, imageThumbnail: uploaded.thumb, imageSource: 'cloudinary' };
  }
  return { imageUrl: indiaImg, imageThumbnail: indiaImg, imageSource: 'placeholder' };
}

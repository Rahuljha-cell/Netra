export const locales = ['en', 'hi', 'ta', 'te', 'bn', 'kn', 'ml', 'mr', 'gu', 'pa'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  hi: { native: 'हिन्दी', english: 'Hindi' },
  ta: { native: 'தமிழ்', english: 'Tamil' },
  te: { native: 'తెలుగు', english: 'Telugu' },
  bn: { native: 'বাংলা', english: 'Bengali' },
  kn: { native: 'ಕನ್ನಡ', english: 'Kannada' },
  ml: { native: 'മലയാളം', english: 'Malayalam' },
  mr: { native: 'मराठी', english: 'Marathi' },
  gu: { native: 'ગુજરાતી', english: 'Gujarati' },
  pa: { native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
};

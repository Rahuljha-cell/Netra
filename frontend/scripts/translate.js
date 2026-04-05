const fs = require('fs');
const path = require('path');

// Language codes and their Google Translate codes
const LANGUAGES = {
  hi: 'hi', ta: 'ta', te: 'te', bn: 'bn',
  kn: 'kn', ml: 'ml', mr: 'mr', gu: 'gu', pa: 'pa',
};

const messagesDir = path.join(__dirname, '..', 'src', 'i18n', 'messages');

async function translate(text, targetLang) {
  try {
    const { translate } = await import('@vitalets/google-translate-api');
    const result = await translate(text, { to: targetLang });
    return result.text;
  } catch (err) {
    console.error(`  Failed to translate "${text.slice(0, 30)}..." to ${targetLang}:`, err.message);
    return text; // fallback to English
  }
}

async function translateObject(obj, targetLang, existingObj = {}) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, targetLang, existingObj[key] || {});
    } else if (typeof value === 'string') {
      // Skip if already translated
      if (existingObj[key] && existingObj[key] !== value) {
        result[key] = existingObj[key];
      } else {
        // Translate
        await new Promise(r => setTimeout(r, 200)); // rate limit
        result[key] = await translate(value, targetLang);
        process.stdout.write('.');
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function main() {
  const enFile = path.join(messagesDir, 'en.json');
  const en = JSON.parse(fs.readFileSync(enFile, 'utf-8'));

  for (const [langCode, googleCode] of Object.entries(LANGUAGES)) {
    const langFile = path.join(messagesDir, `${langCode}.json`);
    let existing = {};
    try {
      existing = JSON.parse(fs.readFileSync(langFile, 'utf-8'));
    } catch {}

    console.log(`\nTranslating to ${langCode} (${googleCode})...`);
    const translated = await translateObject(en, googleCode, existing);

    fs.writeFileSync(langFile, JSON.stringify(translated, null, 2) + '\n', 'utf-8');
    console.log(` Done! Saved ${langFile}`);
  }

  console.log('\nAll translations complete!');
}

main().catch(console.error);

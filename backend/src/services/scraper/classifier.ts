/**
 * Smart incident classifier using weighted keyword scoring.
 * Each category has weighted keywords — higher weight = stronger signal.
 * The category with the highest total score wins.
 * This replaces simple regex matching with a scoring system that handles
 * ambiguous articles much better.
 */

interface ClassificationResult {
  category: string;
  subCategory: string;
  severity: string;
  confidence: number;
}

interface KeywordRule {
  pattern: RegExp;
  weight: number;
  subCategory: string;
}

// Negative patterns — if these match, DON'T classify as this category
const NEGATIVE_PATTERNS: Record<string, RegExp[]> = {
  animal: [
    /stock market|sensex|nifty|BSE|bearish|bullish|rally|correction/i,
    /lone.?wolf.*terror|wolf.*isis|wolf.*threat/i,
    /party animal|social animal|animal spirit/i,
  ],
  crime: [
    /film|movie|series|web series|OTT|trailer|bollywood/i,
    /cricket|sports|match|tournament|IPL/i,
    /novel|book|fiction|story/i,
  ],
  accident: [
    /stock.*crash|market.*crash|crypto.*crash/i,
    /plane.*crash.*(?:years? ago|decade|history)/i,
  ],
  environmental: [
    /fire.*sale|fire.*brand|under fire|crossfire|firing|gunfire|ceasefire/i,
    /flood.*(?:market|complaint|request|application)/i,
    /storm.*(?:controversy|debate|protest|social media)/i,
  ],
};

const CATEGORY_RULES: Record<string, KeywordRule[]> = {
  animal: [
    // High confidence — very specific animal incident words
    { pattern: /leopard attack|leopard mauled|leopard killed/i, weight: 10, subCategory: 'leopard' },
    { pattern: /leopard spotted|leopard sighting|leopard enters/i, weight: 8, subCategory: 'leopard' },
    { pattern: /tiger attack|tiger mauled|tiger killed|tigress/i, weight: 10, subCategory: 'tiger' },
    { pattern: /tiger spotted|tiger sighting/i, weight: 8, subCategory: 'tiger' },
    { pattern: /bear attack|sloth bear|bear mauled/i, weight: 10, subCategory: 'bear' },
    { pattern: /bear spotted|bear sighting/i, weight: 8, subCategory: 'bear' },
    { pattern: /snake bite|cobra|python|viper|krait/i, weight: 9, subCategory: 'snake' },
    { pattern: /crocodile attack|crocodile spotted/i, weight: 10, subCategory: 'crocodile' },
    { pattern: /elephant attack|elephant rampage|elephant trampled/i, weight: 10, subCategory: 'elephant' },
    { pattern: /monkey attack|monkey menace|monkey bite/i, weight: 9, subCategory: 'monkey' },
    { pattern: /stray dog|dog bite|dog attack|dog mauled|feral dog/i, weight: 9, subCategory: 'stray_dog' },
    { pattern: /wild boar attack|wild boar/i, weight: 8, subCategory: 'wild_boar' },
    { pattern: /wolf attack|wolves attack/i, weight: 9, subCategory: 'wolf' },
    { pattern: /animal attack|mauled to death|mauled by/i, weight: 7, subCategory: 'other' },
    // Medium confidence
    { pattern: /leopard/i, weight: 5, subCategory: 'leopard' },
    { pattern: /tiger/i, weight: 5, subCategory: 'tiger' },
    { pattern: /elephant/i, weight: 4, subCategory: 'elephant' },
    { pattern: /monkey/i, weight: 4, subCategory: 'monkey' },
    { pattern: /snake|serpent/i, weight: 5, subCategory: 'snake' },
  ],
  women_safety: [
    { pattern: /gang rape|gangrape/i, weight: 10, subCategory: 'sexual_assault' },
    { pattern: /rape accused|rape case|raped/i, weight: 10, subCategory: 'sexual_assault' },
    { pattern: /molestation|molested/i, weight: 10, subCategory: 'molestation' },
    { pattern: /sexual assault|sexual harassment/i, weight: 10, subCategory: 'sexual_harassment' },
    { pattern: /eve teasing|eve.?teased/i, weight: 10, subCategory: 'harassment' },
    { pattern: /acid attack/i, weight: 10, subCategory: 'acid_attack' },
    { pattern: /domestic violence/i, weight: 10, subCategory: 'domestic_violence' },
    { pattern: /dowry death|dowry harassment|dowry case/i, weight: 10, subCategory: 'dowry_violence' },
    { pattern: /stalking|stalked/i, weight: 7, subCategory: 'harassment' },
    { pattern: /woman.*attack|girl.*attack|woman.*assault/i, weight: 6, subCategory: 'assault' },
    { pattern: /harassment.*woman|woman.*harassed/i, weight: 7, subCategory: 'harassment' },
  ],
  crime: [
    { pattern: /murdered|murder case|murder accused/i, weight: 9, subCategory: 'murder' },
    { pattern: /shot dead|gunned down/i, weight: 10, subCategory: 'shooting' },
    { pattern: /stabbed to death|stabbed|stabbing/i, weight: 9, subCategory: 'stabbing' },
    { pattern: /robbery|robbed|daylight robbery/i, weight: 8, subCategory: 'robbery' },
    { pattern: /chain snatching|phone snatched|bag snatched/i, weight: 9, subCategory: 'snatching' },
    { pattern: /kidnapped|abducted|kidnapping/i, weight: 9, subCategory: 'kidnapping' },
    { pattern: /burglary|break.?in|broke into/i, weight: 8, subCategory: 'burglary' },
    { pattern: /loot|looted|dacoity/i, weight: 8, subCategory: 'robbery' },
    { pattern: /theft|stolen|thief|thieves/i, weight: 6, subCategory: 'theft' },
    { pattern: /arrested|booked|nabbed|held for/i, weight: 4, subCategory: 'arrest' },
    { pattern: /killed|hacked to death/i, weight: 5, subCategory: 'murder' },
  ],
  accident: [
    { pattern: /road accident|car accident|vehicle accident/i, weight: 10, subCategory: 'vehicle_collision' },
    { pattern: /bus.*accident|bus.*overturn|bus.*fall|bus.*plunge/i, weight: 10, subCategory: 'bus_accident' },
    { pattern: /truck.*accident|truck.*overturn|lorry.*accident/i, weight: 10, subCategory: 'truck_accident' },
    { pattern: /car crash|head.?on collision/i, weight: 10, subCategory: 'vehicle_collision' },
    { pattern: /hit.?and.?run/i, weight: 10, subCategory: 'hit_and_run' },
    { pattern: /train derail|rail accident|train accident/i, weight: 10, subCategory: 'train_accident' },
    { pattern: /drunk driv/i, weight: 9, subCategory: 'drunk_driving' },
    { pattern: /pothole.*death|pothole.*accident/i, weight: 9, subCategory: 'pothole' },
    { pattern: /electrocuted|electric shock/i, weight: 9, subCategory: 'electrocution' },
    { pattern: /drowned|drowning/i, weight: 8, subCategory: 'drowning' },
    { pattern: /building collapse|wall collapse|bridge collapse|roof collapse/i, weight: 10, subCategory: 'building_collapse' },
    { pattern: /pile.?up/i, weight: 7, subCategory: 'vehicle_collision' },
    { pattern: /overturn/i, weight: 6, subCategory: 'vehicle_collision' },
    { pattern: /crash/i, weight: 4, subCategory: 'vehicle_collision' },
    { pattern: /accident/i, weight: 4, subCategory: 'vehicle_collision' },
  ],
  environmental: [
    { pattern: /flood warning|flash flood|flood.?hit|flooding|flood water/i, weight: 10, subCategory: 'flood' },
    { pattern: /cyclone.*alert|cyclone.*warning|cyclone.*landfall|cyclone.*hit/i, weight: 10, subCategory: 'cyclone' },
    { pattern: /earthquake.*hit|earthquake.*jolt|tremor|quake/i, weight: 10, subCategory: 'earthquake' },
    { pattern: /landslide|mudslide|land.*slide/i, weight: 10, subCategory: 'landslide' },
    { pattern: /fire breaks out|fire.*(?:building|factory|house|shop|market|forest|slum)/i, weight: 9, subCategory: 'fire' },
    { pattern: /blaze|gutted|inferno|engulfed/i, weight: 8, subCategory: 'fire' },
    { pattern: /heatwave|heat stroke|heat wave/i, weight: 10, subCategory: 'heatwave' },
    { pattern: /gas leak|chemical leak|ammonia leak/i, weight: 10, subCategory: 'gas_leak' },
    { pattern: /lightning.*kill|lightning.*strike|thunderstorm/i, weight: 8, subCategory: 'storm' },
    { pattern: /cloudburst/i, weight: 9, subCategory: 'storm' },
    { pattern: /flood/i, weight: 5, subCategory: 'flood' },
    { pattern: /fire/i, weight: 3, subCategory: 'fire' },
  ],
  personal_safety: [
    { pattern: /mob lynching|mob lynched|lynched to death/i, weight: 10, subCategory: 'mob_violence' },
    { pattern: /mob.*beat|mob.*attack|beaten by mob/i, weight: 9, subCategory: 'mob_violence' },
    { pattern: /missing person|child missing|went missing|person missing/i, weight: 9, subCategory: 'missing_person' },
    { pattern: /communal clash|communal violence|communal riot/i, weight: 10, subCategory: 'communal_violence' },
    { pattern: /riot|rioting/i, weight: 6, subCategory: 'communal_violence' },
  ],
};

// Severity keywords
const SEVERITY_KEYWORDS = {
  critical: /killed|dead|death|dies|fatal|deceased|succumbed|mauled to death/i,
  high: /injured|hurt|attack|hospitalized|critical condition|serious|bleeding/i,
  medium: /spotted|sighting|warning|alert|menace|panic|fear|terror/i,
  low: /rescued|caught|captured|relocated|awareness|advisory/i,
};

export function classifyIncident(title: string, description: string = ''): ClassificationResult | null {
  const text = (title + ' ' + description).toLowerCase();

  // Score each category
  const scores: Record<string, { score: number; topSubCategory: string; topWeight: number }> = {};

  for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
    // Check negative patterns first
    const negatives = NEGATIVE_PATTERNS[category] || [];
    if (negatives.some(p => p.test(title + ' ' + description))) continue;

    let totalScore = 0;
    let topSubCategory = 'other';
    let topWeight = 0;

    for (const rule of rules) {
      if (rule.pattern.test(text)) {
        totalScore += rule.weight;
        if (rule.weight > topWeight) {
          topWeight = rule.weight;
          topSubCategory = rule.subCategory;
        }
      }
    }

    if (totalScore > 0) {
      scores[category] = { score: totalScore, topSubCategory, topWeight };
    }
  }

  // Pick the category with the highest score
  let bestCategory = '';
  let bestScore = 0;
  let bestSubCategory = 'other';

  for (const [category, data] of Object.entries(scores)) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestCategory = category;
      bestSubCategory = data.topSubCategory;
    }
  }

  // Minimum score threshold — must have at least some confidence
  if (bestScore < 4) return null;

  // Determine severity
  let severity = 'medium';
  if (SEVERITY_KEYWORDS.critical.test(text)) severity = 'critical';
  else if (SEVERITY_KEYWORDS.high.test(text)) severity = 'high';
  else if (SEVERITY_KEYWORDS.low.test(text)) severity = 'low';

  // Confidence is normalized score (0-1)
  const confidence = Math.min(bestScore / 15, 1);

  return {
    category: bestCategory,
    subCategory: bestSubCategory,
    severity,
    confidence,
  };
}

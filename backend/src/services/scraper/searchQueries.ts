export interface QueryGroup {
  name: string;
  category: string;
  queries: { term: string; subCategory: string; specificTypes?: string[] }[];
}

export const QUERY_GROUPS: QueryGroup[] = [
  {
    name: 'animals_predators',
    category: 'animal',
    queries: [
      { term: '"leopard attack" OR "leopard spotted" India', subCategory: 'leopard', specificTypes: ['Indian leopard'] },
      { term: '"tiger attack" OR "tiger spotted" India', subCategory: 'tiger', specificTypes: ['Bengal tiger'] },
      { term: '"bear attack" OR "bear spotted" India', subCategory: 'bear', specificTypes: ['sloth bear', 'Himalayan bear'] },
      { term: '"wolf attack" India', subCategory: 'wolf' },
      { term: '"wild boar attack" OR "wild boar" India', subCategory: 'wild_boar' },
      { term: '"crocodile attack" OR "crocodile spotted" India', subCategory: 'crocodile', specificTypes: ['mugger crocodile', 'saltwater crocodile'] },
    ],
  },
  {
    name: 'animals_snakes',
    category: 'animal',
    queries: [
      { term: '"snake bite" OR "cobra" OR "cobra spotted" India', subCategory: 'snake', specificTypes: ['king cobra', 'Indian cobra', 'spectacled cobra'] },
      { term: '"python" OR "python spotted" OR "python rescued" India', subCategory: 'snake', specificTypes: ['Indian python', 'rock python'] },
      { term: '"viper bite" OR "krait bite" India', subCategory: 'snake', specificTypes: ['Russell viper', 'common krait', 'saw-scaled viper'] },
    ],
  },
  {
    name: 'animals_urban',
    category: 'animal',
    queries: [
      { term: '"stray dog attack" OR "dog bite" OR "stray dogs" India', subCategory: 'stray_dog' },
      { term: '"monkey attack" OR "monkey menace" OR "monkey bite" India', subCategory: 'monkey', specificTypes: ['rhesus macaque', 'langur'] },
      { term: '"elephant attack" OR "elephant rampage" OR "elephant corridor" India', subCategory: 'elephant', specificTypes: ['Asian elephant'] },
      { term: '"scorpion sting" OR "scorpion bite" India', subCategory: 'scorpion' },
      { term: '"bee attack" OR "hornet attack" OR "wasp attack" India', subCategory: 'insect' },
    ],
  },
  {
    name: 'crime_theft',
    category: 'crime',
    queries: [
      { term: '"chain snatching" OR "chain snatcher" India', subCategory: 'chain_snatching' },
      { term: '"phone snatching" OR "mobile theft" OR "mobile snatched" India', subCategory: 'phone_theft' },
      { term: '"robbery" OR "loot" OR "robbed" India', subCategory: 'robbery' },
      { term: '"burglary" OR "house break-in" OR "home burglary" India', subCategory: 'burglary' },
      { term: '"ATM robbery" OR "ATM loot" India', subCategory: 'atm_robbery' },
      { term: '"carjacking" OR "vehicle theft" India', subCategory: 'vehicle_theft' },
    ],
  },
  {
    name: 'crime_violent',
    category: 'crime',
    queries: [
      { term: '"murder" OR "killed" OR "homicide" India -film -movie -series', subCategory: 'murder' },
      { term: '"stabbing" OR "stabbed" India -film -movie', subCategory: 'stabbing' },
      { term: '"shooting" OR "gunshot" OR "fired upon" India -film -cricket', subCategory: 'shooting' },
      { term: '"kidnapping" OR "kidnapped" OR "abducted" India -film -movie', subCategory: 'kidnapping' },
      { term: '"assault" OR "beaten" OR "attacked" India -film -movie -animal', subCategory: 'assault' },
    ],
  },
  {
    name: 'women_safety',
    category: 'women_safety',
    queries: [
      { term: '"eve teasing" OR "harassment women" OR "stalking" India', subCategory: 'harassment' },
      { term: '"molestation" OR "molested" OR "groping" India', subCategory: 'molestation' },
      { term: '"acid attack" India', subCategory: 'acid_attack' },
      { term: '"dowry death" OR "dowry violence" OR "dowry harassment" India', subCategory: 'dowry_violence' },
      { term: '"domestic violence" OR "wife beaten" India', subCategory: 'domestic_violence' },
      { term: '"sexual harassment" OR "workplace harassment" India -film', subCategory: 'sexual_harassment' },
      { term: '"women safety" OR "unsafe for women" India', subCategory: 'general_safety' },
    ],
  },
  {
    name: 'personal_safety',
    category: 'personal_safety',
    queries: [
      { term: '"missing person" OR "person missing" OR "went missing" India', subCategory: 'missing_person' },
      { term: '"mob lynching" OR "mob violence" OR "mob attack" India', subCategory: 'mob_violence' },
      { term: '"communal violence" OR "communal clash" OR "riot" India -politics', subCategory: 'communal_violence' },
      { term: '"gang violence" OR "gang war" India -film', subCategory: 'gang_violence' },
      { term: '"fraud" OR "scam" OR "cheated" India -stock -market', subCategory: 'fraud' },
      { term: '"cybercrime" OR "online fraud" OR "cyber attack" India', subCategory: 'cybercrime' },
    ],
  },
  {
    name: 'accidents_road',
    category: 'accident',
    queries: [
      { term: '"road accident" OR "car accident" OR "car crash" India', subCategory: 'vehicle_collision' },
      { term: '"hit and run" OR "hit-and-run" India', subCategory: 'hit_and_run' },
      { term: '"bus accident" OR "bus overturns" OR "bus crash" India', subCategory: 'bus_accident' },
      { term: '"truck accident" OR "truck overturns" OR "lorry accident" India', subCategory: 'truck_accident' },
      { term: '"bike accident" OR "two wheeler accident" India', subCategory: 'bike_accident' },
      { term: '"drunk driving" OR "drunk driver" India', subCategory: 'drunk_driving' },
      { term: '"pothole accident" OR "pothole death" India', subCategory: 'pothole' },
      { term: '"train accident" OR "rail accident" OR "train derail" India', subCategory: 'train_accident' },
    ],
  },
  {
    name: 'accidents_other',
    category: 'accident',
    queries: [
      { term: '"bridge collapse" OR "flyover collapse" India', subCategory: 'bridge_collapse' },
      { term: '"building collapse" OR "wall collapse" OR "roof collapse" India', subCategory: 'building_collapse' },
      { term: '"electrocution" OR "electric shock death" India', subCategory: 'electrocution' },
      { term: '"drowning" OR "drowned" India -film', subCategory: 'drowning' },
    ],
  },
  {
    name: 'environmental_water',
    category: 'environmental',
    queries: [
      { term: '"flood" OR "flooding" OR "flood warning" India', subCategory: 'flood' },
      { term: '"cyclone" OR "cyclone warning" OR "cyclone alert" India', subCategory: 'cyclone' },
      { term: '"landslide" OR "mudslide" OR "land slide" India', subCategory: 'landslide' },
      { term: '"water contamination" OR "water pollution" OR "toxic water" India', subCategory: 'water_contamination' },
    ],
  },
  {
    name: 'environmental_other',
    category: 'environmental',
    queries: [
      { term: '"earthquake" India', subCategory: 'earthquake' },
      { term: '"fire" OR "blaze" OR "fire breaks out" India -firing -gunfire', subCategory: 'fire' },
      { term: '"heatwave" OR "heat wave" OR "heat stroke death" India', subCategory: 'heatwave' },
      { term: '"gas leak" OR "chemical leak" OR "toxic gas" India', subCategory: 'gas_leak' },
      { term: '"air pollution" OR "AQI dangerous" OR "smog" India', subCategory: 'air_pollution' },
    ],
  },
];

export function getQueriesForCycle(cycleIndex: number): QueryGroup[] {
  const groupsPerCycle = 3;
  const totalGroups = QUERY_GROUPS.length;
  const startIdx = (cycleIndex * groupsPerCycle) % totalGroups;

  const groups: QueryGroup[] = [];
  for (let i = 0; i < groupsPerCycle; i++) {
    groups.push(QUERY_GROUPS[(startIdx + i) % totalGroups]);
  }
  return groups;
}

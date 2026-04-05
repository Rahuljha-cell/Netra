export const CATEGORIES = {
  animal: {
    key: 'animal',
    color: '#E53935',
    bgColor: 'bg-red-500',
    lightBg: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-500',
    heatmapColor: { 0.4: '#FFA726', 0.65: '#FF7043', 1: '#E53935' },
    icon: '🐾',
    subcategories: ['dog', 'snake', 'monkey', 'elephant', 'leopard', 'crocodile', 'wildBoar', 'other'],
  },
  crime: {
    key: 'crime',
    color: '#7B1FA2',
    bgColor: 'bg-purple-700',
    lightBg: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-700',
    heatmapColor: { 0.4: '#CE93D8', 0.65: '#AB47BC', 1: '#7B1FA2' },
    icon: '⚠️',
    subcategories: ['theft', 'robbery', 'assault', 'harassment', 'murder', 'kidnapping', 'other'],
  },
  accident: {
    key: 'accident',
    color: '#1565C0',
    bgColor: 'bg-blue-800',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-800',
    heatmapColor: { 0.4: '#64B5F6', 0.65: '#42A5F5', 1: '#1565C0' },
    icon: '🚗',
    subcategories: ['vehicleCollision', 'hitAndRun', 'drunkDriving', 'potholeHazard', 'other'],
  },
  women_safety: {
    key: 'women_safety',
    color: '#E91E63',
    bgColor: 'bg-pink-600',
    lightBg: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-600',
    heatmapColor: { 0.4: '#F48FB1', 0.65: '#EC407A', 1: '#E91E63' },
    icon: '👩',
    subcategories: ['harassment', 'molestation', 'acid_attack', 'domestic_violence', 'sexual_harassment', 'other'],
  },
  personal_safety: {
    key: 'personal_safety',
    color: '#FF5722',
    bgColor: 'bg-orange-600',
    lightBg: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-600',
    heatmapColor: { 0.4: '#FFAB91', 0.65: '#FF7043', 1: '#FF5722' },
    icon: '🛡️',
    subcategories: ['missing_person', 'mob_violence', 'communal_violence', 'fraud', 'cybercrime', 'other'],
  },
  environmental: {
    key: 'environmental',
    color: '#2E7D32',
    bgColor: 'bg-green-700',
    lightBg: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-700',
    heatmapColor: { 0.4: '#A5D6A7', 0.65: '#66BB6A', 1: '#2E7D32' },
    icon: '🌊',
    subcategories: ['flood', 'landslide', 'fire', 'earthquake', 'cyclone', 'heatwave', 'other'],
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const SEVERITY_COLORS = {
  low: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-600' },
} as const;

export const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
export const DEFAULT_ZOOM = 5;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Mock data for landing page
export const MOCK_STATS = {
  totalIncidents: 52847,
  activeAlerts: 1243,
  citiesCovered: 547,
};

export const MOCK_RECENT_INCIDENTS = [
  { id: '1', title: 'Stray dog pack spotted near school', category: 'animal' as const, subCategory: 'dog', severity: 'high' as const, location: 'Andheri West, Mumbai', time: '15 min', lat: 19.1364, lng: 72.8296 },
  { id: '2', title: 'Chain snatching reported', category: 'crime' as const, subCategory: 'theft', severity: 'medium' as const, location: 'Connaught Place, Delhi', time: '32 min', lat: 28.6315, lng: 77.2167 },
  { id: '3', title: 'Major pothole on highway', category: 'accident' as const, subCategory: 'potholeHazard', severity: 'high' as const, location: 'NH-48, Gurugram', time: '1 hr', lat: 28.4595, lng: 77.0266 },
  { id: '4', title: 'Flash flood warning issued', category: 'environmental' as const, subCategory: 'flood', severity: 'critical' as const, location: 'Wayanad, Kerala', time: '2 hr', lat: 11.6854, lng: 76.1320 },
  { id: '5', title: 'Monkey troupe causing havoc', category: 'animal' as const, subCategory: 'monkey', severity: 'medium' as const, location: 'Shimla, Himachal', time: '3 hr', lat: 31.1048, lng: 77.1734 },
  { id: '6', title: 'Cobra sighted in residential area', category: 'animal' as const, subCategory: 'snake', severity: 'critical' as const, location: 'Thiruvananthapuram, Kerala', time: '4 hr', lat: 8.5241, lng: 76.9366 },
  { id: '7', title: 'Hit and run on outer ring road', category: 'accident' as const, subCategory: 'hitAndRun', severity: 'critical' as const, location: 'Marathahalli, Bangalore', time: '5 hr', lat: 12.9591, lng: 77.6974 },
  { id: '8', title: 'Landslide blocks road', category: 'environmental' as const, subCategory: 'landslide', severity: 'high' as const, location: 'Darjeeling, West Bengal', time: '6 hr', lat: 27.0410, lng: 88.2663 },
];

// Extended incidents for denser map view
export const MOCK_MAP_INCIDENTS = [
  ...MOCK_RECENT_INCIDENTS,
  // Mumbai area
  { id: '9', title: 'Leopard spotted near Sanjay Gandhi Park', category: 'animal' as const, subCategory: 'leopard', severity: 'critical' as const, location: 'Borivali, Mumbai', time: '7 hr', lat: 19.228, lng: 72.856 },
  { id: '10', title: 'Bag snatching near station', category: 'crime' as const, subCategory: 'theft', severity: 'medium' as const, location: 'Dadar, Mumbai', time: '8 hr', lat: 19.018, lng: 72.843 },
  { id: '11', title: 'Road cave-in due to rain', category: 'environmental' as const, subCategory: 'flood', severity: 'high' as const, location: 'Sion, Mumbai', time: '9 hr', lat: 19.043, lng: 72.862 },
  { id: '12', title: 'Stray dog bite reported', category: 'animal' as const, subCategory: 'dog', severity: 'medium' as const, location: 'Bandra, Mumbai', time: '10 hr', lat: 19.054, lng: 72.836 },
  { id: '13', title: 'Two-wheeler collision', category: 'accident' as const, subCategory: 'vehicleCollision', severity: 'high' as const, location: 'Powai, Mumbai', time: '11 hr', lat: 19.119, lng: 72.905 },
  // Delhi area
  { id: '14', title: 'Monkey attack near temple', category: 'animal' as const, subCategory: 'monkey', severity: 'medium' as const, location: 'Lodhi Road, Delhi', time: '4 hr', lat: 28.593, lng: 77.219 },
  { id: '15', title: 'Phone snatching from auto', category: 'crime' as const, subCategory: 'robbery', severity: 'high' as const, location: 'Lajpat Nagar, Delhi', time: '5 hr', lat: 28.570, lng: 77.243 },
  { id: '16', title: 'Bus rear-ends truck', category: 'accident' as const, subCategory: 'vehicleCollision', severity: 'critical' as const, location: 'Ring Road, Delhi', time: '6 hr', lat: 28.653, lng: 77.189 },
  { id: '17', title: 'Wild boar sighting in park', category: 'animal' as const, subCategory: 'wildBoar', severity: 'low' as const, location: 'Hauz Khas, Delhi', time: '12 hr', lat: 28.549, lng: 77.204 },
  { id: '18', title: 'Chain snatching on metro', category: 'crime' as const, subCategory: 'theft', severity: 'medium' as const, location: 'Rajiv Chowk, Delhi', time: '13 hr', lat: 28.633, lng: 77.219 },
  // Bangalore
  { id: '19', title: 'Stray dog pack near school', category: 'animal' as const, subCategory: 'dog', severity: 'high' as const, location: 'Koramangala, Bangalore', time: '3 hr', lat: 12.935, lng: 77.624 },
  { id: '20', title: 'Tree falls on road', category: 'environmental' as const, subCategory: 'flood', severity: 'medium' as const, location: 'Indiranagar, Bangalore', time: '4 hr', lat: 12.978, lng: 77.641 },
  { id: '21', title: 'Pothole causes bike accident', category: 'accident' as const, subCategory: 'potholeHazard', severity: 'high' as const, location: 'Whitefield, Bangalore', time: '6 hr', lat: 12.969, lng: 77.749 },
  // Kolkata
  { id: '22', title: 'Snake found in apartment', category: 'animal' as const, subCategory: 'snake', severity: 'critical' as const, location: 'Salt Lake, Kolkata', time: '5 hr', lat: 22.581, lng: 88.412 },
  { id: '23', title: 'Waterlogging blocks traffic', category: 'environmental' as const, subCategory: 'flood', severity: 'high' as const, location: 'Park Street, Kolkata', time: '7 hr', lat: 22.551, lng: 88.357 },
  // Chennai
  { id: '24', title: 'Crocodile spotted near river', category: 'animal' as const, subCategory: 'crocodile', severity: 'critical' as const, location: 'Adyar, Chennai', time: '4 hr', lat: 13.006, lng: 80.257 },
  { id: '25', title: 'Auto-rickshaw overturns', category: 'accident' as const, subCategory: 'vehicleCollision', severity: 'medium' as const, location: 'T Nagar, Chennai', time: '8 hr', lat: 13.041, lng: 80.234 },
  // Hyderabad
  { id: '26', title: 'Drunk driving crash', category: 'accident' as const, subCategory: 'drunkDriving', severity: 'critical' as const, location: 'Jubilee Hills, Hyderabad', time: '3 hr', lat: 17.432, lng: 78.407 },
  { id: '27', title: 'Purse snatching reported', category: 'crime' as const, subCategory: 'theft', severity: 'medium' as const, location: 'Secunderabad, Hyderabad', time: '9 hr', lat: 17.434, lng: 78.503 },
  // Jaipur
  { id: '28', title: 'Monkey troupe raids shop', category: 'animal' as const, subCategory: 'monkey', severity: 'low' as const, location: 'Amer, Jaipur', time: '5 hr', lat: 26.985, lng: 75.851 },
  { id: '29', title: 'Tourist robbed near fort', category: 'crime' as const, subCategory: 'robbery', severity: 'high' as const, location: 'Nahargarh, Jaipur', time: '7 hr', lat: 26.937, lng: 75.815 },
  // Kerala
  { id: '30', title: 'Elephant blocks highway', category: 'animal' as const, subCategory: 'elephant', severity: 'high' as const, location: 'Munnar, Kerala', time: '2 hr', lat: 10.089, lng: 77.060 },
  { id: '31', title: 'Heavy rain flooding', category: 'environmental' as const, subCategory: 'flood', severity: 'critical' as const, location: 'Kochi, Kerala', time: '3 hr', lat: 9.931, lng: 76.267 },
  // Other cities
  { id: '32', title: 'Snake rescue from house', category: 'animal' as const, subCategory: 'snake', severity: 'medium' as const, location: 'Pune', time: '4 hr', lat: 18.520, lng: 73.856 },
  { id: '33', title: 'Road accident on highway', category: 'accident' as const, subCategory: 'vehicleCollision', severity: 'high' as const, location: 'Surat', time: '6 hr', lat: 21.170, lng: 72.831 },
  { id: '34', title: 'Theft at bus stand', category: 'crime' as const, subCategory: 'theft', severity: 'medium' as const, location: 'Ahmedabad', time: '8 hr', lat: 23.022, lng: 72.571 },
  { id: '35', title: 'Wild boar injures farmer', category: 'animal' as const, subCategory: 'wildBoar', severity: 'high' as const, location: 'Coimbatore', time: '5 hr', lat: 11.016, lng: 76.955 },
  { id: '36', title: 'Cyclone warning issued', category: 'environmental' as const, subCategory: 'cyclone', severity: 'critical' as const, location: 'Visakhapatnam', time: '1 hr', lat: 17.686, lng: 83.218 },
  { id: '37', title: 'Car pile-up on expressway', category: 'accident' as const, subCategory: 'vehicleCollision', severity: 'critical' as const, location: 'Lucknow', time: '3 hr', lat: 26.846, lng: 80.946 },
  { id: '38', title: 'Assault near market', category: 'crime' as const, subCategory: 'assault', severity: 'high' as const, location: 'Patna', time: '10 hr', lat: 25.612, lng: 85.144 },
  { id: '39', title: 'Landslide blocks road', category: 'environmental' as const, subCategory: 'landslide', severity: 'high' as const, location: 'Shimla', time: '4 hr', lat: 31.105, lng: 77.173 },
  { id: '40', title: 'Stray dog attack on child', category: 'animal' as const, subCategory: 'dog', severity: 'critical' as const, location: 'Chandigarh', time: '2 hr', lat: 30.733, lng: 76.775 },
  { id: '41', title: 'Bike theft from parking', category: 'crime' as const, subCategory: 'theft', severity: 'low' as const, location: 'Nagpur', time: '12 hr', lat: 21.146, lng: 79.088 },
  { id: '42', title: 'Fire in market area', category: 'environmental' as const, subCategory: 'fire', severity: 'critical' as const, location: 'Varanasi', time: '1 hr', lat: 25.317, lng: 82.987 },
  { id: '43', title: 'Monkey bites tourist', category: 'animal' as const, subCategory: 'monkey', severity: 'medium' as const, location: 'Agra', time: '6 hr', lat: 27.176, lng: 78.008 },
  { id: '44', title: 'Truck overturns on bridge', category: 'accident' as const, subCategory: 'vehicleCollision', severity: 'high' as const, location: 'Bhubaneswar', time: '8 hr', lat: 20.296, lng: 85.824 },
  { id: '45', title: 'Robbery at ATM', category: 'crime' as const, subCategory: 'robbery', severity: 'critical' as const, location: 'Indore', time: '4 hr', lat: 22.719, lng: 75.857 },
  { id: '46', title: 'Flash flood alert', category: 'environmental' as const, subCategory: 'flood', severity: 'high' as const, location: 'Guwahati', time: '2 hr', lat: 26.144, lng: 91.736 },
];

export const MOCK_RISK_AREAS = [
  { name: 'Andheri West, Mumbai', category: 'animal' as const, incidents: 23, risk: 'critical' as const },
  { name: 'Chandni Chowk, Delhi', category: 'crime' as const, incidents: 18, risk: 'high' as const },
  { name: 'NH-44, Hyderabad', category: 'accident' as const, incidents: 15, risk: 'high' as const },
  { name: 'Wayanad, Kerala', category: 'environmental' as const, incidents: 12, risk: 'critical' as const },
  { name: 'Jaipur Old City', category: 'crime' as const, incidents: 11, risk: 'medium' as const },
];

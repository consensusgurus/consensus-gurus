// City atlas + geo helpers for Ping, the daily city hunt.
//
// One secret city a day (app/ping/puzzles.js). Players guess a city; every
// guess returns the great-circle distance to the secret city plus the compass
// bearing pointing toward it. This file is the guessable universe: a set of
// well-known world cities with coordinates and a few common aliases. It is
// imported by the client for autocomplete + client-side distance math, so it
// stays lean (names + coords, no per-day answers). The daily answer city always
// appears in this list too, so it is always a valid guess.
//
// Coordinates are decimal degrees, north/east positive. `aliases` catch the
// common alternate spellings and nicknames a player might type. Keep entries
// unique by (name, country); if you add a target city to the bank, add it here.

export const CITIES = [
  // ── North America ────────────────────────────────────────────────────────
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.006, aliases: ['nyc', 'new york city'] },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, aliases: ['la'] },
  { name: 'Chicago', country: 'United States', lat: 41.8781, lng: -87.6298 },
  { name: 'San Francisco', country: 'United States', lat: 37.7749, lng: -122.4194, aliases: ['sf'] },
  { name: 'Miami', country: 'United States', lat: 25.7617, lng: -80.1918 },
  { name: 'Seattle', country: 'United States', lat: 47.6062, lng: -122.3321 },
  { name: 'Boston', country: 'United States', lat: 42.3601, lng: -71.0589 },
  { name: 'Washington', country: 'United States', lat: 38.9072, lng: -77.0369, aliases: ['washington dc', 'dc'] },
  { name: 'Denver', country: 'United States', lat: 39.7392, lng: -104.9903 },
  { name: 'Dallas', country: 'United States', lat: 32.7767, lng: -96.797 },
  { name: 'Houston', country: 'United States', lat: 29.7604, lng: -95.3698 },
  { name: 'Atlanta', country: 'United States', lat: 33.749, lng: -84.388 },
  { name: 'Las Vegas', country: 'United States', lat: 36.1699, lng: -115.1398, aliases: ['vegas'] },
  { name: 'New Orleans', country: 'United States', lat: 29.9511, lng: -90.0715 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'Montreal', country: 'Canada', lat: 45.5017, lng: -73.5673 },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, aliases: ['cdmx'] },
  { name: 'Guadalajara', country: 'Mexico', lat: 20.6597, lng: -103.3496 },
  { name: 'Cancun', country: 'Mexico', lat: 21.1619, lng: -86.8515 },
  { name: 'Havana', country: 'Cuba', lat: 23.1136, lng: -82.3666 },
  { name: 'Panama City', country: 'Panama', lat: 8.9824, lng: -79.5199 },
  { name: 'San Jose', country: 'Costa Rica', lat: 9.9281, lng: -84.0907 },

  // ── South America ────────────────────────────────────────────────────────
  { name: 'Bogota', country: 'Colombia', lat: 4.711, lng: -74.0721 },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428 },
  { name: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, aliases: ['rio'] },
  { name: 'Sao Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333 },
  { name: 'Brasilia', country: 'Brazil', lat: -15.7939, lng: -47.8828 },
  { name: 'Quito', country: 'Ecuador', lat: -0.1807, lng: -78.4678 },
  { name: 'Caracas', country: 'Venezuela', lat: 10.4806, lng: -66.9036 },
  { name: 'La Paz', country: 'Bolivia', lat: -16.4897, lng: -68.1193 },
  { name: 'Montevideo', country: 'Uruguay', lat: -34.9011, lng: -56.1645 },

  // ── Europe ───────────────────────────────────────────────────────────────
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { name: 'Edinburgh', country: 'United Kingdom', lat: 55.9533, lng: -3.1883 },
  { name: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3874, lng: 2.1686 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { name: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.19 },
  { name: 'Venice', country: 'Italy', lat: 45.4408, lng: 12.3155 },
  { name: 'Naples', country: 'Italy', lat: 40.8518, lng: 14.2681 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517 },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405 },
  { name: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.582 },
  { name: 'Frankfurt', country: 'Germany', lat: 50.1109, lng: 8.6821 },
  { name: 'Hamburg', country: 'Germany', lat: 53.5511, lng: 9.9937 },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417 },
  { name: 'Geneva', country: 'Switzerland', lat: 46.2044, lng: 6.1432 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738 },
  { name: 'Prague', country: 'Czechia', lat: 50.0755, lng: 14.4378 },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122 },
  { name: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402 },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683 },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686 },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522 },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384 },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lng: -21.9426 },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173 },
  { name: 'Saint Petersburg', country: 'Russia', lat: 59.9311, lng: 30.3609, aliases: ['st petersburg'] },
  { name: 'Kyiv', country: 'Ukraine', lat: 50.4501, lng: 30.5234, aliases: ['kiev'] },
  { name: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025 },
  { name: 'Belgrade', country: 'Serbia', lat: 44.7866, lng: 20.4489 },

  // ── Africa ───────────────────────────────────────────────────────────────
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lng: -7.5898 },
  { name: 'Marrakech', country: 'Morocco', lat: 31.6295, lng: -7.9811 },
  { name: 'Tunis', country: 'Tunisia', lat: 36.8065, lng: 10.1815 },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
  { name: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.187 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219 },
  { name: 'Addis Ababa', country: 'Ethiopia', lat: 9.145, lng: 40.4897 },
  { name: 'Dar es Salaam', country: 'Tanzania', lat: -6.7924, lng: 39.2083 },
  { name: 'Kinshasa', country: 'DR Congo', lat: -4.4419, lng: 15.2663 },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241 },
  { name: 'Dakar', country: 'Senegal', lat: 14.7167, lng: -17.4677 },

  // ── Middle East & Central Asia ───────────────────────────────────────────
  { name: 'Jerusalem', country: 'Israel', lat: 31.7683, lng: 35.2137 },
  { name: 'Tel Aviv', country: 'Israel', lat: 32.0853, lng: 34.7818 },
  { name: 'Beirut', country: 'Lebanon', lat: 33.8938, lng: 35.5018 },
  { name: 'Amman', country: 'Jordan', lat: 31.9454, lng: 35.9284 },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708 },
  { name: 'Doha', country: 'Qatar', lat: 25.2854, lng: 51.531 },
  { name: 'Tehran', country: 'Iran', lat: 35.6892, lng: 51.389 },
  { name: 'Baghdad', country: 'Iraq', lat: 33.3152, lng: 44.3661 },
  { name: 'Tashkent', country: 'Uzbekistan', lat: 41.2995, lng: 69.2401 },
  { name: 'Almaty', country: 'Kazakhstan', lat: 43.222, lng: 76.8512 },

  // ── South & Southeast Asia ───────────────────────────────────────────────
  { name: 'Mumbai', country: 'India', lat: 19.076, lng: 72.8777, aliases: ['bombay'] },
  { name: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025, aliases: ['new delhi'] },
  { name: 'Bengaluru', country: 'India', lat: 12.9716, lng: 77.5946, aliases: ['bangalore'] },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lng: 88.3639, aliases: ['calcutta'] },
  { name: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707, aliases: ['madras'] },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011 },
  { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lng: 74.3587 },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125 },
  { name: 'Kathmandu', country: 'Nepal', lat: 27.7172, lng: 85.324 },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
  { name: 'Hanoi', country: 'Vietnam', lat: 21.0278, lng: 105.8342 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lng: 106.6297, aliases: ['saigon'] },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.6869 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
  { name: 'Bali', country: 'Indonesia', lat: -8.4095, lng: 115.1889, aliases: ['denpasar'] },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842 },
  { name: 'Phnom Penh', country: 'Cambodia', lat: 11.5564, lng: 104.9282 },

  // ── East Asia ────────────────────────────────────────────────────────────
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023 },
  { name: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.978 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074 },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737 },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694 },
  { name: 'Guangzhou', country: 'China', lat: 23.1291, lng: 113.2644 },
  { name: 'Chengdu', country: 'China', lat: 30.5728, lng: 104.0668 },
  { name: 'Taipei', country: 'Taiwan', lat: 25.033, lng: 121.5654 },
  { name: 'Ulaanbaatar', country: 'Mongolia', lat: 47.8864, lng: 106.9057 },

  // ── Oceania ──────────────────────────────────────────────────────────────
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631 },
  { name: 'Brisbane', country: 'Australia', lat: -27.4698, lng: 153.0251 },
  { name: 'Perth', country: 'Australia', lat: -31.9505, lng: 115.8605 },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633 },
  { name: 'Wellington', country: 'New Zealand', lat: -41.2865, lng: 174.7762 },
  { name: 'Honolulu', country: 'United States', lat: 21.3069, lng: -157.8583 },
  { name: 'Suva', country: 'Fiji', lat: -18.1248, lng: 178.4501 },
];

// Continent per country, for the one free "reveal the continent" hint. Every
// country used by a CITIES entry is covered; anything unmapped falls back to
// 'Asia' (the largest bucket) so the hint never comes back blank.
const CONTINENT = {
  'United States': 'North America', Canada: 'North America', Mexico: 'North America',
  Cuba: 'North America', Panama: 'North America', 'Costa Rica': 'North America',
  Colombia: 'South America', Peru: 'South America', Chile: 'South America',
  Argentina: 'South America', Brazil: 'South America', Ecuador: 'South America',
  Venezuela: 'South America', Bolivia: 'South America', Uruguay: 'South America',
  'United Kingdom': 'Europe', Ireland: 'Europe', France: 'Europe', Spain: 'Europe',
  Portugal: 'Europe', Italy: 'Europe', Netherlands: 'Europe', Belgium: 'Europe',
  Germany: 'Europe', Switzerland: 'Europe', Austria: 'Europe', Czechia: 'Europe',
  Poland: 'Europe', Hungary: 'Europe', Denmark: 'Europe', Sweden: 'Europe',
  Norway: 'Europe', Finland: 'Europe', Iceland: 'Europe', Greece: 'Europe',
  Turkey: 'Europe', Russia: 'Europe', Ukraine: 'Europe', Romania: 'Europe', Serbia: 'Europe',
  Egypt: 'Africa', Morocco: 'Africa', Tunisia: 'Africa', Nigeria: 'Africa', Ghana: 'Africa',
  Kenya: 'Africa', Ethiopia: 'Africa', Tanzania: 'Africa', 'DR Congo': 'Africa',
  'South Africa': 'Africa', Senegal: 'Africa',
  Israel: 'Asia', Lebanon: 'Asia', Jordan: 'Asia', 'Saudi Arabia': 'Asia',
  'United Arab Emirates': 'Asia', Qatar: 'Asia', Iran: 'Asia', Iraq: 'Asia',
  Uzbekistan: 'Asia', Kazakhstan: 'Asia', India: 'Asia', Pakistan: 'Asia',
  Bangladesh: 'Asia', Nepal: 'Asia', 'Sri Lanka': 'Asia', Thailand: 'Asia',
  Vietnam: 'Asia', Singapore: 'Asia', Malaysia: 'Asia', Indonesia: 'Asia',
  Philippines: 'Asia', Cambodia: 'Asia', Japan: 'Asia', 'South Korea': 'Asia',
  China: 'Asia', Taiwan: 'Asia', Mongolia: 'Asia',
  Australia: 'Oceania', 'New Zealand': 'Oceania', Fiji: 'Oceania',
};
export function continentOf(city) {
  return (city && CONTINENT[city.country]) || 'Asia';
}

// ── Geo helpers ────────────────────────────────────────────────────────────
const R_MI = 3958.8; // mean Earth radius, miles
const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

// Great-circle (haversine) distance in miles between two {lat,lng} points,
// rounded to the nearest mile.
export function haversineMiles(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R_MI * Math.asin(Math.min(1, Math.sqrt(x))));
}

// Initial compass bearing in degrees (0..360, 0 = due north, clockwise) from
// point `a` toward point `b`. Used to point the guess arrow at the secret city.
export function bearingDeg(a, b) {
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(la2);
  const x =
    Math.cos(la1) * Math.sin(la2) -
    Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const COMPASS8 = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
// Nearest 8-point compass label for a bearing in degrees.
export function compass8(deg) {
  return COMPASS8[Math.round(deg / 45) % 8];
}

// Normalize a typed query for matching: lowercase, strip accents + punctuation,
// collapse whitespace. "São Paulo" -> "sao paulo", "St. Petersburg" -> "st petersburg".
export function normCity(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Resolve a typed guess to a city record (exact name/alias match after
// normalization), or null if it is not a known city.
export function findCity(query) {
  const q = normCity(query);
  if (!q) return null;
  for (const c of CITIES) {
    if (normCity(c.name) === q) return c;
    if (c.aliases && c.aliases.some((a) => normCity(a) === q)) return c;
  }
  return null;
}

// Up to `limit` cities whose name/alias starts with (then contains) the query,
// for the autocomplete dropdown. Empty query returns nothing.
export function suggestCities(query, limit = 6) {
  const q = normCity(query);
  if (!q) return [];
  const starts = [];
  const contains = [];
  for (const c of CITIES) {
    const n = normCity(c.name);
    const hay = [n, ...(c.aliases || []).map(normCity)];
    if (hay.some((x) => x.startsWith(q))) starts.push(c);
    else if (hay.some((x) => x.includes(q))) contains.push(c);
  }
  return [...starts, ...contains].slice(0, limit);
}

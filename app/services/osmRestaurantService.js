import { findNearestMetroStation, getDistanceBetween } from '../data/transitData.js';

/**
 * OpenStreetMap Overpass API Discovery Service
 * Queries live OSM Overpass nodes for restaurants, cafes, and eateries around any Bengaluru location.
 */

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

const SIGNATURE_DISHES_BY_CUISINE = {
  southindian: {
    mustTry: { dish: 'Ghee Podi Masala Dosa', price: 85 },
    topDishes: [
      { name: 'Filter Coffee', price: 25 },
      { name: 'Button Idli Sambar', price: 60 },
      { name: 'Medu Vada', price: 40 },
    ],
  },
  northindian: {
    mustTry: { dish: 'Paneer Butter Masala & Naan', price: 210 },
    topDishes: [
      { name: 'Dal Makhani', price: 180 },
      { name: 'Butter Garlic Naan', price: 65 },
      { name: 'Tandoori Roti Platter', price: 120 },
    ],
  },
  cafe: {
    mustTry: { dish: 'Artisanal Cappuccino & Croissant', price: 190 },
    topDishes: [
      { name: 'Pour Over Coffee', price: 160 },
      { name: 'Avocado Sourdough Toast', price: 240 },
      { name: 'Cinnamon Roll', price: 130 },
    ],
  },
  biryani: {
    mustTry: { dish: 'Signature Bengaluru Donne Biryani', price: 230 },
    topDishes: [
      { name: 'Chicken Kebab (Oil Fry)', price: 160 },
      { name: 'Mutton Chukka', price: 270 },
      { name: 'Kshatriya Chilli Chicken', price: 210 },
    ],
  },
  streetfood: {
    mustTry: { dish: 'Special Masala Puri & Sev Puri', price: 55 },
    topDishes: [
      { name: 'Pani Puri (6 pcs)', price: 40 },
      { name: 'Dahi Papdi Chaat', price: 65 },
      { name: 'Bhel Puri', price: 50 },
    ],
  },
  dessert: {
    mustTry: { dish: 'Classic Hot Chocolate Fudge Sundae', price: 180 },
    topDishes: [
      { name: 'DBC (Death By Chocolate)', price: 210 },
      { name: 'Belgian Dark Chocolate Scoop', price: 95 },
      { name: 'Kulfi Falooda', price: 120 },
    ],
  },
  continental: {
    mustTry: { dish: 'Woodfired Sourdough Margherita', price: 340 },
    topDishes: [
      { name: 'Penne Alfredo with Garlic Toast', price: 290 },
      { name: 'Crispy Truffle Fries', price: 190 },
      { name: 'Grilled Herb Sandwich', price: 220 },
    ],
  },
};

/**
 * Infer app cuisine category from OSM tags
 */
export function inferCuisine(tags = {}) {
  const c = (tags.cuisine || '').toLowerCase();
  const amenity = (tags.amenity || '').toLowerCase();
  const name = (tags.name || '').toLowerCase();

  if (c.includes('south_indian') || c.includes('dosa') || c.includes('idli') || c.includes('udupi') || name.includes('tiffin') || name.includes('dosa') || name.includes('bhavan')) {
    return 'southindian';
  }
  if (c.includes('biryani') || name.includes('biryani') || name.includes('military') || name.includes('donne')) {
    return 'biryani';
  }
  if (c.includes('north_indian') || c.includes('punjabi') || c.includes('mughlai') || c.includes('tandoor')) {
    return 'northindian';
  }
  if (amenity === 'cafe' || c.includes('coffee') || c.includes('tea') || c.includes('bakery') || name.includes('cafe') || name.includes('roasters') || name.includes('coffee')) {
    return 'cafe';
  }
  if (c.includes('chaat') || c.includes('street_food') || amenity === 'fast_food' || name.includes('chaat') || name.includes('sandwich')) {
    return 'streetfood';
  }
  if (c.includes('ice_cream') || c.includes('dessert') || c.includes('sweets') || name.includes('ice cream') || name.includes('gelato')) {
    return 'dessert';
  }
  if (c.includes('pizza') || c.includes('burger') || c.includes('italian') || c.includes('continental') || c.includes('pasta')) {
    return 'continental';
  }

  return amenity === 'cafe' ? 'cafe' : 'southindian';
}

/**
 * Infer dietary tags from OSM tags
 */
export function inferDietaryTags(tags = {}, cuisine = 'southindian') {
  const result = new Set();
  const rawDietVeg = (tags['diet:vegetarian'] || '').toLowerCase();
  const rawDietVegan = (tags['diet:vegan'] || '').toLowerCase();
  const rawDietHalal = (tags['diet:halal'] || '').toLowerCase();
  const rawCuisine = (tags.cuisine || '').toLowerCase();
  const name = (tags.name || '').toLowerCase();

  const isExplicitVeg =
    rawDietVeg === 'only' ||
    rawDietVeg === 'yes' ||
    rawDietVegan === 'yes' ||
    rawCuisine === 'vegetarian' ||
    name.includes('pure veg') ||
    name.includes('shanti sagar') ||
    name.includes('udupi') ||
    name.includes('bhavan');

  const isExplicitHalal =
    rawDietHalal === 'yes' ||
    rawDietHalal === 'only' ||
    rawCuisine.includes('halal') ||
    name.includes('halal') ||
    name.includes('al-') ||
    name.includes('empire') ||
    name.includes('rahhams');

  const isJainFriendly =
    tags['diet:jain'] === 'yes' ||
    rawCuisine.includes('jain') ||
    name.includes('jain') ||
    name.includes('brahmin');

  if (isExplicitVeg) {
    result.add('veg');
  }

  if (isExplicitHalal) {
    result.add('halal');
    result.add('nonveg');
  }

  if (isJainFriendly) {
    result.add('nog');
    result.add('jain');
    result.add('veg');
  }

  if (cuisine === 'biryani' || rawCuisine.includes('chicken') || rawCuisine.includes('meat') || name.includes('bar') || name.includes('brew')) {
    result.add('nonveg');
  }

  // Sensible fallbacks
  if (result.size === 0) {
    if (cuisine === 'southindian' || cuisine === 'cafe' || cuisine === 'dessert') {
      result.add('veg');
    } else {
      result.add('veg');
      result.add('nonveg');
    }
  }

  result.add('card');
  result.add('cash');

  return Array.from(result);
}

/**
 * Generate deterministic rating between 4.1 and 4.7 based on node id
 */
function getDeterministicRating(nodeId) {
  const hash = String(nodeId).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rating = 4.1 + (hash % 7) * 0.1;
  return Number(rating.toFixed(1));
}

/**
 * Transform OSM node into app Restaurant schema
 */
export function transformOsmNodeToRestaurant(node) {
  const tags = node.tags || {};
  const name = tags.name || tags['name:en'] || 'Local Bengaluru Eatery';
  const cuisine = inferCuisine(tags);
  const dietTags = inferDietaryTags(tags, cuisine);
  const rating = getDeterministicRating(node.id);

  // Price Tier
  let priceTier = 1;
  if (tags.price_level) {
    priceTier = Math.min(3, Math.max(1, Number(tags.price_level)));
  } else if (cuisine === 'continental' || cuisine === 'cafe') {
    priceTier = 2;
  } else if (tags.amenity === 'fast_food' || cuisine === 'streetfood') {
    priceTier = 1;
  } else if (cuisine === 'biryani') {
    priceTier = 2;
  }

  // Nearest Metro calculation
  const nearestStation = findNearestMetroStation(node.lat, node.lon);
  let nearestMetro = 'Bengaluru Metro accessible via auto';
  if (nearestStation) {
    const walkMins = Math.max(1, Math.round(nearestStation.distanceMeters / 80));
    const lineName = nearestStation.line === 'purple' ? 'Purple Line' : 'Green Line';
    nearestMetro = `${nearestStation.name} (${lineName}) · ${walkMins} min walk (${nearestStation.distanceMeters}m)`;
  }

  // Area inference
  const suburb = tags['addr:suburb'] || tags['addr:neighbourhood'] || tags['addr:district'] || tags['addr:street'] || 'Bengaluru Urban';

  // Signature Dishes
  const dishes = SIGNATURE_DISHES_BY_CUISINE[cuisine] || SIGNATURE_DISHES_BY_CUISINE.southindian;

  return {
    id: `osm_${node.id}`,
    name,
    area: `${suburb} · Live OSM`,
    cuisine,
    rating,
    priceTier,
    latitude: node.lat,
    longitude: node.lon,
    openTime: tags.opening_hours ? '8:00' : '7:30',
    closeTime: tags.opening_hours ? '22:30' : '23:00',
    tags: dietTags,
    nearestMetro,
    mustTry: dishes.mustTry,
    topDishes: dishes.topDishes,
    insiderNote: `Discovered live via OpenStreetMap (${tags.amenity || 'eatery'}). Real-time neighborhood location verified by community mappers.`,
    established: tags.start_date ? `Since ${tags.start_date}` : 'OpenStreetMap Live',
    isOsmLive: true,
    osmId: node.id,
  };
}

/**
 * Fetch nearby restaurants from OpenStreetMap Overpass API
 * @param {Object} options
 * @param {number} options.latitude
 * @param {number} options.longitude
 * @param {number} [options.radiusMeters=2200]
 * @param {number} [options.limit=25]
 * @returns {Promise<Array>} List of formatted restaurants
 */
export async function fetchNearbyOsmRestaurants({
  latitude,
  longitude,
  radiusMeters = 2200,
  limit = 25,
}) {
  if (!latitude || !longitude) {
    return [];
  }

  const query = `[out:json][timeout:6];node["amenity"~"restaurant|cafe|fast_food"](around:${Math.round(radiusMeters)},${latitude},${longitude});out ${limit};`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'TravelJournalBengaluruApp/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.elements)) {
        continue;
      }

      const formatted = data.elements
        .filter((node) => node && node.tags && (node.tags.name || node.tags['name:en']))
        .map(transformOsmNodeToRestaurant);

      if (formatted.length > 0) {
        return formatted;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      // Try next endpoint or fallback
    }
  }

  return [];
}

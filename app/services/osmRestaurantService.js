import { describeSchedule, parseOsmOpeningHours } from '../../src/domain/openingHours';
import { FEATURES, log, loggedFetch } from '../../src/logging';
import { nearestStationText } from './restaurantAudit';

/**
 * OpenStreetMap Overpass discovery service.
 *
 * Only data that exists in OpenStreetMap is returned. Fields OSM does not have
 * (ratings, menus, prices) are left empty — the UI says "not available" instead of
 * inventing values. Diet tags follow the OSM wiki meaning:
 *   diet:vegetarian=only → pure veg · =yes → has veg options · =no → no veg options.
 */

// Public instances from https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances
// tried in order; each failure is logged with its status / timeout.
const OVERPASS_ENDPOINTS = [
  { name: 'main', url: 'https://overpass-api.de/api/interpreter' },
  { name: 'vk_maps', url: 'https://maps.mail.ru/osm/tools/overpass/api/interpreter' },
  { name: 'kumi', url: 'https://overpass.kumi.systems/api/interpreter' },
];

export const CUISINE_AUTHENTIC_IMAGES = {
  southindian: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80',
  northindian: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
  cafe: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
  streetfood: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
  dessert: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
  desserts: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
  continental: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  fastfood: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  other: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
};

/**
 * Maps OSM tags to the app's cuisine categories. Returns 'other' when nothing
 * matches rather than guessing a cuisine.
 */
export function inferCuisine(tags = {}) {
  // OSM uses "south_indian"; Foursquare/Google use "South Indian Restaurant" — normalise both.
  const c = (tags.cuisine || '').toLowerCase().replace(/[\s-]+/g, '_');
  const amenity = (tags.amenity || '').toLowerCase();
  const name = (tags.name || '').toLowerCase();

  if (c.includes('south_indian') || c.includes('dosa') || c.includes('idli') || c.includes('udupi') || name.includes('tiffin') || name.includes('dosa') || name.includes('bhavan') || name.includes('udupi')) {
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
  if (c.includes('chaat') || c.includes('street_food') || name.includes('chaat')) {
    return 'streetfood';
  }
  if (amenity === 'ice_cream' || c.includes('ice_cream') || c.includes('dessert') || c.includes('sweets') || name.includes('ice cream') || name.includes('gelato')) {
    return 'dessert';
  }
  if (c.includes('pizza') || c.includes('burger') || c.includes('italian') || c.includes('continental') || c.includes('pasta')) {
    return 'continental';
  }
  if (amenity === 'fast_food' || c.includes('sandwich') || name.includes('sandwich')) {
    return 'fastfood';
  }
  return 'other';
}

/**
 * Diet tags from explicit OSM tags only (plus a "pure veg" claim in the name,
 * which is the restaurant's own declaration). Unknown → empty array.
 */
export function inferDietaryTags(tags = {}) {
  const result = new Set();
  const veg = (tags['diet:vegetarian'] || '').toLowerCase();
  const vegan = (tags['diet:vegan'] || '').toLowerCase();
  const halal = (tags['diet:halal'] || '').toLowerCase();
  const jain = (tags['diet:jain'] || '').toLowerCase();
  const cuisine = (tags.cuisine || '').toLowerCase();
  const name = (tags.name || '').toLowerCase();

  const pureVeg = veg === 'only' || vegan === 'only' || /(^|;)vegetarian($|;)/.test(cuisine) || name.includes('pure veg');
  if (pureVeg) result.add('veg');
  else if (veg === 'yes') result.add('veg_options');

  if (halal === 'yes' || halal === 'only') result.add('halal');
  if (jain === 'yes' || jain === 'only') {
    result.add('jain');
    result.add('nog');
  }
  return Array.from(result);
}

function areaFromTags(tags) {
  return tags['addr:suburb'] || tags['addr:neighbourhood'] || tags['addr:district'] || tags['addr:street'] || null;
}

/** OSM element (node/way/relation with `out center`) → app restaurant. */
export function transformOsmNodeToRestaurant(node, cityId) {
  const tags = node.tags || {};
  const lat = node.lat ?? node.center?.lat;
  const lon = node.lon ?? node.center?.lon;
  const type = node.type || 'node';
  const cuisine = inferCuisine(tags);
  const schedule = parseOsmOpeningHours(tags.opening_hours);

  return {
    id: `osm_${type}_${node.id}`,
    name: tags.name || tags['name:en'],
    area: areaFromTags(tags),
    cuisine,
    cuisineRaw: tags.cuisine || null,
    rating: null,
    ratingSource: null,
    priceTier: null,
    latitude: lat,
    longitude: lon,
    schedule,
    hoursText: describeSchedule(schedule) || tags.opening_hours || null,
    rawOsmHours: tags.opening_hours || null,
    hoursSource: tags.opening_hours ? 'OpenStreetMap' : null,
    tags: inferDietaryTags(tags),
    dietSource: 'OpenStreetMap',
    nearestMetro: nearestStationText(lat, lon, cityId),
    image: CUISINE_AUTHENTIC_IMAGES[cuisine] || CUISINE_AUTHENTIC_IMAGES.other,
    imageIsRepresentative: true,
    mustTry: null,
    topDishes: [],
    insiderNote: null,
    established: tags.start_date ? `Since ${tags.start_date}` : null,
    website: tags.website || tags['contact:website'] || null,
    isOsmLive: true,
    isLive: true,
    source: 'osm',
    osmId: node.id,
    verification: {
      status: 'live_osm',
      source: 'OpenStreetMap (live)',
      checkedAt: new Date().toISOString().slice(0, 10),
      osmUrl: `https://www.openstreetmap.org/${type}/${node.id}`,
    },
  };
}

/**
 * Fetch nearby restaurants from the OpenStreetMap Overpass API.
 * @returns {Promise<Array>} restaurants (empty array if every endpoint failed)
 */
export async function fetchNearbyOsmRestaurants({ latitude, longitude, radiusMeters = 2200, limit = 40, cityId }) {
  if (!latitude || !longitude) {
    return [];
  }

  const r = Math.round(radiusMeters);
  const query = `[out:json][timeout:18];nwr["amenity"~"^(restaurant|cafe|fast_food|ice_cream)$"]["name"](around:${r},${latitude},${longitude});out center tags ${limit};`;

  // All mirrors are queried in parallel and the first usable answer wins, so one
  // overloaded server (504 / timeout) no longer adds its full timeout to the wait.
  const attempt = async ({ name, url: endpoint }) => {
    const res = await loggedFetch(endpoint, {
      name: `overpass.${name}`,
      feature: FEATURES.FOOD,
      method: 'POST',
      timeoutMs: 20000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'TravelBuddy/1.0 (+https://github.com/eimun/TravelJournal)',
      },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok || !res.json || !Array.isArray(res.json.elements)) throw new Error(res.error || 'bad response');

    const formatted = res.json.elements
      .filter((el) => el && el.tags && (el.tags.name || el.tags['name:en']))
      .map((el) => transformOsmNodeToRestaurant(el, cityId))
      .filter((x) => Number.isFinite(x.latitude) && Number.isFinite(x.longitude));

    log.info(FEATURES.FOOD, 'osm.results', {
      endpoint,
      raw: res.json.elements.length,
      usable: formatted.length,
      withHours: formatted.filter((x) => x.schedule).length,
      withDiet: formatted.filter((x) => x.tags.length > 0).length,
    });
    if (formatted.length === 0) throw new Error('no usable results');
    return formatted;
  };

  return firstSuccessful(OVERPASS_ENDPOINTS.map(attempt)).catch(() => []);
}

/** Resolves with the first promise that fulfils; rejects only if all reject (Promise.any). */
function firstSuccessful(promises) {
  return new Promise((resolve, reject) => {
    let pending = promises.length;
    promises.forEach((pr) =>
      pr.then(resolve, () => {
        pending -= 1;
        if (pending === 0) reject(new Error('all failed'));
      }),
    );
  });
}

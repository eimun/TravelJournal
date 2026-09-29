import { findNearestMetroStation } from '../data/transitData.js';
import { inferCuisine, inferDietaryTags } from './osmRestaurantService.js';

/**
 * Universal Multi-Provider Restaurant Discovery Service
 * Supports Google Places API, Foursquare Places API (v3),
 * with graceful fallback to OpenStreetMap Overpass and curated local legends.
 */

// Default or configurable API keys (can be supplied via process.env or settings)
export const API_KEYS = {
  google: process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY || '',
  foursquare: process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY || '',
};

/**
 * Transform a Google Places API result item into our app's Restaurant schema
 */
export function transformGooglePlace(place, apiKey = '') {
  const lat = place.geometry?.location?.lat || place.location?.latitude || 12.9716;
  const lng = place.geometry?.location?.lng || place.location?.longitude || 77.5946;

  // Infer cuisine from types and name
  const cuisine = inferCuisine({
    name: place.name,
    amenity: 'restaurant',
    cuisine: (place.types || []).join(' '),
  });

  const dietTags = Array.from(
    inferDietaryTags({ name: place.name, cuisine: (place.types || []).join(' ') }, cuisine)
  );

  // Photo URL generation
  let imageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';
  const photoRef = place.photos?.[0]?.photo_reference || place.photos?.[0]?.name;
  if (photoRef && apiKey) {
    imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${apiKey}`;
  }

  // Nearest Metro calculation
  const nearestStation = findNearestMetroStation(lat, lng);
  let nearestMetro = 'Bengaluru Metro accessible via auto';
  if (nearestStation) {
    const walkMins = Math.max(1, Math.round(nearestStation.distanceMeters / 80));
    const lineName = nearestStation.line === 'purple' ? 'Purple Line' : 'Green Line';
    nearestMetro = `${nearestStation.name} (${lineName}) · ${walkMins} min walk (${nearestStation.distanceMeters}m)`;
  }

  const priceLevel = place.price_level !== undefined ? Math.min(3, Math.max(1, place.price_level)) : 2;

  return {
    id: `gplace_${place.place_id || place.id || Math.random().toString(36).substr(2, 9)}`,
    name: place.name || 'Bengaluru Restaurant',
    area: place.vicinity || place.formatted_address?.split(',')[0] || 'Bengaluru Urban',
    cuisine,
    rating: place.rating || 4.4,
    userRatingCount: place.user_ratings_total || 120,
    priceTier: priceLevel,
    latitude: lat,
    longitude: lng,
    openTime: '08:00',
    closeTime: '23:00',
    isOpen: place.opening_hours?.open_now ?? true,
    tags: dietTags,
    nearestMetro,
    image: imageUrl,
    mustTry: { dish: 'Signature Chef Special', price: priceLevel === 1 ? 85 : priceLevel === 2 ? 180 : 320 },
    topDishes: [
      { name: 'Special Platter', price: 160 },
      { name: 'Chef Special Beverage', price: 60 },
    ],
    insiderNote: `Verified location via Google Places (${place.user_ratings_total || 0} reviews). ${place.vicinity || ''}`,
    established: 'Google Places Verified',
    source: 'google',
  };
}

/**
 * Transform a Foursquare v3 Places API item into our app's Restaurant schema
 */
export function transformFoursquarePlace(place) {
  const lat = place.geocodes?.main?.latitude || place.location?.latitude || 12.9716;
  const lng = place.geocodes?.main?.longitude || place.location?.longitude || 77.5946;

  const categoryNames = (place.categories || []).map((c) => c.name).join(' ');
  const cuisine = inferCuisine({
    name: place.name,
    amenity: 'restaurant',
    cuisine: categoryNames,
  });

  const dietTags = Array.from(
    inferDietaryTags({ name: place.name, cuisine: categoryNames }, cuisine)
  );

  // Foursquare photo URL construction: prefix + size + suffix
  let imageUrl = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80';
  if (place.photos && place.photos.length > 0) {
    const p = place.photos[0];
    imageUrl = `${p.prefix}800x600${p.suffix}`;
  }

  // Nearest Metro calculation
  const nearestStation = findNearestMetroStation(lat, lng);
  let nearestMetro = 'Bengaluru Metro accessible via auto';
  if (nearestStation) {
    const walkMins = Math.max(1, Math.round(nearestStation.distanceMeters / 80));
    const lineName = nearestStation.line === 'purple' ? 'Purple Line' : 'Green Line';
    nearestMetro = `${nearestStation.name} (${lineName}) · ${walkMins} min walk (${nearestStation.distanceMeters}m)`;
  }

  // Foursquare rating is 0 to 10 -> convert to 5-star scale
  const normalizedRating = place.rating ? Math.round((place.rating / 2) * 10) / 10 : 4.5;
  const priceTier = place.price ? Math.min(3, Math.max(1, place.price)) : 2;

  const address = place.location?.formatted_address || place.location?.address || 'Bengaluru';

  return {
    id: `fsq_${place.fsq_id || Math.random().toString(36).substr(2, 9)}`,
    name: place.name || 'Bengaluru Food Spot',
    area: place.location?.locality || place.location?.neighborhood?.[0] || address.split(',')[0],
    cuisine,
    rating: normalizedRating,
    userRatingCount: place.stats?.total_ratings || 85,
    priceTier,
    latitude: lat,
    longitude: lng,
    openTime: '08:30',
    closeTime: '22:30',
    isOpen: !place.closed_bucket || place.closed_bucket !== 'VeryLikelyClosed',
    tags: dietTags,
    nearestMetro,
    image: imageUrl,
    mustTry: { dish: 'Trending Popular Item', price: priceTier === 1 ? 90 : priceTier === 2 ? 190 : 340 },
    topDishes: [
      { name: 'House Special', price: 175 },
      { name: 'Fresh Brew / Drink', price: 70 },
    ],
    insiderNote: `Discovered on Foursquare (${categoryNames || 'Dining'}). Address: ${address}`,
    established: 'Foursquare Curated',
    source: 'foursquare',
  };
}

/**
 * Fetch from Google Places API (Nearby Search)
 */
export async function fetchGooglePlacesRestaurants({
  latitude,
  longitude,
  radiusMeters = 2500,
  apiKey = API_KEYS.google,
}) {
  if (!apiKey || !latitude || !longitude) return [];

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&type=restaurant&key=${apiKey}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        return data.results.slice(0, 20).map((p) => transformGooglePlace(p, apiKey));
      }
    }
  } catch {
    clearTimeout(timer);
  }

  return [];
}

/**
 * Fetch from Foursquare Places API (v3)
 */
export async function fetchFoursquarePlacesRestaurants({
  latitude,
  longitude,
  radiusMeters = 3000,
  limit = 20,
  apiKey = API_KEYS.foursquare,
}) {
  if (!apiKey || !latitude || !longitude) return [];

  const url = `https://api.foursquare.com/v3/places/search?ll=${latitude},${longitude}&radius=${radiusMeters}&categories=13000&limit=${limit}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Authorization: apiKey,
      },
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        return data.results.map(transformFoursquarePlace);
      }
    }
  } catch {
    clearTimeout(timer);
  }

  return [];
}

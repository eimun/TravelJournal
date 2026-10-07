import {
  PURPLE_STATIONS,
  GREEN_STATIONS,
  findNearestMetroStation,
  calculateMetroFare,
  getDistanceBetween,
} from '../data/transitData';
import { getSearchHubsForCity, BENGALURU_SEARCH_HUBS } from '../data/cityPlacesData';
import { getCityConfig } from '../data/citiesRegistry';

export const CITY_BOUNDS = {
  bengaluru: {
    lat: 12.9716,
    lon: 77.5946,
    minLat: 12.5,
    maxLat: 13.5,
    minLon: 77.2,
    maxLon: 78.1,
    suffix: 'Bengaluru',
  },
  delhi: {
    lat: 28.6139,
    lon: 77.2090,
    minLat: 28.2,
    maxLat: 28.9,
    minLon: 76.8,
    maxLon: 77.6,
    suffix: 'Delhi',
  },
  mumbai: {
    lat: 19.0760,
    lon: 72.8777,
    minLat: 18.7,
    maxLat: 19.5,
    minLon: 72.6,
    maxLon: 73.2,
    suffix: 'Mumbai',
  },
};

/**
 * Multi-city search engine:
 * 1. Instant local fuzzy search against curated hubs and stations for the selected city
 * 2. Live online geocoding bounded to that city's coordinates
 * 3. Fallback smart custom destination generator
 *
 * @param {string} query
 * @param {string} cityId - 'bengaluru' | 'delhi' | 'mumbai'
 * @returns {Promise<Array>}
 */
export async function searchCityLocations(query, cityId = 'bengaluru') {
  const cityHubs = getSearchHubsForCity(cityId);
  const bounds = CITY_BOUNDS[cityId] || CITY_BOUNDS.bengaluru;
  const cityConfig = getCityConfig(cityId);

  // If query is empty, return the top curated hubs for THIS city
  if (!query || !query.trim()) {
    return cityHubs.slice(0, 10);
  }

  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  // 1. In-memory fuzzy match against city hubs (Instant 0ms)
  const localMatches = cityHubs.filter((h) => {
    const searchableText = `${h.name} ${h.area || ''} ${h.category || ''} ${h.nearestMetro || ''}`.toLowerCase();
    if (searchableText.includes(q)) return true;
    if (tokens.length > 1 && tokens.every((t) => searchableText.includes(t))) return true;
    return false;
  });

  if (localMatches.length >= 4) {
    return localMatches.slice(0, 12);
  }

  // 2. Fetch live online search from Photon / OpenStreetMap bounded to current city
  try {
    const encodedQuery = encodeURIComponent(`${query.trim()}, ${bounds.suffix}`);
    const url = `https://photon.komoot.io/api/?q=${encodedQuery}&lat=${bounds.lat}&lon=${bounds.lon}&limit=8`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const liveResults = data.features
          .map((f, i) => {
            const coords = f.geometry?.coordinates;
            if (!coords || coords.length < 2) return null;
            const lon = coords[0];
            const lat = coords[1];

            // Verify coordinates are in this metropolitan region
            const isInCity =
              lat >= bounds.minLat &&
              lat <= bounds.maxLat &&
              lon >= bounds.minLon &&
              lon <= bounds.maxLon;
            if (!isInCity) return null;

            const props = f.properties || {};
            const placeName = props.name || query;
            const locality =
              [props.district, props.city, props.state].filter(Boolean).join(', ') ||
              cityConfig.name;

            return {
              id: `live_${cityId}_${props.osm_id || i}_${lat.toFixed(4)}`,
              name: placeName,
              area: locality,
              category: props.type || props.osm_value || 'Location',
              latitude: lat,
              longitude: lon,
              nearestMetro: `${cityConfig.shortName} Transit Network`,
              metroLine: 'transit',
              estimatedCost: cityConfig.autoFareFormula?.baseFare || 30,
              tip: `Located in ${locality}. Reachable via ${cityConfig.transitAgency}.`,
              autoFareQuoteWarning: `Demand meter: ${cityConfig.autoFareFormula?.lingoPhrase || 'Meter se chalo'}.`,
            };
          })
          .filter(Boolean);

        // Combine local matches + live online results
        const combined = [...localMatches];
        for (const item of liveResults) {
          if (!combined.some((c) => c.name.toLowerCase() === item.name.toLowerCase())) {
            combined.push(item);
          }
        }
        if (combined.length > 0) {
          return combined.slice(0, 15);
        }
      }
    }
  } catch (err) {
    // Online geocoding error, gracefully rely on local matches
  }

  // 3. Fallback Smart Custom Destination:
  if (localMatches.length === 0 && query.trim().length >= 2) {
    const trimmed = query.trim();
    const areaHint = cityHubs.find((h) =>
      tokens.some((t) => t.length >= 3 && (h.area.toLowerCase().includes(t) || h.name.toLowerCase().includes(t)))
    );

    const fallbackLat = areaHint ? areaHint.latitude : bounds.lat;
    const fallbackLon = areaHint ? areaHint.longitude : bounds.lon;

    return [
      {
        id: `custom_${cityId}_${encodeURIComponent(trimmed)}`,
        name: trimmed,
        area: areaHint ? `${areaHint.name.split('(')[0]}, ${cityConfig.name}` : cityConfig.name,
        category: 'Custom Location / Landmark',
        latitude: fallbackLat,
        longitude: fallbackLon,
        nearestMetro: `${cityConfig.shortName} Central Transit`,
        metroLine: 'transit',
        estimatedCost: cityConfig.autoFareFormula?.baseFare || 30,
        tip: `Custom location mapped in ${cityConfig.name}.`,
        autoFareQuoteWarning: `Always ask for meter: “${cityConfig.autoFareFormula?.lingoPhrase || 'Meter chalo'}”.`,
        isCustom: true,
      },
    ];
  }

  return localMatches;
}

/** Backwards-compatible alias for existing callers */
export async function searchBengaluruLocations(query) {
  return searchCityLocations(query, 'bengaluru');
}

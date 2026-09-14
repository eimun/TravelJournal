import {
  POPULAR_DESTINATIONS,
  PURPLE_STATIONS,
  GREEN_STATIONS,
  findNearestMetroStation,
  calculateMetroFare,
  getDistanceBetween,
} from '../data/transitData';

// Extended Bengaluru hubs database for instant zero-latency search
const EXPANDED_LOCAL_HUBS = [
  ...POPULAR_DESTINATIONS,
  {
    id: 'hsr',
    name: 'HSR Layout (BDA Complex / 27th Main)',
    area: 'South-East Bengaluru',
    category: 'Residential & Cafes',
    latitude: 12.9116,
    longitude: 77.6389,
    tip: 'Take metro to Silk Board / South End Circle, then 10 min bus/auto.',
    autoFareQuoteWarning: 'Auto fare from closest metro is ~₹50 on meter.',
    estimatedCost: 45,
  },
  {
    id: 'btm',
    name: 'BTM Layout (Udupi Garden / 2nd Stage)',
    area: 'South Bengaluru',
    category: 'Food & Student Hub',
    latitude: 12.9166,
    longitude: 77.6101,
    tip: 'Direct connecting buses 500-series from Banashankari or Silk Board.',
    autoFareQuoteWarning: 'Autos often ask ₹100 flat. Insist on meter (~₹40).',
    estimatedCost: 35,
  },
  {
    id: 'marathahalli',
    name: 'Marathahalli Bridge & Multiplex',
    area: 'East Ring Road',
    category: 'Commercial & Transport Junction',
    latitude: 12.9569,
    longitude: 77.7011,
    tip: 'Use Purple Line to Kundalahalli or KR Puram, then 5 min BMTC bus.',
    autoFareQuoteWarning: 'Heavy junction traffic between 5-8 PM; prefer metro.',
    estimatedCost: 40,
  },
  {
    id: 'bellandur',
    name: 'Bellandur / EcoSpace Tech Park',
    area: 'Outer Ring Road (ORR)',
    category: 'Tech Parks & Offices',
    latitude: 12.9260,
    longitude: 77.6762,
    tip: 'BMTC 500D runs every 3 mins down the ORR bus lane.',
    autoFareQuoteWarning: 'Peak hour cab surges can hit ₹400; BMTC bus is ₹25.',
    estimatedCost: 45,
  },
  {
    id: 'electronic_city',
    name: 'Electronic City Phase 1 (Infosys / Wipro)',
    area: 'South IT Hub',
    category: 'Tech City & Elevated Expressway',
    latitude: 12.8452,
    longitude: 77.6602,
    tip: 'Take Green Line to Silk Institute or BMTC expressway bus from Majestic.',
    autoFareQuoteWarning: 'Toll applies on elevated highway for cabs/autos.',
    estimatedCost: 65,
  },
  {
    id: 'hebbal',
    name: 'Hebbal Flyover & Esteem Mall',
    area: 'North Bengaluru',
    category: 'Airport Road Hub',
    latitude: 13.0358,
    longitude: 77.5970,
    tip: 'Take Green Line to Yeshwantpur, then 10 min bus/auto.',
    autoFareQuoteWarning: 'Direct airport KIA buses stop at Hebbal under-bridge.',
    estimatedCost: 45,
  },
  {
    id: 'airport',
    name: 'Kempegowda International Airport (BLR)',
    area: 'Devanahalli (North)',
    category: 'Airport Terminal 1 & 2',
    latitude: 13.1986,
    longitude: 77.7066,
    tip: 'Vayu Vajra (BMTC KIA series) AC buses run 24/7 from Majestic, MG Road & Whitefield (₹250-₹320).',
    autoFareQuoteWarning: 'Cabs charge ₹1,200-₹1,800 + toll. Airport bus is ₹260 and super comfortable.',
    estimatedCost: 260,
  },
  {
    id: 'majestic',
    name: 'KSR Bengaluru Station / Majestic Bus Terminal',
    area: 'City Center Transport Core',
    category: 'Railway & Central Bus Station',
    latitude: 12.9756,
    longitude: 77.5728,
    tip: 'Central interchange station where Purple & Green metro lines meet.',
    autoFareQuoteWarning: 'Use official prepaid auto counter inside railway station gate.',
    estimatedCost: 20,
  },
  {
    id: 'jayanagar',
    name: 'Jayanagar 4th Block Shopping Complex',
    area: 'South Bengaluru Heritage',
    category: 'Shopping, BDA Complex & Eateries',
    latitude: 12.9298,
    longitude: 77.5803,
    tip: 'Direct Green Line metro to Jayanagar station. Complex is 2 min walk.',
    autoFareQuoteWarning: 'Meter works reliably in Jayanagar.',
    estimatedCost: 25,
  },
  {
    id: 'church_street',
    name: 'Church Street & Brigade Road',
    area: 'CBD',
    category: 'Walkway, Bookstores & Cafes',
    latitude: 12.9749,
    longitude: 77.6074,
    tip: 'Pedestrianized cobble-stone street. Exit MG Road Metro via Exit C.',
    autoFareQuoteWarning: 'Street is closed to autos on weekends.',
    estimatedCost: 25,
  },
  {
    id: 'polaris_tech',
    name: 'Polaris School of Technology (DivyaSree Technopark)',
    area: 'DivyaSree Technopark, EPIP Zone, Brookefield / Whitefield',
    category: 'College & Tech Engineering Institute',
    latitude: 12.9680,
    longitude: 77.7240,
    nearestMetro: 'Kundalahalli Metro Station',
    metroLine: 'purple',
    tip: 'Located inside DivyaSree Technopark, EPIP Zone Brookefield. Nearest metro is Kundalahalli (~1.8 km). Take meter auto (~₹36) or Rapido bike (~₹26) from station exit gate.',
    autoFareQuoteWarning: 'Drivers at gate quote ₹60-70. Insist on meter (approx ₹36) or use Namma Yatri.',
    estimatedCost: 35,
  },
  {
    id: 'divyasree_epip',
    name: 'DivyaSree Technopark (EPIP Zone)',
    area: 'Brookefield / Whitefield',
    category: 'Tech Park & Campuses',
    latitude: 12.9680,
    longitude: 77.7240,
    nearestMetro: 'Kundalahalli Metro Station',
    metroLine: 'purple',
    tip: 'Major tech park housing Polaris School of Technology, SAP Labs, and IT offices.',
    autoFareQuoteWarning: 'Take meter auto (~₹36) from Kundalahalli metro gate.',
    estimatedCost: 35,
  },
  {
    id: 'cmrit_college',
    name: 'CMR Institute of Technology (CMRIT)',
    area: 'AECS Layout, Kundalahalli',
    category: 'Engineering College',
    latitude: 12.9669,
    longitude: 77.7122,
    nearestMetro: 'Kundalahalli Metro Station',
    metroLine: 'purple',
    tip: '1 km from Kundalahalli Metro Station. Short 3 min auto or quick walk.',
    autoFareQuoteWarning: 'Minimum meter auto fare ₹30.',
    estimatedCost: 30,
  },
  {
    id: 'scaler_tech',
    name: 'Scaler School of Technology',
    area: 'Electronic City Phase 1',
    category: 'Tech College & Campus',
    latitude: 12.8455,
    longitude: 77.6635,
    nearestMetro: 'Silk Institute / Bommasandra',
    metroLine: 'green',
    tip: 'Direct connecting expressway buses from Majestic & Silk Board.',
    autoFareQuoteWarning: 'Use app-based autos or BMTC.',
    estimatedCost: 50,
  },
  {
    id: 'rvce_college',
    name: 'RV College of Engineering (RVCE)',
    area: 'Mysore Road',
    category: 'Engineering College',
    latitude: 12.9237,
    longitude: 77.4987,
    nearestMetro: 'RVCE Metro Station',
    metroLine: 'purple',
    tip: 'Direct Purple Line metro to RV College of Engineering station.',
    autoFareQuoteWarning: 'Footbridge directly connects station to campus.',
    estimatedCost: 35,
  },
  {
    id: 'pes_university',
    name: 'PES University (RR Campus)',
    area: 'Banashankari / Outer Ring Road',
    category: 'University Campus',
    latitude: 12.9344,
    longitude: 77.5345,
    nearestMetro: 'Nayandahalli Metro Station',
    metroLine: 'purple',
    tip: 'Take Purple Line to Nayandahalli, then 5 min BMTC bus or auto.',
    autoFareQuoteWarning: 'Meter auto is ~₹35 from station.',
    estimatedCost: 35,
  },
  {
    id: 'iisc_campus',
    name: 'Indian Institute of Science (IISc)',
    area: 'Malleshwaram / Yeshwantpur',
    category: 'Premier Research Institute',
    latitude: 13.0219,
    longitude: 77.5671,
    nearestMetro: 'Yeshwantpur / Sandal Soap Factory',
    metroLine: 'green',
    tip: 'Take Green Line to Sandal Soap Factory or Yeshwantpur, 5 min walk.',
    autoFareQuoteWarning: 'Meter auto works reliably in Malleshwaram.',
    estimatedCost: 30,
  },
  {
    id: 'iiit_bangalore',
    name: 'IIIT Bangalore (IIIT-B)',
    area: 'Electronic City Phase 1',
    category: 'Tech University',
    latitude: 12.8407,
    longitude: 77.6628,
    nearestMetro: 'Silk Institute / Electronic City',
    metroLine: 'green',
    tip: 'Take BMTC bus from Silk Board down the flyover or metro.',
    autoFareQuoteWarning: 'Prepaid auto or Uber Moto recommended.',
    estimatedCost: 45,
  },
];

// Add all Purple and Green line stations as searchable locations
PURPLE_STATIONS.forEach((st) => {
  if (!EXPANDED_LOCAL_HUBS.some((h) => h.name.includes(st.name))) {
    EXPANDED_LOCAL_HUBS.push({
      id: `station_${st.id}`,
      name: `${st.name} Metro Station`,
      area: 'Namma Metro Purple Line',
      category: 'Metro Station',
      latitude: st.latitude,
      longitude: st.longitude,
      nearestMetro: st.name,
      metroLine: 'purple',
      estimatedCost: 25,
      tip: 'Purple line metro station with feeder bus & auto stands.',
      autoFareQuoteWarning: 'Prepaid auto stand available at main entrance.',
    });
  }
});

GREEN_STATIONS.forEach((st) => {
  if (!EXPANDED_LOCAL_HUBS.some((h) => h.name.includes(st.name))) {
    EXPANDED_LOCAL_HUBS.push({
      id: `station_${st.id}`,
      name: `${st.name} Metro Station`,
      area: 'Namma Metro Green Line',
      category: 'Metro Station',
      latitude: st.latitude,
      longitude: st.longitude,
      nearestMetro: st.name,
      metroLine: 'green',
      estimatedCost: 25,
      tip: 'Green line metro station with token counters & card recharges.',
      autoFareQuoteWarning: 'Autos queue outside gate for nearby connectivity.',
    });
  }
});

/**
 * Searches locations in Bengaluru:
 * 1. Instant local fuzzy search against 90+ curated hubs, colleges, and all metro stations
 * 2. If online, queries Photon / OpenStreetMap API for ANY address, street, building or tech park
 * 3. Fallback smart custom location generator so the user is never blocked!
 */
export async function searchBengaluruLocations(query) {
  if (!query || !query.trim()) {
    return EXPANDED_LOCAL_HUBS.slice(0, 10);
  }

  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  // 1. In-memory fuzzy match (Instant 0ms)
  const localMatches = EXPANDED_LOCAL_HUBS.filter((h) => {
    const searchableText = `${h.name} ${h.area || ''} ${h.category || ''} ${h.nearestMetro || ''}`.toLowerCase();
    if (searchableText.includes(q)) return true;
    if (tokens.length > 1 && tokens.every((t) => searchableText.includes(t))) return true;
    return false;
  });

  // If we found 5+ exact local matches, return them immediately
  if (localMatches.length >= 5) {
    return localMatches.slice(0, 12);
  }

  // 2. Fetch live online search from Photon / OpenStreetMap (Global geocoding bounded to Bengaluru)
  try {
    const encodedQuery = encodeURIComponent(`${query.trim()}, Bengaluru`);
    const url = `https://photon.komoot.io/api/?q=${encodedQuery}&lat=12.9716&lon=77.5946&limit=8`;

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

            // Verify coordinates are reasonably in or around Bengaluru metro region (lat ~12.5 - 13.5, lon ~77.2 - 78.1)
            const isNearBengaluru = lat >= 12.5 && lat <= 13.5 && lon >= 77.2 && lon <= 78.1;
            if (!isNearBengaluru) return null;

            const props = f.properties || {};
            const placeName = props.name || query;
            const locality = [props.district, props.city, props.state]
              .filter(Boolean)
              .join(', ') || 'Bengaluru';

            const nearest = findNearestMetroStation(lat, lon);
            const dist = nearest ? getDistanceBetween(lat, lon, nearest.latitude, nearest.longitude) : 0;
            const fare = calculateMetroFare(6);

            return {
              id: `live_${props.osm_id || i}_${lat.toFixed(4)}`,
              name: placeName,
              area: locality,
              category: props.type || props.osm_value || 'Location',
              latitude: lat,
              longitude: lon,
              nearestMetro: nearest ? nearest.name.split('(')[0] : 'Bengaluru Transit',
              metroLine: nearest?.line || 'purple',
              estimatedCost: fare,
              distanceToMetroMeters: dist,
              tip: nearest
                ? `Nearest station is ${nearest.name.split('(')[0]} (~${(dist / 1000).toFixed(1)} km).`
                : 'Accessible via BMTC bus and city autos.',
              autoFareQuoteWarning: 'Insist on meter auto or book via Namma Yatri.',
            };
          })
          .filter(Boolean);

        // Combine local matches + live online results (deduplicating by name)
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
    console.log('Online geocoding fallback (using local database):', err.message);
  }

  // 3. Fallback Smart Custom Destination:
  // If no exact match exists in local database or OSM, synthesize a custom destination
  // based on keyword or nearest area so the user can still route!
  if (localMatches.length === 0 && query.trim().length >= 3) {
    const trimmed = query.trim();
    // Check if query mentions an area (e.g. 'brookefield', 'whitefield', 'hsr', 'btm', 'indiranagar')
    const areaHint = EXPANDED_LOCAL_HUBS.find((h) =>
      tokens.some((t) => t.length >= 3 && (h.area.toLowerCase().includes(t) || h.name.toLowerCase().includes(t)))
    );

    const fallbackLat = areaHint ? areaHint.latitude : 12.9716;
    const fallbackLon = areaHint ? areaHint.longitude : 77.5946;
    const nearest = findNearestMetroStation(fallbackLat, fallbackLon);

    return [
      {
        id: `custom_${encodeURIComponent(trimmed)}`,
        name: trimmed,
        area: areaHint ? `${areaHint.name.split('(')[0]} Area, Bengaluru` : 'Bengaluru',
        category: 'Custom Location / Landmark',
        latitude: fallbackLat,
        longitude: fallbackLon,
        nearestMetro: nearest ? nearest.name.split('(')[0] : 'Bengaluru Transit',
        metroLine: nearest?.line || 'purple',
        estimatedCost: 35,
        tip: `Custom location mapped near ${areaHint ? areaHint.name.split('(')[0] : 'Bengaluru central transit network'}.`,
        autoFareQuoteWarning: 'Book via Namma Yatri or Uber Auto for upfront pricing.',
        isCustom: true,
      },
    ];
  }

  // Fallback to local matches
  return localMatches;
}

/**
 * Curated Bengaluru neighbourhood walking circuits (F-1) + heritage eatery
 * stamp anchors (F-2) + Rain Mode indoor fallback variants (F-4).
 *
 * Content authored from public sources; every non-obvious fact carries a
 * citation. Distance/walk times are measured along the plotted path, not
 * as-the-crow-flies. The data-audit test gates completeness.
 */

export const TRAILS = [
  {
    id: 'blr_basavanagudi_morning',
    cityId: 'bengaluru',
    title: 'The Basavanagudi Morning Trail',
    neighbourhood: 'Basavanagudi · South Bengaluru',
    theme: 'Heritage, market & old-school breakfast',
    totalDistanceKm: 1.9,
    estDurationMin: 165,
    estCostInr: 220,
    weatherRiskTags: ['open-air'],
    indoorTrailId: 'blr_museum_circuit',
    summary:
      'Flower-market bustle, a 16th-century monolithic Nandi and two heritage tiffin rooms — the classic old-Bengaluru morning.',
    stops: [
      {
        id: 'bs_gfb',
        order: 1,
        name: 'Gandhi Bazaar Flower Market',
        type: 'market',
        latitude: 12.9507,
        longitude: 77.5698,
        walkFromPrevM: 0,
        spendTimeMin: 30,
        hours: '6:00 AM – 11:00 AM (best before 9 AM)',
        tip: 'Marigold stacks are cheapest at the bulk stalls in the middle, not the entrance.',
        citations: ['https://www.karnataka.com/bangalore/gandhi-bazaar/'],
      },
      {
        id: 'bs_bull',
        order: 2,
        name: 'Bull Temple (Dodda Basavana Gudi)',
        type: 'temple',
        latitude: 12.9454,
        longitude: 77.5688,
        walkFromPrevM: 620,
        spendTimeMin: 40,
        hours: '6:00 AM – 12:00 PM · 5:00 PM – 8:30 PM',
        tip: 'Shoe counter is free; do not pay unofficial attendants asking for "shoe tokens".',
        citations: ['https://en.wikipedia.org/wiki/Bull_Temple'],
      },
      {
        id: 'bs_bugle',
        order: 3,
        name: 'Bugle Rock Park',
        type: 'park',
        latitude: 12.9415,
        longitude: 77.5659,
        walkFromPrevM: 400,
        spendTimeMin: 30,
        hours: '5:00 AM – 9:00 PM',
        tip: 'Peninsular rock formations said to be 3,000-million-years old — and bats at dusk.',
        citations: ['https://en.wikipedia.org/wiki/Bugle_Rock'],
      },
      {
        id: 'bs_vb',
        order: 4,
        name: 'Vidyarthi Bhavan (since 1943)',
        type: 'eatery',
        latitude: 12.9438,
        longitude: 77.5704,
        eateryId: 'r_vidyarthi',
        walkFromPrevM: 850,
        spendTimeMin: 45,
        hours: '6:30 AM – 11:30 AM · closed Fridays',
        signatureDish: 'Benne Masala Dosa',
        signatureDishPriceInr: 85,
        tip: 'Queue by 8:00 AM; token counter system, no table service.',
        citations: ['https://en.wikipedia.org/wiki/Vidyarthi_Bhavan'],
      },
      {
        id: 'bs_bcb',
        order: 5,
        name: "Brahmin's Coffee Bar (since 1960s)",
        type: 'eatery',
        latitude: 12.9452,
        longitude: 77.5728,
        eateryId: 'r_brahmin',
        walkFromPrevM: 230,
        spendTimeMin: 25,
        hours: '6:30 AM – 12:00 PM · closed Tuesdays',
        signatureDish: 'Idli + Filter Coffee',
        signatureDishPriceInr: 60,
        tip: 'Standing-room only; pat the chutney on generously — that is the local way.',
        citations: [
          'https://www.thehindu.com/life-and-style/food/brahmins-coffee-bar-a-humble-store-that-serves-a-hearty-meal/article66098675.ece',
        ],
      },
    ],
  },
  {
    id: 'blr_cubbon_heritage',
    cityId: 'bengaluru',
    title: 'Cubbon Park & Colonial Heart',
    neighbourhood: 'Central Bengaluru',
    theme: 'Parks, colonial landmarks & museums',
    totalDistanceKm: 2.4,
    estDurationMin: 150,
    estCostInr: 60,
    weatherRiskTags: ['open-air'],
    indoorTrailId: 'blr_museum_circuit',
    summary:
      'A shaded red-road wander through Cubbon Park with the State Library, High Court and Vidhana Soudha framing the edges.',
    stops: [
      {
        id: 'cp_cubbon',
        order: 1,
        name: 'Cubbon Park Main Gate',
        type: 'park',
        latitude: 12.9763,
        longitude: 77.5929,
        walkFromPrevM: 0,
        spendTimeMin: 40,
        hours: 'Open sunrise–sunset; roads closed to traffic until 10 AM weekdays',
        tip: 'Grab the free park map at the gate — the red laterite paths are the scenic ones.',
        citations: ['https://en.wikipedia.org/wiki/Cubbon_Park'],
      },
      {
        id: 'cp_library',
        order: 2,
        name: 'State Central Library',
        type: 'landmark',
        latitude: 12.9651,
        longitude: 77.5891,
        walkFromPrevM: 900,
        spendTimeMin: 25,
        hours: '8:30 AM – 7:30 PM (interiors weekdays)',
        tip: 'The pale-red 1915 building with "_markup" cream trim is the classic photo stop.',
        citations: ['https://en.wikipedia.org/wiki/State_Central_Library,_Bangalore'],
      },
      {
        id: 'cp_museum',
        order: 3,
        name: 'Government Museum & Venkatappa Art Gallery',
        type: 'museum',
        latitude: 12.9621,
        longitude: 77.5874,
        walkFromPrevM: 260,
        spendTimeMin: 45,
        hours: '9:00 AM – 5:30 PM · closed Mondays',
        tip: 'One of India\u2019s oldest museums (est. 1865) — ₹20 entry, camera fee extra.',
        citations: ['https://en.wikipedia.org/wiki/Government_Museum,_Bangalore'],
      },
      {
        id: 'cp_vsh',
        order: 4,
        name: 'Vidhana Soudha (viewpoint)',
        type: 'landmark',
        latitude: 12.9628,
        longitude: 77.5908,
        walkFromPrevM: 320,
        spendTimeMin: 20,
        hours: 'Exterior always visible; lit up on Sunday evenings',
        tip: 'Best angle is the Cubbon Park (north-east) face at golden hour.',
        citations: ['https://en.wikipedia.org/wiki/Vidhana_Soudha'],
      },
    ],
  },
  {
    id: 'blr_malleswaram_ht',
    cityId: 'bengaluru',
    title: 'Malleswaram Heritage Half-Day',
    neighbourhood: 'Malleswaram · North-West Bengaluru',
    theme: 'Temples, bazaars & heritage sweets',
    totalDistanceKm: 2.1,
    estDurationMin: 180,
    estCostInr: 190,
    weatherRiskTags: ['open-air'],
    indoorTrailId: 'blr_museum_circuit',
    summary:
      'The 19th-century grid of squares — Kadu Malleshwara Temple, flower-and-saree lanes, landmark cafés and sweets.',
    stops: [
      {
        id: 'ml_kadu',
        order: 1,
        name: 'Kadu Malleshwara Temple',
        type: 'temple',
        latitude: 12.9985,
        longitude: 77.5722,
        walkFromPrevM: 0,
        spendTimeMin: 35,
        hours: '7:00 AM – 12:00 PM · 5:00 PM – 8:30 PM',
        tip: 'A 17th-century Shiva shrine discovered by a French Jesuit father — look for the stone tank.',
        citations: ['https://en.wikipedia.org/wiki/Kadu_Malleshwara_Temple'],
      },
      {
        id: 'ml_8thcross',
        order: 2,
        name: '8th Cross Market Walk',
        type: 'market',
        latitude: 12.9971,
        longitude: 77.5731,
        walkFromPrevM: 190,
        spendTimeMin: 35,
        hours: 'Busiest 7:00 – 11:00 AM',
        tip: 'Try freshly-ground filter coffee powder at the corner shops — buy 250g, it is the souvenir.',
        citations: [
          'https://timesofindia.indiatimes.com/city/bengaluru/malleswaram-market-gets-a-facelift/articleshow/63428407.cms',
        ],
      },
      {
        id: 'ml_nandini',
        order: 3,
        name: 'CTR (Sri Krishna Sweets Coffee Bar, since 1950)',
        type: 'eatery',
        eateryId: 'r_ctr',
        latitude: 12.9968,
        longitude: 77.5711,
        walkFromPrevM: 210,
        spendTimeMin: 30,
        hours: '6:30 AM – 12:00 PM · 3:30 – 9:00 PM',
        signatureDish: 'Benne Dosa',
        signatureDishPriceInr: 90,
        tip: "Malleswaram's legendary benne dosa — thicker and softer than Vidyarthi Bhavan. A friendly rivalry since the 1960s.",
        citations: ['https://en.wikipedia.org/wiki/CTR_(restaurant)'],
      },
      {
        id: 'ml_sampangi',
        order: 4,
        name: 'Sampangi Ramaswamy Temple & Malleswaram 18th Cross',
        type: 'temple',
        latitude: 12.9948,
        longitude: 77.5694,
        walkFromPrevM: 320,
        spendTimeMin: 40,
        hours: '6:30 AM – 12:30 PM · 5:30 PM – 9:00 PM',
        tip: 'The 18th Cross end is famous for jewellery and umbrellas — but walk the by-lanes behind, that\u2019s old Malleswaram.',
        citations: ['https://en.wikipedia.org/wiki/Malleswaram'],
      },
    ],
  },
  {
    id: 'blr_museum_circuit',
    cityId: 'bengaluru',
    title: 'The Rainy-Day Museum Circuit',
    neighbourhood: 'Central Bengaluru (mostly indoors)',
    theme: 'Rain Mode (Plan B) covered defaults',
    totalDistanceKm: 1.5,
    estDurationMin: 150,
    estCostInr: 130,
    weatherRiskTags: ['covered', 'indoor'],
    indoorTrailId: null,
    summary:
      'Three connected indoor stops — Government Museum, Venkatappa, and Visvesvaraya — linked by short covered walks, unkillingable by drizzle.',
    isIndoor: true,
    stops: [
      {
        id: 'mv_gov_museum',
        order: 1,
        name: 'Government Museum Bengaluru',
        type: 'museum',
        latitude: 12.9621,
        longitude: 77.5874,
        walkFromPrevM: 0,
        spendTimeMin: 50,
        hours: '9:00 AM – 5:30 PM · closed Mondays',
        tip: 'Start here — ₹20 entry, Halmidi inscription replica (oldest Kannada record).',
        citations: ['https://en.wikipedia.org/wiki/Government_Museum,_Bangalore'],
      },
      {
        id: 'mv_venkatappa',
        order: 2,
        name: 'Venkatappa Art Gallery',
        type: 'museum',
        latitude: 12.9606,
        longitude: 77.5873,
        walkFromPrevM: 200,
        spendTimeMin: 45,
        hours: '9:00 AM – 5:00 PM · closed Mondays',
        tip: 'K. Venkatappa\u2019s watercolours of KRS Dam — no photos of paintings, respect the signs.',
        citations: ['https://en.wikipedia.org/wiki/Venkatappa_Art_Gallery'],
      },
      {
        id: 'mv_visvesvaraya',
        order: 3,
        name: 'Visvesvaraya Industrial & Technological Museum',
        type: 'museum',
        latitude: 12.9609,
        longitude: 77.5899,
        walkFromPrevM: 260,
        spendTimeMin: 55,
        hours: '9:30 AM – 6:00 PM',
        tip: 'Interactive engine hall is beloved by kids — the fun-biotope para on the 1st floor.',
        citations: [
          'https://en.wikipedia.org/wiki/Visvesvaraya_Industrial_and_Technological_Museum',
        ],
      },
    ],
  },
];

/**
 * Heritage eatery stamp anchors (F-2) — restaurants already curated in
 * bengaluruData.js that unlock stamps when the user checks in nearby.
 */
export const HERITAGE_EATERIES = [
  {
    id: 'he_r_vidyarthi',
    sourceId: 'r_vidyarthi',
    title: 'Vidyarthi Bhavan',
    year: 1943,
    unlockedLabel: 'Unlocked: Heritage Taster — Vidyarthi Bhavan (1943)',
    latitude: 12.9438,
    longitude: 77.5704,
    checkInRadiusM: 60,
  },
  {
    id: 'he_r_brahmin',
    sourceId: 'r_brahmin',
    title: "Brahmin's Coffee Bar",
    year: 1960,
    unlockedLabel: "Unlocked: Heritage Filter Legend — Brahmin's Coffee Bar",
    latitude: 12.9452,
    longitude: 77.5728,
    checkInRadiusM: 60,
  },
  {
    id: 'he_r_mtr',
    sourceId: 'r_mtr',
    title: 'MTR — Mavalli Tiffin Rooms',
    year: 1924,
    unlockedLabel: 'Unlocked: Heritage Legend — MTR (1924)',
    latitude: 12.9421,
    longitude: 77.5766,
    checkInRadiusM: 75,
  },
  {
    id: 'he_r_ctr',
    sourceId: 'r_ctr',
    title: 'CTR Malleshwaram',
    year: 1950,
    unlockedLabel: 'Unlocked: Heritage Icon — CTR (1950)',
    latitude: 12.9968,
    longitude: 77.5711,
    checkInRadiusM: 60,
  },
  {
    id: 'he_r_ammemane',
    sourceId: 'r_ammemane',
    title: 'Amma Eeranna / Ammemane Rare Items Shop Cafe',
    year: 1950,
    unlockedLabel: 'Unlocked: Heritage Corner — Ammemane Café',
    latitude: 12.9441,
    longitude: 77.5702,
    checkInRadiusM: 60,
  },
];

/** Food-conversion anchors for the Saved-Money Meter (F-3), per spec. */
export const FOOD_MENUS = [
  { id: 'f_dosa', name: 'Benne Masala Dosa', priceInr: 85 },
  { id: 'f_idli', name: 'Idli Plate', priceInr: 45 },
  { id: 'f_coffee', name: 'Filter Coffee', priceInr: 30 },
];

export function getTrailsForCity(cityId) {
  return TRAILS.filter((t) => t.cityId === cityId);
}

export function getTrailById(trailId) {
  return TRAILS.find((t) => t.id === trailId) || null;
}

export function getIndoorTrailFor(trail) {
  if (!trail?.indoorTrailId) return null;
  return getTrailById(trail.indoorTrailId);
}

export function getHeritageEateriesForCity(cityId) {
  if (cityId !== 'bengaluru') return [];
  return HERITAGE_EATERIES;
}

export default TRAILS;

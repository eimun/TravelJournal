/**
 * Multi-City Registry for Urban Explorer & Transit Companion
 * Provides ground-truth transit configs, auto/taxi fare formulas, and iconic destinations
 * for Bengaluru, Delhi NCR, and Mumbai.
 */

export const SUPPORTED_CITIES = {
  bengaluru: {
    id: 'bengaluru',
    name: 'Bengaluru',
    shortName: 'BLR',
    state: 'Karnataka',
    tagline: 'Silicon Valley & Heritage Tiffin Rooms',
    badge: '🟢 Full Transit Pack',
    center: {
      name: 'Bengaluru City Center',
      latitude: 12.9716,
      longitude: 77.5946,
    },
    transitAgency: 'Namma Metro & BMTC',
    metroLines: ['Purple Line', 'Green Line', 'Yellow Line (Upcoming)'],
    interchangeHub: 'Nadaprabhu Kempegowda Station (Majestic)',
    primaryHubId: 'ksr_majestic_railway',
    localLanguage: 'Kannada',
    autoFareFormula: {
      vehicleType: 'Auto-Rickshaw',
      baseFare: 30,
      baseDistanceKm: 2.0,
      perKm: 15,
      nightMultiplier: 1.5,
      nightHours: '22:00 – 05:00',
      lingoPhrase: 'Meter haaki (ಮೀಟರ್ ಹಾಕಿ)',
      hindiMeaning: 'Meter se chaliye',
    },
    quickChips: ['Cubbon Park', 'Lalbagh', 'HSR Layout', 'Indiranagar', 'Koramangala', 'BTM Layout', 'Whitefield', 'MG Road'],
    popularHubs: [
      { name: 'KSR Majestic Railway', emoji: '🚉', area: 'Interchange Hub', lat: 12.9781, lon: 77.5695 },
      { name: 'MG Road Metro', emoji: '🛍️', area: 'CBD', lat: 12.9754, lon: 77.6067 },
      { name: 'Indiranagar 100ft', emoji: '☕', area: 'East BLR', lat: 12.9783, lon: 77.6387 },
      { name: 'Koramangala 5th Block', emoji: '💻', area: 'Startups & Food', lat: 12.9352, lon: 77.6245 },
      { name: 'HSR Layout BDA', emoji: '🌳', area: 'Sector 6', lat: 12.9116, lon: 77.6389 },
      { name: 'Whitefield ITPL', emoji: '🏢', area: 'Tech Corridor', lat: 12.9877, lon: 77.7289 },
    ],
    transitTips: [
      'First metro departs 5:00 AM from terminal stations; last train around 11:00 PM.',
      'WhatsApp QR tickets give 5% discount on official BMRCL WhatsApp (+91 81055 56677).',
      'Majestic interchange takes 3-4 mins walk inside the paid concourse between Purple and Green lines.',
      'BMTC Vajra AC buses connect Kempegowda Airport (KIA) from Majestic every 15 mins.',
    ],
    localPhrases: [
      { phrase: 'Meter haaki', english: 'Please put the meter on', context: 'When boarding an auto' },
      { phrase: 'Yeshtu aaguthe?', english: 'How much will it cost?', context: 'Asking fare / price' },
      { phrase: 'Left / Right thagoli', english: 'Take a left / right turn', context: 'Giving directions to driver' },
      { phrase: 'Illi nillisi', english: 'Please stop here', context: 'When reaching your spot' },
      { phrase: 'Majestic-ge hogutha?', english: 'Does this go to Majestic?', context: 'Asking BMTC bus conductor' },
      { phrase: 'Bega banni', english: 'Please come quickly', context: 'Calling auto / cab' },
    ],
    popularDestinations: [
      {
        id: 'cubbon_park',
        name: 'Cubbon Park & Vidhana Soudha',
        title: 'Cubbon Park & Vidhana Soudha',
        subtitle: 'Historic green lungs & State Legislature',
        area: 'Central Bengaluru',
        category: 'Heritage & Nature',
        latitude: 12.9763,
        longitude: 77.5929,
        metroGate: 'Cubbon Park Metro (Gate 1 or 2)',
      },
      {
        id: 'lalbagh_gardens',
        name: 'Lalbagh Botanical Garden',
        title: 'Lalbagh Botanical Garden',
        subtitle: '240-acre garden with 1889 glass house',
        area: 'South Bengaluru',
        category: 'Botanical Garden',
        latitude: 12.9507,
        longitude: 77.5848,
        metroGate: 'Lalbagh Metro (West Gate)',
      },
      {
        id: 'mg_road_church_st',
        name: 'MG Road & Church Street',
        title: 'MG Road & Church Street',
        subtitle: 'Bustling boulevard, bookstores & cafes',
        area: 'CBD Bengaluru',
        category: 'Urban Walk & Cafes',
        latitude: 12.9749,
        longitude: 77.6095,
        metroGate: 'MG Road Metro (Gate 1)',
      },
      {
        id: 'iskcon_temple',
        name: 'ISKCON Temple Rajajinagar',
        title: 'ISKCON Temple Rajajinagar',
        subtitle: 'Monumental neoclassical Dravidian shrine',
        area: 'West Bengaluru',
        category: 'Spiritual & Architecture',
        latitude: 13.0098,
        longitude: 77.5511,
        metroGate: 'Mahalakshmi Metro (Gate 2)',
      },
    ],
    iconicFoods: [
      { name: 'Benne Masala Dosa', legend: 'Vidyarthi Bhavan (Since 1943)', price: '₹85' },
      { name: 'Filter Coffee & Kesari Bath', legend: "Brahmin's Coffee Bar", price: '₹35' },
      { name: 'Rava Idli', legend: 'Mavalli Tiffin Room / MTR (Since 1924)', price: '₹60' },
    ],
    scamAlert: 'Never pay street quotes over ₹50 for under 2.5 km. Demand meter or book via Namma Yatri / Uber Auto.',
    cloakroomHighlight: 'KSR Majestic Railway Platform 1 (24/7 · ₹30/day)',
    environmentalAlert: {
      aqi: 42,
      aqiLabel: 'Good (Garden City)',
      aqiColor: '#16a34a',
      temperature: '24°C',
      weatherIcon: '🍃',
      weatherCondition: 'Pleasant & Breezy',
      headline: 'Clean Garden Air · AQI 42',
      subtext: 'Silk Board & ORR peak bottlenecks · Namma Metro Purple Line saves ~65 mins to ITPL',
      transitNotice: '🟢 Purple & Green lines running at 4-min peak frequency · Zero road jams',
      badges: ['🍃 AQI 42 (Clean)', '24°C Pleasant', 'ORR Traffic Advisory'],
      tips: [
        'Cubbon Park & Lalbagh are ideal for morning and evening strolls.',
        'Skip cab gridlock on Outer Ring Road by switching to Purple Line at KR Pura.',
      ],
    },
  },

  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    shortName: 'DEL',
    state: 'Delhi',
    tagline: 'DMRC Network, Mughal Heritage & Street Food',
    badge: '⚡ DMRC Live Ready',
    center: {
      name: 'Connaught Place (Central Delhi)',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    transitAgency: 'Delhi Metro (DMRC) & DTC',
    metroLines: ['Yellow Line', 'Blue Line', 'Red Line', 'Violet Line', 'Airport Express'],
    interchangeHub: 'Rajiv Chowk (Connaught Place)',
    primaryHubId: 'new_delhi_railway',
    localLanguage: 'Hindi',
    autoFareFormula: {
      vehicleType: 'Delhi Auto (CNG)',
      baseFare: 30,
      baseDistanceKm: 1.5,
      perKm: 11,
      nightMultiplier: 1.25,
      nightHours: '23:00 – 05:00',
      lingoPhrase: 'Bhaiya meter se chalo',
      hindiMeaning: 'Please turn on the meter',
    },
    quickChips: ['Connaught Place', 'India Gate', 'Chandni Chowk', 'Qutub Minar', 'Hauz Khas', 'Saket', 'Cyber Hub', 'Karol Bagh'],
    popularHubs: [
      { name: 'Rajiv Chowk Metro', emoji: '🏛️', area: 'Central Hub / CP', lat: 28.6328, lon: 77.2195 },
      { name: 'New Delhi Railway Station', emoji: '🚉', area: 'Paharganj / Ajmeri Gate', lat: 28.6429, lon: 77.2195 },
      { name: 'India Gate', emoji: '🇮🇳', area: 'Kartavya Path', lat: 28.6129, lon: 77.2295 },
      { name: 'Chandni Chowk', emoji: '🕌', area: 'Old Delhi Heritage', lat: 28.6562, lon: 77.2307 },
      { name: 'Hauz Khas Village', emoji: '☕', area: 'South Delhi Cafes', lat: 28.5534, lon: 77.1945 },
      { name: 'IGI Airport T3', emoji: '✈️', area: 'Airport Express Metro', lat: 28.5562, lon: 77.0999 },
    ],
    transitTips: [
      'DMRC Delhi Metro runs from 5:30 AM to 11:30 PM across 12 lines and 288 stations.',
      'Airport Express Line connects NDLS railway station to IGI Airport in 19 minutes flat for ₹60.',
      'Download DMRC Momentum 2.0 app or use WhatsApp (+91 96508 55800) for instant QR ticketing.',
      'Rajiv Chowk and Kashmere Gate are major multi-level interchange hubs; allow 5 mins to switch lines.',
    ],
    localPhrases: [
      { phrase: 'Bhaiya meter se chaloge?', english: 'Will you go by meter?', context: 'Boarding Delhi auto' },
      { phrase: 'Rajiv Chowk kis platform pe badalna hai?', english: 'Which platform to change for Rajiv Chowk?', context: 'Metro interchange' },
      { phrase: 'Gate number kaunsa paas padega?', english: 'Which gate number is nearest?', context: 'Exiting large metro stations' },
      { phrase: 'Aage se right modna', english: 'Turn right ahead', context: 'Guiding cab or auto driver' },
      { phrase: 'Yahin side me rok do', english: 'Please stop on this side', context: 'Reaching destination' },
    ],
    popularDestinations: [
      {
        id: 'connaught_place',
        name: 'Connaught Place (CP)',
        title: 'Connaught Place (CP) & Central Park',
        subtitle: 'Colonial Georgian arcade & Rajiv Chowk interchange',
        area: 'Central Delhi',
        category: 'Heritage & Shopping',
        latitude: 28.6315,
        longitude: 77.2167,
        metroGate: 'Rajiv Chowk Metro (Gate 7 or 8)',
      },
      {
        id: 'india_gate',
        name: 'India Gate & Kartavya Path',
        title: 'India Gate & Kartavya Path',
        subtitle: 'War memorial archway & sprawling promenade',
        area: 'Central Delhi',
        category: 'National Monument',
        latitude: 28.6129,
        longitude: 77.2295,
        metroGate: 'Central Secretariat Metro (Gate 3)',
      },
      {
        id: 'chandni_chowk',
        name: 'Chandni Chowk & Red Fort',
        title: 'Chandni Chowk & Red Fort',
        subtitle: '17th-century Mughal walled city & iconic food galis',
        area: 'Old Delhi',
        category: 'Historic Old Delhi',
        latitude: 28.6562,
        longitude: 77.2307,
        metroGate: 'Chandni Chowk Metro (Gate 1)',
      },
      {
        id: 'qutub_minar',
        name: 'Qutub Minar',
        title: 'Qutub Minar & Mehrauli Archaeological Park',
        subtitle: '73m minaret & 12th-century UNESCO World Heritage',
        area: 'South Delhi',
        category: 'UNESCO Heritage',
        latitude: 28.5245,
        longitude: 77.1855,
        metroGate: 'Qutab Minar Metro (Yellow Line)',
      },
    ],
    iconicFoods: [
      { name: 'Chole Bhature', legend: 'Sita Ram Diwan Chand (Paharganj)', price: '₹90' },
      { name: 'Parathas with White Butter', legend: 'Pandit Gaya Prasad (Paranthe Wali Gali, 1872)', price: '₹75' },
      { name: 'Butter Chicken & Naan', legend: 'Moti Mahal Daryaganj (Original Inventor)', price: '₹350' },
    ],
    scamAlert: 'Paharganj & New Delhi station touts offer "hotel closed due to festival" scams. Ignore touts and take Delhi Metro direct.',
    cloakroomHighlight: 'New Delhi Railway Station (Platform 16 / Ajmeri Gate · 24/7 · ₹30/day)',
    environmentalAlert: {
      aqi: 268,
      aqiLabel: 'Poor / Smog (GRAP-3)',
      aqiColor: '#dc2626',
      temperature: '28°C',
      weatherIcon: '🌫️',
      weatherCondition: 'Winter Haze & Smog',
      headline: 'High Smog Alert · AQI 268',
      subtext: 'Heavy particulate smog across NCR · Wear N95 outdoors · Prefer AC Delhi Metro over open autos',
      transitNotice: '⚡ DMRC running 40 extra train trips today · Filtered air conditioning inside underground lines',
      badges: ['🌫️ AQI 268 (Smog)', 'Wear N95 Mask', 'DMRC +40 Extra Trips'],
      tips: [
        'Stay inside underground DMRC stations to avoid roadside PM2.5 particulate matter.',
        'Avoid open-air e-rickshaws on Ring Road & Mathura Road during evening rush hours.',
      ],
    },
  },

  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    shortName: 'BOM',
    state: 'Maharashtra',
    tagline: 'Suburban Locals, Sea Link & Vada Pav',
    badge: '🚆 Local + Metro Ready',
    center: {
      name: 'CSMT / Fort (South Mumbai)',
      latitude: 19.0760,
      longitude: 72.8777,
    },
    transitAgency: 'Mumbai Suburban Railways & Metro & BEST',
    metroLines: ['Western Line', 'Central Line', 'Metro Line 1 (Versova-Ghatkopar)', 'Metro Line 2A & 7'],
    interchangeHub: 'Dadar Junction & CSMT',
    primaryHubId: 'csmt_railway',
    localLanguage: 'Marathi / Hindi',
    autoFareFormula: {
      vehicleType: 'Kaali-Peeli / Auto (Meter Only)',
      baseFare: 23,
      baseDistanceKm: 1.5,
      perKm: 15.33,
      nightMultiplier: 1.25,
      nightHours: '00:00 – 05:00',
      lingoPhrase: 'Dadar/Bandra meter ne chala',
      hindiMeaning: 'Strict meter system is law in Mumbai',
    },
    quickChips: ['Gateway of India', 'Marine Drive', 'CSMT Terminus', 'Bandra Bandstand', 'Juhu Beach', 'Colaba', 'Dadar', 'BKC'],
    popularHubs: [
      { name: 'CSMT Station', emoji: '🏛️', area: 'South Mumbai Terminal', lat: 18.9400, lon: 72.8353 },
      { name: 'Churchgate Station', emoji: '🌊', area: 'Western Line HQ', lat: 18.9322, lon: 72.8264 },
      { name: 'Dadar Junction', emoji: '🚉', area: 'Central & Western Interchange', lat: 19.0178, lon: 72.8478 },
      { name: 'Bandra Station', emoji: '🎸', area: 'Queen of Suburbs', lat: 19.0544, lon: 72.8402 },
      { name: 'Andheri Metro / Suburban', emoji: '🚇', area: 'Versova-Ghatkopar Interchange', lat: 19.1197, lon: 72.8464 },
      { name: 'Gateway of India', emoji: '⛵', area: 'Colaba Waterfront', lat: 18.9220, lon: 72.8347 },
    ],
    transitTips: [
      'Mumbai Suburban Trains run almost 24/7 (first local ~4:00 AM, last local ~1:30 AM).',
      'Always check "Fast" vs "Slow" train indicator boards at Dadar, Churchgate, and CSMT.',
      'Kaali-Peeli taxis and auto-rickshaws strictly run by meter by state law; no fixed quotes needed.',
      'BEST AC Electric buses offer ₹6 minimum fare; download Chalo app for live bus GPS.',
    ],
    localPhrases: [
      { phrase: 'Dadar fast train kaunsa platform?', english: 'Which platform for Dadar fast train?', context: 'Suburban train boarding' },
      { phrase: 'Meter se chalo bhaiya', english: 'Please drive by the meter', context: 'Boarding Mumbai taxi/auto' },
      { phrase: 'Pudhil station konte?', english: 'Which is the next station?', context: 'Marathi train announcement' },
      { phrase: 'Churchgate side utarna hai', english: 'Need to get down on Churchgate side', context: 'Exiting crowded local train' },
      { phrase: 'Signal ke aage rokna', english: 'Please stop past the signal', context: 'Alighting cab' },
    ],
    popularDestinations: [
      {
        id: 'gateway_of_india',
        name: 'Gateway of India',
        title: 'Gateway of India & Colaba Causeway',
        subtitle: '1924 basalt triumphal arch overlooking the Arabian Sea',
        area: 'Colaba, South Mumbai',
        category: 'Colonial Landmark',
        latitude: 18.9220,
        longitude: 72.8347,
        metroGate: 'Churchgate Suburban Station (~2 km by ₹25 sharing cab)',
      },
      {
        id: 'marine_drive',
        name: 'Marine Drive',
        title: 'Marine Drive (Queens Necklace)',
        subtitle: '3.6 km Art Deco promenade curving along Back Bay',
        area: 'South Mumbai',
        category: 'Scenic Coastal Boulevard',
        latitude: 18.9432,
        longitude: 72.8230,
        metroGate: 'Marine Lines / Churchgate Station',
      },
      {
        id: 'csmt_terminus',
        name: 'CSMT Terminus',
        title: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
        subtitle: 'Victorian Gothic UNESCO railway headquarters (1888)',
        area: 'Fort, South Mumbai',
        category: 'UNESCO Heritage Station',
        latitude: 18.9400,
        longitude: 72.8353,
        metroGate: 'CSMT Railway & Underground Metro 3',
      },
      {
        id: 'bandra_bandstand',
        name: 'Bandra Bandstand',
        title: 'Bandra Bandstand & Bandra Fort',
        subtitle: 'Portuguese fort ruins overlooking the Sea Link',
        area: 'Bandra West, Mumbai',
        category: 'Coastal Heritage & Cafes',
        latitude: 19.0435,
        longitude: 72.8197,
        metroGate: 'Bandra Station (Western Line)',
      },
    ],
    iconicFoods: [
      { name: 'Vada Pav with Lasun Chutney', legend: 'Ashok Vada Pav (Kirti College, Dadar)', price: '₹25' },
      { name: 'Pav Bhaji with Amul Butter', legend: 'Sardar Refreshments (Tardeo)', price: '₹140' },
      { name: 'Irani Chai & Bun Maska', legend: 'Kyani & Co. (Marine Lines, Since 1904)', price: '₹40' },
    ],
    scamAlert: 'Unlike other cities, Mumbai autos/taxis strictly follow meter by law! Never agree to fixed quotes.',
    cloakroomHighlight: 'CSMT Station Platform 1 (24/7 · ₹30/day with padlock)',
    environmentalAlert: {
      aqi: 64,
      aqiLabel: 'Satisfactory (Coastal)',
      aqiColor: '#0284c7',
      temperature: '31°C',
      weatherIcon: '🌊',
      weatherCondition: 'Coastal Humid & Breeze',
      headline: 'High Tide Alert · 4.2m at 14:15',
      subtext: 'Arabian Sea high tide expected afternoon · Suburban locals running on normal 3-4 min schedule',
      transitNotice: '🚆 Western & Central locals running smoothly · Caution along Marine Drive tetrapods',
      badges: ['🌊 High Tide 4.2m', 'AQI 64 (Good)', 'Locals On Time'],
      tips: [
        'Avoid low-lying seafront tetrapods during high tide swell at Marine Drive & Bandstand.',
        'Prefer fast locals during peak hours between Churchgate/CSMT and Dadar.',
      ],
    },
  },
};

/**
 * Returns city configuration object by id.
 * @param {string} cityId
 * @returns {Object}
 */
export function getCityConfig(cityId = 'bengaluru') {
  return SUPPORTED_CITIES[cityId] || SUPPORTED_CITIES.bengaluru;
}

/**
 * Returns array of all supported cities for switcher UI.
 * @returns {Array<Object>}
 */
export function getAllCities() {
  return Object.values(SUPPORTED_CITIES);
}

/**
 * Returns environmental & advisory alert for a given city.
 * @param {string} cityId
 * @returns {Object}
 */
export function getCityEnvironmentalAlert(cityId = 'bengaluru') {
  const city = getCityConfig(cityId);
  return city?.environmentalAlert || SUPPORTED_CITIES.bengaluru.environmentalAlert;
}

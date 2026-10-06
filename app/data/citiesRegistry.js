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
    popularDestinations: [
      {
        id: 'cubbon_park',
        title: 'Cubbon Park & Vidhana Soudha',
        subtitle: 'Historic green lungs & State Legislature',
        category: 'Heritage & Nature',
        latitude: 12.9763,
        longitude: 77.5929,
        metroGate: 'Cubbon Park Metro (Gate 1 or 2)',
      },
      {
        id: 'lalbagh_gardens',
        title: 'Lalbagh Botanical Garden',
        subtitle: '240-acre garden with 1889 glass house',
        category: 'Botanical Garden',
        latitude: 12.9507,
        longitude: 77.5848,
        metroGate: 'Lalbagh Metro (West Gate)',
      },
      {
        id: 'mg_road_church_st',
        title: 'MG Road & Church Street',
        subtitle: 'Bustling boulevard, bookstores & cafes',
        category: 'Urban Walk & Cafes',
        latitude: 12.9749,
        longitude: 77.6095,
        metroGate: 'MG Road Metro (Gate 1)',
      },
      {
        id: 'iskcon_temple',
        title: 'ISKCON Temple Rajajinagar',
        subtitle: 'Monumental neoclassical Dravidian shrine',
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
  },

  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    shortName: 'DEL',
    state: 'Delhi',
    tagline: 'DMRC Network, Mughal Heritage & Street Food',
    badge: '⚡ DMRC Live Ready',
    center: {
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
    popularDestinations: [
      {
        id: 'connaught_place',
        title: 'Connaught Place (CP) & Central Park',
        subtitle: 'Colonial Georgian arcade & Rajiv Chowk interchange',
        category: 'Heritage & Shopping',
        latitude: 28.6315,
        longitude: 77.2167,
        metroGate: 'Rajiv Chowk Metro (Gate 7 or 8)',
      },
      {
        id: 'india_gate',
        title: 'India Gate & Kartavya Path',
        subtitle: 'War memorial archway & sprawling promenade',
        category: 'National Monument',
        latitude: 28.6129,
        longitude: 77.2295,
        metroGate: 'Central Secretariat Metro (Gate 3)',
      },
      {
        id: 'chandni_chowk',
        title: 'Chandni Chowk & Red Fort',
        subtitle: '17th-century Mughal walled city & iconic food galis',
        category: 'Historic Old Delhi',
        latitude: 28.6562,
        longitude: 77.2307,
        metroGate: 'Chandni Chowk Metro (Gate 1)',
      },
      {
        id: 'qutub_minar',
        title: 'Qutub Minar & Mehrauli Archaeological Park',
        subtitle: '73m minaret & 12th-century UNESCO World Heritage',
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
  },

  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    shortName: 'BOM',
    state: 'Maharashtra',
    tagline: 'Suburban Locals, Sea Link & Vada Pav',
    badge: '🚆 Local + Metro Ready',
    center: {
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
    popularDestinations: [
      {
        id: 'gateway_of_india',
        title: 'Gateway of India & Colaba Causeway',
        subtitle: '1924 basalt triumphal arch overlooking the Arabian Sea',
        category: 'Colonial Landmark',
        latitude: 18.9220,
        longitude: 72.8347,
        metroGate: 'Churchgate Suburban Station (~2 km by ₹25 sharing cab)',
      },
      {
        id: 'marine_drive',
        title: 'Marine Drive (Queens Necklace)',
        subtitle: '3.6 km Art Deco promenade curving along Back Bay',
        category: 'Scenic Coastal Boulevard',
        latitude: 18.9432,
        longitude: 72.8230,
        metroGate: 'Marine Lines / Churchgate Station',
      },
      {
        id: 'csmt_terminus',
        title: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
        subtitle: 'Victorian Gothic UNESCO railway headquarters (1888)',
        category: 'UNESCO Heritage Station',
        latitude: 18.9400,
        longitude: 72.8353,
        metroGate: 'CSMT Railway & Underground Metro 3',
      },
      {
        id: 'bandra_bandstand',
        title: 'Bandra Bandstand & Bandra Fort',
        subtitle: 'Portuguese fort ruins overlooking the Sea Link',
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

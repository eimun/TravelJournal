/**
 * BMTC Bus Routes & Real-Time Schedule Engine for Bengaluru
 * Includes Metro Feeders (MF-series), High-Frequency Trunks (500D, 335E, G4),
 * and Airport Vayu Vajra (KIA-series) with realistic frequency and departure calculation.
 */

export const BMTC_ROUTES = [
  // ── Metro Feeder Routes (MF-Series) ──
  {
    id: 'MF-18',
    routeNumber: 'MF-18',
    type: 'metro_feeder',
    category: 'Metro Feeder',
    color: '#8b5cf6',
    name: 'Baiyappanahalli Metro ↔ ITPL / Whitefield',
    origin: 'Baiyappanahalli Metro (Purple Line)',
    destination: 'ITPL Main Gate (Whitefield)',
    frequencyMinutes: 6,
    firstBus: '05:30 AM',
    lastBus: '23:15 PM',
    ordinaryFare: 15,
    vajraFare: 35,
    stops: [
      'Baiyappanahalli Metro Gate 2',
      'Tin Factory',
      'KR Puram Railway Station',
      'Mahadevapura',
      'Garudacharpalya',
      'Hoodi Junction',
      'Big Bazaar Whitefield',
      'ITPL Main Gate',
    ],
    highlight: 'Dedicated feeder between Purple Line and Whitefield tech corridor. Runs every 6 mins.',
  },
  {
    id: 'MF-12',
    routeNumber: 'MF-12',
    type: 'metro_feeder',
    category: 'Metro Feeder',
    color: '#10b981',
    name: 'Majestic (KBS) ↔ Yeshwantpur Metro',
    origin: 'Kempegowda Bus Station (Platform 18)',
    destination: 'Yeshwantpur Metro Station',
    frequencyMinutes: 8,
    firstBus: '05:00 AM',
    lastBus: '23:30 PM',
    ordinaryFare: 10,
    vajraFare: 25,
    stops: [
      'Kempegowda Bus Station (Majestic)',
      'Anand Rao Circle',
      'Malleshwaram 8th Cross',
      'Malleshwaram 18th Cross',
      'Yeshwantpur TTMC',
      'Yeshwantpur Metro Gate B',
    ],
    highlight: 'Connects city center to Green Line northern corridor via Malleshwaram heritage markets.',
  },
  {
    id: 'MF-21',
    routeNumber: 'MF-21',
    type: 'metro_feeder',
    category: 'Metro Feeder',
    color: '#8b5cf6',
    name: 'Indiranagar Metro ↔ Koramangala Sony World',
    origin: 'Indiranagar Metro (CMH Road Gate)',
    destination: 'Koramangala 6th Block (Sony World Signal)',
    frequencyMinutes: 10,
    firstBus: '06:00 AM',
    lastBus: '22:45 PM',
    ordinaryFare: 12,
    vajraFare: 30,
    stops: [
      'Indiranagar Metro (100 Ft Rd)',
      'Domlur Flyover Bridge',
      'Doopanahalli',
      'Ejipura Signal',
      'Sony World Koramangala',
    ],
    highlight: 'Seamless link from Purple Line straight to Koramangala dining & startup hub.',
  },
  {
    id: 'MF-375',
    routeNumber: 'MF-375',
    type: 'metro_feeder',
    category: 'Metro Feeder',
    color: '#10b981',
    name: 'Banashankari Metro ↔ Kengeri Satellite Town',
    origin: 'Banashankari Metro / TTMC',
    destination: 'Kengeri Bus Terminal',
    frequencyMinutes: 12,
    firstBus: '05:45 AM',
    lastBus: '22:30 PM',
    ordinaryFare: 15,
    vajraFare: 35,
    stops: [
      'Banashankari Metro Gate A',
      'Padmanabhanagar',
      'Kumaraswamy Layout',
      'Uttarahalli Circle',
      'Channasandra',
      'Kengeri Satellite Town',
    ],
    highlight: 'Cross-link between Green Line southern terminal and Mysore Road Purple Line.',
  },
  {
    id: 'MF-5',
    routeNumber: 'MF-5',
    type: 'metro_feeder',
    category: 'Metro Feeder',
    color: '#8b5cf6',
    name: 'KR Puram Metro ↔ Hope Farm Junction',
    origin: 'KR Puram Metro Station',
    destination: 'Hope Farm Junction (Whitefield)',
    frequencyMinutes: 7,
    firstBus: '05:30 AM',
    lastBus: '23:00 PM',
    ordinaryFare: 15,
    vajraFare: 30,
    stops: [
      'KR Puram Metro',
      'B Narayanapura',
      'Singayyanapalya',
      'Garudacharpalya',
      'Kundalahalli Gate',
      'Hope Farm Junction',
    ],
    highlight: 'High-frequency feeder along Old Madras Road connecting eastern IT hubs.',
  },

  // ── High-Frequency Trunk & Ring Road Routes ──
  {
    id: '500-D',
    routeNumber: '500-D',
    type: 'trunk',
    category: 'Outer Ring Road Trunk',
    color: '#0284c7',
    name: 'Central Silk Board ↔ Hebbal via Marathahalli',
    origin: 'Central Silk Board Junction',
    destination: 'Hebbal TTMC Bus Terminal',
    frequencyMinutes: 4,
    firstBus: '05:00 AM',
    lastBus: '23:45 PM',
    ordinaryFare: 25,
    vajraFare: 55,
    stops: [
      'Central Silk Board',
      'HSR Layout BDA Complex',
      'Agara Junction',
      'Bellandur EcoSpace',
      'Kadubeesanahalli (Prestige Tech Park)',
      'Marathahalli Bridge',
      'Karthik Nagar',
      'Kalyan Nagar',
      'Nagawara (Manyata Tech Park)',
      'Hebbal Flyover',
    ],
    highlight:
      'Bengaluru’s busiest bus corridor down the Outer Ring Road bus lane. Bus every 4 mins.',
  },
  {
    id: '335-E',
    routeNumber: '335-E',
    type: 'trunk',
    category: 'City Trunk',
    color: '#0284c7',
    name: 'Majestic (KBS) ↔ Kadugodi / Whitefield',
    origin: 'Kempegowda Bus Station (Majestic)',
    destination: 'Kadugodi Bus Stand',
    frequencyMinutes: 9,
    firstBus: '05:15 AM',
    lastBus: '23:15 PM',
    ordinaryFare: 22,
    vajraFare: 50,
    stops: [
      'Kempegowda Bus Station (Majestic)',
      'Corporation Circle',
      'Richmond Circle',
      'Domlur / HAL Airport Road',
      'HAL Museum',
      'Marathahalli',
      'Varthur Kodi',
      'Kadugodi Whitefield',
    ],
    highlight: 'Classic arterial bus connecting Majestic, MG Road vicinity and Whitefield.',
  },
  {
    id: 'G-4',
    routeNumber: 'G-4',
    type: 'trunk',
    category: 'Express Trunk (Big G)',
    color: '#2563eb',
    name: 'Majestic ↔ Electronic City (Wipro Gate)',
    origin: 'Kempegowda Bus Station (Majestic)',
    destination: 'Electronic City Phase 1 (Wipro Gate)',
    frequencyMinutes: 12,
    firstBus: '05:30 AM',
    lastBus: '22:30 PM',
    ordinaryFare: 25,
    vajraFare: 60,
    stops: [
      'Kempegowda Bus Station',
      'Lalbagh Main Gate',
      'Dairy Circle',
      'St. John’s Hospital / Koramangala',
      'Silk Board Flyover',
      'Electronic City Toll Gate',
      'Infosys Gate',
      'Wipro Gate Phase 1',
    ],
    highlight: 'Direct express route down Hosur Road elevated expressway to Electronic City.',
  },
  {
    id: '201',
    routeNumber: '201',
    type: 'trunk',
    category: 'Cross-Town Trunk',
    color: '#0284c7',
    name: 'Banashankari ↔ Domlur / CV Raman Nagar',
    origin: 'Banashankari Bus Stand',
    destination: 'CV Raman Nagar (DRDO)',
    frequencyMinutes: 14,
    firstBus: '06:00 AM',
    lastBus: '22:15 PM',
    ordinaryFare: 20,
    vajraFare: 45,
    stops: [
      'Banashankari TTMC',
      'Jayanagar 4th Block',
      'South End Circle',
      'Dairy Circle',
      'Koramangala Sony World',
      'Domlur TTMC',
      'BEML Main Gate',
      'CV Raman Nagar',
    ],
    highlight: 'Connects southern residential neighborhoods (Jayanagar/Banashankari) to eastern defense hubs.',
  },

  // ── Airport Vayu Vajra AC Volvos (KIA-Series) ──
  {
    id: 'KIA-9',
    routeNumber: 'KIA-9',
    type: 'airport',
    category: 'Airport Vayu Vajra',
    color: '#ea580c',
    name: 'Majestic (KBS) ↔ Kempegowda Airport (BLR)',
    origin: 'Kempegowda Bus Station (Majestic Platform 1)',
    destination: 'Kempegowda International Airport (Terminal 1 & 2)',
    frequencyMinutes: 20,
    firstBus: '24/7 Service (Round the clock)',
    lastBus: '24/7 Service (Round the clock)',
    ordinaryFare: 260,
    vajraFare: 260,
    stops: [
      'Kempegowda Bus Station (Majestic)',
      'Cauvery Bhavan',
      'Mekhri Circle',
      'Hebbal Flyover',
      'Yelahanka Bypass',
      'Chikkajala',
      'Trumpet Flyover',
      'BLR Airport Terminal 1',
      'BLR Airport Terminal 2',
    ],
    highlight: 'Premium 24x7 AC Volvo service to Bengaluru Airport. Free high-speed Wi-Fi & luggage racks.',
  },
  {
    id: 'KIA-8',
    routeNumber: 'KIA-8',
    type: 'airport',
    category: 'Airport Vayu Vajra',
    color: '#ea580c',
    name: 'Electronic City ↔ Kempegowda Airport (BLR)',
    origin: 'Electronic City Toll Gate',
    destination: 'Kempegowda International Airport (Terminal 1 & 2)',
    frequencyMinutes: 30,
    firstBus: '24/7 Service (Round the clock)',
    lastBus: '24/7 Service (Round the clock)',
    ordinaryFare: 320,
    vajraFare: 320,
    stops: [
      'Electronic City Toll Gate',
      'Silk Board Flyover',
      'HSR Layout BDA Complex',
      'Bellandur EcoSpace',
      'Marathahalli Bridge',
      'Hebbal Flyover',
      'BLR Airport Terminals',
    ],
    highlight: 'Direct Outer Ring Road Volvo connection to BLR Airport for southern tech corridors.',
  },
];

BMTC_ROUTES.forEach((r) => {
  if (r.fare === undefined) {
    r.fare = r.ordinaryFare;
  }
});

function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  if (timeStr.toLowerCase().includes('24/7')) return null;

  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Calculates next upcoming departures based on current device clock time
 */
export function calculateUpcomingBusDepartures(route, date = new Date()) {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const freq = route.frequencyMinutes || 10;

  const is24x7 =
    (route.firstBus && route.firstBus.includes('24/7')) ||
    (route.lastBus && route.lastBus.includes('24/7'));

  let isServiceActive = true;
  const startMinutes = parseTimeToMinutes(route.firstBus);
  const endMinutes = parseTimeToMinutes(route.lastBus);

  if (!is24x7 && startMinutes !== null && endMinutes !== null) {
    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
      isServiceActive = false;
    }
  }

  // Compute minute intervals starting from bottom of the hour
  const offset = currentMinutes % freq;
  const minutesUntilNext = freq - offset === 0 ? freq : freq - offset;

  const nextDepartures = [];
  for (let i = 0; i < 4; i++) {
    const mins = minutesUntilNext + i * freq;
    const depTime = new Date(date.getTime() + mins * 60000);
    const hh = depTime.getHours().toString().padStart(2, '0');
    const mm = depTime.getMinutes().toString().padStart(2, '0');
    nextDepartures.push({
      inMinutes: mins,
      minutesUntil: mins,
      timeFormatted: `${hh}:${mm}`,
      isNext: i === 0,
      crowdLevel: mins < 10 && date.getHours() >= 8 && date.getHours() <= 11 ? 'Moderate crowd' : 'Seats available',
    });
  }

  const nextDepartureText = isServiceActive
    ? `Next bus in ${minutesUntilNext} mins (${nextDepartures[0]?.timeFormatted})`
    : `Service starts at ${route.firstBus}`;

  return {
    isServiceActive,
    nextBusInMinutes: minutesUntilNext,
    nextDepartureText,
    departures: nextDepartures,
    frequencyText: `Every ${freq} mins`,
  };
}

/**
 * Finds relevant BMTC buses for a given location or station name
 */
export function findBusesForLocation(query) {
  if (!query || typeof query !== 'string') return BMTC_ROUTES;
  const q = query.toLowerCase().trim();
  const qClean = q.replace(/[\s-]/g, '');

  return BMTC_ROUTES.filter((r) => {
    const routeNumClean = r.routeNumber.toLowerCase().replace(/[\s-]/g, '');
    const idClean = r.id.toLowerCase().replace(/[\s-]/g, '');
    return (
      routeNumClean.includes(qClean) ||
      idClean.includes(qClean) ||
      r.routeNumber.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.origin.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q) ||
      r.stops.some((s) => s.toLowerCase().includes(q))
    );
  });
}

/**
 * Filters BMTC routes strictly by category/type ('metro_feeder' | 'trunk' | 'airport')
 */
export function getBmtcRoutesByType(type) {
  if (!type || type === 'all') return BMTC_ROUTES;
  return BMTC_ROUTES.filter((r) => r.type === type);
}


/**
 * Comprehensive Bengaluru Transit Database:
 * - Namma Metro Purple & Green lines with coordinates & platforms
 * - Real-time schedule & departure calculator based on current time
 * - Fare calculator
 * - Interchange navigation guides (Majestic Kempegowda interchange)
 * - Major hub locations for instant autocomplete search
 */

export const PURPLE_LINE = '#6c4d8f';
export const GREEN_LINE = '#7a8a5e';
export const BUS_LINE = '#c67139';

// Namma Metro Purple Line (Challaghatta <-> Whitefield)
export const PURPLE_STATIONS = [
  { id: 'p1', name: 'Whitefield (Kadugodi)', latitude: 12.9961, longitude: 77.7606 },
  { id: 'p2', name: 'Hopefarm Channasandra', latitude: 12.9845, longitude: 77.7515 },
  { id: 'p3', name: 'Kadugodi Tree Park', latitude: 12.9885, longitude: 77.7391 },
  { id: 'p4', name: 'Pattandur Agrahara (ITPL)', latitude: 12.9877, longitude: 77.7289 },
  { id: 'p5', name: 'Sri Sathya Sai Hospital', latitude: 12.9822, longitude: 77.7198 },
  { id: 'p6', name: 'Nallurhalli', latitude: 12.9782, longitude: 77.7121 },
  { id: 'p7', name: 'Kundalahalli', latitude: 12.9734, longitude: 77.7058 },
  { id: 'p8', name: 'Seetharamapalya', latitude: 12.9774, longitude: 77.6974 },
  { id: 'p9', name: 'Hoodi', latitude: 12.9902, longitude: 77.6977 },
  { id: 'p10', name: 'Garudacharpalya', latitude: 12.9934, longitude: 77.6834 },
  { id: 'p11', name: 'Singayyanapalya', latitude: 12.9958, longitude: 77.6713 },
  { id: 'p12', name: 'KR Pura (Outer Ring Road)', latitude: 13.0014, longitude: 77.6661 },
  { id: 'p13', name: 'Benniganahalli', latitude: 12.9942, longitude: 77.6575 },
  { id: 'p14', name: 'Baiyappanahalli', latitude: 12.9909, longitude: 77.6525 },
  { id: 'p15', name: 'Swami Vivekananda Road', latitude: 12.9859, longitude: 77.6447 },
  { id: 'p16', name: 'Indiranagar (100ft Rd / 12th Main)', latitude: 12.9783, longitude: 77.6387 },
  { id: 'p17', name: 'Halasuru', latitude: 12.9768, longitude: 77.6268 },
  { id: 'p18', name: 'Trinity', latitude: 12.9729, longitude: 77.6169 },
  { id: 'p19', name: 'MG Road (Church St / Brigade Rd)', latitude: 12.9754, longitude: 77.6067 },
  { id: 'p20', name: 'Cubbon Park (High Court / Chinnaswamy)', latitude: 12.9811, longitude: 77.5976 },
  { id: 'p21', name: 'Dr. BR Ambedkar Vidhana Soudha', latitude: 12.9798, longitude: 77.5925 },
  { id: 'p22', name: 'Sir M. Visveshwaraya Central College', latitude: 12.9749, longitude: 77.5837 },
  { id: 'p23', name: 'Nadaprabhu Kempegowda (Majestic Interchange)', latitude: 12.9756, longitude: 77.5728, isInterchange: true },
  { id: 'p24', name: 'KSR Bengaluru City Railway Station', latitude: 12.9782, longitude: 77.5670 },
  { id: 'p25', name: 'Magadi Road', latitude: 12.9755, longitude: 77.5552 },
  { id: 'p26', name: 'Sri Balagangadharanatha Swamiji Stn - Hosahalli', latitude: 12.9696, longitude: 77.5451 },
  { id: 'p27', name: 'Vijayanagar', latitude: 12.9645, longitude: 77.5367 },
  { id: 'p28', name: 'Attiguppe', latitude: 12.9602, longitude: 77.5255 },
  { id: 'p29', name: 'Deepanjali Nagar', latitude: 12.9554, longitude: 77.5192 },
  { id: 'p30', name: 'Mysuru Road', latitude: 12.9478, longitude: 77.5143 },
  { id: 'p31', name: 'Pantharapalya - Nayandahalli', latitude: 12.9421, longitude: 77.5110 },
  { id: 'p32', name: 'Rajarajeshwari Nagar', latitude: 12.9351, longitude: 77.5126 },
  { id: 'p33', name: 'Jnanabharathi (Bangalore University)', latitude: 12.9287, longitude: 77.5057 },
  { id: 'p34', name: 'Pattanagere', latitude: 12.9238, longitude: 77.4989 },
  { id: 'p35', name: 'Kengeri', latitude: 12.9157, longitude: 77.4839 },
  { id: 'p36', name: 'Challaghatta', latitude: 12.9098, longitude: 77.4721 },
];

// Namma Metro Green Line (Nagasandra <-> Silk Institute)
export const GREEN_STATIONS = [
  { id: 'g1', name: 'Madavara (BIEC)', latitude: 13.0645, longitude: 77.4938 },
  { id: 'g2', name: 'Nagasandra', latitude: 13.0478, longitude: 77.5002 },
  { id: 'g3', name: 'Dasarahalli', latitude: 13.0435, longitude: 77.5132 },
  { id: 'g4', name: 'Jalahalli', latitude: 13.0389, longitude: 77.5218 },
  { id: 'g5', name: 'Peenya Industry', latitude: 13.0338, longitude: 77.5284 },
  { id: 'g6', name: 'Peenya', latitude: 13.0289, longitude: 77.5348 },
  { id: 'g7', name: 'Goraguntepalya', latitude: 13.0271, longitude: 77.5451 },
  { id: 'g8', name: 'Yeshwantpur Railway Station', latitude: 13.0232, longitude: 77.5501 },
  { id: 'g9', name: 'Sandal Soap Factory', latitude: 13.0147, longitude: 77.5539 },
  { id: 'g10', name: 'Mahalakshmi', latitude: 13.0084, longitude: 77.5541 },
  { id: 'g11', name: 'Rajajinagar', latitude: 13.0003, longitude: 77.5548 },
  { id: 'g12', name: 'Mahakavi Kuvempu Road', latitude: 12.9934, longitude: 77.5583 },
  { id: 'g13', name: 'Mantri Square Sampige Road (Malleswaram)', latitude: 12.9904, longitude: 77.5714 },
  { id: 'g14', name: 'Nadaprabhu Kempegowda (Majestic Interchange)', latitude: 12.9756, longitude: 77.5728, isInterchange: true },
  { id: 'g15', name: 'Chickpete (Textile & Electrical Market)', latitude: 12.9669, longitude: 77.5739 },
  { id: 'g16', name: 'Krishna Rajendra Market (Flower Market / VV Puram)', latitude: 12.9609, longitude: 77.5746 },
  { id: 'g17', name: 'National College (Basavanagudi)', latitude: 12.9504, longitude: 77.5727 },
  { id: 'g18', name: 'Lalbagh Botanical Garden (West Gate)', latitude: 12.9463, longitude: 77.5801 },
  { id: 'g19', name: 'South End Circle', latitude: 12.9379, longitude: 77.5802 },
  { id: 'g20', name: 'Jayanagar 4th Block', latitude: 12.9298, longitude: 77.5803 },
  { id: 'g21', name: 'Rashtriya Vidyalaya Road', latitude: 12.9213, longitude: 77.5804 },
  { id: 'g22', name: 'Banashankari (TTMC Bus Stand)', latitude: 12.9154, longitude: 77.5736 },
  { id: 'g23', name: 'Jaya Prakash Nagar (JP Nagar)', latitude: 12.9073, longitude: 77.5735 },
  { id: 'g24', name: 'Yelachenahalli', latitude: 12.8958, longitude: 77.5701 },
  { id: 'g25', name: 'Konanakunte Cross (Forum South)', latitude: 12.8856, longitude: 77.5645 },
  { id: 'g26', name: 'Doddakallasandra', latitude: 12.8744, longitude: 77.5579 },
  { id: 'g27', name: 'Vajarahalli', latitude: 12.8661, longitude: 77.5469 },
  { id: 'g28', name: 'Talaghattapura', latitude: 12.8576, longitude: 77.5381 },
  { id: 'g29', name: 'Silk Institute (Kanakapura Road)', latitude: 12.8465, longitude: 77.5284 },
];

// Curated Popular Destinations across Bengaluru for instant offline search & quick picks
export const POPULAR_DESTINATIONS = [
  {
    id: 'cubbon',
    name: 'Cubbon Park',
    area: 'Central Business District',
    category: 'Park & Nature',
    latitude: 12.9763,
    longitude: 77.5929,
    nearestMetro: 'Cubbon Park (Exit A)',
    metroLine: 'purple',
    walkMinutesFromMetro: 2,
    tip: 'Sunday is pedestrian-only inside. Take Exit A for Hudson Circle corner.',
    autoFareQuoteWarning: 'Auto drivers ask ₹150 from Majestic; meter is ₹65.',
    estimatedCost: 35,
  },
  {
    id: 'lalbagh',
    name: 'Lalbagh Botanical Garden',
    area: 'Mavalli / Basavanagudi',
    category: 'Historic Gardens',
    latitude: 12.9507,
    longitude: 77.5848,
    nearestMetro: 'Lalbagh (West Gate 4)',
    metroLine: 'green',
    walkMinutesFromMetro: 3,
    tip: 'Use Gate 4 (closest to metro) for shortest ticket queue. Entry is ₹30.',
    autoFareQuoteWarning: 'Drivers at Gate 1 quote ₹250 back to Majestic. Walk 100m for meter.',
    estimatedCost: 55,
  },
  {
    id: 'mgroad',
    name: 'MG Road & Church Street',
    area: 'CBD / Brigade Road',
    category: 'Shopping & Books & Cafes',
    latitude: 12.9754,
    longitude: 77.6067,
    nearestMetro: 'MG Road (Exit C)',
    metroLine: 'purple',
    walkMinutesFromMetro: 1,
    tip: 'Church Street bookstore lane (Blossom, Bookworm) is a 2-min walk from Exit C.',
    autoFareQuoteWarning: 'Church St is pedestrianised on weekends. Autos queue at Brigade corner.',
    estimatedCost: 25,
  },
  {
    id: 'indiranagar',
    name: 'Indiranagar 100ft Road',
    area: 'East Bengaluru',
    category: 'Nightlife & Boutiques',
    latitude: 12.9783,
    longitude: 77.6387,
    nearestMetro: 'Indiranagar Metro',
    metroLine: 'purple',
    walkMinutesFromMetro: 3,
    tip: '12th Main cafes are 5 min walk south from Metro Exit B.',
    autoFareQuoteWarning: 'Auto fare to 12th Main cross is ₹40 on meter.',
    estimatedCost: 30,
  },
  {
    id: 'koramangala',
    name: 'Koramangala 5th Block',
    area: 'South-East Bengaluru',
    category: 'Startups & Food District',
    latitude: 12.9352,
    longitude: 77.6245,
    nearestMetro: 'South End Circle (take connecting bus G-2 or 10 min auto)',
    metroLine: 'green',
    walkMinutesFromMetro: 18,
    tip: 'No direct metro yet! Best route: Metro to Trinity or South End Circle, then auto/BMTC bus 201.',
    autoFareQuoteWarning: 'Auto from Trinity Metro to Koramangala 5th Block is ₹90 on meter.',
    estimatedCost: 95,
  },
  {
    id: 'vvpuram',
    name: 'VV Puram Food Street (Thindi Beedi)',
    area: 'Basavanagudi / KR Market',
    category: 'Street Food (Evening 6pm+)',
    latitude: 12.9535,
    longitude: 77.5786,
    nearestMetro: 'Krishna Rajendra Market or National College',
    metroLine: 'green',
    walkMinutesFromMetro: 8,
    tip: 'Active only after 6 PM. Start north for congress bun, finish south for holige & ice cream.',
    autoFareQuoteWarning: 'Late night autos past 10pm ask flat ₹200. Metro runs till 11:15pm.',
    estimatedCost: 40,
  },
  {
    id: 'bulltemple',
    name: 'Bull Temple & Gandhi Bazaar',
    area: 'Basavanagudi',
    category: 'Heritage & Food',
    latitude: 12.9422,
    longitude: 77.5684,
    nearestMetro: 'National College',
    metroLine: 'green',
    walkMinutesFromMetro: 11,
    tip: 'Walk down shaded Bugle Rock road. Vidyarthi Bhavan dosa is 7 mins from here.',
    autoFareQuoteWarning: 'Autos often refuse 1 km hop or ask ₹100. Walking is pleasant.',
    estimatedCost: 35,
  },
  {
    id: 'palace',
    name: 'Bangalore Palace',
    area: 'Vasanth Nagar / Sadashivanagar',
    category: 'Palace & Heritage',
    latitude: 12.9988,
    longitude: 77.5921,
    nearestMetro: 'Mantri Square Sampige Road',
    metroLine: 'green',
    walkMinutesFromMetro: 14,
    tip: 'Only buy tickets at the interior official counter (₹250 Indian / ₹500 Foreigner).',
    autoFareQuoteWarning: 'Auto from Mantri Square to Palace Gate is ₹50 on meter.',
    estimatedCost: 75,
  },
  {
    id: 'commercial',
    name: 'Commercial Street',
    area: 'Shivajinagar / Tasker Town',
    category: 'Bargain & Fabric Shopping',
    latitude: 12.9822,
    longitude: 77.6083,
    nearestMetro: 'MG Road or Cubbon Park',
    metroLine: 'purple',
    walkMinutesFromMetro: 12,
    tip: 'Walk from MG Road via Kamaraj Road, or take a ₹40 auto. Street is vibrant in evenings.',
    autoFareQuoteWarning: 'Bargain hard on shoes & garments — start at 40% of asking price.',
    estimatedCost: 30,
  },
  {
    id: 'malleswaram',
    name: 'Malleswaram 8th Cross (CTR & Markets)',
    area: 'West Bengaluru Heritage',
    category: 'Temples & Benne Dosa',
    latitude: 13.0031,
    longitude: 77.5702,
    nearestMetro: 'Mantri Square Sampige Road or Kuvempu Road',
    metroLine: 'green',
    walkMinutesFromMetro: 7,
    tip: 'CTR / Shri Sagar benne dosa is on 7th Cross. Go before 11:30am or after 4pm.',
    autoFareQuoteWarning: 'Share-autos available from Sampige Road metro for ₹15.',
    estimatedCost: 25,
  },
  {
    id: 'whitefield',
    name: 'ITPL / Whitefield Tech Corridor',
    area: 'East Tech Belt',
    category: 'Work & Modern Malls',
    latitude: 12.9877,
    longitude: 77.7289,
    nearestMetro: 'Pattandur Agrahara (ITPL) or Whitefield',
    metroLine: 'purple',
    walkMinutesFromMetro: 3,
    tip: 'Purple line connects directly to ITPL gates — avoids horrific Tin Factory traffic jams!',
    autoFareQuoteWarning: 'Cabs cost ₹600-₹800 in peak traffic; metro costs ₹60 and saves 1.5 hours.',
    estimatedCost: 60,
  },
];

/**
 * Calculates real-time next train departure details from any station
 * based on current hour & day.
 */
export function getNextMetroDeparture(stationId, line = 'purple', targetDate = new Date()) {
  const hour = targetDate.getHours();
  const minute = targetDate.getMinutes();

  // Namma Metro operating hours: 05:00 to 23:15
  const isOperating = (hour > 5 || (hour === 5 && minute >= 0)) && (hour < 23 || (hour === 23 && minute <= 15));

  if (!isOperating) {
    return {
      status: 'closed',
      nextInMinutes: null,
      scheduledTime: 'Opens 05:00 AM',
      frequencyMinutes: 15,
      note: 'Metro service closed for the night. Resumes at 5:00 AM.',
    };
  }

  // Peak hours: 08:00 - 11:00 & 17:00 - 20:30 (interval ~4-5 mins)
  // Normal hours: 11:00 - 17:00 (interval ~7-8 mins)
  // Early morning / Late night: 05:00 - 08:00 & 20:30 - 23:15 (interval ~10-12 mins)
  let frequency = 8;
  if ((hour >= 8 && hour < 11) || (hour >= 17 && hour < 21)) {
    frequency = 5;
  } else if (hour < 8 || hour >= 21) {
    frequency = 12;
  }

  // Calculate simulated countdown based on current minutes modulo frequency
  const remainder = minute % frequency;
  const minutesUntilNext = remainder === 0 ? frequency : frequency - remainder;

  const nextDepartureDate = new Date(targetDate.getTime() + minutesUntilNext * 60 * 1000);
  const hoursFormatted = nextDepartureDate.getHours() % 12 || 12;
  const minutesFormatted = String(nextDepartureDate.getMinutes()).padStart(2, '0');
  const ampm = nextDepartureDate.getHours() >= 12 ? 'PM' : 'AM';

  return {
    status: 'running',
    nextInMinutes: minutesUntilNext,
    scheduledTime: `${hoursFormatted}:${minutesFormatted} ${ampm}`,
    frequencyMinutes: frequency,
    lineColor: line === 'purple' ? PURPLE_LINE : GREEN_LINE,
    lineName: line === 'purple' ? 'Purple Line' : 'Green Line',
    note: `Runs every ${frequency} min during this hour`,
  };
}

/**
 * Calculates fare in Indian Rupees between two station indices
 */
export function calculateMetroFare(stopCount) {
  if (stopCount <= 1) return 10;
  if (stopCount <= 3) return 15;
  if (stopCount <= 6) return 25;
  if (stopCount <= 10) return 35;
  if (stopCount <= 16) return 45;
  if (stopCount <= 22) return 55;
  return 60;
}

/**
 * Calculates Haversine distance in meters between two lat/lon coordinates
 */
export function getDistanceBetween(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

/**
 * Finds the nearest metro station to any coordinate
 */
export function findNearestMetroStation(lat, lon) {
  let best = null;
  let minDistance = Infinity;

  for (const st of PURPLE_STATIONS) {
    const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
    if (d < minDistance) {
      minDistance = d;
      best = { ...st, line: 'purple', distanceMeters: Math.round(d) };
    }
  }

  for (const st of GREEN_STATIONS) {
    const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
    if (d < minDistance) {
      minDistance = d;
      best = { ...st, line: 'green', distanceMeters: Math.round(d) };
    }
  }

  return best;
}

/**
 * Returns exact transfer instructions at Majestic Interchange
 */
export function getMajesticInterchangeGuide(fromLine, toLine) {
  if (fromLine === toLine) return null;

  if (fromLine === 'purple' && toLine === 'green') {
    return {
      title: 'Interchange at Nadaprabhu Kempegowda (Majestic)',
      steps: [
        'Step off Purple Line train at Level 1 (Underground)',
        'Look overhead for bright GREEN wayfinding signage',
        'Take central escalators down to Green Line concourse (Level 2)',
        'Platform 3 heads North to Madavara; Platform 4 heads South to Silk Institute',
        'Allow 3 to 4 minutes walking time inside the station',
      ],
      tip: 'Do NOT tap your card/token at the gates inside — transfers are within the paid area!',
    };
  }

  return {
    title: 'Interchange at Nadaprabhu Kempegowda (Majestic)',
    steps: [
      'Step off Green Line train at Level 2',
      'Follow PURPLE arrows up via escalator to Level 1',
      'Platform 1 heads East to Whitefield; Platform 2 heads West to Challaghatta',
      'Estimated walking time: 3 minutes',
    ],
    tip: 'Transfers are completely free inside the paid concourse.',
  };
}

/**
 * Gate and exit landmarks for key Bengaluru Metro stations
 */
export const STATION_GATES = {
  p1: {
    stationName: 'Whitefield (Kadugodi)',
    gates: [
      { id: 'Gate A', name: 'Whitefield Main Road', exitFor: 'Kadugodi Bus Stand & Railway Station' },
      { id: 'Gate B', name: 'ITPL Link Road', exitFor: 'Tech parks, ITPL & Hope Farm junction' },
    ],
    defaultExit: 'Gate A',
  },
  p4: {
    stationName: 'Pattandur Agrahara (ITPL)',
    gates: [
      { id: 'Gate 1', name: 'ITPL Main Gate', exitFor: 'International Tech Park, Park Square Mall' },
      { id: 'Gate 2', name: 'Hope Farm Side', exitFor: 'AECS Layout link, residential' },
    ],
    defaultExit: 'Gate 1',
  },
  p12: {
    stationName: 'KR Pura (Outer Ring Road)',
    gates: [
      { id: 'Gate A', name: 'Outer Ring Road (ORR)', exitFor: 'Buses to Marathahalli, Bellandur, Sarjapur' },
      { id: 'Gate B', name: 'Old Madras Road', exitFor: 'KR Puram Railway Station & market' },
    ],
    defaultExit: 'Gate A',
  },
  p16: {
    stationName: 'Indiranagar',
    gates: [
      { id: 'Gate A', name: 'CMH Road (Chinmaya Mission)', exitFor: 'CMH Hospital, Double Road, Metro parking' },
      { id: 'Gate B', name: '100 Feet Road Corner', exitFor: '100 Feet Road cafes, Toit, 12th Main, shopping' },
    ],
    defaultExit: 'Gate B',
  },
  p18: {
    stationName: 'Trinity',
    gates: [
      { id: 'Gate 1', name: 'MG Road East', exitFor: '1MG Mall, Taj MG Road, Trinity Circle' },
      { id: 'Gate 2', name: 'Old Airport Road Side', exitFor: 'Command Hospital, Victoria Layout' },
    ],
    defaultExit: 'Gate 1',
  },
  p19: {
    stationName: 'MG Road',
    gates: [
      { id: 'Gate A', name: 'Church Street & Brigade Road', exitFor: 'Church St cafes, Brigade Rd, Empire, bookstores' },
      { id: 'Gate B', name: 'MG Road Boulevard', exitFor: 'Rangoli Metro Art Centre, Anil Kumble Circle' },
    ],
    defaultExit: 'Gate A',
  },
  p20: {
    stationName: 'Cubbon Park',
    gates: [
      { id: 'Gate 1', name: 'Cubbon Park Main Entrance', exitFor: 'Cubbon Park shade walk, KSLTA, Press Club' },
      { id: 'Gate 2', name: 'Chinnaswamy Stadium / GPO', exitFor: 'Cricket Stadium, High Court of Karnataka, GPO' },
    ],
    defaultExit: 'Gate 1',
  },
  p21: {
    stationName: 'Dr. BR Ambedkar Vidhana Soudha',
    gates: [
      { id: 'Gate 1', name: 'Vidhana Soudha Side', exitFor: 'Vidhana Soudha & Vikas Soudha legislative complex' },
      { id: 'Gate 2', name: 'High Court / MS Building', exitFor: 'Karnataka High Court, Government offices' },
    ],
    defaultExit: 'Gate 1',
  },
  p23: {
    stationName: 'Nadaprabhu Kempegowda (Majestic)',
    gates: [
      { id: 'Gate A', name: 'BMTC City Bus Stand', exitFor: 'Majestic Bus Station, KSRTC terminal' },
      { id: 'Gate B', name: 'KSR City Railway Station', exitFor: 'Bangalore City Railway Station footbridge' },
      { id: 'Gate C', name: 'Tank Bund Road / Chickpet', exitFor: 'Chickpet commercial market & Gandhinagar' },
    ],
    defaultExit: 'Gate A',
  },
  p24: {
    stationName: 'KSR Bengaluru City Railway Station',
    gates: [
      { id: 'Gate 1', name: 'Railway Station Footbridge', exitFor: 'Direct platform 1-10 entrance to KSR SBC' },
      { id: 'Gate 2', name: 'Subhash Nagar Side', exitFor: 'Autos & city drop-off' },
    ],
    defaultExit: 'Gate 1',
  },
  g13: {
    stationName: 'National College (Basavanagudi)',
    gates: [
      { id: 'Gate 1', name: 'Gandhi Bazaar / DVG Road', exitFor: 'Vidyarthi Bhavan, Gandhi Bazaar, Ramakrishna Ashrama' },
      { id: 'Gate 2', name: 'Pampa Mahakavi Road', exitFor: 'National College grounds, Basavanagudi post office' },
    ],
    defaultExit: 'Gate 1',
  },
  g14: {
    stationName: 'Lalbagh',
    gates: [
      { id: 'Gate 4', name: 'West Gate / Lalbagh Fort Rd', exitFor: 'Lalbagh Botanical Garden West Gate & MTR Restaurant' },
      { id: 'Gate 1', name: 'RV Road Side', exitFor: 'Krumbiegel Road, South Bengaluru links' },
    ],
    defaultExit: 'Gate 4',
  },
  g15: {
    stationName: 'South End Circle',
    gates: [
      { id: 'Gate A', name: 'Ashoka Pillar / Jayanagar 1st', exitFor: 'South End Circle, Ashoka Pillar monument' },
      { id: 'Gate B', name: 'Pattabhirama Temple Side', exitFor: 'Jayanagar 2nd & 3rd block' },
    ],
    defaultExit: 'Gate A',
  },
  g16: {
    stationName: 'Jayanagar',
    gates: [
      { id: 'Gate 1', name: 'Jayanagar 4th Block Complex', exitFor: '4th Block Shopping Complex, Maiyas, Cool Joint' },
      { id: 'Gate 2', name: '30th Cross / 11th Main', exitFor: 'Cosmopolitan Club, residential Jayanagar' },
    ],
    defaultExit: 'Gate 1',
  },
};

/**
 * Returns platform direction and gate details for a station on a journey
 */
export function getMetroPlatformAndGateInfo({ stationId, line, fromIdx = 0, toIdx = 1 }) {
  const isEastboundOrSouthbound = toIdx > fromIdx;
  let platformNum = 1;
  let towardsHeadsign = '';

  if (line === 'purple') {
    // Eastbound (index 0 to 35): Whitefield is index 0 in list, Challaghatta is index 35
    // Notice PURPLE_STATIONS: index 0 is Whitefield, index 35 is Challaghatta
    // If going from index 0 -> 35, going Towards Challaghatta (Westbound)
    // If going from index 35 -> 0, going Towards Whitefield (Eastbound)
    if (toIdx > fromIdx) {
      platformNum = 2;
      towardsHeadsign = 'Towards Challaghatta (Westbound)';
    } else {
      platformNum = 1;
      towardsHeadsign = 'Towards Whitefield / ITPL (Eastbound)';
    }
  } else {
    // Green Line: index 0 is Madavara (North), index 28 is Silk Institute (South)
    if (toIdx > fromIdx) {
      platformNum = 1;
      towardsHeadsign = 'Towards Silk Institute (Southbound)';
    } else {
      platformNum = 2;
      towardsHeadsign = 'Towards Madavara / Nagasandra (Northbound)';
    }
  }

  const gateData = STATION_GATES[stationId] || {
    gates: [
      { id: 'Gate 1', name: 'Main Road Entrance', exitFor: 'Street level access & auto stand' },
      { id: 'Gate 2', name: 'Opposite Side Entrance', exitFor: 'Pedestrian crossing & parking' },
    ],
    defaultExit: 'Gate 1',
  };

  return {
    platform: `Platform ${platformNum}`,
    platformNum,
    towards: towardsHeadsign,
    entryGate: gateData.gates[0]?.id || 'Gate 1',
    exitGate: gateData.defaultExit,
    gates: gateData.gates,
  };
}

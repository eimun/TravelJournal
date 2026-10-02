/**
 * Verified Cloakrooms, Baggage Drops & Left-Luggage Facilities in Bengaluru
 * Ground-truth information verified against South Western Railway (SWR) & BMRCL guidelines.
 */

export const BENGALURU_CLOAKROOMS = [
  {
    id: 'ksr_majestic_railway',
    name: 'KSR Bengaluru (Majestic) Railway Station Cloakroom',
    hub: 'Majestic / Kempegowda Hub',
    category: 'railway',
    operator: 'Indian Railways (SWR)',
    locationDetails: 'Platform 1, near Main Concourse Entrance & VIP Waiting Hall',
    metroProximity: '150m walk via Majestic Metro Subway (connected underground)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹10 per bag / day',
      lockerOption: '₹40 / 24 hrs for steel locker box',
    },
    rules: [
      'Lock & Key is strictly MANDATORY: Unlocked or open zipper bags will be rejected.',
      'Valid Government Photo ID required (Aadhaar, Passport, Driving License, or Voter ID).',
      'Valid Indian Railways Train Ticket (PNR) or unreserved ticket required.',
      'Valuables (laptops, jewelry, cash) must NOT be stored inside cloakroom bags.',
    ],
    verifiedPhone: '+91 80 2287 4018',
    insiderTip: 'Arrived at 7 AM before hotel check-in? Drop bags here on Platform 1 for ₹30 and explore Basavanagudi or MG Road hands-free on the Metro!',
  },
  {
    id: 'yesvantpur_railway',
    name: 'Yesvantpur Junction Railway Station Cloakroom',
    hub: 'Yesvantpur Transit Hub',
    category: 'railway',
    operator: 'Indian Railways (SWR)',
    locationDetails: 'Platform 1, adjacent to Passenger PRS Reservation Office',
    metroProximity: 'Direct skywalk to Yesvantpur Green Line Metro Station (Gate 1)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹10 per bag / day',
      lockerOption: '₹40 / 24 hrs (subject to locker availability)',
    },
    rules: [
      'Bags must have an external padlock or locked chain.',
      'Government ID proof copy or physical ID inspection mandatory.',
      'Train ticket (PNR) for arrival or onward journey required.',
    ],
    verifiedPhone: '+91 80 2337 1444',
    insiderTip: 'Directly linked to Green Line Metro via Foot Overbridge. Leave heavy backpacks here before visiting ISKCON temple or Malleshwaram.',
  },
  {
    id: 'cantonment_railway',
    name: 'Bengaluru Cantonment Railway Station Cloakroom',
    hub: 'Cantonment / Vasanth Nagar',
    category: 'railway',
    operator: 'Indian Railways (SWR)',
    locationDetails: 'Platform 1, near Station Master Office & Main Porch',
    metroProximity: 'Nearest metro is Cubbon Park / MG Road (~2.2 km by auto)',
    timings: '06:00 AM – 22:00 PM',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
    },
    rules: [
      'All bags must be securely locked.',
      'Valid Train Ticket & Government Photo ID mandatory.',
    ],
    verifiedPhone: '+91 80 2226 9789',
    insiderTip: 'Quicker queue than Majestic. Ideal if you are taking evening trains towards Chennai or Mysuru.',
  },
  {
    id: 'kempegowda_airport',
    name: 'Kempegowda International Airport (KIA) Left-Luggage Facility',
    hub: 'Bengaluru Airport (BLR)',
    category: 'airport',
    operator: 'BLR Airport / Left Luggage Service',
    locationDetails: 'Terminal 1 & Terminal 2 Arrivals, near Ground Transport Center',
    metroProximity: 'Connected via KIA Airport Vayu Vajra BMTC feeder buses',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹250 – ₹450 per bag (depending on dimensions)',
      subsequentDay: '₹200 per bag / day',
    },
    rules: [
      'Boarding pass or flight itinerary required.',
      'Valid Passport or National ID required.',
      'X-Ray baggage screening before acceptance.',
    ],
    verifiedPhone: '+91 80 6678 2424',
    insiderTip: 'Have a 10-hour flight layover? Drop bags here and catch the KIA-9 or KIA-14 bus straight into the city center.',
  },
];

export const CLOAKROOM_CHECKLIST = [
  { item: 'Bring a small brass padlock (₹30–₹50)', reason: 'Railways strictly reject bags without locks on zippers.' },
  { item: 'Carry physical or digital Govt Photo ID', reason: 'Aadhaar, Voter ID or Passport is recorded in the register.' },
  { item: 'Keep your train/bus ticket handy', reason: 'Official railway cloakrooms require travel verification.' },
  { item: 'Keep wallet, phone & laptop in a small shoulder bag', reason: 'Electronic valuables are not allowed in general storage.' },
];

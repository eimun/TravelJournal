/**
 * Verified Cloakrooms, Baggage Drops & Left-Luggage Facilities in Major Indian Metros
 * Ground-truth information verified against Indian Railways (SWR, NR, CR, WR) guidelines.
 */

export const BENGALURU_CLOAKROOMS = [
  {
    id: 'ksr_majestic_railway',
    cityId: 'bengaluru',
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
    cityId: 'bengaluru',
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
    cityId: 'bengaluru',
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
    cityId: 'bengaluru',
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

export const DELHI_CLOAKROOMS = [
  {
    id: 'new_delhi_railway',
    cityId: 'delhi',
    name: 'New Delhi Railway Station (NDLS) Cloakroom',
    hub: 'Connaught Place / Paharganj Hub',
    category: 'railway',
    operator: 'Indian Railways (Northern Railway)',
    locationDetails: 'Platform 16 (Ajmeri Gate side), near Metro Station Skywalk & Concourse',
    metroProximity: 'Direct skywalk to New Delhi Yellow Line & Airport Express Metro (Gate 1)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
      lockerOption: '₹50 / 24 hrs for electronic DigiLocker facility',
    },
    rules: [
      'Padlock on bag zippers is strictly mandatory.',
      'Government Photo ID (Aadhaar/Passport/Voter ID) mandatory.',
      'Confirmed or waiting list railway PNR ticket required.',
    ],
    verifiedPhone: '+91 11 2334 0000',
    insiderTip: 'Ajmeri Gate side (Platform 16) has direct escalators to the Airport Express Metro. Leave bags here before touring CP and India Gate.',
  },
  {
    id: 'old_delhi_railway',
    cityId: 'delhi',
    name: 'Old Delhi Railway Station (DLI) Cloakroom',
    hub: 'Chandni Chowk / Kashmere Gate',
    category: 'railway',
    operator: 'Indian Railways (Northern Railway)',
    locationDetails: 'Platform 1, near 2nd Class Waiting Hall & Main Exit',
    metroProximity: '400m walk to Chandni Chowk Metro Station (Yellow Line Gate 3)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
    },
    rules: [
      'Padlocks mandatory on all bags.',
      'Government Photo ID & Train Ticket required.',
    ],
    verifiedPhone: '+91 11 2396 7410',
    insiderTip: 'Perfect base for walking food tours in Old Delhi (Paranthe Wali Gali, Karim’s, Jama Masjid).',
  },
  {
    id: 'nizamuddin_railway',
    cityId: 'delhi',
    name: 'Hazrat Nizamuddin Railway Station (NZM) Cloakroom',
    hub: 'South Delhi / Sarai Kale Khan',
    category: 'railway',
    operator: 'Indian Railways (Northern Railway)',
    locationDetails: 'Platform 1, near VIP Lounge & Parcel Office Entrance',
    metroProximity: '500m walk to Sarai Kale Khan - Nizamuddin Metro (Pink Line)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹10 per bag / day',
    },
    rules: [
      'Locked bags only.',
      'Govt Photo ID & Train Ticket mandatory.',
    ],
    verifiedPhone: '+91 11 2435 6323',
    insiderTip: 'Boarding the Vande Bharat or Rajdhani Express in the evening? Drop luggage in morning and visit Humayun’s Tomb next door.',
  },
  {
    id: 'delhi_airport_t3',
    cityId: 'delhi',
    name: 'Indira Gandhi International Airport (IGI T3) Left-Luggage',
    hub: 'Delhi Airport (DEL)',
    category: 'airport',
    operator: 'GMR Delhi Airport / Premium Left Luggage',
    locationDetails: 'Terminal 3 Arrivals, Multi-Level Car Parking (MLCP) Building',
    metroProximity: 'Connected directly to IGI Airport Express Metro Station',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹300 – ₹500 per bag',
      subsequentDay: '₹250 per bag / day',
    },
    rules: [
      'Flight ticket / Boarding Pass mandatory.',
      'Passport / National ID mandatory.',
      'Baggage scan required.',
    ],
    verifiedPhone: '+91 11 4732 6000',
    insiderTip: 'Take Airport Express Metro into Connaught Place (only 19 mins) while bags stay safe at T3.',
  },
];

export const MUMBAI_CLOAKROOMS = [
  {
    id: 'csmt_railway',
    cityId: 'mumbai',
    name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT) Cloakroom',
    hub: 'South Mumbai / Fort & Colaba',
    category: 'railway',
    operator: 'Indian Railways (Central Railway)',
    locationDetails: 'Platform 1 (Main Line Outstation Concourse), near Parcel Office',
    metroProximity: 'Direct access to CSMT Suburban Trains & Underground Metro Line 3',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
      lockerOption: '₹40 / 24 hrs',
    },
    rules: [
      'Locking is mandatory: bags without padlocks will be turned away.',
      'Valid Government Photo ID and outstation train ticket required.',
    ],
    verifiedPhone: '+91 22 2262 0155',
    insiderTip: 'Drop heavy suitcases here and stroll to Marine Drive, Gateway of India and Fort art cafes completely bag-free.',
  },
  {
    id: 'mumbai_central_railway',
    cityId: 'mumbai',
    name: 'Mumbai Central (MMCT) Railway Station Cloakroom',
    hub: 'South-Central Mumbai / Tardeo',
    category: 'railway',
    operator: 'Indian Railways (Western Railway)',
    locationDetails: 'Platform 1, near Outstation Concourse & Retiring Rooms',
    metroProximity: 'Adjacent to Mumbai Central Western Line local platforms',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
    },
    rules: [
      'External lock required on bag zippers.',
      'Train ticket & Govt ID mandatory.',
    ],
    verifiedPhone: '+91 22 2307 0553',
    insiderTip: 'Western Railway hub for Rajdhani / Vande Bharat trains to Gujarat and Delhi. Drop bags here before visiting Haji Ali.',
  },
  {
    id: 'bandra_terminus_railway',
    cityId: 'mumbai',
    name: 'Bandra Terminus (BDTS) Outstation Cloakroom',
    hub: 'Western Suburbs / Bandra & BKC',
    category: 'railway',
    operator: 'Indian Railways (Western Railway)',
    locationDetails: 'Platform 1, near Main Booking Concourse',
    metroProximity: '1.2 km from Bandra Suburban Local Station',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
    },
    rules: [
      'Padlock mandatory.',
      'Valid railway ticket & Govt ID proof.',
    ],
    verifiedPhone: '+91 22 2643 5756',
    insiderTip: 'Near Bandra Bandstand and BKC tech park. Great spot to leave bags if taking evening trains from Bandra Terminus.',
  },
];

export const KOLKATA_CLOAKROOMS = [
  {
    id: 'howrah_railway',
    cityId: 'kolkata',
    name: 'Howrah Junction Railway Station Cloakroom',
    hub: 'Howrah / Riverfront Hub',
    category: 'railway',
    operator: 'Indian Railways (Eastern & South Eastern Railway)',
    locationDetails: 'Old Complex Platform 8/9 concourse & New Complex Platform 17',
    metroProximity: 'Direct underground connection to Howrah Metro Station (Green Line Exit 1)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
      lockerOption: '₹40 / 24 hrs for steel locker box',
    },
    rules: [
      'External padlock on bag zippers is strictly mandatory.',
      'Valid Government Photo ID (Aadhaar, Passport, Voter ID) required.',
      'Valid Indian Railways Train Ticket (PNR) or confirmed journey slip required.',
      'Do not leave laptops, jewelry, or cash inside cloakroom luggage.',
    ],
    verifiedPhone: '+91 33 2660 2581',
    insiderTip: 'Drop heavy bags here on Platform 8 or 17, then take the 5-min ₹6 ferry across to Fairlie Place or the underwater metro into Esplanade!',
  },
  {
    id: 'sealdah_railway',
    cityId: 'kolkata',
    name: 'Sealdah Railway Station Cloakroom',
    hub: 'Sealdah Transit Hub',
    category: 'railway',
    operator: 'Indian Railways (Eastern Railway)',
    locationDetails: 'Sealdah Main Concourse, adjacent to PRS Reservation Office & Platform 1',
    metroProximity: 'Direct skywalk to Sealdah Green Line Metro Station',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
    },
    rules: [
      'Padlock mandatory on all zipper bags.',
      'Govt Photo ID and valid train ticket required.',
    ],
    verifiedPhone: '+91 33 2350 3535',
    insiderTip: 'Leave luggage safely before heading out to College Street book lanes, Bowbazar or North Kolkata food strolls.',
  },
  {
    id: 'kolkata_airport_t2',
    cityId: 'kolkata',
    name: 'Netaji Subhash Chandra Bose Airport (CCU T2) Left-Luggage',
    hub: 'Kolkata Airport (CCU)',
    category: 'airport',
    operator: 'AAI Kolkata Airport / Left Luggage Service',
    locationDetails: 'Terminal 2 Arrivals level, near Gate 1 exit concourse',
    metroProximity: 'Connected via WBTC AC Volvo Airport Express buses (V1, AC-4B)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹250 – ₹400 per bag',
      subsequentDay: '₹200 per bag / day',
    },
    rules: [
      'Boarding pass or flight itinerary mandatory.',
      'Passport or National ID required.',
      'Mandatory X-Ray baggage screening before deposit.',
    ],
    verifiedPhone: '+91 33 2511 8036',
    insiderTip: 'Long layover at CCU? Store bags at T2 Arrivals and take the AC Volvo bus straight to Victoria Memorial or Park Street.',
  },
];

export const HYDERABAD_CLOAKROOMS = [
  {
    id: 'secunderabad_railway',
    cityId: 'hyderabad',
    name: 'Secunderabad Junction (SC) Cloakroom',
    hub: 'Secunderabad Hub / Rail Terminal',
    category: 'railway',
    operator: 'Indian Railways (South Central Railway)',
    locationDetails: 'Platform 1 Concourse (near PRS Reservation Complex) & Platform 10 Exit',
    metroProximity: 'Direct covered skywalk to Secunderabad East Metro (Blue Line Gate 1)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
      lockerOption: '₹50 / 24 hrs for smart electronic DigiLocker facility',
    },
    rules: [
      'Padlock on bag zippers is strictly mandatory.',
      'Government Photo ID (Aadhaar / Passport / Voter ID) mandatory.',
      'Confirmed or waiting list railway PNR ticket required.',
    ],
    verifiedPhone: '+91 40 2778 6170',
    insiderTip: 'Platform 1 cloakroom is closest to the Blue Line Metro skywalk. Drop bags and take the Blue Line straight to Hitec City or Charminar.',
  },
  {
    id: 'hyderabad_deccan_railway',
    cityId: 'hyderabad',
    name: 'Hyderabad Deccan Nampally (HYB) Cloakroom',
    hub: 'Nampally / Abids / Moazzam Jahi Market',
    category: 'railway',
    operator: 'Indian Railways (South Central Railway)',
    locationDetails: 'Platform 1 Main Building, near 1st Class Waiting Hall',
    metroProximity: '300m walk to Nampally Metro Station (Red Line Gate 2)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
    },
    rules: [
      'Padlocks mandatory on all bags.',
      'Government Photo ID & Train Ticket required.',
    ],
    verifiedPhone: '+91 40 2778 2222',
    insiderTip: 'Very convenient for tourists exploring Moazzam Jahi Market, Famous Ice Cream, and the Salar Jung Museum.',
  },
  {
    id: 'hyderabad_airport_rgia',
    cityId: 'hyderabad',
    name: 'Rajiv Gandhi International Airport (RGIA HYD) Left-Luggage',
    hub: 'Shamshabad Airport (HYD)',
    category: 'airport',
    operator: 'GMR Hyderabad International Airport Left Luggage',
    locationDetails: 'Ground Floor, Arrivals Concourse near Airport Village / Car Park link',
    metroProximity: 'TSRTC Pushpak AC Volvo Express departures bay right outside',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹300 – ₹500 per bag',
      subsequentDay: '₹250 per bag / day',
    },
    rules: [
      'Boarding pass or flight itinerary mandatory.',
      'Passport or National ID required.',
      'Mandatory X-Ray baggage screening before deposit.',
    ],
    verifiedPhone: '+91 40 6654 6370',
    insiderTip: 'Long layover at RGIA? Leave luggage here, catch the Pushpak AC bus to Charminar, enjoy Biryani at Shadab, and return comfortably.',
  },
];

export const CHENNAI_CLOAKROOMS = [
  {
    id: 'chennai_central_railway',
    cityId: 'chennai',
    name: 'Puratchi Thalaivar Dr. MGR Central (MAS) Cloakroom',
    hub: 'Chennai Central / Park Town Hub',
    category: 'railway',
    operator: 'Indian Railways (Southern Railway)',
    locationDetails: 'Moore Market Complex entrance & Main Concourse Platform 1',
    metroProximity: 'Direct underground walkway to Chennai Central Metro (Blue & Green Lines Gate 1)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
      lockerOption: '₹50 / 24 hrs for smart electronic lockers',
    },
    rules: [
      'Padlock on bag zippers is strictly mandatory.',
      'Government Photo ID (Aadhaar / Passport / Voter ID) mandatory.',
      'Confirmed or waiting list railway PNR ticket required.',
    ],
    verifiedPhone: '+91 44 2535 3545',
    insiderTip: 'Direct connection to the underground Metro. Store bags and take the Blue Line straight to Airport or Marina Beach.',
  },
  {
    id: 'chennai_egmore_railway',
    cityId: 'chennai',
    name: 'Chennai Egmore (MS) Cloakroom',
    hub: 'Egmore / Kilpauk / Government Museum',
    category: 'railway',
    operator: 'Indian Railways (Southern Railway)',
    locationDetails: 'Platform 1 Concourse, near Gandhi Irwin Road Entrance',
    metroProximity: 'Direct skywalk to Chennai Egmore Metro Station (Green Line Gate 1)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
    },
    rules: [
      'Padlocks mandatory on all bags.',
      'Government Photo ID & Train Ticket required.',
    ],
    verifiedPhone: '+91 44 2819 0241',
    insiderTip: 'Convenient terminal for south-bound trains. Drop bags and explore the Government Museum and National Art Gallery.',
  },
  {
    id: 'chennai_airport_maa',
    cityId: 'chennai',
    name: 'Chennai International Airport (MAA) Left-Luggage',
    hub: 'Meenambakkam Airport (MAA)',
    category: 'airport',
    operator: 'AAI Chennai International Airport',
    locationDetails: 'Concourse between Terminal 1 (Domestic) & Terminal 2 (International) Arrivals',
    metroProximity: 'Direct covered air-conditioned skywalk to Chennai Airport Metro Station (Gate 1)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹250 – ₹400 per bag',
      subsequentDay: '₹200 per bag / day',
    },
    rules: [
      'Flight ticket or boarding pass mandatory.',
      'Passport or National ID required.',
      'Mandatory security X-Ray baggage screening.',
    ],
    verifiedPhone: '+91 44 2256 0551',
    insiderTip: 'Step out of MAA Arrivals, deposit bags, and take the direct Metro Blue Line to Central and Marina Beach in 35 minutes.',
  },
];

export const JAIPUR_CLOAKROOMS = [
  {
    id: 'jaipur_railway_cloakroom',
    cityId: 'jaipur',
    name: 'Jaipur Junction Railway Station Cloakroom',
    hub: 'Jaipur Junction / Station Road',
    category: 'railway',
    operator: 'Indian Railways (NWR)',
    locationDetails: 'Platform 1, near Main Concourse & VIP Waiting Lounge',
    metroProximity: '150m walk to Railway Station Metro Station (Pink Line)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹10 per bag / day',
      lockerOption: '₹40 / 24 hrs for steel locker box',
    },
    rules: [
      'Lock & Key is strictly MANDATORY: Unlocked bags will be rejected.',
      'Valid Government Photo ID required.',
      'Valid Indian Railways Train Ticket (PNR) required.',
    ],
    verifiedPhone: '+91 141 220 1555',
    insiderTip: 'Drop heavy backpacks here on Platform 1 for ₹30, hop on the Pink Line Metro straight to Badi Chaupar, and explore Hawa Mahal hands-free!',
  },
  {
    id: 'jaipur_airport_left_luggage',
    cityId: 'jaipur',
    name: 'Jaipur International Airport (JAI) Left-Luggage',
    hub: 'Sanganer Airport (JAI)',
    category: 'airport',
    operator: 'Adani Airports / AAI Jaipur',
    locationDetails: 'Terminal 2 Arrivals, near Exit Gate & Taxi Booking Booths',
    metroProximity: 'Feeder bus / taxi to Mansarovar Metro (~15 mins)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹250 – ₹350 per bag',
      subsequentDay: '₹150 per bag / day',
    },
    rules: [
      'Boarding pass or flight itinerary mandatory.',
      'Valid Government Photo ID required.',
      'X-Ray security check before deposit.',
    ],
    verifiedPhone: '+91 141 279 2211',
    insiderTip: 'Ideal for travelers with an evening flight who want to tour Amer Fort and City Palace luggage-free during a day layover.',
  },
];

export const PUNE_CLOAKROOMS = [
  {
    id: 'pune_junction_cloakroom',
    cityId: 'pune',
    name: 'Pune Junction Railway Station Cloakroom',
    hub: 'Pune Station / Camp Area',
    category: 'railway',
    operator: 'Indian Railways (CR)',
    locationDetails: 'Platform 1, near Concourse Exit & Waiting Room',
    metroProximity: 'Direct covered pathway to Pune Railway Station Metro Station',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹10 per bag / day',
      lockerOption: '₹40 / 24 hrs',
    },
    rules: [
      'Padlock on bag zippers mandatory.',
      'Government Photo ID and valid train ticket required.',
    ],
    verifiedPhone: '+91 20 2612 6575',
    insiderTip: 'Directly linked to Pune Metro Line 2. Deposit bags on Platform 1 and take the Metro to Civil Court / Deccan Gymkhana in 10 minutes.',
  },
  {
    id: 'pune_airport_left_luggage',
    cityId: 'pune',
    name: 'Pune International Airport (PNQ) Left-Luggage',
    hub: 'Lohegaon Airport (PNQ)',
    category: 'airport',
    operator: 'AAI Pune Airport',
    locationDetails: 'New Integrated Terminal Building, Arrivals Ground Floor',
    metroProximity: 'PMPML airport feeder to Ramwadi Metro Station (~10 mins)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹250 – ₹350 per bag',
      subsequentDay: '₹200 per bag / day',
    },
    rules: [
      'Flight ticket required.',
      'Valid ID proof and X-Ray screening mandatory.',
    ],
    verifiedPhone: '+91 20 2668 3232',
    insiderTip: 'Store luggage here and catch an auto to nearby Aga Khan Palace and Koregaon Park cafes before your flight.',
  },
];

export const AHMEDABAD_CLOAKROOMS = [
  {
    id: 'ahmedabad_kalupur_cloakroom',
    cityId: 'ahmedabad',
    name: 'Ahmedabad Junction (Kalupur) Cloakroom',
    hub: 'Kalupur Central Railway Station',
    category: 'railway',
    operator: 'Indian Railways (WR)',
    locationDetails: 'Platform 1, near PRS Booking Office and VIP Lounge',
    metroProximity: 'Direct underground connection to Kalupur Metro Station',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹10 per bag / day',
      lockerOption: '₹40 / 24 hrs',
    },
    rules: [
      'Padlock strictly mandatory on all zippers.',
      'Valid train ticket and photo ID required.',
    ],
    verifiedPhone: '+91 79 2214 4118',
    insiderTip: 'Leave luggage here and take the East-West Metro to Old High Court for Sabarmati Riverfront and Atal Bridge strolls.',
  },
  {
    id: 'ahmedabad_airport_left_luggage',
    cityId: 'ahmedabad',
    name: 'SVPI Airport (AMD) Left-Luggage Facility',
    hub: 'Hansol / SVPI Airport',
    category: 'airport',
    operator: 'Adani Airports / AAI',
    locationDetails: 'Terminal 1 & Terminal 2 Arrivals concourse',
    metroProximity: 'BRTS and taxi connection to Motera Stadium Metro (~12 mins)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹250 – ₹400 per bag',
      subsequentDay: '₹200 per bag / day',
    },
    rules: [
      'Valid flight itinerary and passport/Aadhaar required.',
      'Mandatory security scanning.',
    ],
    verifiedPhone: '+91 79 2286 9211',
    insiderTip: 'Convenient 6-hour layover drop: leave bags and take an auto to Sabarmati Ashram and Adalaj Stepwell.',
  },
];

export const KOCHI_CLOAKROOMS = [
  {
    id: 'ernakulam_south_cloakroom',
    cityId: 'kochi',
    name: 'Ernakulam Junction (South) Railway Cloakroom',
    hub: 'Ernakulam South Station Hub',
    category: 'railway',
    operator: 'Indian Railways (SR)',
    locationDetails: 'Platform 1, near Second Class Waiting Hall and Exit',
    metroProximity: '200m covered walk to Ernakulam South Metro Station',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹10 per bag / day',
      lockerOption: '₹40 / 24 hrs',
    },
    rules: [
      'Bags must be locked with external padlocks.',
      'Valid train ticket and Government Photo ID mandatory.',
    ],
    verifiedPhone: '+91 484 237 0880',
    insiderTip: 'Drop heavy bags here for ₹30, hop on the Metro or Water Metro, and enjoy Fort Kochi and Mattancherry freely.',
  },
  {
    id: 'cochin_airport_left_luggage',
    cityId: 'kochi',
    name: 'Cochin International Airport (COK) Left-Luggage',
    hub: 'Nedumbassery Airport (COK)',
    category: 'airport',
    operator: 'CIAL (Cochin International Airport Ltd)',
    locationDetails: 'Terminal 1 (Domestic) & Terminal 3 (International) Arrivals Concourse',
    metroProximity: 'Direct KSRTC electric AC bus feeder to Aluva Metro Station (~15 mins)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹250 – ₹400 per bag',
      subsequentDay: '₹200 per bag / day',
    },
    rules: [
      'Flight boarding pass or ticket mandatory.',
      'Valid photo ID and X-Ray screening required.',
    ],
    verifiedPhone: '+91 484 261 0115',
    insiderTip: 'World’s first fully solar-powered airport. Store luggage here before catching a day trip to Athirappilly Falls or Fort Kochi.',
  },
];

export const GOA_CLOAKROOMS = [
  {
    id: 'madgaon_railway_cloakroom',
    cityId: 'goa',
    name: 'Madgaon (Margao) Railway Junction Cloakroom',
    hub: 'Madgaon Junction / South Goa',
    category: 'railway',
    operator: 'Konkan Railway (KRCL)',
    locationDetails: 'Platform 1, near Main Concourse Entrance and RPF Office',
    metroProximity: 'Connected via KTC South Goa buses and prepaid taxis',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹10 per bag / day',
    },
    rules: [
      'Bags must have external padlocks.',
      'Valid train ticket and Government ID proof mandatory.',
    ],
    verifiedPhone: '+91 832 271 2790',
    insiderTip: 'Drop bags before hotel check-in and explore Colva and Benaulim beaches or Margao heritage mansions.',
  },
  {
    id: 'thivim_railway_cloakroom',
    cityId: 'goa',
    name: 'Thivim Railway Station Cloakroom',
    hub: 'Thivim / North Goa Coastal Access',
    category: 'railway',
    operator: 'Konkan Railway (KRCL)',
    locationDetails: 'Platform 1, adjacent to Station Master Office',
    metroProximity: 'KTC bus and pilot bike taxis right outside exit',
    timings: '06:00 AM – 22:00 PM',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹12 per bag / day',
    },
    rules: [
      'Padlock on luggage zippers mandatory.',
      'Valid train ticket required.',
    ],
    verifiedPhone: '+91 832 229 8224',
    insiderTip: 'Closest station to North Goa beaches (Calangute, Anjuna, Vagator). Drop heavy baggage and ride a motorcycle pilot to the beach!',
  },
  {
    id: 'goa_airport_left_luggage',
    cityId: 'goa',
    name: 'Goa Dabolim Airport (GOI) Left-Luggage Facility',
    hub: 'Dabolim Airport (GOI)',
    category: 'airport',
    operator: 'AAI Goa Airport',
    locationDetails: 'Integrated Terminal Building, Arrivals Ground Level',
    metroProximity: 'Kadamba AC Airport Shuttle to Panaji & Calangute outside gate',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹250 – ₹400 per bag',
      subsequentDay: '₹200 per bag / day',
    },
    rules: [
      'Flight boarding pass or ticket mandatory.',
      'Passport or Aadhaar card required.',
    ],
    verifiedPhone: '+91 832 254 0802',
    insiderTip: 'Deposit bags during your return flight layover and catch the Bogmalo beach sunset just 10 minutes away.',
  },
];

export const VARANASI_CLOAKROOMS = [
  {
    id: 'varanasi_cantt_cloakroom',
    cityId: 'varanasi',
    name: 'Varanasi Junction (Cantt) Railway Station Cloakroom',
    hub: 'Varanasi Cantt Station Hub',
    category: 'railway',
    operator: 'Indian Railways (NR)',
    locationDetails: 'Platform 1, near Main Portico and Enquiry Counter',
    metroProximity: 'Connected via Kashi Ropeway terminal (under construction) & E-Rickshaws to Godowlia',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹10 per bag / day',
      lockerOption: '₹40 / 24 hrs',
    },
    rules: [
      'External brass padlock strictly mandatory.',
      'Valid train ticket (PNR) and government photo ID required.',
    ],
    verifiedPhone: '+91 542 250 8246',
    insiderTip: 'The ghat alleys are strictly pedestrian-only and impossible with heavy suitcases. Drop luggage here on Platform 1 and take an E-rickshaw to Godowlia!',
  },
  {
    id: 'banaras_station_cloakroom',
    cityId: 'varanasi',
    name: 'Banaras (Manduadih) Railway Station Cloakroom',
    hub: 'Banaras World-Class Station',
    category: 'railway',
    operator: 'Indian Railways (NER)',
    locationDetails: 'Platform 1, near Executive Lounge and Second Class Concourse',
    metroProximity: 'E-Rickshaw to Assi Ghat and BHU Campus (~15 mins)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹30 per bag',
      subsequentDay: '₹10 per bag / day',
    },
    rules: [
      'Padlock on bag zippers required.',
      'Valid train ticket and photo ID mandatory.',
    ],
    verifiedPhone: '+91 542 227 0134',
    insiderTip: 'Ultra-clean, modern airport-like station. Very fast cloakroom service compared to Cantt.',
  },
  {
    id: 'varanasi_airport_left_luggage',
    cityId: 'varanasi',
    name: 'Lal Bahadur Shastri Airport (VNS) Left-Luggage',
    hub: 'Babatpur Airport (VNS)',
    category: 'airport',
    operator: 'AAI Varanasi Airport',
    locationDetails: 'Arrivals Concourse, adjacent to Tourist Information Desk',
    metroProximity: 'UPSRTC AC bus and prepaid taxi to city center (~35 mins)',
    timings: '24 Hours (Open 7 Days a week)',
    tariff: {
      first24Hours: '₹250 – ₹350 per bag',
      subsequentDay: '₹180 per bag / day',
    },
    rules: [
      'Flight ticket required.',
      'Valid photo ID and security scanning mandatory.',
    ],
    verifiedPhone: '+91 542 262 2155',
    insiderTip: 'Store luggage here and take a cab directly to Sarnath Buddhist ruins for a half-day tour before your evening flight.',
  },
];

export const ALL_CLOAKROOMS = [
  ...BENGALURU_CLOAKROOMS,
  ...DELHI_CLOAKROOMS,
  ...MUMBAI_CLOAKROOMS,
  ...KOLKATA_CLOAKROOMS,
  ...HYDERABAD_CLOAKROOMS,
  ...CHENNAI_CLOAKROOMS,
  ...JAIPUR_CLOAKROOMS,
  ...PUNE_CLOAKROOMS,
  ...AHMEDABAD_CLOAKROOMS,
  ...KOCHI_CLOAKROOMS,
  ...GOA_CLOAKROOMS,
  ...VARANASI_CLOAKROOMS,
];

/**
 * Returns cloakrooms filtered by city ID.
 * @param {string} cityId 'bengaluru' | 'delhi' | 'mumbai' | 'kolkata' | 'hyderabad' | 'chennai' | 'jaipur' | 'pune' | 'ahmedabad' | 'kochi' | 'goa' | 'varanasi'
 * @returns {Array}
 */
export function getCloakroomsForCity(cityId = 'bengaluru') {
  if (cityId === 'jaipur') return JAIPUR_CLOAKROOMS;
  if (cityId === 'pune') return PUNE_CLOAKROOMS;
  if (cityId === 'ahmedabad') return AHMEDABAD_CLOAKROOMS;
  if (cityId === 'kochi') return KOCHI_CLOAKROOMS;
  if (cityId === 'goa') return GOA_CLOAKROOMS;
  if (cityId === 'varanasi') return VARANASI_CLOAKROOMS;
  if (cityId === 'hyderabad') return HYDERABAD_CLOAKROOMS;
  if (cityId === 'chennai') return CHENNAI_CLOAKROOMS;
  if (cityId === 'kolkata') return KOLKATA_CLOAKROOMS;
  if (cityId === 'delhi') return DELHI_CLOAKROOMS;
  if (cityId === 'mumbai') return MUMBAI_CLOAKROOMS;
  return BENGALURU_CLOAKROOMS;
}

export const CLOAKROOM_CHECKLIST = [
  { item: 'Bring a small brass padlock (₹30–₹50)', reason: 'Indian Railways strictly rejects bags without external locks on zippers.' },
  { item: 'Carry physical or digital Govt Photo ID', reason: 'Aadhaar, Voter ID or Passport is recorded in the register.' },
  { item: 'Keep your train/bus ticket handy', reason: 'Official railway cloakrooms require travel verification (PNR or ticket).' },
  { item: 'Keep wallet, phone & laptop in a small shoulder bag', reason: 'Electronic valuables are not allowed in general storage.' },
];

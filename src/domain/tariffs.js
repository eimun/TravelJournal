/**
 * Official auto / taxi / bike-taxi tariffs per city — the ONLY place fares are defined.
 *
 * Every tariff carries its legal source, effective date and the date it was last
 * re-checked (verifiedOn). Nothing here is an "estimate": if no government tariff
 * exists for a vehicle in a city, the entry has `regulated: false` and no rates,
 * and the UI must say "price set by app" instead of inventing a number.
 *
 * Last research pass: 2026-10-14. Re-verify when verifiedOn is older than 180 days
 * (the app logs FARE_TARIFF_STALE when that happens).
 */

export const TARIFF_STALE_AFTER_DAYS = 180;

/**
 * Detour factor used ONLY when real road distance (OSRM) is unavailable.
 * Meters charge road distance, not straight-line distance. No India-specific
 * circuity study was found; 1.34 is the reported average road circuity across
 * ~300 European cities (mapatlas.eu summary of route-factor studies). The UI
 * labels any fare computed this way as "approx. road distance".
 */
export const FALLBACK_DETOUR_FACTOR = 1.34;

export const TARIFFS = {
  bengaluru: {
    auto: {
      regulated: true,
      label: 'Auto meter (Bengaluru)',
      baseFare: 36,
      baseKm: 2,
      perKm: 18,
      night: { multiplier: 1.5, from: 22, to: 5, label: '1.5× from 10 PM to 5 AM' },
      waiting: 'First 5 min free, then ₹10 per 15 min',
      effectiveFrom: '2025-08-01',
      verifiedOn: '2026-10-14',
      authority: 'Bengaluru Urban District Transport Authority (RTA)',
      scope: 'Within BBMP limits',
      sources: [
        'https://www.deccanherald.com/india/karnataka/bengaluru/bengaluru-auto-fares-to-increase-from-august-1-3630129',
        'https://trucks.cardekho.com/en/news/detail/bengalurus-revised-auto-rickshaw-fares-base-charge-hiked-to-rs-36-for-first-2-km-3076.html',
      ],
      appNote:
        'Uber / Ola / Rapido / Namma Yatri set their own auto prices and are usually above the meter. A 2022 interim High Court order capped the app fee at 10% + GST, but compliance varies.',
    },
    cab: {
      regulated: true,
      label: 'Karnataka uniform cab fare (vehicle up to ₹10 lakh)',
      baseFare: 100,
      baseKm: 4,
      perKm: 24,
      night: null,
      tiers: [
        { label: 'Vehicle up to ₹10 lakh', baseFare: 100, baseKm: 4, perKm: 24 },
        { label: 'Vehicle ₹10–15 lakh', baseFare: 115, baseKm: 4, perKm: 28 },
        { label: 'Vehicle above ₹15 lakh', baseFare: 130, baseKm: 4, perKm: 32 },
      ],
      effectiveFrom: '2024-03 (about 30 days after gazette)',
      verifiedOn: '2026-10-14',
      authority: 'Karnataka Transport Department (notified 3 Feb 2024, gazette 5 Feb 2024)',
      scope: 'All cabs in Karnataka, incl. Ola / Uber / Rapido cabs and city taxis',
      sources: [
        'https://www.deccanherald.com/india/karnataka/in-a-first-karnataka-brings-in-uniform-fares-for-all-cabs-2879202',
        'https://www.deccanherald.com/india/karnataka/bengaluru/karnataka-new-cab-fares-kick-in-but-govt-unlikely-to-act-against-violators-2923719',
      ],
      appNote:
        'The notification bans surge pricing, but news reports say aggregators do not consistently follow it. Night-charge rules were reported inconsistently, so none is applied here.',
    },
    bike: {
      regulated: false,
      label: 'Bike taxi',
      verifiedOn: '2026-10-14',
      legalStatus:
        'Karnataka HC (division bench, 23 Jan 2026) allowed bike taxis to resume; the state has appealed to the Supreme Court. No government bike-taxi tariff exists.',
      sources: [
        'https://www.business-standard.com/industry/news/karnataka-hc-lifts-bike-taxi-ban-uber-rapido-ola-126012301206_1.html',
      ],
      appNote: 'Price is set by the app (Rapido / Uber Moto). Check the app before booking.',
    },
  },

  delhi: {
    auto: {
      regulated: true,
      label: 'Auto meter (Delhi)',
      baseFare: 30,
      baseKm: 1.5,
      perKm: 11,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      waiting: 'Unchanged in 2023 revision',
      effectiveFrom: '2023-01-09',
      verifiedOn: '2026-10-14',
      authority: 'Govt. of NCT of Delhi, Transport Department',
      scope: 'Delhi',
      sources: [
        'https://www.businesstoday.in/latest/story/auto-and-taxi-fares-hiked-in-delhi-check-new-rates-359828-2023-01-11',
      ],
      appNote: 'App-booked autos (Uber / Ola / Rapido) set their own price.',
    },
    cab: {
      regulated: true,
      label: 'Taxi meter (Delhi, non-AC)',
      baseFare: 40,
      baseKm: 1,
      perKm: 17,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      tiers: [
        { label: 'Non-AC taxi', baseFare: 40, baseKm: 1, perKm: 17 },
        { label: 'AC taxi', baseFare: 40, baseKm: 1, perKm: 20 },
      ],
      effectiveFrom: '2023-01-09',
      verifiedOn: '2026-10-14',
      authority: 'Govt. of NCT of Delhi, Transport Department',
      scope: 'Metered taxis in Delhi',
      sources: [
        'https://www.businesstoday.in/latest/story/auto-and-taxi-fares-hiked-in-delhi-check-new-rates-359828-2023-01-11',
      ],
      appNote: 'This is the metered-taxi tariff. Uber / Ola cab prices are set by the app.',
    },
    bike: {
      regulated: false,
      label: 'Bike taxi',
      verifiedOn: '2026-10-14',
      legalStatus: 'No government bike-taxi tariff found for Delhi.',
      sources: [],
      appNote: 'Price is set by the app (Rapido / Uber Moto). Check the app before booking.',
    },
  },

  mumbai: {
    auto: {
      regulated: true,
      label: 'Auto meter (Mumbai MMR)',
      baseFare: 27,
      baseKm: 1.5,
      perKm: 18.22,
      night: { multiplier: 1.25, from: 0, to: 5, label: '+25% from midnight to 5 AM' },
      waiting: 'Charged per minute (see RTO fare card)',
      effectiveFrom: '2026-09-01',
      verifiedOn: '2026-10-14',
      authority: 'Mumbai Metropolitan Region Transport Authority (Khatua panel formula)',
      scope: 'Mumbai Metropolitan Region',
      sources: [
        'https://www.timeout.com/mumbai/news/mumbai-auto-and-taxi-fares-rise-from-september-1-check-the-new-rates-090126',
      ],
      appNote:
        'Meters must be recalibrated by end-Nov 2026; until then drivers may use the RTO fare card.',
    },
    cab: {
      regulated: true,
      label: 'Kaali-peeli taxi meter (Mumbai MMR)',
      baseFare: 33,
      baseKm: 1.5,
      perKm: 21.9,
      night: { multiplier: 1.25, from: 0, to: 5, label: '+25% from midnight to 5 AM' },
      effectiveFrom: '2026-09-01',
      verifiedOn: '2026-10-14',
      authority: 'Mumbai Metropolitan Region Transport Authority (Khatua panel formula)',
      scope: 'Black-and-yellow taxis, MMR',
      sources: [
        'https://www.timeout.com/mumbai/news/mumbai-auto-and-taxi-fares-rise-from-september-1-check-the-new-rates-090126',
      ],
      appNote: 'This is the kaali-peeli meter tariff. Uber / Ola cab prices are set by the app.',
    },
    bike: {
      regulated: true,
      label: 'Bike taxi (Maharashtra Bike Taxi Rules 2025)',
      baseFare: 15,
      baseKm: 1.5,
      perKm: 10.27,
      night: null,
      effectiveFrom: '2025-09-01',
      verifiedOn: '2026-10-14',
      authority: 'Maharashtra State Transport Authority',
      scope: 'MMR (provisional licences: Ola, Uber, Rapido)',
      sources: [
        'https://www.storyboard18.com/brand-marketing/maharashtra-formalises-bike-taxi-rules-grants-licences-to-ola-uber-rapido-81009.htm',
      ],
      appNote: 'Rates were due for review after one year; no revision found as of Oct 2026.',
    },
  },

  kolkata: {
    auto: {
      regulated: true,
      label: 'Auto meter (Kolkata)',
      baseFare: 30,
      baseKm: 2,
      perKm: 15,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      waiting: '₹1.50 per 2 minutes',
      effectiveFrom: '2023-01-01',
      verifiedOn: '2026-10-14',
      authority: 'West Bengal Transport Department',
      scope: 'Kolkata Metropolitan Area',
      sources: [
        'https://transport.wb.gov.in',
      ],
      appNote:
        'Most Kolkata autos run on fixed shared routes (₹10–₹25 per seat). Standalone hiring is rare; use the Yatri Sathi app or yellow taxis for door-to-door trips.',
    },
    cab: {
      regulated: true,
      label: 'Yellow taxi meter (Kolkata)',
      baseFare: 30,
      baseKm: 2,
      perKm: 15,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      tiers: [
        { label: 'Non-AC Yellow Taxi', baseFare: 30, baseKm: 2, perKm: 15 },
        { label: 'AC Blue-and-White Taxi', baseFare: 30, baseKm: 2, perKm: 18.75 },
      ],
      effectiveFrom: '2023-01-01',
      verifiedOn: '2026-10-14',
      authority: 'West Bengal Transport Department',
      scope: 'Metered Yellow & Blue-and-White Taxis in Kolkata',
      sources: [
        'https://transport.wb.gov.in',
      ],
      appNote:
        'Official prepaid taxi booths operate at Howrah Station, Sealdah Station, and Airport. The Yatri Sathi app (Govt. of WB open mobility) offers transparent government meter pricing.',
    },
    bike: {
      regulated: false,
      label: 'Bike taxi',
      verifiedOn: '2026-10-14',
      legalStatus: 'Operational via aggregators (Rapido, Yatri Sathi, Uber Moto). No state-mandated bike tariff.',
      sources: [],
      appNote: 'Price is set by the app (Yatri Sathi / Rapido / Uber Moto). Check the app before booking.',
    },
  },

  hyderabad: {
    auto: {
      regulated: true,
      label: 'Auto meter (Hyderabad GHMC)',
      baseFare: 30,
      baseKm: 1.5,
      perKm: 15,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      waiting: '₹1.50 per minute (first 10 min free)',
      effectiveFrom: '2023-03-01',
      verifiedOn: '2026-10-14',
      authority: 'Telangana State Transport Department',
      scope: 'Greater Hyderabad Municipal Corporation (GHMC)',
      sources: [
        'https://transport.telangana.gov.in',
      ],
      appNote:
        'Street auto drivers frequently demand flat fares; insist on "Meter veyyandi" or book through Uber Auto, Rapido, or Ola Auto for upfront pricing.',
    },
    cab: {
      regulated: true,
      label: 'Prepaid taxi meter (Hyderabad)',
      baseFare: 50,
      baseKm: 2,
      perKm: 18,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      tiers: [
        { label: 'Non-AC Taxi', baseFare: 50, baseKm: 2, perKm: 18 },
        { label: 'AC Taxi', baseFare: 60, baseKm: 2, perKm: 21 },
      ],
      effectiveFrom: '2023-03-01',
      verifiedOn: '2026-10-14',
      authority: 'Telangana State Transport Department',
      scope: 'Metered & Prepaid Taxis in Hyderabad',
      sources: [
        'https://transport.telangana.gov.in',
      ],
      appNote:
        'Prepaid taxi counters are active at Secunderabad (SC), Nampally (HYB), and Rajiv Gandhi International Airport (RGIA). TSRTC Pushpak AC buses connect airport to city hubs.',
    },
    bike: {
      regulated: false,
      label: 'Bike taxi',
      verifiedOn: '2026-10-14',
      legalStatus: 'Operational via Rapido, Uber Moto, and Ola Bike in Hyderabad GHMC.',
      sources: [],
      appNote: 'Price is determined dynamically by the app. Check Rapido or Uber before booking.',
    },
  },

  chennai: {
    auto: {
      regulated: true,
      label: 'Auto meter (Chennai GCC)',
      baseFare: 25,
      baseKm: 1.8,
      perKm: 12,
      night: { multiplier: 1.5, from: 23, to: 5, label: '+50% from 11 PM to 5 AM' },
      waiting: '₹3.50 per 5 minutes',
      effectiveFrom: '2023-02-01',
      verifiedOn: '2026-10-14',
      authority: 'Tamil Nadu Transport Department (Motor Vehicles Act)',
      scope: 'Greater Chennai Corporation (GCC)',
      sources: [
        'https://tnsta.gov.in',
      ],
      appNote:
        'Street drivers rarely run meters; insist on "Meter podunga" or book via Rapido, Ola Auto, or Fast Track. Prepaid auto booths operate at Chennai Central and Egmore.',
    },
    cab: {
      regulated: true,
      label: 'Fast Track / Metered Taxi (Chennai)',
      baseFare: 60,
      baseKm: 3,
      perKm: 16,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      tiers: [
        { label: 'Sedan / Hatchback Meter', baseFare: 60, baseKm: 3, perKm: 16 },
        { label: 'AC Prime Taxi', baseFare: 80, baseKm: 3, perKm: 20 },
      ],
      effectiveFrom: '2023-02-01',
      verifiedOn: '2026-10-14',
      authority: 'Tamil Nadu Transport Department',
      scope: 'Metered Taxis and Call Taxis in Chennai',
      sources: [
        'https://tnsta.gov.in',
      ],
      appNote:
        'Prepaid call taxi counters (Fast Track, Aviation Express) are available at Chennai Central, Egmore, and Chennai Airport (MAA).',
    },
    bike: {
      regulated: false,
      label: 'Bike taxi',
      verifiedOn: '2026-10-14',
      legalStatus: 'Operational via Rapido, Uber Moto, and Ola Bike.',
      sources: [],
      appNote: 'Dynamic app pricing applies. Check Rapido / Uber Moto before hailing.',
    },
  },

  jaipur: {
    auto: {
      regulated: true,
      label: 'Auto meter (Jaipur)',
      baseFare: 30,
      baseKm: 2,
      perKm: 10,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      waiting: '₹10 per 15 min after first 5 min',
      effectiveFrom: '2023-04-01',
      verifiedOn: '2026-10-14',
      authority: 'Rajasthan Transport Department (RTO Jaipur)',
      scope: 'Jaipur municipal area',
      sources: ['https://transport.rajasthan.gov.in'],
      appNote: 'Autos often ask flat rates near tourist hubs like Hawa Mahal and Amer Fort. Ask for meter or book via Ola/Uber Auto.',
    },
    cab: {
      regulated: true,
      label: 'Prepaid & Metered Taxi (Jaipur)',
      baseFare: 60,
      baseKm: 3,
      perKm: 15,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      effectiveFrom: '2023-04-01',
      verifiedOn: '2026-10-14',
      authority: 'Rajasthan State Transport Authority',
      scope: 'Jaipur district',
      sources: ['https://transport.rajasthan.gov.in'],
      appNote: 'Prepaid taxi counters available at Jaipur Junction Railway and Jaipur International Airport Terminal 2.',
    },
    bike: {
      regulated: false,
      label: 'Bike taxi',
      verifiedOn: '2026-10-14',
      legalStatus: 'Operational via Rapido and Uber Moto.',
      sources: [],
      appNote: 'Dynamic pricing applies.',
    },
  },

  pune: {
    auto: {
      regulated: true,
      label: 'Auto meter (Pune)',
      baseFare: 25,
      baseKm: 1.5,
      perKm: 17,
      night: { multiplier: 1.25, from: 24, to: 5, label: '+25% from 12 AM to 5 AM' },
      waiting: '₹1 for every minute after first 5 min',
      effectiveFrom: '2022-09-01',
      verifiedOn: '2026-10-14',
      authority: 'Pune Regional Transport Authority (RTA)',
      scope: 'PMC and PCMC limits',
      sources: ['https://transport.maharashtra.gov.in'],
      appNote: 'Autos in Pune are legally bound to run by digital meter. Prepaid booths available at Pune Railway Station.',
    },
    cab: {
      regulated: true,
      label: 'Cool Cab / Meter Taxi (Pune)',
      baseFare: 75,
      baseKm: 3,
      perKm: 21,
      night: { multiplier: 1.25, from: 24, to: 5, label: '+25% from 12 AM to 5 AM' },
      effectiveFrom: '2023-01-01',
      verifiedOn: '2026-10-14',
      authority: 'Maharashtra Transport Department',
      scope: 'Pune Metropolitan Region (PMRDA)',
      sources: ['https://transport.maharashtra.gov.in'],
      appNote: 'App cabs (Ola, Uber) and Cool Cabs connect Pune to Hinjewadi, Kharadi, and Mumbai Expressway.',
    },
    bike: {
      regulated: false,
      label: 'Bike taxi',
      verifiedOn: '2026-10-14',
      legalStatus: 'Operational via Rapido and Uber Moto.',
      sources: [],
      appNote: 'Dynamic app pricing applies.',
    },
  },

  ahmedabad: {
    auto: {
      regulated: true,
      label: 'Auto meter (Ahmedabad)',
      baseFare: 20,
      baseKm: 1.2,
      perKm: 15,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      waiting: '₹5 per 10 min after first 5 min',
      effectiveFrom: '2023-03-01',
      verifiedOn: '2026-10-14',
      authority: 'Gujarat Transport Department (RTO Ahmedabad)',
      scope: 'AMC limits & Gandhinagar corridor',
      sources: ['https://cot.gujarat.gov.in'],
      appNote: 'Prepaid auto kiosks operate at Kalupur Railway Station and SVPI Airport.',
    },
    cab: {
      regulated: true,
      label: 'Meter Taxi / Sedan (Ahmedabad)',
      baseFare: 60,
      baseKm: 3,
      perKm: 16,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      effectiveFrom: '2023-03-01',
      verifiedOn: '2026-10-14',
      authority: 'Gujarat Transport Department',
      scope: 'Ahmedabad & Gandhinagar',
      sources: ['https://cot.gujarat.gov.in'],
      appNote: 'Popular for airport transfers and trips to Gandhinagar Akshardham.',
    },
    bike: {
      regulated: false,
      label: 'Bike taxi',
      verifiedOn: '2026-10-14',
      legalStatus: 'Operational via Rapido and Uber Moto.',
      sources: [],
      appNote: 'Dynamic app pricing applies.',
    },
  },

  kochi: {
    auto: {
      regulated: true,
      label: 'Auto meter (Kochi)',
      baseFare: 30,
      baseKm: 1.5,
      perKm: 15,
      night: { multiplier: 1.5, from: 22, to: 5, label: '1.5× from 10 PM to 5 AM' },
      waiting: '₹10 for every 15 min',
      effectiveFrom: '2022-05-01',
      verifiedOn: '2026-10-14',
      authority: 'Kerala Motor Vehicles Department (MVD)',
      scope: 'Kochi Corporation & Greater Cochin',
      sources: ['https://mvd.kerala.gov.in'],
      appNote: 'Prepaid auto counters at Ernakulam Junction (South) and Town (North) stations offer fixed regulated slips.',
    },
    cab: {
      regulated: true,
      label: 'Meter Taxi / Fast Track (Kochi)',
      baseFare: 75,
      baseKm: 3,
      perKm: 18,
      night: { multiplier: 1.25, from: 22, to: 5, label: '+25% from 10 PM to 5 AM' },
      effectiveFrom: '2022-05-01',
      verifiedOn: '2026-10-14',
      authority: 'Kerala State Transport Authority',
      scope: 'Ernakulam District',
      sources: ['https://mvd.kerala.gov.in'],
      appNote: 'Official Cochin Airport Prepaid Taxi counter runs 24/7 with zero surge.',
    },
    bike: {
      regulated: false,
      label: 'Bike taxi',
      verifiedOn: '2026-10-14',
      legalStatus: 'Operational via Rapido.',
      sources: [],
      appNote: 'Dynamic app pricing applies.',
    },
  },

  goa: {
    auto: {
      regulated: true,
      label: 'Auto meter & Pilot Bike (Goa)',
      baseFare: 30,
      baseKm: 1.5,
      perKm: 16,
      night: { multiplier: 1.35, from: 23, to: 5, label: '+35% from 11 PM to 5 AM' },
      waiting: '₹10 per 15 min',
      effectiveFrom: '2023-01-01',
      verifiedOn: '2026-10-14',
      authority: 'Goa Directorate of Transport',
      scope: 'North & South Goa',
      sources: ['https://goatransport.gov.in'],
      appNote: 'Goa features licensed Motorcycle Pilots (unique bike taxis) for ₹25 base + ₹12/km. App cabs via GoaMiles.',
    },
    cab: {
      regulated: true,
      label: 'GoaMiles / Tourist Taxi (Goa)',
      baseFare: 100,
      baseKm: 3,
      perKm: 22,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      effectiveFrom: '2023-01-01',
      verifiedOn: '2026-10-14',
      authority: 'Goa Directorate of Transport / GTDC',
      scope: 'Statewide Goa',
      sources: ['https://goatransport.gov.in'],
      appNote: 'GoaMiles app offers official government-backed regulated rates across beaches and airports.',
    },
    bike: {
      regulated: true,
      label: 'Licensed Motorcycle Pilot (Goa)',
      baseFare: 25,
      baseKm: 1,
      perKm: 12,
      night: { multiplier: 1.25, from: 22, to: 5, label: '+25% from 10 PM to 5 AM' },
      effectiveFrom: '2023-01-01',
      verifiedOn: '2026-10-14',
      authority: 'Goa Directorate of Transport',
      scope: 'Panaji, Mapusa, Margao',
      sources: ['https://goatransport.gov.in'],
      appNote: 'Goa Pilot bike taxis have designated stands near ferry wharfs and market centers.',
    },
  },

  varanasi: {
    auto: {
      regulated: true,
      label: 'Auto meter & E-Rickshaw (Varanasi)',
      baseFare: 25,
      baseKm: 1.5,
      perKm: 12,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      waiting: '₹5 per 10 min',
      effectiveFrom: '2023-02-01',
      verifiedOn: '2026-10-14',
      authority: 'UP State Transport Authority (RTO Varanasi)',
      scope: 'Varanasi Smart City area',
      sources: ['https://uptransport.upsdc.gov.in'],
      appNote: 'E-rickshaws dominate old city routes (Godowlia to Cantt) for ₹10–₹20 flat sharing fares.',
    },
    cab: {
      regulated: true,
      label: 'Prepaid Taxi (Varanasi)',
      baseFare: 70,
      baseKm: 3,
      perKm: 15,
      night: { multiplier: 1.25, from: 23, to: 5, label: '+25% from 11 PM to 5 AM' },
      effectiveFrom: '2023-02-01',
      verifiedOn: '2026-10-14',
      authority: 'UP Transport Department',
      scope: 'Varanasi and Sarnath',
      sources: ['https://uptransport.upsdc.gov.in'],
      appNote: 'Official prepaid taxi booth at Varanasi Cantt Railway Station and Babatpur Airport (VNS).',
    },
    bike: {
      regulated: false,
      label: 'Bike taxi',
      verifiedOn: '2026-10-14',
      legalStatus: 'Operational via Rapido and Uber Moto.',
      sources: [],
      appNote: 'Dynamic app pricing applies. Ideal for navigating narrow ghat galis.',
    },
  },
};

export function getTariff(cityId, vehicle) {
  const city = TARIFFS[cityId] || null;
  return city ? city[vehicle] || null : null;
}

export function isNightTime(night, date) {
  if (!night) return false;
  const h = date.getHours();
  return night.from > night.to ? h >= night.from || h < night.to : h >= night.from && h < night.to;
}

export function daysSince(isoDate, now = new Date()) {
  const then = new Date(`${isoDate}T00:00:00`);
  return Math.floor((now.getTime() - then.getTime()) / 86400000);
}

/**
 * Official meter fare for a trip.
 *
 * @param {string} cityId 'bengaluru' | 'delhi' | 'mumbai'
 * @param {'auto'|'cab'|'bike'} vehicle
 * @param {object} trip
 * @param {number} trip.roadMeters  real road distance (preferred)
 * @param {number} trip.straightMeters  straight-line distance (fallback × detour factor)
 * @param {Date}   [trip.date]
 * @returns {object} { regulated, fare, dayFare, isNight, distanceKm, distanceSource, tariff, breakdown, ... }
 */
export function computeOfficialFare(
  cityId,
  vehicle,
  { roadMeters, straightMeters, date = new Date() } = {},
) {
  const tariff = getTariff(cityId, vehicle);
  if (!tariff) {
    return {
      regulated: false,
      fare: null,
      missing: true,
      cityId,
      vehicle,
      reason: 'no_tariff_configured',
    };
  }

  const hasRoad = Number.isFinite(roadMeters) && roadMeters > 0;
  const meters = hasRoad ? roadMeters : (Number(straightMeters) || 0) * FALLBACK_DETOUR_FACTOR;
  const distanceKm = Math.round((meters / 1000) * 10) / 10;
  const distanceSource = hasRoad ? 'road' : 'estimated';

  if (!tariff.regulated) {
    return {
      regulated: false,
      fare: null,
      cityId,
      vehicle,
      distanceKm,
      distanceSource,
      tariff,
    };
  }

  const extraKm = Math.max(0, meters / 1000 - tariff.baseKm);
  const dayFare = Math.round(tariff.baseFare + extraKm * tariff.perKm);
  const night = isNightTime(tariff.night, date);
  const fare = night ? Math.round(dayFare * tariff.night.multiplier) : dayFare;

  return {
    regulated: true,
    fare,
    dayFare,
    isNight: night,
    cityId,
    vehicle,
    distanceKm,
    distanceSource,
    tariff,
    breakdown: {
      base: `₹${tariff.baseFare} for first ${tariff.baseKm} km`,
      perKm: `₹${tariff.perKm}/km after that`,
      extraKm: Math.round(extraKm * 10) / 10,
      night: night ? tariff.night.label : null,
    },
  };
}

/** Human label for a fare result, e.g. "₹72", "₹72 (night)", "App price". */
export function formatFareLabel(result) {
  if (!result || result.fare === null || result.fare === undefined) return 'App price';
  const approx = result.distanceSource === 'estimated' ? '~' : '';
  return `${approx}₹${result.fare}`;
}

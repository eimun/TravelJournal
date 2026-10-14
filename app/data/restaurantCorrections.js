/**
 * Researched corrections for the curated restaurant list (checked 2026-10-14).
 *
 * The curated list (bengaluruData.js / cityPlacesData.js) was entered by hand and its
 * hours, cuisines and some locations were guesses. Each entry here comes from public
 * listings or OpenStreetMap and names its sources. Rules applied by restaurantAudit.js:
 *   hours   – OSM opening_hours syntax; shown as "Open/Closed" only when present here
 *             or in OpenStreetMap. Otherwise hours are shown as "unverified".
 *   remove  – place could not be found anywhere (OSM, listings); hidden from the app.
 *   cuisine / area / latitude+longitude – corrected values.
 * Third-party listings sometimes disagree; `note` records the disagreement.
 * Re-check entries before relying on them for anything important.
 */

export const CORRECTIONS_CHECKED_ON = '2026-10-14';

const EAZY = (slug) => `https://www.eazydiner.com/${slug}`;

export const RESTAURANT_CORRECTIONS = {
  // ─────────────── Bengaluru ───────────────
  r_vidyarthi: {
    hours: 'Mo-Th 06:30-11:30,14:00-20:00; Sa-Su 06:30-12:00,14:30-20:00; Fr off',
    sources: [
      'https://www.openstreetmap.org (opening_hours on the matched node)',
      'https://curlytales.com/have-some-heritage-breakfast-in-the-70-year-old-vidyarthi-bhavan-in-bangalore/amp/',
      'https://yappe.in/karnataka/bengaluru/vidyarthi-bhavan/760947',
    ],
    note: 'Closed on Fridays.',
  },
  r_mtr: {
    hours: 'Tu-Su 06:30-11:00,12:30-21:00; Mo off',
    sources: ['https://www.openstreetmap.org/node/429833271', 'https://curlytales.com/relish-unlimited-thalis-iconic-mtr-bengaluru/amp/'],
    note: 'Closed on Mondays.',
  },
  r_ctr: {
    hours: 'Mo-Su 07:30-12:30,16:00-21:00',
    sources: ['https://curlytales.com/ctr-bengaluru-perfect-benne-dosa/amp/'],
    note: 'Weekly closing day not found in any listing.',
  },
  r_brahmin: {
    hours: 'Mo-Sa 06:00-12:00,15:00-19:00; Su off',
    sources: ['https://www.timeout.com/bangalore/restaurants/brahmins-coffee-bar', 'https://imvoyager.com/brahmins-coffee-bar-basavanagudi-bangalore/'],
    note: 'Closed on Sundays.',
  },
  r_airlines: {
    cuisine: 'southindian',
    sources: ['https://imvoyager.com/airlines-hotel-bangalore'],
    note: 'Known for South Indian breakfast. No reliable opening hours found.',
  },
  r_shivaji: {
    hours: 'Mo-Su 08:00-15:00',
    sources: [EAZY('bengaluru/shivaji-military-hotel-jayanagar-330810')],
  },
  r_empire: {
    hours: 'Mo-Su 12:30-23:50',
    cuisine: 'northindian',
    sources: [EAZY('bengaluru/hotel-empire-international-church-street-334597')],
    note: 'Listing shows 12:30 PM–11:50 PM; other Empire branches open from 8 AM.',
  },
  r_vvpuram: {
    sources: ['https://en.wikipedia.org/wiki/VV_Puram_Food_Street', 'https://www.onmanorama.com/food/features/2020/02/03/bengaluru-bangalore-vv-puram-food-street.html'],
    note: 'Street of stalls that gets busy from about 5 PM; no fixed closing time.',
  },
  r_koshy: {
    hours: 'Mo-Su 09:00-23:30',
    cuisine: 'continental',
    sources: [EAZY('bengaluru/koshys-st-marks-road-330539'), 'https://www.makemytrip.com/tripideas/attractions/koshy\'s'],
  },
  r_taazathindi: {
    hours: 'Mo-Su 07:00-12:00,16:30-21:30',
    sources: [EAZY('bengaluru/taaza-thindi-jayanagar-332695'), 'https://yappe.in/karnataka/bengaluru/taaza-thindi/833316'],
    note: 'One listing shows mornings only (7 AM–12 PM).',
  },
  r_thirdwave: {
    note: 'Third Wave has many Indiranagar outlets; this exact branch and its hours could not be confirmed.',
    sources: ['https://traveltriangle.com/blog/cafes-in-indiranagar/'],
  },
  r_meghana: {
    hours: 'Mo-Su 12:00-16:00,19:00-23:00',
    // Old pin was ~600 m off; Ola Maps places 57/1 Residency Rd here (checked 2026-10-14).
    latitude: 12.9728,
    longitude: 77.6092,
    sources: [EAZY('bengaluru/meghana-foods-residency-road-334874'), 'Ola Maps place details'],
  },
  r_sukhniwas: {
    remove: true,
    note: 'No Sukh Sagar outlet found on Chowdaiah Road / Sadashivanagar in OpenStreetMap or restaurant listings.',
    sources: [EAZY('bengaluru/sukh-sagar-koramangala-334752')],
  },
  r_truffles: {
    hours: 'Mo-Su 12:00-23:00',
    cuisine: 'continental',
    area: 'Koramangala 5th Block',
    latitude: 12.93356,
    longitude: 77.61432,
    sources: [EAZY('bengaluru/truffles-koramangala-334767'), 'https://www.openstreetmap.org/node/3709164638'],
    note: 'The outlet is in Koramangala 5th Block, not 7th. Listings disagree on opening time (8 AM–12 PM).',
  },
  r_asha_sweets: {
    note: 'Asha Sweet Center lists JP Nagar among its counters but publishes no address or hours for it.',
    sources: ['https://ashasweetcenter.com/pages/about-us'],
  },
  r_alco: {
    remove: true,
    note: "No \"Al's Cafe\" found on Commercial Street in OpenStreetMap or restaurant listings.",
    sources: [],
  },
  r_toit: {
    hours: 'Mo-Su 08:30-01:00',
    cuisine: 'bar',
    sources: ['https://yappe.in/karnataka/bengaluru/toit-brewpub/44737', 'https://lbb.in/bangalore/check-out-the-best-pubs-in-indiranagar/'],
  },
  r_rameshwaram: {
    hours: 'Mo-Su 06:30-01:00',
    sources: ['https://yappe.in/karnataka/bengaluru/the-rameshwaram-cafe-indiranagar/2140761', 'https://magicpin.in/Bangalore/Hal-2nd-Stage/Restaurant/The-Rameshwaram-Cafe/store/5b72aa'],
  },
  r_ammemane: {
    remove: true,
    note: 'No restaurant called Ammemane found in Saraswathipuram (OpenStreetMap or listings).',
    sources: [],
  },
  r_nagarjuna_residency: {
    hours: 'Mo-Su 12:00-15:30,19:00-23:00',
    sources: [EAZY('bengaluru/nagarjuna-residency-road-334689')],
    note: 'Closed between lunch and dinner.',
  },
  r_hole_in_the_wall: {
    cuisine: 'continental',
    sources: ['https://www.openstreetmap.org (opening_hours Tu-Su 08:00-21:00)'],
  },
  r_glen_bakehouse: {
    cuisine: 'bakery',
    area: '100 Feet Road, Indiranagar',
    sources: ['https://lbb.in/places/Glens-Bakehouse-indira-nagar-7979cf'],
    note: 'Listed at 297, 100 Feet Road, not 12th Main. No reliable hours found.',
  },
  r_new_krishna_bhavan: {
    hours: 'Mo-Su 07:30-21:00',
    sources: [EAZY('bengaluru/gopika-new-krishna-bhavan-malleshwaram-334938'), 'https://yappe.in/karnataka/bengaluru/new-krishna-bhavan/833306'],
    note: 'One listing says it closes at 9:30 PM.',
  },
  r_janatha: {
    sources: ['https://yappe.in/karnataka/bengaluru/hotel-janatha/833309'],
    note: 'Reported closed on Wednesdays; opening hours not published.',
  },
  r_corner_house_residency: {
    hours: 'Mo-Su 11:00-23:00',
    sources: [EAZY('bengaluru/corner-house-ice-cream-residency-road-334540')],
  },
  r_social_church_st: {
    hours: 'Mo-Su 09:00-00:30',
    cuisine: 'bar',
    sources: [EAZY('bengaluru/church-street-social-church-street-330194')],
  },
  r_matteo_coffea: {
    hours: 'Mo-Su 09:00-23:00',
    sources: ['https://yappe.in/karnataka/bengaluru/matteo-coffea/691777', EAZY('bengaluru/matteo-coffea-church-street-334668')],
    note: 'One listing shows a 10 AM opening.',
  },
  r_bobs_bar_indiranagar: {
    hours: 'Mo-Su 12:00-01:00',
    cuisine: 'bar',
    sources: ['https://www.timeout.com/bengaluru/bars/best-bars', 'https://magicpin.in/Bangalore/Indiranagar/Restaurant/Bobs-bar/store/19307c'],
  },
  r_chinita: {
    hours: 'Mo-Su 12:00-23:00',
    cuisine: 'continental',
    area: 'Double Road, Indiranagar',
    sources: [EAZY('bengaluru/chinita-real-mexican-food-indiranagar-330195')],
  },
  r_kota_kachori: {
    area: 'Koramangala 7th Block (opp. Forum Mall)',
    latitude: 12.93463,
    longitude: 77.61247,
    sources: ['https://platelicker.talvinder.com/restaurants/kota-kachori-koramangala', 'https://www.openstreetmap.org/node/1474351207'],
    note: 'The outlet is opposite Forum Mall in 7th Block, not 5th Block. No reliable hours found.',
  },
  r_hari_sandwich: {
    hours: 'Mo-Su 11:00-21:30',
    sources: ['https://so.city/bangalore/article/7-eateries-you-need-to-visit-where-wolf-down-mouth-watering-street-food', 'https://lbb.in/bangalore/cafes-and-restaurants-in-jayanagar'],
  },
  r_mahalakshmi_tiffin: {
    sources: ['https://www.noenthuda.com/2011/05/24/the-basavanagudi-food-arrangement/'],
    note: 'No current hours published; a 2011 source says it is closed on Saturdays.',
  },
  r_vb_bakery: {
    cuisine: 'bakery',
    sources: ['https://in.worldorgs.com/catalog/bengaluru/bakery/vb-bakery'],
    note: 'No reliable opening hours found.',
  },
  r_albert_bakery: {
    hours: 'Mo-Su 15:00-21:00',
    cuisine: 'bakery',
    sources: ['https://lbb.in/bangalore/albert-bakery-bangalore/', 'https://wanderlog.com/list/geoCategory/445975'],
    note: 'Evenings only; some listings say it opens at 3:30–4 PM.',
  },
  r_rahhams: {
    sources: ['https://yappe.in/karnataka/bengaluru/rahhams-restaurant/2081407'],
    note: 'Hours found (11:30 AM–11:30 PM) are not tied to the Frazer Town branch, so not used.',
  },
  r_karama: {
    sources: ['https://lbb.in/places/Karama-Restaurant-frazer-town-60838d'],
    note: 'Only a Ramadan-season listing (12 PM–1 AM) found, so not used.',
  },
  r_fanoos: {
    hours: 'Mo-Su 11:00-22:00',
    sources: [EAZY('bengaluru/hotel-fanoos-richmond-town-330558/reviews'), 'https://yappe.in/karnataka/bengaluru/hotel-fanoos/2081442'],
    note: 'One older listing says 12 PM–12 AM.',
  },
  r_anand_sweets_commercial: {
    hours: 'Mo-Su 09:00-22:00',
    sources: ['https://housing.com/news/sweet-shops-in-bangalore', 'https://lbb.in/places/Anand-Sweets-and-Savouries-commercial-street-9fc623'],
  },
  r_windmills_whitefield: {
    hours: 'Mo-Su 12:00-23:30',
    cuisine: 'bar',
    sources: ['https://www.mapsofworld.com/travel/blog/restaurant-review/windmills-craftworks-bangalore/amp/'],
  },
  r_udupi_park_whitefield: {
    hours: 'Mo-Su 06:30-23:00',
    sources: ['https://yappe.in/karnataka/bengaluru/sri-udupi-park/761115'],
  },
  r_shanti_sagar_rtnagar: {
    hours: 'Mo-Su 08:00-15:00,19:00-23:00',
    sources: [EAZY('bengaluru/new-shanthi-sagar-rt-nagar-335685')],
  },
  r_blossom_cafe: {
    remove: true,
    note: 'Blossom Book House is a bookshop with no cafe; the cafe below it is Matteo Coffea (already listed).',
    sources: ['https://www.outlooktraveller.com/explore/city-breaks/the-best-bookstores-in-bengaluru'],
  },
  r_empire_shivajinagar: {
    hours: 'Mo-Su 08:00-24:00',
    sources: [EAZY('bengaluru/empire-restaurant-shivajinagar-334596/about')],
  },
  r_subbamma_stores: {
    hours: 'Mo-Su 10:00-14:00,17:00-21:00',
    sources: ['https://lbb.in/bangalore/subbamma-stores-bangalore/'],
    note: 'Reportedly renamed Subramanya Condiments.',
  },
  r_cool_joint_jayanagar: {
    hours: 'Mo-Su 10:00-23:00',
    sources: [EAZY('bengaluru/cool-joint-jayanagar-335184')],
  },

  // ─────────────── Delhi ───────────────
  r_del_sitaram: {
    hours: 'Mo-Su 08:00-17:30',
    sources: ['https://so.city/delhi/article/5-historic-brekkie-places-in-paharganj-offering-yummies-under-rs-100-per-person-woah', 'https://www.savaari.com/blog/chole-bhature-places-in-delhi/'],
  },
  r_del_karim: {
    hours: 'Mo-Su 09:00-00:30',
    sources: ['https://www.delhitourism.gov.in/dt/food_tour/karim_hotels.html'],
  },
  r_del_motimahal: {
    hours: 'Mo-Su 12:00-24:00',
    sources: [EAZY('delhi-ncr/moti-mahal-daryaganj-110373')],
  },
  r_del_natraj: {
    hours: 'Mo-Su 10:30-21:30',
    sources: ['https://www.delhitourism.gov.in/dt/food_tour/natraj_dahi_bhalla.html'],
  },
  r_del_kuremal: {
    hours: 'Mo-Su 11:00-23:00',
    sources: ['https://so.city/delhi/article/on-a-delhi-kulfi-trail-these-are-the-best-places-to-gorge-on-kulfis-in-the-city'],
  },
  r_del_saravana: {
    hours: 'Mo-Su 08:00-23:00',
    sources: [EAZY('delhi-ncr/saravana-bhavan-janpath-110230')],
  },
  r_del_aslam: {
    hours: 'Mo-Su 16:00-00:30',
    sources: ['https://www.delhitourism.gov.in/dt/food_tour/aslam_butter_chicken_corner.html'],
  },
  r_del_wengers: {
    hours: 'Mo-Su 11:00-20:00',
    cuisine: 'bakery',
    sources: [EAZY('delhi-ncr/wengers-connaught-place-110083'), 'https://www.timeout.com/delhi/things-to-do/connaught-place'],
    note: 'One listing says it closes at 7 PM.',
  },
  r_del_aljawahar: {
    hours: 'Mo-Su 07:00-24:00',
    sources: ['https://delhitourism.gov.in/dt/food_tour/al-jawahar.html'],
  },

  // ─────────────── Mumbai ───────────────
  r_bom_ashok: {
    hours: 'Mo-Sa 11:00-21:30; Su off',
    sources: ['https://www.openstreetmap.org (opening_hours Mo-Sa 11:00-21:30)', 'https://migrationology.com/ashok-vada-pav-mumbai'],
    note: 'Closed on Sundays.',
  },
  r_bom_sardar: {
    hours: 'Mo-Su 12:00-02:00',
    sources: ['https://livetheworld.com/activities/india/sardar-refreshments-tardeo-mumbai'],
    note: 'One listing says it closes at midnight.',
  },
  r_bom_kyani: {
    hours: 'Mo-Su 07:00-19:30',
    sources: ['https://tablejourney.com/india/mumbai/bakeries/kyani-bakery/'],
  },
  r_bom_britannia: {
    hours: 'Mo-Sa 11:30-16:00; Su off',
    sources: ['https://www.openstreetmap.org (Mo-Sa; lists closing as 04:00, read as 4 PM for this lunch-only cafe)'],
    note: 'Lunch only, closed on Sundays.',
  },
  r_bom_bademiya: {
    hours: 'Mo-Su 12:00-03:00',
    sources: ['https://tablejourney.com/india/mumbai/late-night/'],
    note: 'Street stall hours; the indoor branch reportedly closes at midnight.',
  },
  r_bom_mahesh: {
    hours: 'Mo-Su 11:30-15:30,18:30-23:00',
    sources: [EAZY('mumbai/mahesh-lunch-home-fort-220042'), 'https://tablejourney.com/india/mumbai/casual-dining/mahesh-lunch-home-casual/'],
  },
  r_bom_bachelorr: {
    hours: 'Mo-Su 11:00-01:30',
    sources: ['https://www.sluurpy.com/it/mumbai/restaurant/4508184/bachelorr-s'],
    note: 'Another listing gives 6 PM–2 AM.',
  },
  r_bom_cafemadras: {
    hours: 'Tu-Su 07:00-14:30,16:00-22:30; Mo off',
    sources: ['https://yappe.in/maharashtra/mumbai/cafe-madras-r/83538', 'https://tablejourney.com/india/mumbai/cafes/cafe-madras/'],
    note: 'Closed on Mondays.',
  },
  r_bom_noor: {
    hours: 'Mo-Su 06:00-01:30',
    sources: [EAZY('mumbai/noor-mohammadi-hotel-girgaum-227495')],
  },
  r_bom_mondegar: {
    hours: 'Mo-Su 08:00-23:30',
    sources: ['https://yappe.in/maharashtra/mumbai/cafe-mondegar/151247', EAZY('mumbai/cafe-mondegar-colaba-222997')],
  },
};

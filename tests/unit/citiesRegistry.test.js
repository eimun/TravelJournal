import { SUPPORTED_CITIES, getCityConfig, getAllCities } from '../../app/data/citiesRegistry';
import { getCloakroomsForCity } from '../../app/data/cloakroomData';

describe('Multi-City Registry & Multi-Metro Support', () => {
  test('supports all 12 major Indian cities with complete transit configs', () => {
    const cities = getAllCities();
    expect(cities.length).toBe(12);

    const cityIds = cities.map((c) => c.id);
    expect(cityIds).toContain('bengaluru');
    expect(cityIds).toContain('delhi');
    expect(cityIds).toContain('mumbai');
    expect(cityIds).toContain('kolkata');
    expect(cityIds).toContain('hyderabad');
    expect(cityIds).toContain('chennai');
    expect(cityIds).toContain('jaipur');
    expect(cityIds).toContain('pune');
    expect(cityIds).toContain('ahmedabad');
    expect(cityIds).toContain('kochi');
    expect(cityIds).toContain('goa');
    expect(cityIds).toContain('varanasi');
  });

  test('validates city auto-meter formulas match legal gazetted rates', () => {
    const blr = getCityConfig('bengaluru');
    expect(blr.autoFareFormula.baseFare).toBe(36);
    expect(blr.autoFareFormula.baseDistanceKm).toBe(2);
    expect(blr.autoFareFormula.perKm).toBe(18);
    expect(blr.autoFareFormula.lingoPhrase).toContain('Meter haaki');

    const del = getCityConfig('delhi');
    expect(del.autoFareFormula.baseFare).toBe(30);
    expect(del.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(del.autoFareFormula.perKm).toBe(11);
    expect(del.transitAgency).toContain('DMRC');

    const bom = getCityConfig('mumbai');
    expect(bom.autoFareFormula.baseFare).toBe(27);
    expect(bom.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(bom.autoFareFormula.perKm).toBe(18.22);
    expect(bom.transitAgency).toContain('Suburban');

    const ccu = getCityConfig('kolkata');
    expect(ccu.autoFareFormula.baseFare).toBe(30);
    expect(ccu.autoFareFormula.baseDistanceKm).toBe(2);
    expect(ccu.autoFareFormula.perKm).toBe(15);
    expect(ccu.transitAgency).toContain('Metro');

    const hyd = getCityConfig('hyderabad');
    expect(hyd.autoFareFormula.baseFare).toBe(30);
    expect(hyd.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(hyd.autoFareFormula.perKm).toBe(15);
    expect(hyd.transitAgency).toContain('Hyderabad Metro');

    const maa = getCityConfig('chennai');
    expect(maa.autoFareFormula.baseFare).toBe(25);
    expect(maa.autoFareFormula.baseDistanceKm).toBe(1.8);
    expect(maa.autoFareFormula.perKm).toBe(12);
    expect(maa.transitAgency).toContain('Chennai Metro');

    const jai = getCityConfig('jaipur');
    expect(jai.autoFareFormula.baseFare).toBe(30);
    expect(jai.autoFareFormula.baseDistanceKm).toBe(2);
    expect(jai.autoFareFormula.perKm).toBe(10);
    expect(jai.transitAgency).toContain('Jaipur Metro');

    const pun = getCityConfig('pune');
    expect(pun.autoFareFormula.baseFare).toBe(25);
    expect(pun.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(pun.autoFareFormula.perKm).toBe(17);
    expect(pun.transitAgency).toContain('Pune');

    const amd = getCityConfig('ahmedabad');
    expect(amd.autoFareFormula.baseFare).toBe(20);
    expect(amd.autoFareFormula.baseDistanceKm).toBe(1.2);
    expect(amd.autoFareFormula.perKm).toBe(15);
    expect(amd.transitAgency).toContain('GMRC');

    const koc = getCityConfig('kochi');
    expect(koc.autoFareFormula.baseFare).toBe(30);
    expect(koc.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(koc.autoFareFormula.perKm).toBe(15);
    expect(koc.transitAgency).toContain('Water Metro');

    const goa = getCityConfig('goa');
    expect(goa.autoFareFormula.baseFare).toBe(30);
    expect(goa.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(goa.autoFareFormula.perKm).toBe(16);

    const vns = getCityConfig('varanasi');
    expect(vns.autoFareFormula.baseFare).toBe(25);
    expect(vns.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(vns.autoFareFormula.perKm).toBe(12);
  });

  test('returns iconic landmarks and local food legends for each city with complete name and area', () => {
    const all = getAllCities();
    for (const city of all) {
      expect(city.quickChips.length).toBeGreaterThanOrEqual(4);
      expect(city.popularHubs.length).toBeGreaterThanOrEqual(4);
      for (const dest of city.popularDestinations) {
        expect(dest.name).toBeDefined();
        expect(dest.title).toBeDefined();
        expect(dest.latitude).toBeGreaterThan(0);
        expect(dest.longitude).toBeGreaterThan(0);
      }
    }

    const del = getCityConfig('delhi');
    expect(del.popularDestinations.length).toBeGreaterThanOrEqual(4);
    expect(del.popularDestinations.some((d) => d.title.includes('Connaught Place'))).toBe(true);
    expect(del.iconicFoods.some((f) => f.name.includes('Chole Bhature'))).toBe(true);

    const bom = getCityConfig('mumbai');
    expect(bom.popularDestinations.some((d) => d.title.includes('Marine Drive'))).toBe(true);
    expect(bom.iconicFoods.some((f) => f.name.includes('Vada Pav'))).toBe(true);

    const ccu = getCityConfig('kolkata');
    expect(ccu.popularDestinations.some((d) => d.title.includes('Victoria Memorial') || d.title.includes('Howrah Bridge'))).toBe(true);
    expect(ccu.iconicFoods.some((f) => f.name.includes('Kathi Roll') || f.name.includes('Rosogolla'))).toBe(true);

    const hyd = getCityConfig('hyderabad');
    expect(hyd.popularDestinations.some((d) => d.title.includes('Charminar') || d.title.includes('Golconda'))).toBe(true);
    expect(hyd.iconicFoods.some((f) => f.name.includes('Biryani') || f.name.includes('Irani Chai'))).toBe(true);

    const maa = getCityConfig('chennai');
    expect(maa.popularDestinations.some((d) => d.title.includes('Marina Beach') || d.title.includes('Kapaleeshwarar'))).toBe(true);
    expect(maa.iconicFoods.some((f) => f.name.includes('Filter Coffee') || f.name.includes('Ghee Roast'))).toBe(true);

    const jai = getCityConfig('jaipur');
    expect(jai.popularDestinations.some((d) => d.title.includes('Hawa Mahal') || d.title.includes('Amer Fort'))).toBe(true);
    expect(jai.iconicFoods.some((f) => f.name.includes('Kachori') || f.name.includes('Dal Baati'))).toBe(true);

    const pun = getCityConfig('pune');
    expect(pun.popularDestinations.some((d) => d.title.includes('Shaniwar Wada') || d.title.includes('Aga Khan'))).toBe(true);
    expect(pun.iconicFoods.some((f) => f.name.includes('Misal') || f.name.includes('Bakarwadi'))).toBe(true);

    const amd = getCityConfig('ahmedabad');
    expect(amd.popularDestinations.some((d) => d.title.includes('Sabarmati') || d.title.includes('Atal'))).toBe(true);
    expect(amd.iconicFoods.some((f) => f.name.includes('Fafda') || f.name.includes('Khaman'))).toBe(true);

    const koc = getCityConfig('kochi');
    expect(koc.popularDestinations.some((d) => d.title.includes('Fishing Nets') || d.title.includes('Mattancherry'))).toBe(true);
    expect(koc.iconicFoods.some((f) => f.name.includes('Appam') || f.name.includes('Karimeen'))).toBe(true);

    const goa = getCityConfig('goa');
    expect(goa.popularDestinations.some((d) => d.title.includes('Bom Jesus') || d.title.includes('Aguada') || d.title.includes('Fontainhas'))).toBe(true);
    expect(goa.iconicFoods.some((f) => f.name.includes('Fish Curry') || f.name.includes('Vindaloo'))).toBe(true);

    const vns = getCityConfig('varanasi');
    expect(vns.popularDestinations.some((d) => d.title.includes('Vishwanath') || d.title.includes('Dashashwamedh') || d.title.includes('Ghat'))).toBe(true);
    expect(vns.iconicFoods.some((f) => f.name.includes('Kachori') || f.name.includes('Tamatar') || f.name.includes('Paan'))).toBe(true);
  });

  test('falls back gracefully to Bengaluru when unknown city ID is passed', () => {
    const fallback = getCityConfig('unknown_city');
    expect(fallback.id).toBe('bengaluru');
  });

  test('returns city-specific verified railway cloakrooms', () => {
    const delCloakrooms = getCloakroomsForCity('delhi');
    expect(delCloakrooms.length).toBeGreaterThanOrEqual(3);
    expect(delCloakrooms.some((c) => c.name.includes('New Delhi'))).toBe(true);

    const bomCloakrooms = getCloakroomsForCity('mumbai');
    expect(bomCloakrooms.length).toBeGreaterThanOrEqual(2);
    expect(bomCloakrooms.some((c) => c.name.includes('CSMT'))).toBe(true);

    const blrCloakrooms = getCloakroomsForCity('bengaluru');
    expect(blrCloakrooms.some((c) => c.name.includes('Majestic'))).toBe(true);

    const ccuCloakrooms = getCloakroomsForCity('kolkata');
    expect(ccuCloakrooms.length).toBeGreaterThanOrEqual(2);
    expect(ccuCloakrooms.some((c) => c.name.includes('Howrah'))).toBe(true);

    const hydCloakrooms = getCloakroomsForCity('hyderabad');
    expect(hydCloakrooms.length).toBeGreaterThanOrEqual(2);
    expect(hydCloakrooms.some((c) => c.name.includes('Secunderabad'))).toBe(true);

    const maaCloakrooms = getCloakroomsForCity('chennai');
    expect(maaCloakrooms.length).toBeGreaterThanOrEqual(2);
    expect(maaCloakrooms.some((c) => c.name.includes('Central'))).toBe(true);
  });

  test('returns city-specific restaurants and dishes for all 6 cities', () => {
    const {
      getRestaurantsForCity,
      getDishesForCity,
      getEateriesDbForCity,
      getSearchHubsForCity,
    } = require('../../app/data/cityPlacesData');

    // Delhi
    const delRestaurants = getRestaurantsForCity('delhi');
    expect(delRestaurants.length).toBeGreaterThanOrEqual(5);
    expect(delRestaurants.some((r) => r.name.includes('Sita Ram') || r.name.includes("Karim"))).toBe(true);

    const delDishes = getDishesForCity('delhi');
    expect(delDishes.some((d) => d.id === 'chole' || d.id === 'butterchicken')).toBe(true);

    const delEateries = getEateriesDbForCity('delhi');
    expect(delEateries.chole.length).toBeGreaterThan(0);

    const delHubs = getSearchHubsForCity('delhi');
    expect(delHubs.some((h) => h.name.includes('Connaught Place'))).toBe(true);

    // Mumbai
    const bomRestaurants = getRestaurantsForCity('mumbai');
    expect(bomRestaurants.length).toBeGreaterThanOrEqual(5);
    expect(bomRestaurants.some((r) => r.name.includes('Ashok Vada Pav') || r.name.includes('Sardar'))).toBe(true);

    const bomDishes = getDishesForCity('mumbai');
    expect(bomDishes.some((d) => d.id === 'vadapav' || d.id === 'pavbhaji')).toBe(true);

    const bomEateries = getEateriesDbForCity('mumbai');
    expect(bomEateries.vadapav.length).toBeGreaterThan(0);

    const bomHubs = getSearchHubsForCity('mumbai');
    expect(bomHubs.some((h) => h.name.includes('Gateway of India'))).toBe(true);

    // Kolkata
    const ccuRestaurants = getRestaurantsForCity('kolkata');
    expect(ccuRestaurants.length).toBeGreaterThanOrEqual(5);
    expect(ccuRestaurants.some((r) => r.name.includes('Peter Cat') || r.name.includes('Arsalan'))).toBe(true);

    const ccuDishes = getDishesForCity('kolkata');
    expect(ccuDishes.some((d) => d.id === 'kathi_roll' || d.id === 'biryani')).toBe(true);

    const ccuEateries = getEateriesDbForCity('kolkata');
    expect(ccuEateries.kathi_roll.length).toBeGreaterThan(0);

    const ccuHubs = getSearchHubsForCity('kolkata');
    expect(ccuHubs.some((h) => h.name.includes('Park Street') || h.name.includes('Howrah'))).toBe(true);

    // Hyderabad
    const hydRestaurants = getRestaurantsForCity('hyderabad');
    expect(hydRestaurants.length).toBeGreaterThanOrEqual(5);
    expect(hydRestaurants.some((r) => r.name.includes('Bawarchi') || r.name.includes('Paradise'))).toBe(true);

    const hydDishes = getDishesForCity('hyderabad');
    expect(hydDishes.some((d) => d.id === 'biryani' || d.id === 'haleem')).toBe(true);

    const hydEateries = getEateriesDbForCity('hyderabad');
    expect(hydEateries.biryani.length).toBeGreaterThan(0);

    const hydHubs = getSearchHubsForCity('hyderabad');
    expect(hydHubs.some((h) => h.name.includes('Charminar') || h.name.includes('Secunderabad'))).toBe(true);

    // Chennai
    const maaRestaurants = getRestaurantsForCity('chennai');
    expect(maaRestaurants.length).toBeGreaterThanOrEqual(5);
    expect(maaRestaurants.some((r) => r.name.includes('Murugan') || r.name.includes('Saravana'))).toBe(true);

    const maaDishes = getDishesForCity('chennai');
    expect(maaDishes.some((d) => d.id === 'filter_coffee' || d.id === 'ghee_dosa')).toBe(true);

    const maaEateries = getEateriesDbForCity('chennai');
    expect(maaEateries.filter_coffee.length).toBeGreaterThan(0);

    const maaHubs = getSearchHubsForCity('chennai');
    expect(maaHubs.some((h) => h.name.includes('Marina Beach') || h.name.includes('Central'))).toBe(true);
  });

  test('searches city-accurate locations via searchCityLocations', async () => {
    const { searchCityLocations } = require('../../app/services/searchService');

    const delResults = await searchCityLocations('', 'delhi');
    expect(delResults.length).toBeGreaterThan(0);
    expect(delResults.some((r) => r.name.includes('Connaught Place') || r.name.includes('New Delhi'))).toBe(true);

    const bomResults = await searchCityLocations('', 'mumbai');
    expect(bomResults.length).toBeGreaterThan(0);
    expect(bomResults.some((r) => r.name.includes('Gateway of India') || r.name.includes('CSMT'))).toBe(true);

    const blrResults = await searchCityLocations('', 'bengaluru');
    expect(blrResults.length).toBeGreaterThan(0);
    expect(blrResults.some((r) => r.name.includes('Cubbon Park') || r.name.includes('Majestic'))).toBe(true);

    const ccuResults = await searchCityLocations('', 'kolkata');
    expect(ccuResults.length).toBeGreaterThan(0);
    expect(ccuResults.some((r) => r.name.includes('Park Street') || r.name.includes('Howrah'))).toBe(true);

    const hydResults = await searchCityLocations('', 'hyderabad');
    expect(hydResults.length).toBeGreaterThan(0);
    expect(hydResults.some((r) => r.name.includes('Charminar') || r.name.includes('Secunderabad'))).toBe(true);

    const maaResults = await searchCityLocations('', 'chennai');
    expect(maaResults.length).toBeGreaterThan(0);
    expect(maaResults.some((r) => r.name.includes('Marina Beach') || r.name.includes('Central'))).toBe(true);
  });

  test('provides live environmental and local hazard advisories for all cities', () => {
    const { getCityEnvironmentalAlert } = require('../../app/data/citiesRegistry');

    const blrAlert = getCityEnvironmentalAlert('bengaluru');
    expect(blrAlert.aqi).toBe(42);
    expect(blrAlert.aqiLabel).toContain('Good');
    expect(blrAlert.headline).toContain('Clean Garden Air');
    expect(blrAlert.transitNotice).toContain('Purple & Green');

    const delAlert = getCityEnvironmentalAlert('delhi');
    expect(delAlert.aqi).toBe(268);
    expect(delAlert.aqiLabel).toContain('Smog');
    expect(delAlert.headline).toContain('High Smog Alert');
    expect(delAlert.transitNotice).toContain('DMRC running 40 extra train trips');
    expect(delAlert.badges).toContain('Wear N95 Mask');

    const bomAlert = getCityEnvironmentalAlert('mumbai');
    expect(bomAlert.aqi).toBe(64);
    expect(bomAlert.headline).toContain('High Tide Alert');
    expect(bomAlert.subtext).toContain('Suburban locals');
    expect(bomAlert.badges).toContain('🌊 High Tide 4.2m');

    const ccuAlert = getCityEnvironmentalAlert('kolkata');
    expect(ccuAlert.aqi).toBe(78);
    expect(ccuAlert.headline).toContain('Hooghly Tide');
    expect(ccuAlert.subtext).toContain('ferries');

    const hydAlert = getCityEnvironmentalAlert('hyderabad');
    expect(hydAlert.aqi).toBe(68);
    expect(hydAlert.headline).toContain('Deccan Plateau');

    const maaAlert = getCityEnvironmentalAlert('chennai');
    expect(maaAlert.aqi).toBe(54);
    expect(maaAlert.headline).toContain('Bay of Bengal');
  });

  test('strictly isolates restaurants so Bengaluru eateries never pollute other cities', () => {
    const { getRestaurantsForCity } = require('../../app/data/cityPlacesData');
    const { CITY_BOUNDS } = require('../../app/services/searchService');

    // 1. Delhi restaurants
    const delRestaurants = getRestaurantsForCity('delhi');
    const delBounds = CITY_BOUNDS.delhi;
    expect(delRestaurants.length).toBeGreaterThanOrEqual(10);

    delRestaurants.forEach((r) => {
      expect(r.latitude).toBeGreaterThan(25);
      expect(r.longitude).toBeGreaterThan(70);
      expect(r.latitude).toBeGreaterThanOrEqual(delBounds.minLat);
      expect(r.latitude).toBeLessThanOrEqual(delBounds.maxLat);
      expect(r.longitude).toBeGreaterThanOrEqual(delBounds.minLon);
      expect(r.longitude).toBeLessThanOrEqual(delBounds.maxLon);
      expect(r.area.toLowerCase()).not.toContain('bengaluru');
      expect(r.area.toLowerCase()).not.toContain('bangalore');
    });

    // 2. Mumbai restaurants
    const bomRestaurants = getRestaurantsForCity('mumbai');
    const bomBounds = CITY_BOUNDS.mumbai;
    expect(bomRestaurants.length).toBeGreaterThanOrEqual(10);

    bomRestaurants.forEach((r) => {
      expect(r.latitude).toBeGreaterThan(18);
      expect(r.longitude).toBeLessThan(75);
      expect(r.latitude).toBeGreaterThanOrEqual(bomBounds.minLat);
      expect(r.latitude).toBeLessThanOrEqual(bomBounds.maxLat);
      expect(r.longitude).toBeGreaterThanOrEqual(bomBounds.minLon);
      expect(r.longitude).toBeLessThanOrEqual(bomBounds.maxLon);
      expect(r.area.toLowerCase()).not.toContain('bengaluru');
      expect(r.area.toLowerCase()).not.toContain('bangalore');
    });

    // 3. Kolkata restaurants
    const ccuRestaurants = getRestaurantsForCity('kolkata');
    const ccuBounds = CITY_BOUNDS.kolkata;
    expect(ccuRestaurants.length).toBeGreaterThanOrEqual(10);

    ccuRestaurants.forEach((r) => {
      expect(r.latitude).toBeGreaterThan(20);
      expect(r.longitude).toBeGreaterThan(85);
      expect(r.latitude).toBeGreaterThanOrEqual(ccuBounds.minLat);
      expect(r.latitude).toBeLessThanOrEqual(ccuBounds.maxLat);
      expect(r.longitude).toBeGreaterThanOrEqual(ccuBounds.minLon);
      expect(r.longitude).toBeLessThanOrEqual(ccuBounds.maxLon);
      expect(r.area.toLowerCase()).not.toContain('bengaluru');
      expect(r.area.toLowerCase()).not.toContain('bangalore');
    });

    // 4. Hyderabad restaurants
    const hydRestaurants = getRestaurantsForCity('hyderabad');
    const hydBounds = CITY_BOUNDS.hyderabad;
    expect(hydRestaurants.length).toBeGreaterThanOrEqual(10);

    hydRestaurants.forEach((r) => {
      expect(r.latitude).toBeGreaterThan(17);
      expect(r.latitude).toBeGreaterThanOrEqual(hydBounds.minLat);
      expect(r.latitude).toBeLessThanOrEqual(hydBounds.maxLat);
      expect(r.longitude).toBeGreaterThanOrEqual(hydBounds.minLon);
      expect(r.longitude).toBeLessThanOrEqual(hydBounds.maxLon);
      expect(r.area.toLowerCase()).not.toContain('bengaluru');
      expect(r.area.toLowerCase()).not.toContain('bangalore');
    });

    // 5. Chennai restaurants
    const maaRestaurants = getRestaurantsForCity('chennai');
    const maaBounds = CITY_BOUNDS.chennai;
    expect(maaRestaurants.length).toBeGreaterThanOrEqual(10);

    maaRestaurants.forEach((r) => {
      expect(r.latitude).toBeGreaterThan(12.8);
      expect(r.latitude).toBeGreaterThanOrEqual(maaBounds.minLat);
      expect(r.latitude).toBeLessThanOrEqual(maaBounds.maxLat);
      expect(r.longitude).toBeGreaterThanOrEqual(maaBounds.minLon);
      expect(r.longitude).toBeLessThanOrEqual(maaBounds.maxLon);
      expect(r.area.toLowerCase()).not.toContain('bengaluru');
      expect(r.area.toLowerCase()).not.toContain('bangalore');
    });

    // Simulated live filter correctly rejects Bengaluru venues for other cities
    const mockBengaluruLiveVenue = {
      id: 'live_blr_123',
      name: 'Nagarjuna Andhra Meals',
      latitude: 12.9716,
      longitude: 77.5946,
      cityId: 'bengaluru',
    };

    const isWithinDelhi =
      mockBengaluruLiveVenue.cityId === 'delhi' ||
      (mockBengaluruLiveVenue.latitude >= delBounds.minLat &&
        mockBengaluruLiveVenue.latitude <= delBounds.maxLat &&
        mockBengaluruLiveVenue.longitude >= delBounds.minLon &&
        mockBengaluruLiveVenue.longitude <= delBounds.maxLon);
    expect(isWithinDelhi).toBe(false);

    const isWithinMumbai =
      mockBengaluruLiveVenue.cityId === 'mumbai' ||
      (mockBengaluruLiveVenue.latitude >= bomBounds.minLat &&
        mockBengaluruLiveVenue.latitude <= bomBounds.maxLat &&
        mockBengaluruLiveVenue.longitude >= bomBounds.minLon &&
        mockBengaluruLiveVenue.longitude <= bomBounds.maxLon);
    expect(isWithinMumbai).toBe(false);

    const isWithinKolkata =
      mockBengaluruLiveVenue.cityId === 'kolkata' ||
      (mockBengaluruLiveVenue.latitude >= ccuBounds.minLat &&
        mockBengaluruLiveVenue.latitude <= ccuBounds.maxLat &&
        mockBengaluruLiveVenue.longitude >= ccuBounds.minLon &&
        mockBengaluruLiveVenue.longitude <= ccuBounds.maxLon);
    expect(isWithinKolkata).toBe(false);

    const isWithinHyderabad =
      mockBengaluruLiveVenue.cityId === 'hyderabad' ||
      (mockBengaluruLiveVenue.latitude >= hydBounds.minLat &&
        mockBengaluruLiveVenue.latitude <= hydBounds.maxLat &&
        mockBengaluruLiveVenue.longitude >= hydBounds.minLon &&
        mockBengaluruLiveVenue.longitude <= hydBounds.maxLon);
    expect(isWithinHyderabad).toBe(false);

    const isWithinChennai =
      mockBengaluruLiveVenue.cityId === 'chennai' ||
      (mockBengaluruLiveVenue.latitude >= maaBounds.minLat &&
        mockBengaluruLiveVenue.latitude <= maaBounds.maxLat &&
        mockBengaluruLiveVenue.longitude >= maaBounds.minLon &&
        mockBengaluruLiveVenue.longitude <= maaBounds.maxLon);
    expect(isWithinChennai).toBe(false);
  });
});

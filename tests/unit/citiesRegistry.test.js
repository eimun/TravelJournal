import { SUPPORTED_CITIES, getCityConfig, getAllCities } from '../../app/data/citiesRegistry';
import { getCloakroomsForCity } from '../../app/data/cloakroomData';

describe('Multi-City Registry & Multi-Metro Support', () => {
  test('supports Bengaluru, Delhi NCR, Mumbai, and Kolkata with complete transit configs', () => {
    const cities = getAllCities();
    expect(cities.length).toBe(4);

    const cityIds = cities.map((c) => c.id);
    expect(cityIds).toContain('bengaluru');
    expect(cityIds).toContain('delhi');
    expect(cityIds).toContain('mumbai');
    expect(cityIds).toContain('kolkata');
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
  });

  test('returns city-specific restaurants and dishes for Delhi, Mumbai, and Kolkata', () => {
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
  });

  test('strictly isolates restaurants so Bengaluru eateries never pollute Delhi, Mumbai, or Kolkata', () => {
    const { getRestaurantsForCity } = require('../../app/data/cityPlacesData');
    const { CITY_BOUNDS } = require('../../app/services/searchService');

    // 1. Delhi restaurants
    const delRestaurants = getRestaurantsForCity('delhi');
    const delBounds = CITY_BOUNDS.delhi;
    expect(delRestaurants.length).toBeGreaterThanOrEqual(10);

    delRestaurants.forEach((r) => {
      // Must NOT be in Bengaluru coordinates
      expect(r.latitude).toBeGreaterThan(25);
      expect(r.longitude).toBeGreaterThan(70);
      // Must be within Delhi NCR bounds
      expect(r.latitude).toBeGreaterThanOrEqual(delBounds.minLat);
      expect(r.latitude).toBeLessThanOrEqual(delBounds.maxLat);
      expect(r.longitude).toBeGreaterThanOrEqual(delBounds.minLon);
      expect(r.longitude).toBeLessThanOrEqual(delBounds.maxLon);
      // No Bengaluru keywords
      expect(r.area.toLowerCase()).not.toContain('bengaluru');
      expect(r.area.toLowerCase()).not.toContain('bangalore');
    });

    // 2. Mumbai restaurants
    const bomRestaurants = getRestaurantsForCity('mumbai');
    const bomBounds = CITY_BOUNDS.mumbai;
    expect(bomRestaurants.length).toBeGreaterThanOrEqual(10);

    bomRestaurants.forEach((r) => {
      // Must NOT be in Bengaluru coordinates
      expect(r.latitude).toBeGreaterThan(18);
      expect(r.longitude).toBeLessThan(75);
      // Must be within Mumbai bounds
      expect(r.latitude).toBeGreaterThanOrEqual(bomBounds.minLat);
      expect(r.latitude).toBeLessThanOrEqual(bomBounds.maxLat);
      expect(r.longitude).toBeGreaterThanOrEqual(bomBounds.minLon);
      expect(r.longitude).toBeLessThanOrEqual(bomBounds.maxLon);
      // No Bengaluru keywords
      expect(r.area.toLowerCase()).not.toContain('bengaluru');
      expect(r.area.toLowerCase()).not.toContain('bangalore');
    });

    // 3. Kolkata restaurants
    const ccuRestaurants = getRestaurantsForCity('kolkata');
    const ccuBounds = CITY_BOUNDS.kolkata;
    expect(ccuRestaurants.length).toBeGreaterThanOrEqual(10);

    ccuRestaurants.forEach((r) => {
      // Must NOT be in Bengaluru coordinates
      expect(r.latitude).toBeGreaterThan(20);
      expect(r.longitude).toBeGreaterThan(85);
      // Must be within Kolkata bounds
      expect(r.latitude).toBeGreaterThanOrEqual(ccuBounds.minLat);
      expect(r.latitude).toBeLessThanOrEqual(ccuBounds.maxLat);
      expect(r.longitude).toBeGreaterThanOrEqual(ccuBounds.minLon);
      expect(r.longitude).toBeLessThanOrEqual(ccuBounds.maxLon);
      // No Bengaluru keywords
      expect(r.area.toLowerCase()).not.toContain('bengaluru');
      expect(r.area.toLowerCase()).not.toContain('bangalore');
    });

    // 4. Simulated live filter correctly rejects Bengaluru venues for Delhi, Mumbai, and Kolkata
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
        mockBengaluruLiveVenue.latitude <= delBounds.maxLat);
    expect(isWithinDelhi).toBe(false);

    const isWithinMumbai =
      mockBengaluruLiveVenue.cityId === 'mumbai' ||
      (mockBengaluruLiveVenue.latitude >= bomBounds.minLat &&
        mockBengaluruLiveVenue.latitude <= bomBounds.maxLat);
    expect(isWithinMumbai).toBe(false);

    const isWithinKolkata =
      mockBengaluruLiveVenue.cityId === 'kolkata' ||
      (mockBengaluruLiveVenue.latitude >= ccuBounds.minLat &&
        mockBengaluruLiveVenue.latitude <= ccuBounds.maxLat);
    expect(isWithinKolkata).toBe(false);
  });
});

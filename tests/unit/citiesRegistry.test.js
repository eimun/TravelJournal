import { SUPPORTED_CITIES, getCityConfig, getAllCities } from '../../app/data/citiesRegistry';
import { getCloakroomsForCity } from '../../app/data/cloakroomData';

describe('Multi-City Registry & Multi-Metro Support', () => {
  test('supports Bengaluru, Delhi NCR, and Mumbai with complete transit configs', () => {
    const cities = getAllCities();
    expect(cities.length).toBe(3);

    const cityIds = cities.map((c) => c.id);
    expect(cityIds).toContain('bengaluru');
    expect(cityIds).toContain('delhi');
    expect(cityIds).toContain('mumbai');
  });

  test('validates city auto-meter formulas match legal gazetted rates', () => {
    const blr = getCityConfig('bengaluru');
    expect(blr.autoFareFormula.baseFare).toBe(30);
    expect(blr.autoFareFormula.baseDistanceKm).toBe(2.0);
    expect(blr.autoFareFormula.perKm).toBe(15);
    expect(blr.autoFareFormula.lingoPhrase).toContain('Meter haaki');

    const del = getCityConfig('delhi');
    expect(del.autoFareFormula.baseFare).toBe(30);
    expect(del.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(del.autoFareFormula.perKm).toBe(11);
    expect(del.transitAgency).toContain('DMRC');

    const bom = getCityConfig('mumbai');
    expect(bom.autoFareFormula.baseFare).toBe(23);
    expect(bom.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(bom.autoFareFormula.perKm).toBe(15.33);
    expect(bom.transitAgency).toContain('Suburban');
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
  });

  test('returns city-specific restaurants and dishes for Delhi and Mumbai', () => {
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
  });
});

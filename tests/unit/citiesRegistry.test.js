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

  test('returns iconic landmarks and local food legends for each city', () => {
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
});

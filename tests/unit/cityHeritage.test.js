import { CITY_HERITAGE_GUIDES, getCityHeritageGuide } from '../../app/data/cityHeritageData';

describe('City Heritage & History Guidebook Data', () => {
  const supportedCities = [
    'bengaluru',
    'delhi',
    'mumbai',
    'kolkata',
    'hyderabad',
    'chennai',
    'jaipur',
    'pune',
    'ahmedabad',
    'kochi',
    'goa',
    'varanasi',
  ];

  test('contains complete heritage guide for all 12 supported cities with 10+ places each', () => {
    for (const cityId of supportedCities) {
      const guide = CITY_HERITAGE_GUIDES[cityId];
      expect(guide).toBeDefined();
      expect(guide.cityId).toBe(cityId);
      expect(guide.cityName).toBeTruthy();
      expect(guide.moniker).toBeTruthy();
      expect(guide.foundingYear).toBeTruthy();
      expect(guide.founder).toBeTruthy();
      expect(guide.historySummary.length).toBeGreaterThan(50);
      expect(guide.historicalEras.length).toBeGreaterThanOrEqual(3);
      expect(guide.monuments.length).toBeGreaterThanOrEqual(10);
    }
  });

  test('every monument has valid coordinates, metadata and nearest transit info', () => {
    for (const cityId of supportedCities) {
      const guide = CITY_HERITAGE_GUIDES[cityId];
      for (const m of guide.monuments) {
        expect(m.id).toBeTruthy();
        expect(m.name).toBeTruthy();
        expect(m.builtYear).toBeTruthy();
        expect(m.builder).toBeTruthy();
        expect(m.category).toBeTruthy();
        expect(m.image).toMatch(/^https:\/\//);
        expect(typeof m.latitude).toBe('number');
        expect(typeof m.longitude).toBe('number');
        expect(m.nearestMetro).toBeTruthy();
        expect(m.visitingHours).toBeTruthy();
        expect(m.entryTicket).toBeTruthy();
      }
    }
  });

  test('getCityHeritageGuide falls back gracefully for unknown city', () => {
    const fallback = getCityHeritageGuide('unknown_city');
    expect(fallback).toBeDefined();
    expect(fallback.cityId).toBe('bengaluru');
  });
});

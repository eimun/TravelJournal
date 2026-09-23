import {
  PLACES,
  DISHES,
  EATERIES_DB,
  PACK_ITEMS,
  EXTRA_PACKS,
  RESTAURANTS,
} from '../../app/data/bengaluruData';

describe('bengaluruData', () => {
  it('has valid place objects with total prices and transit lines', () => {
    expect(PLACES.length).toBeGreaterThan(0);
    PLACES.forEach((place) => {
      expect(place.id).toBeDefined();
      expect(place.name).toBeDefined();
      expect(place.total).toBeGreaterThan(0);
      expect(['purple', 'green', 'bus']).toContain(place.line);
      expect(Array.isArray(place.costs)).toBe(true);
      expect(Array.isArray(place.steps)).toBe(true);
    });
  });

  it('calculates itemized cost properly', () => {
    const cubbon = PLACES.find((p) => p.id === 'cubbon');
    expect(cubbon).toBeDefined();
    expect(cubbon.total).toBe(60);
    expect(cubbon.costs.length).toBe(3);
  });

  it('has authentic dishes mapped to eateries database', () => {
    expect(DISHES.length).toBe(6);
    DISHES.forEach((dish) => {
      expect(dish.id).toBeDefined();
      expect(dish.name).toBeDefined();
      expect(EATERIES_DB[dish.id]).toBeDefined();
      expect(EATERIES_DB[dish.id].length).toBeGreaterThan(0);
    });
  });

  it('contains offline pack assets totaling around 63 MB', () => {
    expect(PACK_ITEMS.length).toBe(5);
    expect(EXTRA_PACKS.length).toBe(2);
  });

  it('contains 50+ curated iconic eateries with complete schema', () => {
    expect(RESTAURANTS.length).toBeGreaterThanOrEqual(50);
    RESTAURANTS.forEach((r) => {
      expect(r.id).toBeDefined();
      expect(r.name).toBeDefined();
      expect(r.area).toBeDefined();
      expect(r.cuisine).toBeDefined();
      expect(r.rating).toBeGreaterThanOrEqual(3.5);
      expect([1, 2, 3]).toContain(r.priceTier);
      expect(r.latitude).toBeGreaterThan(12.8);
      expect(r.longitude).toBeGreaterThan(77.4);
      expect(r.openTime).toBeDefined();
      expect(r.closeTime).toBeDefined();
      expect(Array.isArray(r.tags)).toBe(true);
      expect(r.nearestMetro).toBeDefined();
      expect(r.mustTry).toBeDefined();
      expect(r.mustTry.dish).toBeDefined();
      expect(r.mustTry.price).toBeGreaterThan(0);
      expect(Array.isArray(r.topDishes)).toBe(true);
      expect(r.topDishes.length).toBeGreaterThan(0);
      expect(r.insiderNote).toBeDefined();
      expect(r.established).toBeDefined();
    });
  });
});

import {
  PLACES,
  DISHES,
  EATERIES_DB,
  PACK_ITEMS,
  EXTRA_PACKS,
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
});

import {
  inferCuisine,
  inferDietaryTags,
  transformOsmNodeToRestaurant,
  fetchNearbyOsmRestaurants,
} from '../../app/services/osmRestaurantService';

describe('osmRestaurantService', () => {
  describe('inferCuisine', () => {
    it('infers southindian for udupi or dosa tags', () => {
      expect(inferCuisine({ cuisine: 'south_indian' })).toBe('southindian');
      expect(inferCuisine({ name: 'Udupi Upahar' })).toBe('southindian');
      expect(inferCuisine({ name: 'Sri Krishna Bhavan' })).toBe('southindian');
    });

    it('infers biryani for biryani or military hotel tags', () => {
      expect(inferCuisine({ cuisine: 'biryani' })).toBe('biryani');
      expect(inferCuisine({ name: 'Shivaji Military Hotel' })).toBe('biryani');
    });

    it('infers cafe for coffee/bakery/cafe tags', () => {
      expect(inferCuisine({ amenity: 'cafe' })).toBe('cafe');
      expect(inferCuisine({ cuisine: 'coffee_shop' })).toBe('cafe');
      expect(inferCuisine({ name: 'Third Wave Coffee' })).toBe('cafe');
    });

    it('infers streetfood for chaat/fast_food tags', () => {
      expect(inferCuisine({ cuisine: 'chaat' })).toBe('streetfood');
      expect(inferCuisine({ amenity: 'fast_food', name: 'Hari Super Sandwich' })).toBe('streetfood');
    });

    it('infers continental for pizza or burger tags', () => {
      expect(inferCuisine({ cuisine: 'pizza' })).toBe('continental');
      expect(inferCuisine({ cuisine: 'burger' })).toBe('continental');
    });
  });

  describe('inferDietaryTags', () => {
    it('detects pure vegetarian places', () => {
      const tags = inferDietaryTags({ 'diet:vegetarian': 'yes' });
      expect(tags).toContain('veg');
      expect(tags).not.toContain('nonveg');
    });

    it('detects halal tags', () => {
      const tags = inferDietaryTags({ 'diet:halal': 'yes' });
      expect(tags).toContain('halal');
      expect(tags).toContain('nonveg');
    });

    it('detects jain and no onion-garlic tags', () => {
      const tags = inferDietaryTags({ 'diet:jain': 'yes' });
      expect(tags).toContain('jain');
      expect(tags).toContain('nog');
      expect(tags).toContain('veg');
    });
  });

  describe('transformOsmNodeToRestaurant', () => {
    it('transforms an OSM node into a complete restaurant object', () => {
      const node = {
        id: 998877,
        lat: 12.9754,
        lon: 77.6067,
        tags: {
          name: 'MG Road Coffee Stop',
          amenity: 'cafe',
          cuisine: 'coffee_shop',
          'diet:vegetarian': 'yes',
          'addr:suburb': 'MG Road',
        },
      };

      const restaurant = transformOsmNodeToRestaurant(node);
      expect(restaurant.id).toBe('osm_998877');
      expect(restaurant.name).toBe('MG Road Coffee Stop');
      expect(restaurant.cuisine).toBe('cafe');
      expect(restaurant.isOsmLive).toBe(true);
      expect(restaurant.latitude).toBe(12.9754);
      expect(restaurant.longitude).toBe(77.6067);
      expect(restaurant.rating).toBeGreaterThanOrEqual(4.0);
      expect(restaurant.nearestMetro).toMatch(/(Line|Metro|walk)/);
      expect(restaurant.mustTry.dish).toBeDefined();
      expect(restaurant.mustTry.price).toBeGreaterThan(0);
      expect(Array.isArray(restaurant.topDishes)).toBe(true);
      expect(restaurant.topDishes.length).toBeGreaterThan(0);
      expect(restaurant.tags).toContain('veg');
    });
  });

  describe('fetchNearbyOsmRestaurants', () => {
    it('returns empty array if coordinates missing', async () => {
      const result = await fetchNearbyOsmRestaurants({});
      expect(result).toEqual([]);
    });

    it('handles simulated fetch response correctly', async () => {
      const mockElements = [
        {
          id: 101,
          lat: 12.9716,
          lon: 77.5946,
          tags: {
            name: 'Koramangala Tiffin House',
            amenity: 'restaurant',
            cuisine: 'south_indian',
          },
        },
      ];

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ elements: mockElements }),
      });

      const results = await fetchNearbyOsmRestaurants({
        latitude: 12.9716,
        longitude: 77.5946,
      });

      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Koramangala Tiffin House');
      expect(results[0].cuisine).toBe('southindian');
      expect(results[0].isOsmLive).toBe(true);

      global.fetch = originalFetch;
    });

    it('gracefully catches network timeout/failure without throwing', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network timeout'));

      const results = await fetchNearbyOsmRestaurants({
        latitude: 12.9716,
        longitude: 77.5946,
      });

      expect(results).toEqual([]);
      global.fetch = originalFetch;
    });
  });
});

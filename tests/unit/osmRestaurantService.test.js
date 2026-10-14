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

    it('infers streetfood for chaat and fastfood for fast_food tags', () => {
      expect(inferCuisine({ cuisine: 'chaat' })).toBe('streetfood');
      expect(inferCuisine({ amenity: 'fast_food', name: 'Hari Super Sandwich' })).toBe('fastfood');
      expect(inferCuisine({ amenity: 'fast_food', name: 'Subway', cuisine: 'sandwich' })).toBe('fastfood');
    });

    it('infers continental for pizza or burger tags', () => {
      expect(inferCuisine({ cuisine: 'pizza' })).toBe('continental');
      expect(inferCuisine({ cuisine: 'burger' })).toBe('continental');
    });
  });

  describe('inferDietaryTags (OSM wiki semantics, no guessing)', () => {
    it('diet:vegetarian=only means pure veg', () => {
      expect(inferDietaryTags({ 'diet:vegetarian': 'only' })).toEqual(['veg']);
    });

    it('diet:vegetarian=yes only means veg options are available', () => {
      const tags = inferDietaryTags({ 'diet:vegetarian': 'yes' });
      expect(tags).toContain('veg_options');
      expect(tags).not.toContain('veg');
    });

    it('detects halal and jain from explicit tags', () => {
      expect(inferDietaryTags({ 'diet:halal': 'yes' })).toContain('halal');
      const jain = inferDietaryTags({ 'diet:jain': 'yes' });
      expect(jain).toContain('jain');
      expect(jain).toContain('nog');
    });

    it('does not infer diet from restaurant names like "Empire" or "Udupi"', () => {
      expect(inferDietaryTags({ name: 'Hotel Empire' })).toEqual([]);
      expect(inferDietaryTags({ name: 'Udupi Upahar' })).toEqual([]);
      expect(inferDietaryTags({ name: 'Sri Sagar Pure Veg' })).toEqual(['veg']);
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
      expect(restaurant.id).toBe('osm_node_998877');
      expect(restaurant.name).toBe('MG Road Coffee Stop');
      expect(restaurant.cuisine).toBe('cafe');
      expect(restaurant.isOsmLive).toBe(true);
      expect(restaurant.latitude).toBe(12.9754);
      expect(restaurant.longitude).toBe(77.6067);
      // OSM has no ratings or menus — they must stay empty, not be invented.
      expect(restaurant.rating).toBeNull();
      expect(restaurant.mustTry).toBeNull();
      expect(restaurant.topDishes).toEqual([]);
      expect(restaurant.nearestMetro).toMatch(/(Line|walk|auto)/);
      expect(restaurant.tags).toEqual(['veg_options']);
      expect(restaurant.area).toBe('MG Road');
      expect(restaurant.verification.osmUrl).toBe('https://www.openstreetmap.org/node/998877');
    });

    it('parses real OSM opening_hours instead of assuming hours', () => {
      const r = transformOsmNodeToRestaurant({
        id: 1,
        lat: 12.97,
        lon: 77.6,
        tags: { name: 'X', amenity: 'restaurant', opening_hours: 'Mo-Sa 07:00-22:00; Su off' },
      });
      expect(r.schedule[1]).toEqual([[420, 1320]]);
      expect(r.schedule[0]).toEqual([]);
      const none = transformOsmNodeToRestaurant({ id: 2, lat: 12.97, lon: 77.6, tags: { name: 'Y' } });
      expect(none.schedule).toBeNull();
      expect(none.hoursText).toBeNull();
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
        status: 200,
        text: async () => JSON.stringify({ elements: mockElements }),
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

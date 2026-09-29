import {
  transformGooglePlace,
  transformFoursquarePlace,
  fetchGooglePlacesRestaurants,
  fetchFoursquarePlacesRestaurants,
} from '../../app/services/placesApiService.js';

describe('placesApiService (Google Places & Foursquare)', () => {
  it('correctly transforms Google Places response to app restaurant schema', () => {
    const mockGooglePlace = {
      place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      name: 'Nagarjuna Andhra Restaurant',
      vicinity: 'Residency Road, Shanthala Nagar',
      rating: 4.5,
      user_ratings_total: 1420,
      price_level: 2,
      types: ['restaurant', 'food', 'point_of_interest'],
      geometry: {
        location: {
          lat: 12.9716,
          lng: 77.5946,
        },
      },
      opening_hours: {
        open_now: true,
      },
    };

    const restaurant = transformGooglePlace(mockGooglePlace, 'MOCK_KEY');

    expect(restaurant.id).toBe('gplace_ChIJN1t_tDeuEmsRUsoyG83frY4');
    expect(restaurant.name).toBe('Nagarjuna Andhra Restaurant');
    expect(restaurant.area).toBe('Residency Road, Shanthala Nagar');
    expect(restaurant.rating).toBe(4.5);
    expect(restaurant.userRatingCount).toBe(1420);
    expect(restaurant.priceTier).toBe(2);
    expect(restaurant.source).toBe('google');
    expect(restaurant.nearestMetro).toBeDefined();
    expect(restaurant.mustTry).toBeDefined();
  });

  it('correctly transforms Foursquare v3 Places response to app restaurant schema', () => {
    const mockFsqPlace = {
      fsq_id: '4b058814f964a52026af22e3',
      name: 'CTR Shri Sagar',
      categories: [{ id: 13000, name: 'South Indian Restaurant' }],
      geocodes: {
        main: {
          latitude: 13.0027,
          longitude: 77.566,
        },
      },
      location: {
        formatted_address: '7th Cross Road, Margosa Rd, Malleshwaram',
        locality: 'Malleshwaram',
      },
      rating: 9.2, // Out of 10
      stats: {
        total_ratings: 890,
      },
      price: 1,
      photos: [
        {
          prefix: 'https://fastly.4sqi.net/img/general/',
          suffix: '/584829_abc.jpg',
        },
      ],
    };

    const restaurant = transformFoursquarePlace(mockFsqPlace);

    expect(restaurant.id).toBe('fsq_4b058814f964a52026af22e3');
    expect(restaurant.name).toBe('CTR Shri Sagar');
    expect(restaurant.area).toBe('Malleshwaram');
    expect(restaurant.rating).toBe(4.6); // 9.2 / 2 = 4.6
    expect(restaurant.priceTier).toBe(1);
    expect(restaurant.source).toBe('foursquare');
    expect(restaurant.image).toBe('https://fastly.4sqi.net/img/general/800x600/584829_abc.jpg');
    expect(restaurant.cuisine).toBe('southindian');
  });

  it('safely handles missing API keys without throwing uncaught errors', async () => {
    const googleResults = await fetchGooglePlacesRestaurants({
      latitude: 12.9716,
      longitude: 77.5946,
      apiKey: '',
    });
    expect(googleResults).toEqual([]);

    const fsqResults = await fetchFoursquarePlacesRestaurants({
      latitude: 12.9716,
      longitude: 77.5946,
      apiKey: '',
    });
    expect(fsqResults).toEqual([]);
  });
});

import React from 'react';
import { act, render } from '@testing-library/react-native';
import { TripProvider, useTrip } from '../../src/context/TripContext';

// GPS answers only when the test says so.
let resolveGps;
jest.mock('../../app/services/locationService', () => {
  const actual = jest.requireActual('../../app/services/locationService');
  return {
    ...actual,
    getCurrentUserLocation: jest.fn(
      () =>
        new Promise((resolve) => {
          resolveGps = resolve;
        }),
    ),
  };
});
// No network in unit tests.
jest.mock('../../app/services/directionsService', () => {
  const actual = jest.requireActual('../../app/services/directionsService');
  return {
    ...actual,
    fetchRoadDistance: jest.fn(() => Promise.resolve(null)),
    enrichRouteWithRealRoads: jest.fn((route) => Promise.resolve(route)),
  };
});
jest.mock('../../app/services/osmRestaurantService', () => {
  const actual = jest.requireActual('../../app/services/osmRestaurantService');
  return { ...actual, fetchNearbyOsmRestaurants: jest.fn(() => Promise.resolve([])) };
});

let ctx;
function Probe() {
  ctx = useTrip();
  return null;
}

it('a late startup GPS fix does not overwrite the city the user switched to', async () => {
  await render(
    <TripProvider>
      <Probe />
    </TripProvider>,
  );

  await act(async () => ctx.switchCity('mumbai'));
  expect(ctx.userLocation.name).toContain('CSMT');

  // GPS (in Bengaluru) answers after the switch.
  await act(async () => {
    resolveGps({
      latitude: 12.976,
      longitude: 77.607,
      name: 'Shivajinagar',
      isDefault: false,
      source: 'gps',
    });
  });

  expect(ctx.cityId).toBe('mumbai');
  expect(ctx.userLocation.name).toContain('CSMT');
  expect(ctx.multimodalPlan.distanceKm).toBeLessThan(10);
});

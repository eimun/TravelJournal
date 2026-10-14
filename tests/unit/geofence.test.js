import {
  distanceMeters,
  radiusForStop,
  evaluateCheckIns,
  addVisitedStop,
  trailProgress,
  DEFAULT_RADIUS_BY_TYPE,
} from '../../src/domain/geofence';

describe('domain/geofence', () => {
  describe('distanceMeters', () => {
    it('returns 0 for the same point', () => {
      expect(distanceMeters(12.9716, 77.5946, 12.9716, 77.5946)).toBe(0);
    });

    it('measures a known short distance within tolerance', () => {
      // Majestic (12.9767, 77.5713) to Lalbagh West Gate (12.9634, 77.5773) ~ 1.6 km
      const d = distanceMeters(12.9767, 77.5713, 12.9634, 77.5773);
      expect(d).toBeGreaterThan(1400);
      expect(d).toBeLessThan(1800);
    });

    it('returns null for invalid input', () => {
      expect(distanceMeters(null, 77.5, 12.9, 77.5)).toBeNull();
      expect(distanceMeters(12.9, NaN, 12.9, 77.5)).toBeNull();
    });
  });

  describe('radiusForStop', () => {
    it('uses the type default when no override given', () => {
      expect(radiusForStop({ type: 'market' })).toBe(DEFAULT_RADIUS_BY_TYPE.market);
      expect(radiusForStop({ type: 'eatery' })).toBe(DEFAULT_RADIUS_BY_TYPE.eatery);
    });

    it('falls back to 90m for unknown types', () => {
      expect(radiusForStop({ type: 'volcano' })).toBe(90);
      expect(radiusForStop(null)).toBe(90);
    });

    it('honours and clamps explicit overrides', () => {
      expect(radiusForStop({ type: 'temple', checkInRadiusM: 55 })).toBe(55);
      expect(radiusForStop({ type: 'temple', checkInRadiusM: 10 })).toBe(40);
      expect(radiusForStop({ type: 'temple', checkInRadiusM: 500 })).toBe(200);
    });
  });

  describe('evaluateCheckIns', () => {
    const stops = [
      { id: 's1', type: 'eatery', latitude: 12.9716, longitude: 77.5946 },
      { id: 's2', type: 'park', latitude: 12.9717, longitude: 77.5947 },
      { id: 's3', type: 'temple', latitude: 13.5, longitude: 78.5 },
    ];

    it('checks in stops within radius', () => {
      // user is essentially on top of s1 (~14m away, within 60m) and s2 (~14m, within 140m)
      const result = evaluateCheckIns(stops, { latitude: 12.97156, longitude: 77.59456 });
      expect(result).toEqual([true, true, false]);
    });

    it('rejects a user far from everything', () => {
      const result = evaluateCheckIns(stops, { latitude: 13.0, longitude: 78.0 });
      expect(result).toEqual([false, false, false]);
    });

    it('returns all false for a bad position', () => {
      expect(evaluateCheckIns(stops, null)).toEqual([false, false, false]);
      expect(evaluateCheckIns(stops, { latitude: 'x', longitude: 77 })).toEqual([
        false,
        false,
        false,
      ]);
    });

    it('handles malformed stops gracefully', () => {
      const result = evaluateCheckIns([{ id: 'bad' }], { latitude: 12, longitude: 77 });
      expect(result).toEqual([false]);
    });
  });

  describe('addVisitedStop', () => {
    it('appends new ids preserving order', () => {
      expect(addVisitedStop(['a'], 'b')).toEqual(['a', 'b']);
    });

    it('is idempotent', () => {
      expect(addVisitedStop(['a', 'b'], 'a')).toEqual(['a', 'b']);
    });

    it('tolerates non-array input', () => {
      expect(addVisitedStop(null, 'a')).toEqual(['a']);
    });
  });

  describe('trailProgress', () => {
    const stops = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

    it('counts the leading visited prefix', () => {
      expect(trailProgress(stops, [])).toBe(0);
      expect(trailProgress(stops, ['a'])).toBe(1);
      expect(trailProgress(stops, ['a', 'b'])).toBe(2);
      expect(trailProgress(stops, ['a', 'b', 'c'])).toBe(3);
    });

    it('does not count out-of-order visits beyond the first gap', () => {
      expect(trailProgress(stops, ['a', 'c'])).toBe(1);
      expect(trailProgress(stops, ['b', 'c'])).toBe(0);
    });

    it('handles empty input', () => {
      expect(trailProgress([], ['a'])).toBe(0);
      expect(trailProgress(stops, null)).toBe(0);
    });
  });
});

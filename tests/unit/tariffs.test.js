import {
  computeOfficialFare,
  daysSince,
  FALLBACK_DETOUR_FACTOR,
  isNightTime,
  TARIFFS,
} from '../../src/domain/tariffs';

const noon = new Date('2026-10-14T12:00:00');

describe('official tariffs', () => {
  it('Bengaluru auto: minimum ₹36 covers the first 2 km of road', () => {
    expect(computeOfficialFare('bengaluru', 'auto', { roadMeters: 500, date: noon }).fare).toBe(36);
    expect(computeOfficialFare('bengaluru', 'auto', { roadMeters: 2000, date: noon }).fare).toBe(
      36,
    );
    expect(computeOfficialFare('bengaluru', 'auto', { roadMeters: 2500, date: noon }).fare).toBe(
      45,
    );
  });

  it('night windows wrap past midnight correctly', () => {
    const blr = TARIFFS.bengaluru.auto.night; // 22 → 5
    expect(isNightTime(blr, new Date('2026-10-14T22:00:00'))).toBe(true);
    expect(isNightTime(blr, new Date('2026-10-14T04:59:00'))).toBe(true);
    expect(isNightTime(blr, new Date('2026-10-14T05:00:00'))).toBe(false);
    const mum = TARIFFS.mumbai.auto.night; // 0 → 5
    expect(isNightTime(mum, new Date('2026-10-14T23:59:00'))).toBe(false);
    expect(isNightTime(mum, new Date('2026-10-14T00:10:00'))).toBe(true);
  });

  it('uses road distance when known, otherwise straight line × detour factor', () => {
    const road = computeOfficialFare('bengaluru', 'auto', {
      roadMeters: 6000,
      straightMeters: 4000,
      date: noon,
    });
    expect(road.distanceSource).toBe('road');
    expect(road.fare).toBe(36 + 4 * 18);
    const est = computeOfficialFare('bengaluru', 'auto', { straightMeters: 4000, date: noon });
    expect(est.distanceSource).toBe('estimated');
    expect(est.fare).toBe(Math.round(36 + (4 * FALLBACK_DETOUR_FACTOR - 2) * 18));
  });

  it('returns no number for unregulated vehicles and flags missing tariffs', () => {
    const bike = computeOfficialFare('bengaluru', 'bike', { roadMeters: 3000, date: noon });
    expect(bike.regulated).toBe(false);
    expect(bike.fare).toBeNull();
    const missing = computeOfficialFare('chennai', 'auto', { roadMeters: 3000 });
    expect(missing.missing).toBe(true);
    expect(missing.fare).toBeNull();
  });

  it('every tariff has been verified within the staleness window used by the app', () => {
    const now = new Date('2026-10-14T12:00:00');
    for (const city of Object.values(TARIFFS)) {
      for (const t of Object.values(city)) {
        expect(daysSince(t.verifiedOn, now)).toBeLessThanOrEqual(180);
      }
    }
  });
});

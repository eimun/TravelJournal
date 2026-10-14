import {
  getTimeSurgeContext,
  calculateDynamicFareMatrix,
  BENGALURU_RTO_CONFIG,
} from '../../src/domain/dynamicFare';

describe('Fare matrix (official tariffs only)', () => {
  describe('getTimeSurgeContext (traffic advice, never changes fares)', () => {
    it('detects morning rush 08:30–11:30', () => {
      const ctx = getTimeSurgeContext(new Date('2026-09-29T09:30:00'));
      expect(ctx.period).toBe('morning_peak');
      expect(ctx.label).toContain('Morning');
      expect(ctx.surgeMultiplier).toBeUndefined();
    });

    it('detects evening rush 17:00–20:30', () => {
      const ctx = getTimeSurgeContext(new Date('2026-09-29T18:45:00'));
      expect(ctx.period).toBe('evening_peak');
      expect(ctx.label).toContain('Evening');
    });

    it('uses the city night window from the tariff (Bengaluru 22:00–05:00)', () => {
      expect(getTimeSurgeContext(new Date('2026-09-29T23:15:00')).period).toBe('night');
      expect(getTimeSurgeContext(new Date('2026-09-29T21:59:00')).period).not.toBe('night');
    });

    it('uses Mumbai night window (00:00–05:00) for Mumbai', () => {
      expect(getTimeSurgeContext(new Date('2026-09-29T23:15:00'), 'mumbai').period).not.toBe('night');
      expect(getTimeSurgeContext(new Date('2026-09-30T00:30:00'), 'mumbai').period).toBe('night');
    });
  });

  describe('calculateDynamicFareMatrix', () => {
    const noon = new Date('2026-09-29T14:00:00');

    it('applies the Bengaluru minimum fare ₹36 for road trips up to 2 km', () => {
      const m = calculateDynamicFareMatrix(1000, noon, { roadMeters: 1800 });
      expect(m.providers.rtoMeter.fare).toBe(36);
      expect(m.providers.rtoMeter.tag).toBe('OFFICIAL TARIFF');
      expect(m.distanceSource).toBe('road');
    });

    it('applies ₹18/km after 2 km (5 km road → 36 + 3×18 = ₹90)', () => {
      const m = calculateDynamicFareMatrix(4000, noon, { roadMeters: 5000 });
      expect(m.providers.rtoMeter.fare).toBe(90);
    });

    it('applies the 1.5× night tariff after 10 PM', () => {
      const m = calculateDynamicFareMatrix(4000, new Date('2026-09-29T23:00:00'), { roadMeters: 5000 });
      expect(m.providers.rtoMeter.fare).toBe(135);
      expect(m.surge.isNight).toBe(true);
    });

    it('falls back to straight-line × 1.34 when road distance is unknown and marks it', () => {
      const m = calculateDynamicFareMatrix(5000, noon);
      expect(m.distanceSource).toBe('estimated');
      expect(m.distanceKm).toBeCloseTo(6.7, 1);
      expect(m.providers.rtoMeter.fareText.startsWith('~₹')).toBe(true);
    });

    it('uses the Karnataka uniform cab fare (₹100 first 4 km, ₹24/km)', () => {
      expect(calculateDynamicFareMatrix(3000, noon, { roadMeters: 3000 }).providers.cab.fare).toBe(100);
      expect(calculateDynamicFareMatrix(9000, noon, { roadMeters: 10000 }).providers.cab.fare).toBe(244);
    });

    it('never invents app prices or an unregulated bike-taxi fare', () => {
      const m = calculateDynamicFareMatrix(3000, noon, { roadMeters: 3500 });
      expect(m.providers.appAuto.fare).toBeNull();
      expect(m.providers.appAuto.fareText).toBe('Set by app');
      expect(m.providers.bike.fare).toBeNull();
      expect(m.providers.bike.tag).toBe('NO GOVT TARIFF');
    });

    it('uses the Maharashtra bike-taxi tariff in Mumbai (₹15 first 1.5 km, ₹10.27/km)', () => {
      const m = calculateDynamicFareMatrix(3000, noon, { cityId: 'mumbai', roadMeters: 3500 });
      expect(m.providers.bike.fare).toBe(Math.round(15 + 2 * 10.27));
      expect(m.providers.rtoMeter.fare).toBe(Math.round(27 + 2 * 18.22));
    });

    it('keeps the backwards-compatible Bengaluru config in sync with the tariff', () => {
      expect(BENGALURU_RTO_CONFIG.flagfallFare).toBe(36);
      expect(BENGALURU_RTO_CONFIG.perKmRate).toBe(18);
    });

    it('provides negotiation phrases', () => {
      expect(calculateDynamicFareMatrix(3000).negotiationPhrase.kannada).toContain('Meter hakisi banni');
    });
  });
});

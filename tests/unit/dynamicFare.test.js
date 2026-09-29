import {
  getTimeSurgeContext,
  calculateDynamicFareMatrix,
  BENGALURU_RTO_CONFIG,
} from '../../src/domain/dynamicFare';

describe('Dynamic Auto & Cab Fare Engine', () => {
  describe('getTimeSurgeContext', () => {
    it('detects morning peak rush (08:30 to 11:30) with 1.4x-1.6x surge', () => {
      const morningDate = new Date('2026-09-29T09:30:00');
      const ctx = getTimeSurgeContext(morningDate);

      expect(ctx.period).toBe('morning_peak');
      expect(ctx.surgeMultiplier).toBeGreaterThanOrEqual(1.4);
      expect(ctx.label || ctx.surgeLabel).toContain('Morning');
    });

    it('detects evening peak gridlock (17:00 to 20:30) with highest surge multiplier', () => {
      const eveningDate = new Date('2026-09-29T18:45:00');
      const ctx = getTimeSurgeContext(eveningDate);

      expect(ctx.period).toBe('evening_peak');
      expect(ctx.surgeMultiplier).toBeGreaterThanOrEqual(1.6);
      expect(ctx.label || ctx.surgeLabel).toContain('Evening');
    });

    it('enforces legal 1.5x night surcharge from 10:00 PM to 05:00 AM', () => {
      const nightDate = new Date('2026-09-29T23:15:00');
      const ctx = getTimeSurgeContext(nightDate);

      expect(ctx.period).toBe('night');
      expect(ctx.surgeMultiplier).toBe(1.5);
      expect(ctx.label || ctx.surgeLabel).toContain('Night');
    });

    it('detects midday off-peak (11:30 to 17:00) with near-base rates', () => {
      const middayDate = new Date('2026-09-29T14:00:00');
      const ctx = getTimeSurgeContext(middayDate);

      expect(ctx.period).toBe('midday_normal');
      expect(ctx.surgeMultiplier).toBeLessThanOrEqual(1.1);
    });
  });

  describe('calculateDynamicFareMatrix', () => {
    it('accurately calculates RTO base flagfall of ₹30 for distances under 2km', () => {
      const date = new Date('2026-09-29T14:00:00'); // off-peak
      const matrix = calculateDynamicFareMatrix(1500, date);

      expect(matrix.providers.rtoMeter.fare).toBe(30);
      expect(matrix.providers.rtoMeter.tag).toBe('OFFICIAL TARIFF');
    });

    it('accurately calculates RTO incremental rate (₹15/km) for 5km trip', () => {
      const date = new Date('2026-09-29T14:00:00');
      // 5km: 2km flagfall (₹30) + 3km @ ₹15 = ₹75
      const matrix = calculateDynamicFareMatrix(5000, date);

      expect(matrix.providers.rtoMeter.fare).toBe(75);
    });

    it('calculates provider differentials (Uber surging higher than Namma Yatri and RTO meter)', () => {
      const eveningRushDate = new Date('2026-09-29T18:30:00');
      const matrix = calculateDynamicFareMatrix(4000, eveningRushDate);

      const rto = matrix.providers.rtoMeter.fare;
      const nammaYatri = matrix.providers.nammaYatri.fare;
      const uberOla = matrix.providers.uberOla.fare;
      const streetQuote = matrix.providers.streetQuote.fare;

      expect(nammaYatri).toBeGreaterThanOrEqual(rto);
      expect(uberOla).toBeGreaterThan(nammaYatri);
      expect(streetQuote).toBeGreaterThan(uberOla);
    });

    it('provides Kannada negotiation phrase for commuters and parents', () => {
      const matrix = calculateDynamicFareMatrix(3000);

      expect(matrix.negotiationPhrase).toBeDefined();
      expect(matrix.negotiationPhrase.kannada).toContain('Meter hakisi banni');
      expect(matrix.negotiationPhrase.hindi).toContain('मीटर');
    });
  });
});

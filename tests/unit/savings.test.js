import {
  computeSavings,
  foodEquivalents,
  savingsSentence,
  walletTotals,
} from '../../src/domain/savings';

const MENUS = [
  { id: 'dosa', name: 'Benne Masala Dosa', priceInr: 85 },
  { id: 'idli', name: 'Idli Plate', priceInr: 45 },
  { id: 'coffee', name: 'Filter Coffee', priceInr: 30 },
];

describe('domain/savings', () => {
  describe('computeSavings', () => {
    it('computes direct-cab savings rounded', () => {
      expect(computeSavings(580, 60)).toEqual({
        savedInr: 520,
        isEstimate: true,
        hasData: true,
      });
    });

    it('floors negative results to zero (multimodal costlier than cab)', () => {
      expect(computeSavings(50, 80).savedInr).toBe(0);
    });

    it('reports missing data cleanly', () => {
      expect(computeSavings(null, 60)).toEqual({
        savedInr: 0,
        isEstimate: false,
        hasData: false,
      });
      expect(computeSavings(NaN, 60).hasData).toBe(false);
      expect(computeSavings(100, undefined).hasData).toBe(false);
    });
  });

  describe('foodEquivalents', () => {
    it('greedily converts by most expensive first', () => {
      // 520 = 6 dosas (510) + 0 idli... then falls to coffee? remaining 10 < 30 → stop
      expect(foodEquivalents(520, MENUS)).toEqual([
        { id: 'dosa', name: 'Benne Masala Dosa', count: 6 },
      ]);
    });

    it('cascades down the menu tiers', () => {
      // 100 = 1 dosa (85) + 0 idli (45 > 15 left) ... coffee (30) too — remaining 15 → nothing
      expect(foodEquivalents(160, MENUS)).toEqual([
        { id: 'dosa', name: 'Benne Masala Dosa', count: 1 },
        { id: 'idli', name: 'Idli Plate', count: 1 },
        { id: 'coffee', name: 'Filter Coffee', count: 1 },
      ]);
    });

    it('returns empty for junk input', () => {
      expect(foodEquivalents(-5, MENUS)).toEqual([]);
      expect(foodEquivalents(NaN, MENUS)).toEqual([]);
      expect(foodEquivalents(100, null)).toEqual([]);
      expect(foodEquivalents(100, [{ id: 'x', priceInr: 0 }])).toEqual([]);
    });
  });

  describe('savingsSentence', () => {
    it('builds a friendly sentence', () => {
      const s = savingsSentence(520, MENUS);
      expect(s).toContain('₹520');
      expect(s).toContain('6 Benne Masala Dosas');
    });

    it('returns null when nothing converts', () => {
      expect(savingsSentence(0, MENUS)).toBeNull();
    });
  });

  describe('walletTotals', () => {
    it('folds events into a total and per-day breakdown', () => {
      const wallet = walletTotals([
        { id: 'e1', amountInr: 120, occurredAt: '2026-10-01T09:00:00Z' },
        { id: 'e2', amountInr: 80, occurredAt: '2026-10-01T15:00:00Z' },
        { id: 'e3', amountInr: 300, occurredAt: '2026-10-02T10:00:00Z' },
      ]);
      expect(wallet.totalInr).toBe(500);
      expect(wallet.events).toBe(3);
      expect(wallet.days).toEqual([
        { day: '2026-10-01', amountInr: 200 },
        { day: '2026-10-02', amountInr: 300 },
      ]);
    });

    it('tolerates malformed events', () => {
      const wallet = walletTotals([
        { id: 'e1', amountInr: 100, occurredAt: '2026-10-01' },
        null,
        { id: 'e2', amountInr: 'nan' },
      ]);
      expect(wallet.totalInr).toBe(100);
      expect(wallet.events).toBe(3);
      expect(wallet.days).toEqual([{ day: '2026-10-01', amountInr: 100 }]);
    });

    it('handles empty input', () => {
      expect(walletTotals([])).toEqual({ totalInr: 0, events: 0, days: [] });
      expect(walletTotals(null)).toEqual({ totalInr: 0, events: 0, days: [] });
    });
  });
});

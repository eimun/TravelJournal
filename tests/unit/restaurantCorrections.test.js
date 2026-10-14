import { RESTAURANTS } from '../../app/data/bengaluruData';
import { DELHI_RESTAURANTS, MUMBAI_RESTAURANTS } from '../../app/data/cityPlacesData';
import { RESTAURANT_CORRECTIONS } from '../../app/data/restaurantCorrections';
import { withVerification } from '../../app/services/restaurantAudit';
import { getOpenStatus, parseOsmOpeningHours } from '../../src/domain/openingHours';
import { restaurantOpenStatus } from '../../app/screens/ExploreScreen';

const ALL = [
  ...RESTAURANTS.map((r) => [r, 'bengaluru']),
  ...DELHI_RESTAURANTS.map((r) => [r, 'delhi']),
  ...MUMBAI_RESTAURANTS.map((r) => [r, 'mumbai']),
];
const byId = (id) => {
  const [r, city] = ALL.find(([x]) => x.id === id);
  return withVerification(r, city);
};
// 2026-10-12 is a Monday.
const at = (iso) => new Date(iso);

describe('researched restaurant corrections', () => {
  it('every correction refers to an existing restaurant and parses', () => {
    const ids = new Set(ALL.map(([r]) => r.id));
    for (const [id, fix] of Object.entries(RESTAURANT_CORRECTIONS)) {
      expect(ids.has(id)).toBe(true);
      if (fix.hours) expect(parseOsmOpeningHours(fix.hours)).not.toBeNull();
      expect(Array.isArray(fix.sources)).toBe(true);
    }
  });

  it('hides places that could not be found anywhere', () => {
    for (const id of ['r_sukhniwas', 'r_ammemane', 'r_alco', 'r_blossom_cafe']) {
      expect(byId(id).removed).toBe(true);
    }
  });

  it('uses researched hours: MTR is closed on Monday, Nagarjuna closes between lunch and dinner', () => {
    const mtr = byId('r_mtr');
    expect(mtr.hoursVerified).toBe(true);
    expect(getOpenStatus(mtr.schedule, at('2026-10-12T09:00:00')).isOpen).toBe(false);
    const nag = byId('r_nagarjuna_residency');
    expect(getOpenStatus(nag.schedule, at('2026-10-13T17:00:00')).isOpen).toBe(false);
    expect(getOpenStatus(nag.schedule, at('2026-10-13T20:00:00')).isOpen).toBe(true);
  });

  it('applies corrected cuisine and location', () => {
    expect(byId('r_toit').cuisine).toBe('bar');
    expect(byId('r_albert_bakery').cuisine).toBe('bakery');
    const truffles = byId('r_truffles');
    expect(truffles.area).toBe('Koramangala 5th Block');
    expect(truffles.latitude).toBeCloseTo(12.93356, 4);
    expect(truffles.verification.status).toBe('location_corrected');
  });

  it('never shows a guessed schedule as open or closed', () => {
    const halli = byId('r_halli_mane');
    expect(halli.hoursVerified).toBe(false);
    expect(restaurantOpenStatus(halli)).toEqual({ known: false, isOpen: null, label: 'Hours unverified' });
  });
});

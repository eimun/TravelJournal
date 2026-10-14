import {
  dedupeOlaPlaces,
  localityFromTerms,
  scheduleFromOlaPeriods,
  transformOlaPlace,
} from '../../app/services/olaMapsService';
import { getOpenStatus } from '../../src/domain/openingHours';

// Real shape returned by Ola Advanced Place Details for Vidyarthi Bhavan (2026-10-14).
const VIDYARTHI_PERIODS = [
  { open: { day: 1, time: '0630' }, close: { day: 1, time: '1130' } },
  { open: { day: 1, time: '1400' }, close: { day: 1, time: '2000' } },
  { open: { day: 6, time: '0630' }, close: { day: 6, time: '1200' } },
  { open: { day: 7, time: '0630' }, close: { day: 7, time: '1200' } },
];

describe('olaMapsService', () => {
  it('maps Ola day 7 to Sunday and keeps split sessions', () => {
    const s = scheduleFromOlaPeriods(VIDYARTHI_PERIODS);
    expect(s[1]).toEqual([
      [390, 690],
      [840, 1200],
    ]);
    expect(s[0]).toEqual([[390, 720]]); // Sunday
    expect(s[5]).toEqual([]); // Friday closed
    expect(getOpenStatus(s, new Date('2026-10-12T15:00:00')).isOpen).toBe(true); // Monday
  });

  it('treats "NA" periods as no hours instead of guessing', () => {
    expect(
      scheduleFromOlaPeriods([{ open: { day: 0, time: 'NA' }, close: { day: 0, time: 'NA' } }]),
    ).toBeNull();
    expect(scheduleFromOlaPeriods([])).toBeNull();
  });

  it('handles ranges past midnight', () => {
    const s = scheduleFromOlaPeriods([
      { open: { day: 5, time: '1800' }, close: { day: 6, time: '0130' } },
    ]);
    expect(s[5]).toEqual([[1080, 1530]]);
  });

  it('never invents ratings, phone or website from "NA"/0/-1 values', () => {
    const r = transformOlaPlace(
      {
        place_id: 'ola-platform:1',
        name: 'Meghana Foods',
        geometry: { location: { lat: 12.9728, lng: 77.6092 } },
        types: ['restaurant'],
        rating: -1,
        user_ratings_total: 0,
        formatted_phone_number: 'NA',
        website: 'NA',
        opening_hours: {
          periods: [{ open: { day: 0, time: 'NA' }, close: { day: 0, time: 'NA' } }],
        },
      },
      { place_id: 'ola-platform:1', description: '57/1, Residency Rd, Bengaluru', terms: [] },
      'bengaluru',
    );
    expect(r.rating).toBeNull();
    expect(r.phone).toBeNull();
    expect(r.website).toBeNull();
    expect(r.schedule).toBeNull();
    expect(r.hoursVerified).toBe(false);
    expect(r.verification.status).toBe('live_ola');
    expect(r.address).toBe('57/1, Residency Rd, Bengaluru');
  });

  it('merges duplicate Ola records of the same place', () => {
    const a = {
      name: 'Church Street Social',
      latitude: 12.9749,
      longitude: 77.6052,
      schedule: null,
    };
    const b = {
      name: 'Church Street Social',
      latitude: 12.97495,
      longitude: 77.60525,
      schedule: { 1: [] },
    };
    const c = { name: 'Mirage', latitude: 12.97, longitude: 77.6, schedule: null };
    const out = dedupeOlaPlaces([a, b, c]);
    expect(out).toHaveLength(2);
    expect(out[0].schedule).not.toBeNull();
  });
});

describe('localityFromTerms', () => {
  it('returns the locality just before the city', () => {
    const terms = [
      'Meghana Foods',
      '57/1',
      'Residency Rd',
      'Next To Old Galaxy Theatre',
      'Ashok Nagar',
      'Bengaluru',
      'Karnataka',
      '560025',
      'India',
    ].map((value) => ({ value }));
    expect(localityFromTerms(terms)).toBe('Ashok Nagar');
    expect(localityFromTerms([{ value: 'Bengaluru' }])).toBeNull();
    expect(localityFromTerms(undefined)).toBeNull();
  });
});

it('does not call a restaurant a cafe just because of its name', () => {
  const r = transformOlaPlace(
    {
      place_id: 'x',
      name: 'Hard Rock Cafe Bengaluru',
      geometry: { location: { lat: 12.97, lng: 77.6 } },
      types: ['restaurant'],
    },
    null,
    'bengaluru',
  );
  expect(r.cuisine).not.toBe('cafe');
});

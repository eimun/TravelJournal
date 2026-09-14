import { composeAllIn, formatRupees, parseCostAmount } from '../../src/domain/cost';
import { assembleDay } from '../../src/domain/budgetFit';
import { haversine, walkMinutes } from '../../src/domain/distance';
import { meterEstimate, transitFare } from '../../src/domain/fare';
import { classifyFreshness } from '../../src/domain/freshness';
import { matchesDiet } from '../../src/domain/diet';

describe('Domain: Cost Composition', () => {
  it('parses number and free strings correctly', () => {
    expect(parseCostAmount(50)).toBe(50);
    expect(parseCostAmount('Free')).toBe(0);
    expect(parseCostAmount('₹40')).toBe(40);
  });

  it('composes all-in costs with Free detection', () => {
    const costs = [
      { label: 'Entry', amount: 'Free' },
      { label: 'Metro', amount: '₹40' },
      { label: 'Snack', amount: '₹20' },
    ];
    const res = composeAllIn(costs);
    expect(res.total).toBe(60);
    expect(res.hasFreeEntry).toBe(true);
    expect(res.formattedTotal).toBe('₹60');
  });

  it('formats rupees with commas', () => {
    expect(formatRupees(1500)).toBe('₹1,500');
    expect(formatRupees(0)).toBe('₹0');
  });
});

describe('Domain: Budget-Fit Day Assembly', () => {
  const places = [
    { id: 'p1', name: 'Park', total: 60 },
    { id: 'p2', name: 'Temple', total: 75 },
    { id: 'p3', name: 'Garden', total: 105 },
    { id: 'p4', name: 'Food Street', total: 190 },
    { id: 'p5', name: 'Palace', total: 320 },
    { id: 'p6', name: 'Hills', total: 360 },
  ];

  it('assembles up to 4 places fitting budget ₹300', () => {
    const res = assembleDay(places, 300);
    expect(res.total).toBeLessThanOrEqual(300);
    expect(res.stops.length).toBeLessThanOrEqual(4);
    expect(res.spare).toBe(300 - res.total);
  });

  it('caps at maxStops = 4 on generous budget', () => {
    const res = assembleDay(places, 5000);
    expect(res.stops.length).toBe(4);
    expect(res.total).toBe(60 + 75 + 105 + 190);
  });
});

describe('Domain: Distance & Walking Time', () => {
  it('computes distance between Cubbon Park and Lalbagh', () => {
    // Cubbon Park (12.9763, 77.5929) to Lalbagh (12.9507, 77.5848) ~ 3 km
    const dist = haversine(12.9763, 77.5929, 12.9507, 77.5848);
    expect(dist).toBeGreaterThan(2500);
    expect(dist).toBeLessThan(3500);
  });

  it('computes realistic walking minutes', () => {
    expect(walkMinutes(750)).toBe(10);
    expect(walkMinutes(0)).toBe(0);
  });
});

describe('Domain: Auto & Transit Fare', () => {
  it('estimates fair auto meter price for short hop', () => {
    const res = meterEstimate(1000); // 1 km -> base flagfall ₹30
    expect(res.fair).toBe(30);
    expect(res.isShortHop).toBe(true);
  });

  it('estimates auto meter fare for longer journey', () => {
    const res = meterEstimate(5000); // 5 km -> 30 + 3*15 = 75
    expect(res.fair).toBe(75);
    expect(res.expectedQuote).toBeGreaterThan(res.fair);
  });

  it('resolves distance band transit fare', () => {
    const fares = [
      { band_from_km: 0, band_to_km: 2, amount: 10 },
      { band_from_km: 2, band_to_km: 5, amount: 20 },
      { band_from_km: 5, band_to_km: 12, amount: 30 },
    ];
    expect(transitFare(fares, 4)).toBe(20);
    expect(transitFare(fares, 8)).toBe(30);
  });
});

describe('Domain: Freshness Classification', () => {
  it('marks unverified or disputed fields', () => {
    expect(classifyFreshness('2026-08-12', 'fare', true).status).toBe('disputed');
    expect(classifyFreshness(null, 'fare').status).toBe('stale');
  });

  it('marks current fields within threshold', () => {
    const today = new Date('2026-08-20');
    const res = classifyFreshness('2026-08-12', 'fare', false, today);
    expect(res.status).toBe('current');
    expect(res.isStale).toBe(false);
  });

  it('marks stale fields past threshold', () => {
    const today = new Date('2027-01-01');
    const res = classifyFreshness('2026-08-12', 'fare', false, today);
    expect(res.status).toBe('stale');
    expect(res.isStale).toBe(true);
  });
});

describe('Domain: Dietary Matching', () => {
  it('matches veg, jain, and no-onion-garlic tags', () => {
    const eatery = ['veg', 'nog', 'cash'];
    expect(matchesDiet(eatery, ['veg'])).toBe(true);
    expect(matchesDiet(eatery, ['nog'])).toBe(true);
    expect(matchesDiet(eatery, ['jain'])).toBe(true);
    expect(matchesDiet(eatery, ['halal'])).toBe(false);
  });

  it('excludes nonveg when veg filter is active', () => {
    const nonvegEatery = ['nonveg', 'halal'];
    expect(matchesDiet(nonvegEatery, ['veg'])).toBe(false);
    expect(matchesDiet(nonvegEatery, ['halal'])).toBe(true);
  });
});

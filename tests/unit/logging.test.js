import {
  __resetLoggerForTests,
  addSink,
  FEATURES,
  getEntries,
  getIssues,
  log,
  redact,
  reportIssue,
} from '../../src/logging/logger';
import { ISSUE_CATALOG, SEVERITY } from '../../src/logging/issueCatalog';
import { loggedFetch } from '../../src/logging/loggedFetch';
import { getOfficialFare, __resetFareAuditForTests } from '../../app/services/fareService';
import {
  auditRestaurants,
  withVerification,
  __resetRestaurantAuditForTests,
} from '../../app/services/restaurantAudit';
import { RESTAURANTS } from '../../app/data/bengaluruData';

beforeEach(() => {
  __resetLoggerForTests();
  __resetFareAuditForTests();
  __resetRestaurantAuditForTests();
});

describe('logger', () => {
  it('writes structured entries to the buffer and sinks', () => {
    const seen = [];
    addSink({ write: (e) => seen.push(e) });
    log.info(FEATURES.FOOD, 'test.event', { a: 1 });
    const [e] = getEntries();
    expect(e).toMatchObject({ lvl: 'info', f: 'FOOD', ev: 'test.event', data: { a: 1 } });
    expect(typeof e.sid).toBe('string');
    expect(seen).toHaveLength(1);
  });

  it('redacts API keys and bearer tokens', () => {
    expect(redact('https://x.com/a?key=SECRET123&b=1')).toBe('https://x.com/a?key=<redacted>&b=1');
    expect(redact('Authorization: Bearer abc.def')).toBe('Authorization: Bearer <redacted>');
  });

  it('classifies issues via the catalog and de-duplicates repeats', () => {
    reportIssue('FARE_INVALID', { key: 'bengaluru:auto', message: 'NaN' });
    reportIssue('FARE_INVALID', { key: 'bengaluru:auto', message: 'NaN' });
    reportIssue('FOOD_NOT_VERIFIED', { key: 'r_x' });
    const major = getIssues({ severity: SEVERITY.MAJOR });
    const minor = getIssues({ severity: SEVERITY.MINOR });
    expect(major).toHaveLength(1);
    expect(major[0].count).toBe(2);
    expect(minor.map((i) => i.code)).toEqual(['FOOD_NOT_VERIFIED']);
    // first occurrence logged loudly, repeat only at debug level
    const issueEntries = getEntries().filter((e) => e.code === 'FARE_INVALID');
    expect(issueEntries.map((e) => e.lvl)).toEqual(['error', 'debug']);
  });

  it('every catalog entry has a severity, feature, title and fix hint', () => {
    for (const def of Object.values(ISSUE_CATALOG)) {
      expect([SEVERITY.MAJOR, SEVERITY.MINOR]).toContain(def.severity);
      expect(def.feature).toBeTruthy();
      expect(def.title).toBeTruthy();
      expect(def.hint).toBeTruthy();
    }
  });
});

describe('loggedFetch', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('logs HTTP errors with the provider body and reports a minor network issue', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 429, text: async () => 'rate limited' });
    const res = await loggedFetch('https://api.example.com/x?key=abc', { name: 'demo' });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(429);
    const issue = getIssues()[0];
    expect(issue.code).toBe('NET_REQUEST_FAILED');
    expect(issue.data.body).toBe('rate limited');
    expect(JSON.stringify(getEntries())).not.toContain('key=abc');
  });

  it('never throws on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    const res = await loggedFetch('https://api.example.com', { name: 'demo2' });
    expect(res).toMatchObject({ ok: false, status: 0, error: 'network error' });
  });
});

describe('runtime audits', () => {
  it('flags estimated road distance on longer trips (minor) but not short hops', () => {
    getOfficialFare('bengaluru', 'auto', { straightMeters: 1000 }, 'short');
    expect(getIssues()).toHaveLength(0);
    getOfficialFare('bengaluru', 'auto', { straightMeters: 6000 }, 'long');
    expect(getIssues().map((i) => i.code)).toEqual(['FARE_ROAD_DISTANCE_ESTIMATED']);
  });

  it('reports a MAJOR issue when a city has no tariff', () => {
    getOfficialFare('chennai', 'auto', { straightMeters: 3000 }, 'x');
    expect(getIssues({ severity: SEVERITY.MAJOR })[0].code).toBe('FARE_TARIFF_MISSING');
  });

  it('merges OSM verification: corrected pin, hidden unsourced rating, computed station', () => {
    const mtr = withVerification(
      RESTAURANTS.find((r) => r.id === 'r_mtr'),
      'bengaluru',
    );
    expect(mtr.verification.status).toBe('location_corrected');
    expect(mtr.verification.originalCoords).toEqual({ latitude: 12.951, longitude: 77.579 });
    expect(mtr.latitude).not.toBe(12.951);
    expect(mtr.rating).toBeNull();
    expect(mtr.nearestMetro).toMatch(/Line/);
  });

  it('audit reports corrected pins and unverified places as MINOR (app already shows the fix)', () => {
    const list = RESTAURANTS.map((r) => withVerification(r, 'bengaluru'));
    const counts = auditRestaurants(list, 'bengaluru');
    expect(counts.total).toBe(RESTAURANTS.length);
    const codes = getIssues().map((i) => i.code);
    expect(codes).toContain('FOOD_LOCATION_MISMATCH');
    expect(codes).toContain('FOOD_NOT_VERIFIED');
    expect(getIssues({ severity: SEVERITY.MAJOR })).toHaveLength(0);
  });
});

describe('implausible trip guard', () => {
  it('flags a fare computed for a cross-city distance as MAJOR', () => {
    __resetLoggerForTests();
    getOfficialFare('mumbai', 'auto', { straightMeters: 835000 }, 'direct');
    const [issue] = getIssues({ severity: SEVERITY.MAJOR });
    expect(issue.code).toBe('FARE_IMPLAUSIBLE_TRIP');
    expect(issue.message).toContain('835 km');
  });
});

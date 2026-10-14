import {
  describeSchedule,
  getOpenStatus,
  parseOsmOpeningHours,
  scheduleFromOpenClose,
} from '../../src/domain/openingHours';

// 2026-10-14 is a Wednesday.
const at = (hhmm, day = '2026-10-14') => new Date(`${day}T${hhmm}:00`);

describe('openingHours', () => {
  it('parses simple daily hours', () => {
    const s = parseOsmOpeningHours('Mo-Su 07:00-22:30');
    expect(s[3]).toEqual([[420, 1350]]);
    expect(getOpenStatus(s, at('12:00')).label).toBe('Open · until 22:30');
    expect(getOpenStatus(s, at('06:00')).label).toBe('Closed · opens 07:00');
  });

  it('handles split shifts (Vidyarthi Bhavan style)', () => {
    const s = parseOsmOpeningHours('06:30-11:30,14:00-20:00');
    expect(getOpenStatus(s, at('12:30')).label).toBe('Closed · opens 14:00');
    expect(getOpenStatus(s, at('15:00')).isOpen).toBe(true);
  });

  it('handles a weekly closing day, later rule overriding', () => {
    const s = parseOsmOpeningHours('Mo-Su 06:30-21:00; We off');
    const st = getOpenStatus(s, at('10:00'));
    expect(st.isOpen).toBe(false);
    expect(st.label).toBe('Closed · opens tomorrow 06:30');
    expect(describeSchedule(s)).toBe('06:30–21:00 · Closed Wed');
  });

  it('handles ranges past midnight (curated 11:00–02:00)', () => {
    const s = scheduleFromOpenClose('11:00', '02:00');
    expect(getOpenStatus(s, at('01:30')).label).toBe('Open · until 02:00');
    expect(getOpenStatus(s, at('23:00')).isOpen).toBe(true);
    expect(getOpenStatus(s, at('03:00')).isOpen).toBe(false);
  });

  it('supports 24/7 and day lists', () => {
    expect(getOpenStatus(parseOsmOpeningHours('24/7'), at('03:00')).isOpen).toBe(true);
    const s = parseOsmOpeningHours('Mo,We,Fr 10:00-18:00');
    expect(getOpenStatus(s, at('12:00')).isOpen).toBe(true);
    expect(getOpenStatus(s, at('12:00', '2026-10-13')).isOpen).toBe(false);
  });

  it('handles comma-separated additional rules (Vidyarthi Bhavan on OSM)', () => {
    const s = parseOsmOpeningHours(
      'Mo-Th 06:30-11:30, Mo-Th 14:00-20:00, Sa-Su 06:30-12:00, Sa-Su 14:30-20:00',
    );
    expect(s[1]).toEqual([
      [390, 690],
      [840, 1200],
    ]);
    expect(s[5]).toEqual([]); // Friday: no rule → closed
    expect(getOpenStatus(s, at('15:00')).isOpen).toBe(true); // Wednesday afternoon
  });

  it('returns null for syntax it does not understand instead of guessing', () => {
    expect(parseOsmOpeningHours('Jan-Mar Mo-Fr 08:00-12:00')).toBeNull();
    expect(parseOsmOpeningHours('sunrise-sunset')).toBeNull();
    expect(parseOsmOpeningHours('')).toBeNull();
    expect(getOpenStatus(null)).toEqual({
      known: false,
      isOpen: null,
      label: 'Hours not available',
    });
  });
});

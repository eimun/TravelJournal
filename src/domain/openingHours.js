/**
 * Domain: restaurant opening hours.
 *
 * Supports the common subset of the OpenStreetMap `opening_hours` syntax
 * (https://wiki.openstreetmap.org/wiki/Key:opening_hours):
 *   "24/7" · "Mo-Su 07:00-22:30" · "06:30-11:30,14:30-20:00" · "Mo-Sa 08:00-22:00; Su off"
 *   "Tu-Su 12:00-15:30,19:00-23:00" · "Mo,We,Fr 10:00-18:00" · overnight "18:00-02:00"
 * Anything outside that subset (months, PH, sunrise, week numbers…) returns null so
 * the UI can show the raw string instead of guessing.
 *
 * Schedule shape: { 0: [[startMin, endMin], …], …, 6: […] } with 0 = Sunday and
 * endMin possibly > 1440 for ranges that run past midnight.
 */

const DAY_INDEX = { Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6 };
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

function toMinutes(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 24 || min > 59) return null;
  return h * 60 + min;
}

function parseTimes(text) {
  const ranges = [];
  for (const part of text.split(',')) {
    const m = /^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/.exec(part);
    if (!m) return null;
    const start = toMinutes(m[1]);
    let end = toMinutes(m[2]);
    if (start === null || end === null) return null;
    if (end <= start) end += 1440; // runs past midnight
    ranges.push([start, end]);
  }
  return ranges;
}

function parseDays(text) {
  const days = new Set();
  for (const part of text.split(',')) {
    const m = /^(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?$/.exec(part.trim());
    if (!m) return null;
    const a = DAY_INDEX[m[1]];
    const b = m[2] ? DAY_INDEX[m[2]] : a;
    for (let d = a; ; d = (d + 1) % 7) {
      days.add(d);
      if (d === b) break;
    }
  }
  return [...days];
}

/** Parses an OSM opening_hours string. Returns a schedule or null if unsupported. */
export function parseOsmOpeningHours(value) {
  if (!value || typeof value !== 'string') return null;
  const text = value.trim();
  if (text === '24/7') {
    const s = {};
    ALL_DAYS.forEach((d) => (s[d] = [[0, 1440]]));
    return s;
  }
  const schedule = {};
  ALL_DAYS.forEach((d) => (schedule[d] = []));
  let sawRule = false;

  for (const rawRule of text.split(';')) {
    const rule = rawRule.trim();
    if (!rule) continue;
    const m =
      /^((?:(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?)(?:\s*,\s*(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)?\s*(.*)$/.exec(
        rule,
      );
    if (!m) return null;
    const days = m[1] ? parseDays(m[1].replace(/\s+/g, '')) : ALL_DAYS;
    if (!days) return null;
    const rest = (m[2] || '').trim();
    let ranges;
    if (rest === 'off' || rest === 'closed') ranges = [];
    else if (rest === '')
      return null; // day selector without times — ambiguous
    else ranges = parseTimes(rest);
    if (!ranges) return null;
    // OSM semantics: a later rule replaces earlier rules for the days it names.
    days.forEach((d) => (schedule[d] = ranges.map((r) => [...r])));
    sawRule = true;
  }
  return sawRule ? schedule : null;
}

/** Curated "6:30" / "11:30" pair → daily schedule (overnight if close ≤ open). */
export function scheduleFromOpenClose(openTime, closeTime) {
  if (!openTime || !closeTime) return null;
  const ranges = parseTimes(`${openTime.padStart(5, '0')}-${closeTime.padStart(5, '0')}`);
  if (!ranges) return null;
  const s = {};
  ALL_DAYS.forEach((d) => (s[d] = ranges.map((r) => [...r])));
  return s;
}

function fmt(min) {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/**
 * @returns {{known: boolean, isOpen: boolean|null, label: string, closesAt?: string, opensAt?: string}}
 */
export function getOpenStatus(schedule, date = new Date()) {
  if (!schedule) return { known: false, isOpen: null, label: 'Hours not available' };
  const day = date.getDay();
  const now = date.getHours() * 60 + date.getMinutes();
  const yesterday = (day + 6) % 7;

  // Yesterday's ranges that spill past midnight.
  for (const [s, e] of schedule[yesterday] || []) {
    if (e > 1440 && now < e - 1440) {
      return { known: true, isOpen: true, label: `Open · until ${fmt(e)}`, closesAt: fmt(e) };
    }
  }
  for (const [s, e] of schedule[day] || []) {
    if (now >= s && now < e) {
      return { known: true, isOpen: true, label: `Open · until ${fmt(e)}`, closesAt: fmt(e) };
    }
  }
  const later = (schedule[day] || []).filter(([s]) => s > now).sort((a, b) => a[0] - b[0]);
  if (later.length) {
    return {
      known: true,
      isOpen: false,
      label: `Closed · opens ${fmt(later[0][0])}`,
      opensAt: fmt(later[0][0]),
    };
  }
  for (let i = 1; i <= 7; i += 1) {
    const d = (day + i) % 7;
    const ranges = (schedule[d] || []).slice().sort((a, b) => a[0] - b[0]);
    if (ranges.length) {
      const when = i === 1 ? 'tomorrow' : DAY_NAMES[d];
      return {
        known: true,
        isOpen: false,
        label: `Closed · opens ${when} ${fmt(ranges[0][0])}`,
        opensAt: fmt(ranges[0][0]),
      };
    }
  }
  return { known: true, isOpen: false, label: 'Closed' };
}

/** Short human summary of a schedule, e.g. "06:30–11:30, 14:30–20:00 · Closed Fri". */
export function describeSchedule(schedule) {
  if (!schedule) return null;
  const key = (d) => JSON.stringify(schedule[d] || []);
  const counts = {};
  ALL_DAYS.forEach((d) => (counts[key(d)] = (counts[key(d)] || 0) + 1));
  const common = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const ranges = JSON.parse(common);
  const base = ranges.length ? ranges.map(([s, e]) => `${fmt(s)}–${fmt(e)}`).join(', ') : 'Closed';
  const exceptions = ALL_DAYS.filter((d) => key(d) !== common).map((d) =>
    (schedule[d] || []).length
      ? `${DAY_NAMES[d]} ${schedule[d].map(([s, e]) => `${fmt(s)}–${fmt(e)}`).join(', ')}`
      : `Closed ${DAY_NAMES[d]}`,
  );
  return [base, ...exceptions].join(' · ');
}

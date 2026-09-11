/**
 * Fixture data for the app shell.
 *
 * TEMPORARY: this stands in for the repository layer until `feat/F-08-sqlite`
 * lands `src/repositories/*`. The shapes here deliberately mirror the SQLite
 * schema in PRD 7.1 (trips / days / activities / journal_entries) so swapping
 * the source is a one-line change per screen, not a rewrite.
 *
 * The packing checklist is NOT here — it is derived from the forecast by
 * `src/domain/weather.suggestItems`, because it changes with the weather.
 */

export const trip = {
  id: 'trip-hanoi',
  title: 'Hanoi → Ha Long',
  destination: 'Hanoi',
  dayIndex: 3,
  dayCount: 8,
  budget: 85000,
  spent: 31240,
  currency: 'INR',
  travellerName: 'Anant',
  cachedAgo: '2h ago',
};

/** Today's activities. `state` is derived at render time in the real build. */
export const todayActivities = [
  { id: 'a1', name: 'Phở at Bát Đàn', meta: '08:30 · Old Quarter', state: 'done' },
  { id: 'a2', name: 'Train Street coffee', meta: '10:00 · with Mai', state: 'done' },
  { id: 'a3', name: 'Temple of Literature', meta: '13:30 · 1.4 km away', state: 'next' },
  {
    id: 'a4',
    name: 'Water puppet show',
    meta: '19:00 · clashes with night market',
    state: 'clash',
  },
];

/** The next timed activity, used for the countdown card. 13:30 in minutes. */
export const nextActivity = {
  id: 'a3',
  name: 'Temple of Literature',
  startMinutes: 13 * 60 + 30,
  meta: '13:30 · 1.4 km away · walk 18 min',
};

/**
 * The trail: one stone per day sheet.
 *
 * `offset` is the horizontal indent in dp that gives the trail its wander — it
 * is layout, not data, and comes straight from the design canvas. The day at
 * `flaggedIndex` carries the weather's risk flag.
 */
export const trailDays = [
  { date: 'MON 14', title: 'Land in Hanoi', meta: '3 stops · logged', state: 'done', offset: 14 },
  {
    date: 'TUE 15',
    title: 'Old Quarter loop',
    meta: '5 stops · 2 memories',
    state: 'done',
    offset: 62,
  },
  { date: 'WED 16', title: 'Today', meta: '4 stops · 1 clash', state: 'now', offset: 0 },
  {
    date: 'THU 17',
    title: 'Ha Long cruise',
    meta: '2 stops · ferry 07:10',
    state: 'todo',
    offset: 66,
  },
  { date: 'FRI 18', title: 'Cat Ba island', meta: 'no stops yet', state: 'todo', offset: 10 },
  { date: 'SAT 19', title: 'Tam Coc boats', meta: '1 stop', state: 'todo', offset: 58 },
  { date: 'SUN 20', title: 'Fly to Hoi An', meta: 'ticket saved', state: 'todo', offset: 18 },
  { date: 'MON 21', title: 'Home', meta: 'recap ready after', state: 'todo', offset: 54 },
];

/** The Ha Long day carries the weather flag — it is the one with a ferry. */
export const FLAGGED_DAY_INDEX = 3;

/** Opened when a trail stone is tapped. */
export const daySheetRows = [
  {
    id: 's1',
    time: '07:10',
    name: 'Ferry to Ha Long',
    meta: 'Ticket saved as PDF · opens offline',
  },
  { id: 's2', time: '12:00', name: 'Cruise boarding', meta: 'Bay Legend · booking 4471' },
  { id: 's3', time: '19:00', name: 'Squid fishing off deck', meta: 'Optional · pay onboard' },
];

/** Saved places drawn on the Map tab, positioned as fractions of the map area. */
export const mapPins = [
  { id: 'p1', x: 0.38, y: 0.3, sage: false },
  { id: 'p2', x: 0.58, y: 0.44, sage: false },
  { id: 'p3', x: 0.3, y: 0.55, sage: false },
  { id: 'p4', x: 0.66, y: 0.64, sage: true },
];

export const searchResult = {
  name: 'Bún chả Hương Liên',
  meta: '4.6 · 700 m from your hotel',
};

/** Journal entries, newest first — journalRepo.listByTrip in the real build. */
export const journalEntries = [
  {
    id: 'j1',
    day: 'Day 2',
    geo: 'Hoan Kiem · GPS stamped',
    text: 'Rain came at five and the whole street moved under one awning. Bought a coffee I did not need just to stay dry.',
    tint: 'accent',
  },
  {
    id: 'j2',
    day: 'Day 2',
    geo: 'Train Street · GPS stamped',
    text: 'The 15:20 passes close enough to move your hair. Everyone claps afterwards, then goes back to their tea.',
    tint: 'accent2',
  },
  {
    id: 'j3',
    day: 'Day 1',
    geo: 'Noi Bai · no signal',
    text: 'Landed, no data pack, and the itinerary opened anyway. That was the whole point of building this.',
    tint: 'neutral',
  },
];

/** Per-trip storage, surfaced to the user as PRD 12.2 requires. */
export const storageBreakdown = [
  { id: 'photos', label: 'Photos', megabytes: 128, tint: 'accent' },
  { id: 'documents', label: 'Documents', megabytes: 61, tint: 'accent2' },
  { id: 'database', label: 'Database', megabytes: 24, tint: 'neutral' },
];

export const settingRows = [
  { id: 'notifications', label: 'Notifications', meta: 'Activity reminders 30 min before' },
  { id: 'location', label: 'Location', meta: 'Only while the map is open' },
  { id: 'darkTrail', label: 'Dark trail', meta: 'Follow the system theme instead' },
  { id: 'pin', label: 'PIN lock', meta: 'Ask on every open' },
];

export default {
  trip,
  todayActivities,
  nextActivity,
  trailDays,
  daySheetRows,
  mapPins,
  searchResult,
  journalEntries,
  storageBreakdown,
  settingRows,
};

/**
 * Fixture data for the Home screen.
 *
 * TEMPORARY: this stands in for the repository layer until `feat/F-08-sqlite`
 * lands `src/repositories/*`. The shape here deliberately mirrors the SQLite
 * schema in PRD 7.1 (trips / days / activities / checklist_items) so swapping
 * the source is a one-line change in HomeScreen, not a rewrite.
 */

export const trip = {
  id: 'trip-hanoi',
  title: 'Vietnam, north to south',
  destination: 'Hanoi',
  dayIndex: 3,
  dayCount: 8,
  budget: 85000,
  spent: 31240,
  currency: 'INR',
  travellerName: 'Anant',
};

/** Weather is cached — PRD 4.4 says offline always serves the cached copy, labelled. */
export const weather = {
  condition: 'rain',
  temp: '28°',
  description: 'Light rain later',
  advice: 'Rain from 15:00 — take the shell',
  fetchedAgo: '2h ago',
  source: 'cached',
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
 * is layout, not data, and comes straight from the design canvas.
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

/** Seeded by `domain/packing.suggestItems(tripLength, forecast)` in the real build. */
export const packingItems = [
  { id: 'p1', label: 'Passport + visa print', done: true },
  { id: 'p2', label: 'Power bank', done: true },
  { id: 'p3', label: 'Rain shell', done: false },
  { id: 'p4', label: 'Dry bag for the phone', done: false },
  { id: 'p5', label: 'Quick-dry shoes', done: false },
];

export default { trip, weather, todayActivities, nextActivity, trailDays, packingItems };

/**
 * The cached weather reading, and everything the app derives from it.
 *
 * This is the spine of the concept: one cached reading drives the ground tint,
 * the sky band, the ambient layer, the mascot's gear, the next-up advisory, the
 * trail's risk flag and the whole packing quest. Changing the condition changes
 * the app's mood, not just a number.
 *
 * Domain layer — pure data and pure functions, no React and no storage, so the
 * packing rules (US-011) are unit-testable on their own.
 */

/** The order the Home weather card cycles through when tapped. */
export const CONDITIONS = ['clear', 'rain', 'storm', 'cool'];

export const WEATHER = {
  clear: {
    kind: 'sun',
    temp: '34°',
    description: 'Clear and hot',
    advice: 'Hot at 13:30 — carry water',
    quest: 'Pack for a hot day',
    trailFlag: 'Shade stop added',
    items: [
      'Passport + visa print',
      'Power bank',
      'Reef-safe sunscreen',
      'Refill bottle',
      'Wide hat',
    ],
  },
  rain: {
    kind: 'rain',
    temp: '28°',
    description: 'Light rain later',
    advice: 'Rain from 15:00 — take the shell',
    quest: 'Pack for the rain',
    trailFlag: 'Indoor backup saved',
    items: [
      'Passport + visa print',
      'Power bank',
      'Rain shell',
      'Dry bag for the phone',
      'Quick-dry shoes',
    ],
  },
  storm: {
    kind: 'storm',
    temp: '26°',
    description: 'Storm warning',
    advice: 'Storm at 16:00 — ferry may pause',
    quest: 'Storm-proof the bag',
    trailFlag: 'Ferry at risk',
    items: [
      'Passport in a zip pouch',
      'Power bank charged',
      'Rain shell',
      'Offline map region',
      'Torch',
    ],
  },
  cool: {
    kind: 'mist',
    temp: '19°',
    description: 'Cool and misty',
    advice: 'Cool at 13:30 — a layer helps',
    quest: 'Pack a warm layer',
    trailFlag: 'Sunrise stop moved later',
    items: ['Passport + visa print', 'Power bank', 'Light fleece', 'Long trousers', 'Thermos'],
  },
};

/**
 * How many items every forecast's list starts with already ticked. Every list
 * opens with the passport and the power bank — the things that go in the bag
 * first whatever the weather — so a fresh quest begins at 2 of 5, as on the
 * design canvas.
 */
export const PRE_PACKED = 2;

/** Falls back to rain — the cached reading in the fixture — for an unknown key. */
export function readingFor(condition) {
  return WEATHER[condition] ?? WEATHER.rain;
}

/** The next condition in the cycle, wrapping at the end. */
export function nextCondition(condition) {
  const at = CONDITIONS.indexOf(condition);
  return CONDITIONS[(at + 1) % CONDITIONS.length];
}

/**
 * Seeds the packing checklist from the forecast — `suggestItems` in PRD 5.3.
 *
 * Ticks are keyed by label rather than index so a caller can keep whatever was
 * already packed when an item survives a change of list.
 */
export function suggestItems(condition, alreadyDone = []) {
  const done = new Set(alreadyDone);
  return readingFor(condition).items.map((label, i) => ({
    id: `pack-${i}`,
    label,
    done: done.has(label),
  }));
}

/** A fresh quest for a forecast: its list, with the first {@link PRE_PACKED} ticked. */
export function seedChecklist(condition) {
  return suggestItems(condition, readingFor(condition).items.slice(0, PRE_PACKED));
}

export default {
  CONDITIONS,
  WEATHER,
  PRE_PACKED,
  readingFor,
  nextCondition,
  suggestItems,
  seedChecklist,
};

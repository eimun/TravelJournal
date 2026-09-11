import {
  CONDITIONS,
  PRE_PACKED,
  WEATHER,
  nextCondition,
  readingFor,
  seedChecklist,
  suggestItems,
} from '../../src/domain/weather';

describe('readingFor', () => {
  it('returns the reading for a known condition', () => {
    expect(readingFor('storm').description).toBe('Storm warning');
  });

  it('falls back to the cached rain reading for an unknown condition', () => {
    expect(readingFor('hurricane')).toBe(WEATHER.rain);
    expect(readingFor(undefined)).toBe(WEATHER.rain);
  });
});

describe('nextCondition', () => {
  it('walks the cycle in order', () => {
    expect(nextCondition('clear')).toBe('rain');
    expect(nextCondition('rain')).toBe('storm');
    expect(nextCondition('storm')).toBe('cool');
  });

  it('wraps around at the end', () => {
    expect(nextCondition('cool')).toBe('clear');
  });

  it('starts the cycle from an unknown condition rather than getting stuck', () => {
    expect(CONDITIONS).toContain(nextCondition('nonsense'));
  });

  it('visits every condition exactly once before repeating', () => {
    const seen = [];
    let at = 'clear';
    for (let i = 0; i < CONDITIONS.length; i += 1) {
      seen.push(at);
      at = nextCondition(at);
    }
    expect(new Set(seen).size).toBe(CONDITIONS.length);
    expect(at).toBe('clear');
  });
});

describe('every condition drives the whole UI', () => {
  it.each(CONDITIONS)('%s carries a full set of derived values', (condition) => {
    const reading = readingFor(condition);
    expect(reading.kind).toBeTruthy();
    expect(reading.temp).toMatch(/°/);
    expect(reading.description).toBeTruthy();
    expect(reading.advice).toBeTruthy();
    expect(reading.quest).toBeTruthy();
    expect(reading.trailFlag).toBeTruthy();
    expect(reading.items).toHaveLength(5);
  });

  it('gives each condition its own packing list', () => {
    const lists = CONDITIONS.map((c) => readingFor(c).items.join('|'));
    expect(new Set(lists).size).toBe(CONDITIONS.length);
  });
});

describe('suggestItems', () => {
  it('seeds an unticked list from the forecast', () => {
    const items = suggestItems('clear');
    expect(items).toHaveLength(5);
    expect(items.every((item) => item.done === false)).toBe(true);
    expect(items[0].label).toBe('Passport + visa print');
  });

  it('gives every item a stable unique id', () => {
    const ids = suggestItems('storm').map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps an item ticked when it survives a change of weather', () => {
    // 'Rain shell' is on both the rain and the storm list.
    const items = suggestItems('storm', ['Rain shell']);
    expect(items.find((item) => item.label === 'Rain shell').done).toBe(true);
  });

  it('does not carry a tick onto an item the new forecast dropped', () => {
    const items = suggestItems('clear', ['Rain shell']);
    expect(items.some((item) => item.label === 'Rain shell')).toBe(false);
    expect(items.every((item) => item.done === false)).toBe(true);
  });

  it('only carries a tick across when the label matches exactly', () => {
    // 'Power bank' and 'Power bank charged' are worded differently on purpose.
    const items = suggestItems('storm', ['Power bank']);
    expect(items.find((item) => item.label === 'Power bank charged').done).toBe(false);
  });

  it('treats a missing done-list as nothing packed', () => {
    expect(suggestItems('cool').every((item) => !item.done)).toBe(true);
  });
});

describe('seedChecklist', () => {
  it.each(CONDITIONS)('starts the %s quest with the first items already packed', (condition) => {
    const items = seedChecklist(condition);
    expect(items).toHaveLength(5);
    expect(items.filter((item) => item.done)).toHaveLength(PRE_PACKED);
    items.forEach((item, i) => expect(item.done).toBe(i < PRE_PACKED));
  });

  it('matches the canvas: a fresh rain quest reads 2 of 5 packed', () => {
    const items = seedChecklist('rain');
    expect(items.filter((item) => item.done).map((item) => item.label)).toEqual([
      'Passport + visa print',
      'Power bank',
    ]);
  });

  it('follows the forecast it is given, not the previous one', () => {
    expect(seedChecklist('storm').map((item) => item.label)).toEqual(WEATHER.storm.items);
  });
});

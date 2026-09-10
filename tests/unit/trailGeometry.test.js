import {
  DOT_SIZE,
  PITCH,
  buildTrailGeometry,
  nodeDepth,
  nodeFill,
  nodeSize,
} from '../../app/components/trailGeometry';

const days = [
  { date: 'MON 14', title: 'Land', meta: '', state: 'done', offset: 14 },
  { date: 'TUE 15', title: 'Loop', meta: '', state: 'done', offset: 62 },
  { date: 'WED 16', title: 'Today', meta: '', state: 'now', offset: 0 },
  { date: 'THU 17', title: 'Cruise', meta: '', state: 'todo', offset: 66 },
];

describe('nodeSize', () => {
  it('makes today’s stone the largest so the eye lands on it first', () => {
    expect(nodeSize('now')).toBeGreaterThan(nodeSize('done'));
    expect(nodeSize('done')).toBe(nodeSize('todo'));
  });
});

describe('nodeFill / nodeDepth', () => {
  it('gives every state its own fill, so days are never told apart by size alone', () => {
    const fills = new Set([nodeFill('done'), nodeFill('now'), nodeFill('todo')]);
    expect(fills.size).toBe(3);
  });

  it('pairs each fill with a darker depth colour', () => {
    ['done', 'now', 'todo'].forEach((state) => {
      expect(nodeDepth(state)).not.toBe(nodeFill(state));
    });
  });
});

describe('buildTrailGeometry', () => {
  const geometry = buildTrailGeometry(days);

  it('reserves one pitch of height per day', () => {
    expect(geometry.height).toBe(days.length * PITCH);
    expect(geometry.stones).toHaveLength(days.length);
  });

  it('spaces stone centres exactly one pitch apart vertically', () => {
    for (let i = 1; i < geometry.stones.length; i += 1) {
      expect(geometry.stones[i].cy - geometry.stones[i - 1].cy).toBe(PITCH);
    }
  });

  it('centres each stone on its own horizontal offset', () => {
    geometry.stones.forEach((stone, i) => {
      expect(stone.left).toBe(days[i].offset);
      expect(stone.cx).toBe(days[i].offset + stone.size / 2);
    });
  });

  it('draws connectors for every gap between stones but not past the last one', () => {
    const segments = new Set(geometry.dots.map((dot) => dot.segment));
    expect(segments).toEqual(new Set([0, 1, 2]));
  });

  it('keeps connector dots clear of the stones they join', () => {
    geometry.dots.forEach((dot) => {
      const from = geometry.stones[dot.segment];
      const to = geometry.stones[dot.segment + 1];
      const cx = dot.x + DOT_SIZE / 2;
      const cy = dot.y + DOT_SIZE / 2;

      expect(Math.hypot(cx - from.cx, cy - from.cy)).toBeGreaterThan(from.size / 2);
      expect(Math.hypot(cx - to.cx, cy - to.cy)).toBeGreaterThan(to.size / 2);
    });
  });

  it('tints a segment as walked only when the day it leaves is walked', () => {
    const walkedTints = new Set(
      geometry.dots.filter((dot) => dot.segment < 2).map((dot) => dot.tint),
    );
    const aheadTints = new Set(
      geometry.dots.filter((dot) => dot.segment >= 2).map((dot) => dot.tint),
    );

    expect(walkedTints.size).toBe(1);
    expect(aheadTints.size).toBe(1);
    expect([...walkedTints][0]).not.toBe([...aheadTints][0]);
  });

  it('gives every dot a unique key so React never reuses one across segments', () => {
    const keys = geometry.dots.map((dot) => dot.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('handles a single-day trip without trying to draw a connector', () => {
    const single = buildTrailGeometry([days[0]]);
    expect(single.dots).toHaveLength(0);
    expect(single.stones).toHaveLength(1);
  });

  it('handles an empty trip', () => {
    expect(buildTrailGeometry([])).toEqual({ stones: [], dots: [], height: 0 });
  });
});

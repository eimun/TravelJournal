import { colors } from '../theme/tokens';

/** Vertical distance between two day stones: a 92 dp row plus the 8 dp gap. */
export const PITCH = 100;
/** Gap between the dashes that make up a connector (the canvas's 16 px tile). */
export const DOT_PITCH = 16;
/** Box each dash is placed in, and the clearance kept from the stones. */
export const DOT_SIZE = 6;
/** The dash itself: the canvas's 40 % ellipse in a 6×16 tile — a slim oval. */
export const DASH = { w: 4, h: 9 };
export const NODE_SIZE = { now: 78, other: 62 };
/** The chunky offset fill under each stone — `box-shadow: 0 6px 0` in the design. */
export const STONE_DEPTH = 6;

export const nodeSize = (state) => (state === 'now' ? NODE_SIZE.now : NODE_SIZE.other);

export const nodeFill = (state) => {
  if (state === 'done') return colors.accent2Ramp[500];
  if (state === 'now') return colors.accentRamp[500];
  return colors.neutral[200];
};

export const nodeDepth = (state) => {
  if (state === 'done') return colors.accent2Ramp[700];
  if (state === 'now') return colors.accentRamp[700];
  return colors.neutral[400];
};

/**
 * Lays the stones out in one absolutely-positioned layer.
 *
 * Doing the geometry once here — rather than letting flexbox rows own it — keeps
 * the connectors from being clipped at row boundaries on Android, which is what
 * happens if each row tries to draw the line down into the next one.
 *
 * Pure, so it can be unit-tested without mounting anything.
 */
export function buildTrailGeometry(days) {
  const stones = days.map((day, i) => {
    const size = nodeSize(day.state);
    return {
      ...day,
      index: i,
      size,
      left: day.offset,
      top: i * PITCH + PITCH / 2 - size / 2,
      cx: day.offset + size / 2,
      cy: i * PITCH + PITCH / 2,
    };
  });

  // Dashes are laid along each centre-to-centre segment, turned to follow it,
  // and the ones that would fall under either stone are dropped so the line
  // reads as joining them.
  const dots = [];
  for (let i = 0; i < stones.length - 1; i += 1) {
    const from = stones[i];
    const to = stones[i + 1];
    const dx = to.cx - from.cx;
    const dy = to.cy - from.cy;
    const length = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.round(length / DOT_PITCH));
    // A dash's long axis is vertical at 0°, so subtract 90° from the heading.
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI - 90;
    // A segment is "walked" only once the day it leaves has been walked.
    const tint = from.state === 'done' ? colors.accentRamp[400] : colors.neutral[300];

    for (let k = 0; k <= steps; k += 1) {
      const t = k / steps;
      const px = from.cx + dx * t;
      const py = from.cy + dy * t;
      const clearOfFrom = Math.hypot(px - from.cx, py - from.cy) > from.size / 2 + DOT_SIZE;
      const clearOfTo = Math.hypot(px - to.cx, py - to.cy) > to.size / 2 + DOT_SIZE;
      if (clearOfFrom && clearOfTo) {
        dots.push({
          key: `${i}-${k}`,
          x: px - DOT_SIZE / 2,
          y: py - DOT_SIZE / 2,
          angle,
          tint,
          segment: i,
        });
      }
    }
  }

  return { stones, dots, height: days.length * PITCH };
}

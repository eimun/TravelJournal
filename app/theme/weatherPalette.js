import { colors } from './tokens';

/**
 * How each weather kind tints the app — values taken straight from the WX table
 * on the design canvas.
 *
 * Kept beside the theme rather than in `src/domain/weather.js` so the domain
 * layer stays free of anything presentational — the domain says "storm", this
 * says what a storm looks like.
 */
export const WEATHER_PALETTE = {
  sun: {
    sky: colors.bg,
    band: colors.accentRamp[200],
    dot: colors.accentRamp[300],
    cardBg: colors.accentRamp[200],
    cardInk: colors.accentRamp[800],
  },
  rain: {
    sky: colors.neutral[200],
    band: colors.accent2Ramp[200],
    dot: colors.accent2Ramp[400],
    cardBg: colors.accent2Ramp[200],
    cardInk: colors.accent2Ramp[800],
  },
  storm: {
    sky: colors.neutral[300],
    band: colors.neutral[500],
    dot: colors.accentRamp[500],
    cardBg: colors.neutral[800],
    cardInk: colors.neutral[200],
  },
  mist: {
    sky: colors.accent2Ramp[100],
    band: colors.accent2Ramp[300],
    dot: colors.accent2Ramp[500],
    cardBg: colors.accent2Ramp[300],
    cardInk: colors.accent2Ramp[900],
  },
};

export function paletteFor(kind) {
  return WEATHER_PALETTE[kind] ?? WEATHER_PALETTE.rain;
}

/**
 * What the mascot wears, exactly as the canvas draws it: a band across the brow
 * in the sun (it reads as sunglasses), a hood in the rain, a heavier dark hood
 * in a storm, and nothing in the cold. Each `inset 0 -Npx 0` shadow on the canvas is
 * a bottom border here.
 */
export const MASCOT_GEAR = {
  sun: {
    left: 11,
    top: 24,
    width: 44,
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.neutral[900],
  },
  rain: {
    left: -5,
    top: -9,
    width: 76,
    height: 38,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    backgroundColor: colors.accentRamp[500],
    borderBottomWidth: 5,
    borderBottomColor: colors.accentRamp[700],
  },
  storm: {
    left: -8,
    top: -12,
    width: 82,
    height: 40,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    backgroundColor: colors.neutral[800],
    borderBottomWidth: 5,
    borderBottomColor: colors.neutral[900],
  },
};

/** Cool weather wears nothing: the mist and the card already say it. */
export function gearFor(kind) {
  if (kind === 'mist') return null;
  return MASCOT_GEAR[kind] ?? MASCOT_GEAR.rain;
}

export default { WEATHER_PALETTE, paletteFor, MASCOT_GEAR, gearFor };

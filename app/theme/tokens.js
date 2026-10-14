/**
 * Organic design system tokens.
 *
 * Colour ground lifted from the reference app screenshots (`images/`): a
 * white ground with Google's warm grey text scale, a leaf-green primary
 * (#37ab2f / #2e8f29), a fresh sky-blue secondary (#1e8aff), and the Google
 * Metro-cream band (#eef6e8 / #f4f3e4) behind hero surfaces.
 * Every colour, space and radius in the app must come from here — never a
 * hard-coded hex or px, per PRD 8.5.
 */

export const colors = {
  bg: '#f2f4f7',
  surface: '#ffffff',
  text: '#202124',
  accent: '#37ab2f',
  accent2: '#1e8aff',

  neutral: {
    100: '#f1f3f4',
    200: '#e3e5e8',
    300: '#cad2da',
    400: '#a7adb5',
    500: '#797a7b',
    600: '#6e6f71',
    700: '#5f6368',
    800: '#3c4043',
    900: '#202124',
  },

  // Leaf green — primary actions, active modes, selected states.
  accentRamp: {
    100: '#eef8eb',
    200: '#d9f2d3',
    300: '#b6e7ad',
    400: '#48c75d',
    500: '#26b847',
    600: '#22aa48',
    700: '#1b8b37',
    800: '#146e2a',
    900: '#0e4e1d',
  },

  // Sky blue — links, live dots, informational accents.
  accent2Ramp: {
    100: '#e8f1ff',
    200: '#cfe4ff',
    300: '#a3daf5',
    400: '#66b4f8',
    500: '#1e8aff',
    600: '#1975d8',
    700: '#145fae',
    800: '#0e4682',
    900: '#0a3259',
  },

  // Metro-cream — hero band and soft card washes from the reference screens.
  metroBand: {
    100: '#f6f3e5',
    200: '#f4f3e4',
    300: '#eef6e8',
    400: '#e3f7d6',
  },

  white: '#ffffff',
};

/** Density 1.10x is already baked into this scale — use it, not raw numbers. */
export const space = {
  1: 4.4,
  2: 8.8,
  3: 13.2,
  4: 17.6,
  6: 26.4,
  8: 35.2,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 28,
  pill: 999,
};

/**
 * Elevation tuned to the warm ground. React Native takes shadow colour +
 * offset + radius on iOS and `elevation` on Android, so each token carries both.
 */
export const shadow = {
  sm: {
    shadowColor: colors.neutral[900],
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.neutral[900],
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.neutral[900],
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 32,
    elevation: 12,
  },
};

/**
 * Caprasimo is the only display voice; Figtree carries everything else.
 * `fonts.js` maps these keys to loaded font families and falls back to the
 * platform face until the Google Fonts packages have loaded.
 */
export const fontFamily = {
  heading: 'Caprasimo_400Regular',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodyBold: 'Figtree_700Bold',
  bodyExtraBold: 'Figtree_800ExtraBold',
};

export const type = {
  // Caprasimo is a tall display face — these line heights carry its ascenders and
  // descenders. Tightening them clips a wrapped second line on Android.
  display: { fontSize: 30, lineHeight: 40 },
  title: { fontSize: 22, lineHeight: 30 },
  section: { fontSize: 17, lineHeight: 23 },
  body: { fontSize: 14, lineHeight: 20 },
  meta: { fontSize: 12.5, lineHeight: 17 },
  /** Uppercase eyebrow labels — always paired with letterSpacing. */
  kicker: { fontSize: 10.5, lineHeight: 14, letterSpacing: 0.9 },
};

/**
 * Citymapper-style transport mode colours — one fixed hue per mode, used in
 * EVERY surface (selector cards, map polylines, step rows, chips) so colour
 * itself becomes the mode language. Matched to the reference screenshots:
 * green rails voice, blue bus, mustard auto, charcoal cab.
 */
export const modeColors = {
  metro: colors.accentRamp[600], // leaf green — the primary rail voice
  bus: colors.accent2Ramp[500], // sky blue — the shared street voice
  auto: '#c9a227', // mustard — the three-wheeler
  cab: colors.neutral[800], // charcoal — AC comfort
  walk: colors.accentRamp[400], // light green — on-foot
  rail: colors.accentRamp[700], // deep green — suburban rail
};

/** Short labels used beside the colour chip wherever mode names appear. */
export const modeLabels = {
  metro: 'Metro',
  bus: 'Bus',
  auto: 'Auto',
  cab: 'Cab',
  walk: 'Walk',
  rail: 'Rail',
};

export default { colors, space, radius, shadow, fontFamily, type, modeColors, modeLabels };

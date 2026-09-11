/**
 * Organic design system tokens.
 *
 * Lifted verbatim from the Claude Design canvas that the TravelJournal UI was
 * designed on (`docs/design/`). Every colour, space and radius in the app must
 * come from here — never a hard-coded hex or px, per PRD 8.5.
 *
 * Warm, rounded and a little playful: a cream-and-sand ground with a terracotta
 * accent and a sage second accent. Caprasimo display headings over Figtree.
 */

export const colors = {
  bg: '#f5ead8',
  surface: '#ebddc5',
  text: '#201e1d',
  accent: '#c67139',
  accent2: '#7a8a5e',

  neutral: {
    100: '#f9f4ed',
    200: '#eee7db',
    300: '#dcd3c4',
    400: '#c0b6a5',
    500: '#a19786',
    600: '#82796a',
    700: '#645c50',
    800: '#474238',
    900: '#2e2b25',
  },

  // Terracotta — primary actions, the current day, "next up".
  accentRamp: {
    100: '#fff2eb',
    200: '#ffe1d0',
    300: '#ffc6a5',
    400: '#f6a06b',
    500: '#d67f48',
    600: '#b2622d',
    700: '#8c491a',
    800: '#643312',
    900: '#402310',
  },

  // Sage — the genuine second voice: walked days, offline-good states.
  accent2Ramp: {
    100: '#f0fae1',
    200: '#e1eecc',
    300: '#ccdbb2',
    400: '#aebf92',
    500: '#8fa073',
    600: '#728157',
    700: '#56633f',
    800: '#3d472b',
    900: '#272e1b',
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

export default { colors, space, radius, shadow, fontFamily, type };

import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, space, type } from '../theme/tokens';
import { family } from '../theme/fonts';

/** A surface-filled content card. Over-rounded, soft shadow, never a hairline border. */
export function Card({ style, children, ...rest }) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

/** The uppercase eyebrow that titles almost every block in this design. */
export function Kicker({ children, tone = 'neutral', style, ...rest }) {
  const tint =
    tone === 'accent'
      ? colors.accentRamp[700]
      : tone === 'accent2'
        ? colors.accent2Ramp[700]
        : colors.neutral[600];

  return (
    <Text
      style={[styles.kicker, { color: tint, fontFamily: family('bodyExtraBold') }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** Small pill label tinted from a ramp. */
export function Pill({ children, tone = 'neutral', style, textStyle }) {
  const palette = {
    accent: { bg: colors.accentRamp[200], fg: colors.accentRamp[800] },
    accent2: { bg: colors.accent2Ramp[200], fg: colors.accent2Ramp[800] },
    neutral: { bg: colors.neutral[200], fg: colors.neutral[800] },
    solid: { bg: colors.accentRamp[500], fg: colors.white },
  }[tone];

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }, style]}>
      <Text
        style={[styles.pillText, { color: palette.fg, fontFamily: family('bodyBold') }, textStyle]}
      >
        {children}
      </Text>
    </View>
  );
}

/** Section title in the display face, used above Today and The Trail. */
export function SectionTitle({ children, style }) {
  return (
    <Text style={[styles.sectionTitle, { fontFamily: family('heading') }, style]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: space[4],
    ...shadow.sm,
  },
  kicker: {
    ...type.kicker,
    textTransform: 'uppercase',
  },
  pill: {
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: 11.5,
    letterSpacing: 0.4,
  },
  sectionTitle: {
    ...type.title,
    color: colors.text,
    includeFontPadding: false,
  },
});

export default { Card, Kicker, Pill, SectionTitle };

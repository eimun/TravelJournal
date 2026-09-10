import { Pressable, StyleSheet, Text } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import { colors, radius, space, type } from '../theme/tokens';
import { family } from '../theme/fonts';
import { Card, Kicker } from './primitives';

/**
 * The journal strip — US-014.
 *
 * "Kept on this phone" is the headline on purpose: the journal is the most
 * personal thing in the app and the privacy rule (PRD 9.7) is worth stating
 * where the user can see it, not just in the docs.
 */
export default function JournalCard({ entryCount, onCapture }) {
  return (
    <Card style={styles.card}>
      <Kicker>{`Journal · ${entryCount} entries`}</Kicker>
      <Text style={[styles.title, { fontFamily: family('heading') }]}>Kept on this phone</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Capture this moment"
        onPress={onCapture}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Feather name="plus" size={16} color={colors.white} />
        <Text style={[styles.ctaText, { fontFamily: family('bodyBold') }]}>
          Capture this moment
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 4,
  },
  title: {
    ...type.title,
    color: colors.text,
    includeFontPadding: false,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: space[3],
    backgroundColor: colors.accentRamp[500],
    borderRadius: radius.pill,
    paddingVertical: 13,
    minHeight: 48,
  },
  ctaPressed: {
    backgroundColor: colors.accentRamp[600],
  },
  ctaText: {
    color: colors.white,
    fontSize: 14,
  },
});

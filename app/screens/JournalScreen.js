import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow } from '../theme/tokens';
import { family } from '../theme/fonts';
import Icon from '../components/Icon';
import { FadeIn } from '../components/motion';
import { useTrip } from '../../src/context/TripContext';
import { journalEntries } from '../data/sampleTrip';

/** Washed photo tones — the canvas sits photos back into the warm page. */
const PHOTO_TINT = {
  accent: colors.accentRamp[200],
  accent2: colors.accent2Ramp[200],
  neutral: colors.neutral[300],
};

/**
 * The photo journal — US-014 — as the canvas lays it out: each entry a card with
 * its photo across the top, then the day, the GPS stamp and the note.
 *
 * "Kept on this phone" is the headline because the journal is the most personal
 * thing in the app and never leaves the device.
 */
export default function JournalScreen({ contentPadding }) {
  const { memories, addMemory } = useTrip();

  return (
    <FadeIn>
      <ScrollView
        contentContainerStyle={[styles.content, contentPadding]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Text style={[styles.kicker, { fontFamily: family('bodyBold') }]}>
            {`JOURNAL · ${memories} ENTRIES`}
          </Text>
          <Text style={[styles.title, { fontFamily: family('heading') }]}>Kept on this phone</Text>
        </View>

        <View style={styles.list}>
          {journalEntries.map((entry) => (
            <View key={entry.id} style={styles.card}>
              <View style={[styles.photo, { backgroundColor: PHOTO_TINT[entry.tint] }]}>
                <Icon name="image" size={34} color="rgba(255,255,255,0.9)" strokeWidth={2} />
              </View>

              <View style={styles.body}>
                <View style={styles.metaRow}>
                  <View style={styles.tag}>
                    <Text style={[styles.tagText, { fontFamily: family('bodyBold') }]}>
                      {entry.day}
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={[styles.geo, { fontFamily: family('body') }]}>
                    {entry.geo}
                  </Text>
                </View>
                <Text style={[styles.text, { fontFamily: family('body') }]}>{entry.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Capture this moment"
          onPress={addMemory}
          style={({ pressed }) => [styles.capture, pressed && styles.capturePressed]}
        >
          {({ pressed }) => (
            <Text
              style={[
                styles.captureText,
                { fontFamily: family('bodyBold') },
                pressed && styles.captureTextPressed,
              ]}
            >
              + Capture this moment
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
  },
  head: {
    paddingTop: 6,
  },
  kicker: {
    fontSize: 11.5,
    letterSpacing: 1.38,
    color: colors.accentRamp[700],
  },
  title: {
    fontSize: 25,
    lineHeight: 32,
    marginTop: 4,
    color: colors.text,
    includeFontPadding: false,
  },
  list: {
    gap: 14,
    marginTop: 16,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
    ...shadow.sm,
  },
  photo: {
    height: 186,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingTop: 14,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.accent2Ramp[200],
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 11,
    color: colors.accent2Ramp[800],
  },
  geo: {
    flex: 1,
    fontSize: 11.5,
    color: colors.neutral[600],
  },
  text: {
    fontSize: 14,
    lineHeight: 21.7,
    marginTop: 9,
    color: colors.text,
  },
  capture: {
    marginTop: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.neutral[400],
    borderRadius: radius.lg,
    padding: 17,
    alignItems: 'center',
  },
  capturePressed: {
    borderColor: colors.accentRamp[500],
  },
  captureText: {
    fontSize: 14.5,
    color: colors.neutral[700],
  },
  captureTextPressed: {
    color: colors.accentRamp[700],
  },
});

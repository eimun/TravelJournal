import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow } from '../theme/tokens';
import { family } from '../theme/fonts';
import { FadeIn } from '../components/motion';
import { useTrip } from '../../src/context/TripContext';
import { settingRows, storageBreakdown } from '../data/sampleTrip';

/** The storage allowance the bar is drawn against; what is left shows as free. */
const CAPACITY_MB = 280;

const BAR_TINT = {
  accent: colors.accentRamp[500],
  accent2: colors.accent2Ramp[500],
  neutral: colors.accentRamp[300],
};

/** A themed switch — never the platform default, per the Organic guidance. */
function Toggle({ on, onPress, label }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: on ? colors.accent2Ramp[500] : colors.neutral[300] },
        pressed && styles.pillPressed,
      ]}
    >
      <View style={[styles.knob, on && styles.knobOn]} />
    </Pressable>
  );
}

/**
 * You — traveller details, storage and permissions (PRD 8.1), as the canvas
 * lays them out. Storage is shown in plain megabytes because PRD 12.2 asks for
 * the per-trip footprint to be surfaced to the user, not just logged.
 */
export default function ProfileScreen({ contentPadding }) {
  const { trip, settings, toggleSetting } = useTrip();

  return (
    <FadeIn>
      <ScrollView
        contentContainerStyle={[styles.content, contentPadding]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={[styles.initial, { fontFamily: family('heading') }]}>
              {trip.travellerName.slice(0, 1)}
            </Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={[styles.name, { fontFamily: family('heading') }]}>
              {trip.travellerName}
            </Text>
            <Text style={[styles.sub, { fontFamily: family('body') }]}>
              No account · PIN locked · INR home currency
            </Text>
          </View>
        </View>

        <View style={styles.storage}>
          <Text style={[styles.kicker, { fontFamily: family('bodyBold') }]}>STORAGE ON DEVICE</Text>

          <View style={styles.bar}>
            {storageBreakdown.map((row) => (
              <View
                key={row.id}
                style={{
                  width: `${(row.megabytes / CAPACITY_MB) * 100}%`,
                  backgroundColor: BAR_TINT[row.tint],
                }}
              />
            ))}
          </View>

          <View style={styles.legend}>
            {storageBreakdown.map((row) => (
              <Text key={row.id} style={[styles.legendText, { fontFamily: family('body') }]}>
                {`${row.label} ${row.megabytes} MB`}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.settings}>
          {settingRows.map((row, i) => (
            <View key={row.id} style={styles.settingRow}>
              <View style={styles.settingCopy}>
                <Text style={[styles.settingLabel, { fontFamily: family('bodyBold') }]}>
                  {row.label}
                </Text>
                <Text style={[styles.settingMeta, { fontFamily: family('body') }]}>{row.meta}</Text>
              </View>
              <Toggle on={settings[i]} onPress={() => toggleSetting(i)} label={row.label} />
            </View>
          ))}
        </View>
      </ScrollView>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent2Ramp[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontSize: 24,
    color: colors.accent2Ramp[800],
    includeFontPadding: false,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 23,
    lineHeight: 30,
    color: colors.text,
    includeFontPadding: false,
  },
  sub: {
    fontSize: 12.5,
    color: colors.neutral[600],
    marginTop: 4,
  },
  storage: {
    marginTop: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    padding: 16,
    ...shadow.sm,
  },
  kicker: {
    fontSize: 11.5,
    letterSpacing: 1.15,
    color: colors.neutral[600],
    marginBottom: 12,
  },
  bar: {
    flexDirection: 'row',
    height: 13,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.neutral[300],
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 11,
  },
  legendText: {
    fontSize: 12,
    color: colors.neutral[700],
  },
  settings: {
    gap: 10,
    marginTop: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 15,
    ...shadow.sm,
  },
  settingCopy: {
    flex: 1,
    minWidth: 0,
  },
  settingLabel: {
    fontSize: 14.5,
    color: colors.text,
  },
  settingMeta: {
    fontSize: 12,
    color: colors.neutral[600],
    marginTop: 3,
  },
  pill: {
    width: 52,
    height: 30,
    borderRadius: radius.pill,
    padding: 3,
    justifyContent: 'center',
  },
  pillPressed: {
    transform: [{ scale: 0.96 }],
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    ...shadow.sm,
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
});

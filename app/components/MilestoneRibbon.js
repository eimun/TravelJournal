import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { PURPLE_LINE, GREEN_LINE } from '../data/transitData';

export default function MilestoneRibbon({
  milestones,
  activeStepIndex,
  onSelectMilestone,
}) {
  if (!milestones || milestones.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.kicker}>JOURNEY CHECKPOINTS</Text>
          <Text style={styles.subTitle}>Tap to inspect road on map</Text>
        </View>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>{milestones.length} checkpoints</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {milestones.map((m, idx) => {
          const isSelected = activeStepIndex === m.stepIndex;
          const isLast = idx === milestones.length - 1;
          const isOrigin = m.type === 'origin';
          const isDest = m.type === 'destination';
          const isTransfer = m.type === 'transfer';
          const isStation = m.type === 'station';

          return (
            <React.Fragment key={m.id || idx}>
              <Pressable
                onPress={() => onSelectMilestone(m.stepIndex)}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected && styles.chipSelected,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View
                  style={[
                    styles.dotBadge,
                    isOrigin && styles.dotOrigin,
                    isDest && styles.dotDest,
                    isTransfer && styles.dotTransfer,
                    isStation && (m.line === 'green' ? styles.dotGreen : styles.dotPurple),
                    isSelected && styles.dotSelected,
                  ]}
                >
                  <Text style={styles.dotBadgeNumber}>{idx + 1}</Text>
                </View>

                <View style={styles.textCol}>
                  <Text style={[styles.label, isSelected && styles.labelSelected]}>
                    {m.label}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.title, isSelected && styles.titleSelected]}
                  >
                    {m.title.split('(')[0].trim()}
                  </Text>
                </View>
              </Pressable>

              {!isLast && (
                <View style={styles.connector}>
                  <View style={styles.connectorLine} />
                  <Text style={styles.connectorArrow}>›</Text>
                </View>
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(46, 43, 37, 0.08)',
    ...shadow.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  headerLeft: {
    flex: 1,
  },
  kicker: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.9,
    color: colors.neutral[700],
    textTransform: 'uppercase',
  },
  subTitle: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 1,
  },
  badgeCount: {
    backgroundColor: colors.neutral[200],
    borderRadius: radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeCountText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  scrollList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: colors.neutral[300],
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  chipSelected: {
    backgroundColor: colors.accentRamp[100],
    borderColor: colors.accentRamp[600],
    ...shadow.sm,
  },
  dotBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOrigin: {
    backgroundColor: '#2563eb',
  },
  dotDest: {
    backgroundColor: colors.accentRamp[600],
  },
  dotTransfer: {
    backgroundColor: '#d97706',
  },
  dotPurple: {
    backgroundColor: PURPLE_LINE,
  },
  dotGreen: {
    backgroundColor: GREEN_LINE,
  },
  dotSelected: {
    transform: [{ scale: 1.1 }],
  },
  dotBadgeNumber: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  textCol: {
    maxWidth: 130,
  },
  label: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  labelSelected: {
    color: colors.accentRamp[800],
  },
  title: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  titleSelected: {
    color: colors.accentRamp[900],
  },
  connector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  connectorLine: {
    width: 10,
    height: 1.5,
    backgroundColor: colors.neutral[400],
  },
  connectorArrow: {
    fontSize: 12,
    color: colors.neutral[500],
    fontFamily: fontFamily.bodyBold,
    marginTop: -2,
  },
});

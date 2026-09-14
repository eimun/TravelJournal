import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';

export default function ConnectingLegSelector({
  step,
  selectedModeKey,
  onSelectMode,
}) {
  const [showComparison, setShowComparison] = useState(true);

  if (!step?.modes) return null;

  const modes = step.modes;
  const currentKey = selectedModeKey || step.selectedMode || step.defaultMode || 'auto';
  const currentMode = modes[currentKey] || modes.auto;
  const isLong = step.isLongDistance;

  const modeKeys = ['auto', 'bike', 'cab', 'bus', 'walk'];

  return (
    <View style={styles.container}>
      {/* Long Walk Warning Banner */}
      {isLong && (
        <View
          style={[
            styles.warningBanner,
            currentKey === 'walk' ? styles.warningBannerSevere : styles.warningBannerNotice,
          ]}
        >
          <Text style={styles.warningIcon}>{currentKey === 'walk' ? '⚠️' : '💡'}</Text>
          <View style={styles.warningTextCol}>
            <Text style={styles.warningTitle}>
              {currentKey === 'walk'
                ? 'LONG WALK WARNING (1.9 km · ~26 min)'
                : 'SMART COMMUTE RECOMMENDATION'}
            </Text>
            <Text style={styles.warningDesc}>
              {currentKey === 'walk'
                ? 'Walking 1.9 km in Bengaluru heat and traffic is exhausting. Auto or Bike Taxi is strongly recommended!'
                : '1.9 km is too far to walk. Auto or Bike Taxi suggested with fares compared below.'}
            </Text>
          </View>
        </View>
      )}

      {/* Mode Selector Pill Buttons */}
      <View style={styles.selectorSection}>
        <Text style={styles.selectorHeading}>SELECT MODE FOR THIS LEG</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {modeKeys.map((key) => {
            const m = modes[key];
            if (!m) return null;
            const isSelected = currentKey === key;

            return (
              <Pressable
                key={key}
                onPress={(e) => {
                  e.stopPropagation();
                  onSelectMode(key);
                }}
                style={({ pressed }) => [
                  styles.modePill,
                  isSelected && styles.modePillSelected,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.modeEmoji}>{m.emoji || '🚗'}</Text>
                <View style={styles.pillTextCol}>
                  <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>
                    {m.label}
                  </Text>
                  <Text style={[styles.pillSub, isSelected && styles.pillSubSelected]}>
                    {m.fare > 0 ? `₹${m.fare}` : 'Free'} · {m.durationMinutes}m
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Price & Travel Time Comparison Breakdown */}
      <View style={styles.comparisonCard}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            setShowComparison((prev) => !prev);
          }}
          style={styles.comparisonHeaderRow}
        >
          <View style={styles.comparisonHeaderLeft}>
            <Text style={styles.comparisonSectionTitle}>FARE & TIME COMPARISON</Text>
            <Text style={styles.comparisonSubTitle}>Compare options before choosing</Text>
          </View>
          <Text style={styles.toggleChevron}>{showComparison ? '▲ Hide' : '▼ View All'}</Text>
        </Pressable>

        {showComparison && (
          <View style={styles.comparisonRowsContainer}>
            {modeKeys.map((key) => {
              const m = modes[key];
              if (!m) return null;
              const isSelected = currentKey === key;

              return (
                <Pressable
                  key={key}
                  onPress={(e) => {
                    e.stopPropagation();
                    onSelectMode(key);
                  }}
                  style={[
                    styles.compareRow,
                    isSelected && styles.compareRowSelected,
                  ]}
                >
                  <View style={styles.compareRowLeft}>
                    <Text style={styles.compareRowEmoji}>{m.emoji || '🚗'}</Text>
                    <View>
                      <View style={styles.compareTitleLine}>
                        <Text style={[styles.compareModeName, isSelected && styles.compareModeNameSelected]}>
                          {m.label}
                        </Text>
                        {key === 'bike' && <Text style={styles.bestTag}>Fastest</Text>}
                        {key === 'bus' && <Text style={styles.bestTag}>Cheapest</Text>}
                        {key === 'auto' && isLong && <Text style={styles.bestTag}>Popular</Text>}
                      </View>
                      <Text style={styles.compareNote}>
                        {key === 'auto' && `Meter ~₹${m.fare} · App/Gate ~₹${m.quoteFare}`}
                        {key === 'bike' && `Rapido / Uber Moto · Beats traffic`}
                        {key === 'cab' && `Uber Go / BluSmart · AC comfort`}
                        {key === 'bus' && `BMTC Feeder bus · Direct stop`}
                        {key === 'walk' && (isLong ? `1.9 km · High traffic/heat` : `Direct footpath`)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.compareRowRight}>
                    <Text style={[styles.compareFare, isSelected && styles.compareFareSelected]}>
                      {m.fare > 0 ? `₹${m.fare}` : 'Free'}
                    </Text>
                    <Text style={styles.compareTime}>{m.durationMinutes} min</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Selected Mode Insider Tip */}
      {currentMode.tip && (
        <View style={styles.selectedTipBox}>
          <Text style={styles.selectedTipText}>💡 {currentMode.tip}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
  },
  warningBannerNotice: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  warningBannerSevere: {
    backgroundColor: '#fee2e2',
    borderWidth: 1.2,
    borderColor: '#fca5a5',
  },
  warningIcon: {
    fontSize: 18,
  },
  warningTextCol: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.5,
    color: '#92400e',
    marginBottom: 2,
  },
  warningDesc: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: '#78350f',
    lineHeight: 16,
  },
  selectorSection: {
    marginBottom: 12,
  },
  selectorHeading: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.9,
    color: colors.neutral[600],
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.neutral[100],
    borderWidth: 1.2,
    borderColor: colors.neutral[300],
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  modePillSelected: {
    backgroundColor: colors.accentRamp[700],
    borderColor: colors.accentRamp[800],
    ...shadow.sm,
  },
  modeEmoji: {
    fontSize: 15,
  },
  pillTextCol: {
    alignItems: 'flex-start',
  },
  pillLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  pillLabelSelected: {
    color: colors.white,
  },
  pillSub: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 1,
  },
  pillSubSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: fontFamily.bodyBold,
  },
  comparisonCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(46, 43, 37, 0.08)',
    overflow: 'hidden',
  },
  comparisonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(46, 43, 37, 0.03)',
  },
  comparisonHeaderLeft: {
    flex: 1,
  },
  comparisonSectionTitle: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    color: colors.neutral[800],
  },
  comparisonSubTitle: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 1,
  },
  toggleChevron: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
    marginLeft: 8,
  },
  comparisonRowsContainer: {
    padding: 8,
    gap: 6,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  compareRowSelected: {
    borderColor: colors.accentRamp[500],
    backgroundColor: colors.accentRamp[100],
  },
  compareRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  compareRowEmoji: {
    fontSize: 16,
  },
  compareTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compareModeName: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  compareModeNameSelected: {
    color: colors.accentRamp[900],
  },
  bestTag: {
    backgroundColor: colors.accent2Ramp[200],
    color: colors.accent2Ramp[800],
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  compareNote: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  compareRowRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  compareFare: {
    fontSize: 13,
    fontFamily: fontFamily.heading,
    color: colors.accentRamp[700],
  },
  compareFareSelected: {
    color: colors.accentRamp[800],
    fontFamily: fontFamily.heading,
  },
  compareTime: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 1,
  },
  selectedTipBox: {
    backgroundColor: colors.accentRamp[100],
    borderRadius: radius.sm,
    padding: 9,
    marginTop: 8,
  },
  selectedTipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.accentRamp[800],
    lineHeight: 16,
  },
});

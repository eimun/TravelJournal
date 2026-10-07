import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { useTrip } from '../../src/context/TripContext';

export default function RouteModeSelector() {
  const {
    multimodalPlan,
    selectedRouteMode,
    setRouteMode,
    destination,
  } = useTrip();

  if (!destination || !multimodalPlan || !multimodalPlan.options) {
    return null;
  }

  const { options, isShortDistance, distanceKm, recommendationReason } = multimodalPlan;
  const activeMode = selectedRouteMode || multimodalPlan.recommendedMode || 'metro';

  return (
    <View style={styles.container}>
      {/* Smart Urban Travel Recommendation Banner */}
      <View style={[
        styles.recommendationBanner,
        isShortDistance ? styles.bannerShort : styles.bannerLong,
      ]}>
        <Text style={styles.bannerEmoji}>
          {isShortDistance ? '⚡' : '🛡️'}
        </Text>
        <View style={{ flex: 1 }}>
          <Text style={[
            styles.bannerTitle,
            isShortDistance ? styles.bannerTitleShort : styles.bannerTitleLong,
          ]}>
            {isShortDistance
              ? `Short Distance (${distanceKm} km) · Direct Auto Recommended`
              : `Long Distance (${distanceKm} km) · Metro Rail Beats Traffic`}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {recommendationReason}
          </Text>
        </View>
      </View>

      {/* Mode Comparison Scrollable Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {options.map((opt) => {
          const isSelected = activeMode === opt.id;
          const isRecommended = multimodalPlan.recommendedMode === opt.id;

          return (
            <Pressable
              key={opt.id}
              onPress={() => setRouteMode(opt.id)}
              style={({ pressed }) => [
                styles.modeCard,
                isSelected && styles.modeCardActive,
                opt.id === 'auto' && isSelected && styles.modeCardAutoActive,
                opt.id === 'cab' && isSelected && styles.modeCardCabActive,
                opt.id === 'bus' && isSelected && styles.modeCardBusActive,
                pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
              ]}
            >
              {/* Top Tag / Pill */}
              <View style={styles.cardHeaderRow}>
                <View style={[
                  styles.tagPill,
                  isRecommended && styles.tagPillRecommended,
                  opt.id === 'auto' && isShortDistance && styles.tagPillFastest,
                ]}>
                  <Text style={[
                    styles.tagPillText,
                    isRecommended && styles.tagPillTextRecommended,
                    opt.id === 'auto' && isShortDistance && styles.tagPillTextFastest,
                  ]}>
                    {opt.tag}
                  </Text>
                </View>

                {isSelected && (
                  <View style={styles.activeCheckDot}>
                    <Text style={styles.activeCheckText}>✓</Text>
                  </View>
                )}
              </View>

              {/* Mode Icon & Name */}
              <View style={styles.modeIconRow}>
                <Text style={styles.modeEmoji}>{opt.icon}</Text>
                <Text style={[
                  styles.modeTitle,
                  isSelected && styles.modeTitleActive,
                ]}>
                  {opt.title}
                </Text>
              </View>

              {/* Metric Row: Duration & Cost */}
              <View style={styles.metricsRow}>
                <Text style={[
                  styles.durationText,
                  isSelected && styles.durationTextActive,
                ]}>
                  ~{opt.durationMinutes} min
                </Text>
                <Text style={[
                  styles.costText,
                  isSelected && styles.costTextActive,
                ]}>
                  ₹{opt.cost}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 6,
  },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.md,
    marginBottom: 10,
    borderWidth: 1,
  },
  bannerShort: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  bannerLong: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  bannerEmoji: {
    fontSize: 18,
  },
  bannerTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
  },
  bannerTitleShort: {
    color: '#92400e',
  },
  bannerTitleLong: {
    color: '#1e40af',
  },
  bannerSubtitle: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#475569',
    marginTop: 1,
    lineHeight: 15,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 10,
    paddingBottom: 4,
  },
  modeCard: {
    width: 148,
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 10,
    ...shadow.sm,
  },
  modeCardActive: {
    borderColor: colors.accentRamp[600],
    backgroundColor: '#faf5ff',
    ...shadow.md,
  },
  modeCardAutoActive: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffdf5',
  },
  modeCardCabActive: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff',
  },
  modeCardBusActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tagPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  tagPillRecommended: {
    backgroundColor: '#dbeafe',
  },
  tagPillFastest: {
    backgroundColor: '#fef3c7',
  },
  tagPillText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    color: '#475569',
    letterSpacing: 0.2,
  },
  tagPillTextRecommended: {
    color: '#1d4ed8',
  },
  tagPillTextFastest: {
    color: '#b45309',
  },
  activeCheckDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accentRamp[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCheckText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  modeEmoji: {
    fontSize: 18,
  },
  modeTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: '#1e293b',
    flex: 1,
  },
  modeTitleActive: {
    color: '#0f172a',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 6,
  },
  durationText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: '#64748b',
  },
  durationTextActive: {
    color: colors.neutral[900],
  },
  costText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: '#059669',
  },
  costTextActive: {
    color: '#047857',
  },
});

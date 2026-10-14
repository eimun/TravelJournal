import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, modeColors, radius, shadow } from '../theme/tokens';
import { useTrip } from '../../src/context/TripContext';
import { buildSavingsCard, recordSavings } from '../services/savingsService';
import { FOOD_MENUS } from '../data/bengaluruTrails';

export default function RouteModeSelector() {
  const { multimodalPlan, selectedRouteMode, setRouteMode, destination, fireToast } = useTrip();

  if (!destination || !multimodalPlan || !multimodalPlan.options) {
    return null;
  }

  const { options, isShortDistance, distanceKm, recommendationReason } = multimodalPlan;
  const activeMode = selectedRouteMode || multimodalPlan.recommendedMode || 'metro';

  return (
    <View style={styles.container}>
      {/* Route recommendation banner: White card on green background */}
      <View style={styles.recommendationBanner}>
        <View style={[styles.bannerAccentDot, { backgroundColor: colors.accentRamp[600] }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle} numberOfLines={1}>
            {isShortDistance
              ? `Short hop · ${distanceKm} km — fastest by auto`
              : `${distanceKm} km across town — metro beats traffic`}
          </Text>
          <Text style={styles.bannerSubtitle} numberOfLines={1}>
            {recommendationReason}
          </Text>
        </View>
      </View>

      {/* Travel-mode cards horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {options.map((opt) => {
          const isSelected = activeMode === opt.id;
          const isRecommended = multimodalPlan.recommendedMode === opt.id;
          const modeColor = modeColors[opt.id] || colors.accentRamp[600];

          return (
            <Pressable
              key={opt.id}
              onPress={() => {
                setRouteMode(opt.id);
                if (opt.id !== 'cab' && multimodalPlan.routes?.cab?.totalCost) {
                  const card = buildSavingsCard(
                    multimodalPlan.routes.cab.totalCost,
                    opt.cost,
                    FOOD_MENUS,
                  );
                  if (card.hasData && card.savedInr > 0) {
                    recordSavings({
                      amountInr: card.savedInr,
                      label: `${opt.title} to ${destination?.name || 'destination'} instead of cab`,
                      tripLabel: destination?.name || '',
                    })
                      .then((event) => {
                        if (event) {
                          fireToast(card.sentence || `💰 Saved ₹${card.savedInr} vs Direct Cab!`);
                        }
                      })
                      .catch(() => {});
                  }
                }
              }}
              style={({ pressed }) => [
                styles.modeCard,
                isSelected && styles.modeCardSelected,
                pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
              ]}
            >
              {isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedBadgeText}>BEST</Text>
                </View>
              )}

              {/* Mode Icon Disc */}
              <View
                style={[
                  styles.modeIconDisc,
                  { backgroundColor: isSelected ? modeColor : `${modeColor}18` },
                ]}
              >
                <Text style={styles.modeIconText}>{opt.icon}</Text>
              </View>

              {/* Title */}
              <Text
                numberOfLines={1}
                style={[styles.modeTitleText, isSelected && styles.modeTitleTextActive]}
              >
                {opt.title}
              </Text>

              {/* Meta: Duration & Cost */}
              <Text
                numberOfLines={1}
                style={[styles.modeMetaText, isSelected && styles.modeMetaTextActive]}
              >
                {opt.durationMinutes}m · ₹{opt.cost}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 0,
  },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...shadow.sm,
  },
  bannerAccentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bannerTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  bannerSubtitle: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#475569',
    marginTop: 1,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 6,
  },
  modeCard: {
    alignItems: 'center',
    width: 102,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    position: 'relative',
    ...shadow.sm,
  },
  modeCardSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    ...shadow.md,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#15803d',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    zIndex: 10,
  },
  recommendedBadgeText: {
    fontSize: 8.5,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  modeIconDisc: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  modeIconText: {
    fontSize: 18,
  },
  modeTitleText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
    textAlign: 'center',
  },
  modeTitleTextActive: {
    color: '#0f172a',
    fontFamily: fontFamily.bodyBold,
  },
  modeMetaText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#64748b',
    marginTop: 3,
    textAlign: 'center',
  },
  modeMetaTextActive: {
    color: '#15803d',
    fontFamily: fontFamily.bodyBold,
  },
});

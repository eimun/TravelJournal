import React from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { PURPLE_LINE, GREEN_LINE, BUS_LINE } from '../data/bengaluruData';

export default function PlaceDetailSheet({
  place,
  isAdded,
  onClose,
  onToggleAdd,
}) {
  if (!place) return null;

  const getLineColor = (line) => {
    if (line === 'purple') return PURPLE_LINE;
    if (line === 'green') return GREEN_LINE;
    return BUS_LINE;
  };

  const lineColor = getLineColor(place.line);
  const Container = Platform.OS === 'web' ? View : Modal;
  const containerProps = Platform.OS === 'web'
    ? { style: [StyleSheet.absoluteFill, { zIndex: 1000 }] }
    : { visible: true, transparent: true, animationType: 'slide', onRequestClose: onClose };

  return (
    <Container {...containerProps}>
      <View style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={styles.sheetContainer}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {place.image && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: place.image }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
              </View>
            )}

            <View style={styles.innerBody}>
              <Text style={styles.kicker}>{place.kicker}</Text>
              <Text style={styles.title}>{place.name}</Text>
              <Text style={styles.blurb}>{place.blurb}</Text>

              {/* What It Costs Card */}
              <View style={styles.card}>
                <Text style={styles.cardSectionLabel}>WHAT IT COSTS</Text>
                <View style={styles.costList}>
                  {place.costs.map((item, index) => (
                    <View key={index} style={styles.costRow}>
                      <Text style={styles.costLabel}>{item.label}</Text>
                      <Text style={styles.costAmount}>{item.amount}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.costTotalRow}>
                  <Text style={styles.totalLabel}>All in</Text>
                  <Text style={styles.totalAmount}>₹{place.total}</Text>
                </View>
              </View>

              {/* Transit Steps */}
              <Text style={styles.sectionHeader}>How to get here</Text>
              <View style={styles.transitContainer}>
                {place.steps.map((step, index) => {
                  const isLast = index === place.steps.length - 1;
                  return (
                    <View key={index} style={styles.stepRow}>
                      <View style={styles.stepperCol}>
                        <View
                          style={[
                            styles.stepperDot,
                            { backgroundColor: lineColor },
                          ]}
                        />
                        {!isLast && (
                          <View
                            style={[
                              styles.stepperRail,
                              { borderColor: lineColor },
                            ]}
                          />
                        )}
                      </View>
                      <View style={[styles.stepContent, !isLast && { paddingBottom: 16 }]}>
                        <Text style={styles.stepTitle}>{step.title}</Text>
                        <Text style={styles.stepMeta}>{step.meta}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Auto Advisory */}
              {place.autoTitle && (
                <View style={styles.autoAdvisoryCard}>
                  <View style={styles.advisoryHeader}>
                    <Svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={colors.accentRamp[800]}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <Path d="M12 9v4" />
                      <Path d="M12 17h.01" />
                    </Svg>
                    <Text style={styles.advisoryTitle}>{place.autoTitle}</Text>
                  </View>
                  <Text style={styles.advisoryBody}>{place.autoBody}</Text>
                </View>
              )}

              {/* Eateries */}
              {place.eats && place.eats.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>Eat within 10 minutes</Text>
                  <View style={styles.eatsList}>
                    {place.eats.map((eat, index) => (
                      <View key={index} style={styles.eatCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.eatName}>{eat.name}</Text>
                          <Text style={styles.eatMeta}>{eat.meta}</Text>
                        </View>
                        <Text style={styles.eatPrice}>₹{eat.price}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Verified note */}
              <View style={styles.verifiedRow}>
                <View style={styles.verifiedDot} />
                <Text style={styles.verifiedText}>
                  Entry, fare and hours verified 12 Aug 2026 · works offline
                </Text>
              </View>

              {/* Button */}
              <Pressable
                onPress={() => onToggleAdd(place.id)}
                style={({ pressed }) => [
                  styles.actionButton,
                  isAdded && styles.actionButtonAdded,
                  pressed && { transform: [{ translateY: 2 }] },
                ]}
              >
                <Text style={styles.actionButtonText}>
                  {isAdded ? '✓ Added to today' : 'Add to today'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(32, 30, 29, 0.44)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: colors.bg,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral[400],
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.neutral[300],
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  innerBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  kicker: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1.2,
    color: colors.accentRamp[700],
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    marginTop: 4,
    lineHeight: 32,
  },
  blurb: {
    fontSize: 14,
    fontFamily: fontFamily.body,
    lineHeight: 21,
    color: colors.neutral[700],
    marginTop: 8,
  },
  card: {
    marginTop: 16,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.sm,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1,
    color: colors.neutral[600],
    marginBottom: 10,
  },
  costList: {
    gap: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 13.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[800],
  },
  costAmount: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  costTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46, 43, 37, 0.12)',
  },
  totalLabel: {
    fontSize: 17,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  totalAmount: {
    fontSize: 22,
    fontFamily: fontFamily.heading,
    color: colors.accentRamp[700],
  },
  sectionHeader: {
    fontSize: 19,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    marginTop: 20,
    marginBottom: 10,
  },
  transitContainer: {
    marginTop: 4,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 13,
  },
  stepperCol: {
    width: 24,
    alignItems: 'center',
  },
  stepperDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepperRail: {
    width: 0,
    flex: 1,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  stepMeta: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
    lineHeight: 18,
  },
  autoAdvisoryCard: {
    marginTop: 14,
    backgroundColor: colors.accentRamp[200],
    borderRadius: radius.lg,
    padding: 15,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advisoryTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
  },
  advisoryBody: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.accentRamp[800],
    marginTop: 8,
    lineHeight: 18,
  },
  eatsList: {
    gap: 9,
    marginTop: 4,
  },
  eatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 13,
    ...shadow.sm,
  },
  eatName: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  eatMeta: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  eatPrice: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    marginLeft: 10,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  verifiedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent2Ramp[500],
  },
  verifiedText: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    flex: 1,
  },
  actionButton: {
    marginTop: 18,
    backgroundColor: colors.accentRamp[500],
    borderRadius: radius.pill,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  actionButtonAdded: {
    backgroundColor: colors.accent2Ramp[600],
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
});

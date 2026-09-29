import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { MAJESTIC_STATION } from '../data/stationBlueprintData';
import { useTrip } from '../../src/context/TripContext';

export default function StationBlueprintModal({ visible, onClose, initialPathId = null }) {
  const { seniorMode } = useTrip();
  const [activeLevelId, setActiveLevelId] = useState('L0');
  const [activePathId, setActivePathId] = useState(initialPathId || 'ksr_to_purple');
  const [viewMode, setViewMode] = useState(initialPathId ? 'paths' : 'levels'); // 'levels' | 'paths'

  if (!visible) return null;

  const currentLevel = MAJESTIC_STATION.levels.find((l) => l.id === activeLevelId) || MAJESTIC_STATION.levels[0];
  const currentPath = MAJESTIC_STATION.presetPaths.find((p) => p.id === activePathId) || MAJESTIC_STATION.presetPaths[0];

  const Container = Platform.OS === 'web' ? View : Modal;
  const containerProps =
    Platform.OS === 'web'
      ? { style: [StyleSheet.absoluteFill, { zIndex: 1200 }] }
      : { transparent: true, visible: true, animationType: 'slide', onRequestClose: onClose };

  return (
    <Container {...containerProps}>
      {/* Dimmed backdrop */}
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </View>

      {/* Main Blueprint Sheet */}
      <View style={styles.modalCard}>
        {/* Top Handle */}
        <View style={styles.handleBar} />

        {/* Modal Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.headerBadgeRow}>
              <View style={styles.hubBadge}>
                <Text style={styles.hubBadgeText}>STATION BLUEPRINT</Text>
              </View>
              <View style={styles.depthPill}>
                <Text style={styles.depthPillText}>21m Underground · 4 Levels</Text>
              </View>
            </View>
            <Text style={styles.stationTitle}>Majestic Interchange Hub</Text>
            <Text style={styles.stationSub}>Nadaprabhu Kempegowda Station (MJC)</Text>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[700]} strokeWidth={2.5}>
              <Path d="M18 6L6 18M6 6l12 12" />
            </Svg>
          </Pressable>
        </View>

        {/* Mode Selector Tab (Level Blueprint vs Guided Step-by-Step Path) */}
        <View style={styles.modeToggleRow}>
          <Pressable
            onPress={() => setViewMode('levels')}
            style={[styles.modeToggleBtn, viewMode === 'levels' && styles.modeToggleBtnActive]}
          >
            <Text style={[styles.modeToggleBtnText, viewMode === 'levels' && styles.modeToggleBtnTextActive]}>
              🏢 4-Level Cross-Section
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setViewMode('paths')}
            style={[styles.modeToggleBtn, viewMode === 'paths' && styles.modeToggleBtnActive]}
          >
            <Text style={[styles.modeToggleBtnText, viewMode === 'paths' && styles.modeToggleBtnTextActive]}>
              🗺️ Step-by-Step Paths ({MAJESTIC_STATION.presetPaths.length})
            </Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {viewMode === 'levels' ? (
            <>
              {/* Visual Multi-Level Elevation Cross-Section */}
              <View style={styles.elevationCrossSection}>
                <Text style={styles.sectionHeading}>INTERCHANGE ELEVATION</Text>
                <View style={styles.elevationStack}>
                  {MAJESTIC_STATION.levels.map((lvl) => {
                    const isSelected = lvl.id === activeLevelId;
                    return (
                      <Pressable
                        key={lvl.id}
                        onPress={() => setActiveLevelId(lvl.id)}
                        style={({ pressed }) => [
                          styles.elevationLayer,
                          { borderLeftColor: lvl.color },
                          isSelected && styles.elevationLayerSelected,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <View style={styles.elevationLeft}>
                          <Text style={[styles.elevationLevelLabel, isSelected && { color: lvl.color }]}>
                            {lvl.label}
                          </Text>
                          <Text style={styles.elevationDepth}>{lvl.depth}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.elevationTitle, isSelected && { color: colors.neutral[900], fontFamily: fontFamily.bodyBold }]}>
                            {lvl.title}
                          </Text>
                          <Text style={styles.elevationSub} numberOfLines={1}>
                            {lvl.subtitle}
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={[styles.activeDot, { backgroundColor: lvl.color }]} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Detailed View of Currently Selected Level */}
              <View style={styles.levelDetailCard}>
                <View style={[styles.levelDetailHeader, { backgroundColor: currentLevel.color }]}>
                  <View>
                    <Text style={styles.levelDetailLabel}>{currentLevel.label} · {currentLevel.depth}</Text>
                    <Text style={styles.levelDetailTitle}>{currentLevel.title}</Text>
                  </View>
                  <Text style={styles.levelDetailSub}>{currentLevel.subtitle}</Text>
                </View>

                <View style={styles.levelDetailBody}>
                  {/* Level 0: Gates */}
                  {currentLevel.gates && (
                    <View style={styles.gatesSection}>
                      <Text style={styles.subsectionTitle}>ENTRANCE & EXIT GATES</Text>
                      <View style={styles.gatesGrid}>
                        {currentLevel.gates.map((g) => (
                          <View key={g.id} style={styles.gateCard}>
                            <View style={styles.gateTopRow}>
                              <View style={styles.gateBadge}>
                                <Text style={styles.gateBadgeText}>{g.label}</Text>
                              </View>
                              <View style={styles.gateCategoryBadge}>
                                <Text style={styles.gateCategoryBadgeText}>{g.badge}</Text>
                              </View>
                            </View>
                            <Text style={styles.gateConnectsTo}>{g.connectsTo}</Text>
                            <View style={styles.gateFooterRow}>
                              <Text style={styles.gateWalkText}>⏱️ ~{g.walkMins} min walk</Text>
                              {g.accessible ? (
                                <Text style={styles.gateAccessText}>♿ Lift/Ramp</Text>
                              ) : (
                                <Text style={styles.gateStairsText}>🪜 Stairs only</Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Level -1: Concourse Zones */}
                  {currentLevel.zones && (
                    <View style={styles.zonesSection}>
                      <Text style={styles.subsectionTitle}>CONCOURSE HUBS & FACILITIES</Text>
                      {currentLevel.zones.map((z, idx) => (
                        <View key={idx} style={styles.zoneCard}>
                          <Text style={styles.zoneIcon}>{z.icon}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.zoneTitle}>{z.title}</Text>
                            <Text style={styles.zoneDesc}>{z.desc}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Level -2 or -3: Metro Platforms */}
                  {currentLevel.platforms && (
                    <View style={styles.platformsSection}>
                      <Text style={styles.subsectionTitle}>ACTIVE PLATFORMS</Text>
                      {currentLevel.platforms.map((p) => (
                        <View
                          key={p.number}
                          style={[
                            styles.platformCard,
                            { borderLeftColor: p.line === 'green' ? '#10b981' : '#8b5cf6' },
                          ]}
                        >
                          <View style={styles.platformCardHeader}>
                            <View
                              style={[
                                styles.platformPill,
                                { backgroundColor: p.line === 'green' ? '#10b981' : '#8b5cf6' },
                              ]}
                            >
                              <Text style={styles.platformPillText}>PLATFORM {p.number}</Text>
                            </View>
                            <Text style={styles.platformHeadway}>⏱️ {p.headway}</Text>
                          </View>
                          <Text style={styles.platformTowards}>{p.towards}</Text>
                          <View style={styles.coachTipCard}>
                            <Text style={styles.coachTipText}>💡 {p.coachPositions}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Facilities Row */}
                  {currentLevel.facilities && (
                    <View style={styles.facilitiesSection}>
                      <Text style={styles.subsectionTitle}>STATION SERVICES AT THIS LEVEL</Text>
                      <View style={styles.facilitiesWrap}>
                        {currentLevel.facilities.map((f, i) => (
                          <View key={i} style={styles.facilityPill}>
                            <Text style={{ fontSize: 13 }}>{f.icon}</Text>
                            <View>
                              <Text style={styles.facilityName}>{f.name}</Text>
                              <Text style={styles.facilityLoc}>{f.location}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </>
          ) : (
            /* Guided Step-by-Step Path Simulator */
            <View style={styles.pathsContainer}>
              <Text style={styles.sectionHeading}>SELECT COMMUTE TRANSIT ROUTE</Text>

              {/* Path Selector Buttons */}
              <View style={styles.pathSelectorStrip}>
                {MAJESTIC_STATION.presetPaths.map((p) => {
                  const isSelected = p.id === activePathId;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setActivePathId(p.id)}
                      style={({ pressed }) => [
                        styles.pathChip,
                        isSelected && styles.pathChipActive,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text style={[styles.pathChipText, isSelected && styles.pathChipTextActive]}>
                        {p.shortTitle}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Selected Path Guide Card */}
              <View style={styles.pathGuideCard}>
                <View style={styles.pathGuideHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pathGuideTitle}>{currentPath.title}</Text>
                    <Text style={styles.pathGuideOriginDest}>
                      From {currentPath.origin} ➔ {currentPath.dest}
                    </Text>
                  </View>
                  <View style={styles.pathMetrics}>
                    <Text style={styles.pathWalkMins}>{currentPath.walkMins} min</Text>
                    <Text style={styles.pathWalkMeters}>{currentPath.walkMeters}m walk</Text>
                  </View>
                </View>

                {/* Senior / Accessibility Badge */}
                {seniorMode && currentPath.stepFree && (
                  <View style={styles.seniorStepFreeBanner}>
                    <Text style={{ fontSize: 14 }}>👵👴</Text>
                    <Text style={styles.seniorStepFreeText}>
                      Mom & Dad Mode Active: 100% Step-free elevator route highlighted!
                    </Text>
                  </View>
                )}

                {/* Step Sequence */}
                <View style={styles.stepSequence}>
                  {currentPath.steps.map((st, idx) => (
                    <View key={idx} style={styles.stepItemRow}>
                      <View style={styles.stepIconCircle}>
                        <Text style={{ fontSize: 13 }}>{st.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stepItemTitle}>
                          {idx + 1}. {st.title}
                        </Text>
                        <Text style={styles.stepItemDesc}>{st.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Luggage / Cloakroom Tip Card */}
                <View style={styles.cloakroomTipCard}>
                  <View style={styles.cloakroomIconCircle}>
                    <Text style={{ fontSize: 16 }}>🧳</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cloakroomTipTitle}>Heavy Luggage / Cloakroom Support</Text>
                    <Text style={styles.cloakroomTipDesc}>
                      Counter 4 on Level -1 has a secure cloakroom for ₹20/day. Keep your Aadhaar / Govt ID ready before entering security.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  modalCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '92%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.lg,
    overflow: 'hidden',
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.neutral[300],
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  hubBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  hubBadgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: '#1d4ed8',
    letterSpacing: 0.5,
  },
  depthPill: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  depthPillText: {
    fontSize: 9,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
  },
  stationTitle: {
    fontSize: 18,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  stationSub: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    marginLeft: 12,
  },
  modeToggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    gap: 8,
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface[200],
  },
  modeToggleBtnActive: {
    backgroundColor: colors.neutral[900],
  },
  modeToggleBtnText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  modeToggleBtnTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  elevationCrossSection: {
    marginBottom: 16,
  },
  elevationStack: {
    backgroundColor: colors.surface[100],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
  },
  elevationLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    gap: 12,
  },
  elevationLayerSelected: {
    backgroundColor: '#ffffff',
  },
  elevationLeft: {
    minWidth: 70,
  },
  elevationLevelLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  elevationDepth: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
  },
  elevationTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[800],
  },
  elevationSub: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelDetailCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
    ...shadow.sm,
  },
  levelDetailHeader: {
    padding: 14,
  },
  levelDetailLabel: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.5,
  },
  levelDetailTitle: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: '#ffffff',
    marginTop: 2,
  },
  levelDetailSub: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  levelDetailBody: {
    padding: 14,
  },
  subsectionTitle: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  gatesSection: {
    marginBottom: 16,
  },
  gatesGrid: {
    gap: 8,
  },
  gateCard: {
    backgroundColor: colors.surface[50],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 10,
  },
  gateTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gateBadge: {
    backgroundColor: colors.neutral[900],
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  gateBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
  },
  gateCategoryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  gateCategoryBadgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[600],
  },
  gateConnectsTo: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[800],
    marginBottom: 6,
  },
  gateFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gateWalkText: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
  },
  gateAccessText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#16a34a',
  },
  gateStairsText: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
  },
  zonesSection: {
    marginBottom: 16,
  },
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface[50],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  zoneIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  zoneTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  zoneDesc: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
    lineHeight: 15,
  },
  platformsSection: {
    marginBottom: 16,
  },
  platformCard: {
    backgroundColor: colors.surface[50],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 10,
  },
  platformCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  platformPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  platformPillText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  platformHeadway: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[600],
  },
  platformTowards: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
    lineHeight: 17,
  },
  coachTipCard: {
    backgroundColor: '#fffbeb',
    borderRadius: radius.xs,
    padding: 6,
    marginTop: 8,
  },
  coachTipText: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#92400e',
  },
  facilitiesSection: {
    marginTop: 4,
  },
  facilitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface[100],
    borderRadius: radius.md,
    paddingHorizontal: 9,
    paddingVertical: 6,
    gap: 6,
    flexBasis: '48%',
  },
  facilityName: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  facilityLoc: {
    fontSize: 9.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
  },
  pathsContainer: {
    gap: 12,
  },
  pathSelectorStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  pathChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  pathChipActive: {
    backgroundColor: colors.neutral[900],
    borderColor: colors.neutral[900],
  },
  pathChipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  pathChipTextActive: {
    color: '#ffffff',
  },
  pathGuideCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 16,
    ...shadow.sm,
  },
  pathGuideHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    marginBottom: 12,
  },
  pathGuideTitle: {
    fontSize: 15,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  pathGuideOriginDest: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  pathMetrics: {
    alignItems: 'flex-end',
  },
  pathWalkMins: {
    fontSize: 15,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
  },
  pathWalkMeters: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
  },
  seniorStepFreeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  seniorStepFreeText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
    lineHeight: 16,
  },
  stepSequence: {
    gap: 12,
    marginBottom: 16,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepItemTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  stepItemDesc: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
    lineHeight: 15,
  },
  cloakroomTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: radius.md,
    padding: 12,
    gap: 10,
  },
  cloakroomIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloakroomTipTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: '#1e40af',
  },
  cloakroomTipDesc: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#1e3a8a',
    marginTop: 2,
    lineHeight: 15,
  },
});

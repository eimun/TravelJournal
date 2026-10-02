import React, { useState, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { PURPLE_LINE, GREEN_LINE } from '../data/transitData';
import { useTrip } from '../../src/context/TripContext';
import ConnectingLegSelector from './ConnectingLegSelector';
import StationBlueprintModal from './StationBlueprintModal';
import SafetyPingModal from './SafetyPingModal';

export default function RouteDetailSheet({ route, onFocusMap }) {
  const { fireToast, activeStepIndex, setActiveStepIndex, seniorMode, toggleSeniorMode } = useTrip();
  const [expandedStationStep, setExpandedStationStep] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedModes, setSelectedModes] = useState({});
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [blueprintPathId, setBlueprintPathId] = useState(null);
  const [showSavingsBreakdown, setShowSavingsBreakdown] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const routeSteps = route?.steps;
  const effectiveSteps = useMemo(() => {
    if (!routeSteps) return [];
    return routeSteps.map((step) => {
      if (step.modes) {
        const modeKey = selectedModes[step.id] || step.selectedMode || step.defaultMode || 'auto';
        const m = step.modes[modeKey];
        if (m) {
          return {
            ...step,
            selectedMode: modeKey,
            title: m.title,
            meta: m.meta,
            details: m.details,
            tip: m.tip,
            cost: m.fare,
            durationMinutes: m.durationMinutes,
          };
        }
      }
      return step;
    });
  }, [routeSteps, selectedModes]);

  const dynamicTotalCost = useMemo(() => {
    return effectiveSteps.reduce((sum, s) => sum + (s.cost || 0), 0);
  }, [effectiveSteps]);

  const dynamicTotalDuration = useMemo(() => {
    return Math.round(effectiveSteps.reduce((sum, s) => sum + (s.durationMinutes || 0), 0));
  }, [effectiveSteps]);

  if (!route) return null;

  const toggleIntermediate = (stepId) => {
    setExpandedStationStep((prev) => (prev === stepId ? null : stepId));
  };

  const handleStartNav = () => {
    setIsNavigating(true);
    fireToast('Navigation active! Follow step 1.');
  };

  const advisory = route?.autoAdvisory;
  const directCabFare = advisory?.cabFare || Math.max(140, Math.round(dynamicTotalCost * 5.5));
  const directCabMinutes = advisory?.cabDurationMinutes || Math.round(dynamicTotalDuration * 1.5 + 10);
  const moneySaved = Math.max(0, directCabFare - dynamicTotalCost);
  const savingsPct = directCabFare > 0 ? Math.round((moneySaved / directCabFare) * 100) : 0;
  const foodEquivalent = advisory?.foodEquivalent || (moneySaved > 85 ? `${Math.floor(moneySaved / 85)} Benne Dosas` : '2 Filter Coffees');

  const metroStep = effectiveSteps.find((s) => s.type === 'metro') || effectiveSteps[0];
  const safetyStation = metroStep?.platformInfo?.originStationName || route?.originName || 'Namma Metro';
  const safetyGate = metroStep?.platformInfo?.entryGate || 'Gate 1';
  const safetyLine = metroStep?.line === 'green' ? 'Green Line Metro' : 'Purple Line Metro';
  const safetyTowards = metroStep?.platformInfo?.towards || '';

  return (
    <View style={styles.sheet}>
      {/* Route Quick Summary Card */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryTopRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{route.routeCategory}</Text>
          </View>
          <View style={styles.costBadge}>
            <Text style={styles.costBadgeText}>₹{dynamicTotalCost} all-in</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View>
            <Text style={styles.durationBig}>{dynamicTotalDuration} min</Text>
            <Text style={styles.distanceSmall}>{route.totalDistanceText} total distance</Text>
          </View>

          <Pressable
            onPress={handleStartNav}
            style={({ pressed }) => [
              styles.navStartBtn,
              isNavigating && styles.navStartBtnActive,
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2.5}>
              <Path d="M3 11l19-9-9 19-2-8-8-2z" />
            </Svg>
            <Text style={styles.navStartBtnText}>
              {isNavigating ? 'Navigating' : 'Start'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Clean Quick Utilities Strip (Mom & Dad Mode + Savings Callout + 1-Tap Family Ping) */}
      <View style={styles.utilityActionStrip}>
        <Pressable
          onPress={() => {
            toggleSeniorMode();
            fireToast(
              !seniorMode
                ? '🧓 Mom & Dad Mode active! Lifts & minimal walking prioritized.'
                : 'Standard explorer mode restored.'
            );
          }}
          style={({ pressed }) => [
            styles.seniorPillBtn,
            seniorMode && styles.seniorPillBtnActive,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.seniorPillEmoji}>🧓</Text>
          <Text style={[styles.seniorPillLabel, seniorMode && styles.seniorPillLabelActive]}>
            {seniorMode ? 'Mom & Dad' : 'Mom & Dad'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowSavingsBreakdown((prev) => !prev)}
          style={({ pressed }) => [
            styles.savingsCompactPill,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.savingsCompactEmoji}>💰</Text>
          <Text style={styles.savingsCompactText}>Save ₹{moneySaved}</Text>
          <Text style={styles.savingsChevron}>{showSavingsBreakdown ? '▲' : '▼'}</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowSafetyModal(true)}
          style={({ pressed }) => [
            styles.safetyPillBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.safetyPillEmoji}>🛡️</Text>
          <Text style={styles.safetyPillLabel}>Family Ping</Text>
        </Pressable>
      </View>

      {/* Expandable Fare Comparison & Food Reward Breakdown */}
      {showSavingsBreakdown && (
        <View style={styles.comparatorCard}>
          <View style={styles.comparatorHeaderRow}>
            <View style={styles.comparatorTagBadge}>
              <Text style={styles.comparatorTagText}>FARE COMPARISON & SAVINGS</Text>
            </View>
            <View style={styles.savingsPill}>
              <Text style={styles.savingsPillText}>💰 Save ₹{moneySaved}</Text>
            </View>
          </View>

          {/* Side-by-Side Comparison Columns */}
          <View style={styles.comparisonGrid}>
            <View style={styles.cabCol}>
              <View style={styles.colHeaderRow}>
                <Text style={styles.colEmoji}>🚖</Text>
                <Text style={styles.colTitle}>Direct Cab</Text>
              </View>
              <Text style={styles.colSub}>Uber / Ola direct</Text>
              <Text style={styles.cabFareText}>~₹{directCabFare}</Text>
              <Text style={styles.cabDurationText}>⏱️ {directCabMinutes} min (traffic)</Text>
              <View style={styles.cabRiskBadge}>
                <Text style={styles.cabRiskText}>Surge + Traffic Block</Text>
              </View>
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.transitCol}>
              <View style={styles.colHeaderRow}>
                <Text style={styles.colEmoji}>🚇</Text>
                <Text style={styles.colTitle}>Metro + Auto</Text>
              </View>
              <Text style={styles.colSub}>Step-by-step route</Text>
              <Text style={styles.transitFareText}>₹{dynamicTotalCost}</Text>
              <Text style={styles.transitDurationText}>⚡ {dynamicTotalDuration} min (fast)</Text>
              <View style={styles.transitWinBadge}>
                <Text style={styles.transitWinText}>{savingsPct}% Cheaper</Text>
              </View>
            </View>
          </View>

          {/* Street Food Conversion Banner */}
          <View style={styles.foodRewardBanner}>
            <Text style={styles.foodRewardEmoji}>🥞</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.foodRewardTitle}>
                You save ₹{moneySaved} on this ride!
              </Text>
              <Text style={styles.foodRewardSubtitle}>
                Equivalent to {foodEquivalent}! Enjoy local delicacies with the money saved.
              </Text>
            </View>
          </View>

          {/* Anti-Scam Shield & Auto Meter Tip */}
          {advisory && (
            <View style={styles.scamShieldBox}>
              <Text style={styles.scamShieldTitle}>🛡️ LOCAL SCAM SHIELD</Text>
              <Text style={styles.scamShieldText}>
                Official meter rate: ~₹{advisory.fare || 30}. {advisory.scamAlert || 'Never pay street quotes over 1.5x meter.'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Step-by-Step Stepper with Interactive Map Highlights */}
      <View style={styles.stepperHeaderRow}>
        <Text style={styles.stepperSectionHeading}>EXACT STEP-BY-STEP ROUTE</Text>
        <Text style={styles.stepperHelpText}>Tap any step to see road on map</Text>
      </View>

      <View style={styles.stepperList}>
        {effectiveSteps.map((step, idx) => {
          const isLast = idx === effectiveSteps.length - 1;
          const isMetro = step.type === 'metro';
          const isTransfer = step.type === 'transfer';
          const isAuto = step.type === 'auto' || step.selectedMode === 'auto';
          const isSelected = activeStepIndex === idx;
          const stepLineColor = step.line === 'green' ? GREEN_LINE : PURPLE_LINE;

          return (
            <Pressable
              key={step.id || idx}
              onPress={() => setActiveStepIndex(isSelected ? null : idx)}
              style={({ pressed }) => [
                styles.stepRow,
                isSelected && styles.stepRowActive,
                pressed && { opacity: 0.9 },
              ]}
            >
              {/* Stepper Rail and Icons */}
              <View style={styles.railCol}>
                <View
                  style={[
                    styles.stepBadgeCircle,
                    isMetro && { backgroundColor: stepLineColor },
                    isTransfer && { backgroundColor: colors.accentRamp[700] },
                    isAuto && { backgroundColor: colors.neutral[800] },
                    !isMetro && !isTransfer && !isAuto && { backgroundColor: colors.neutral[400] },
                    isSelected && styles.stepBadgeCircleActive,
                  ]}
                >
                  <Text style={styles.stepBadgeNumber}>{idx + 1}</Text>
                </View>

                {!isLast && (
                  <View
                    style={[
                      styles.railLine,
                      isMetro && { borderLeftColor: stepLineColor, borderStyle: 'solid', borderLeftWidth: 2.5 },
                      isSelected && { borderLeftColor: colors.accentRamp[600], borderLeftWidth: 3 },
                    ]}
                  />
                )}
              </View>

              {/* Step Content */}
              <View style={[styles.stepContentCol, !isLast && { paddingBottom: 18 }]}>
                <View style={styles.stepTitleRow}>
                  <Text style={[styles.stepTitle, isSelected && styles.stepTitleActive]}>
                    {step.title}
                  </Text>
                  {step.cost > 0 && <Text style={styles.stepFare}>₹{step.cost}</Text>}
                </View>

                {isSelected && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onFocusMap?.();
                    }}
                    style={styles.stepMapActiveBadge}
                  >
                    <Text style={styles.stepMapActiveBadgeText}>📍 Highlighted on Map · Tap to View Map ⬆️</Text>
                  </Pressable>
                )}

                <Text style={styles.stepMeta}>{step.meta}</Text>
                <Text style={styles.stepDetails}>{step.details}</Text>

                {/* Metro Platform & Station Gate Guidance */}
                {step.platformInfo && (
                  <View style={styles.gatePlatformCard}>
                    <View style={styles.gatePlatformHeader}>
                      <View style={styles.platformBadge}>
                        <Text style={styles.platformBadgeText}>🚉 {step.platformInfo.platform}</Text>
                      </View>
                      <Text style={styles.platformTowardsText} numberOfLines={1}>
                        {step.platformInfo.towards}
                      </Text>
                    </View>

                    {/* Today's Live Upcoming Trains on this Route */}
                    {step.nextDeparture && (
                      <View style={styles.metroLiveTimingsBox}>
                        <View style={styles.metroLiveTimingsHeader}>
                          <View style={styles.pulseLiveRow}>
                            <View style={styles.pulseGreenDot} />
                            <Text style={styles.metroLiveTitle}>LIVE METRO TIMINGS TODAY</Text>
                          </View>
                          <View style={styles.metroFreqBadge}>
                            <Text style={styles.metroLiveFreq}>
                              {step.nextDeparture.frequencyLabel || `Every ${step.nextDeparture.frequencyMinutes || 5} min`}
                            </Text>
                          </View>
                        </View>

                        {/* Large, spacious Next Train Callout */}
                        <View style={styles.nextTrainHeroRow}>
                          <View style={styles.nextTrainHeroLeft}>
                            <Text style={styles.nextTrainHeroLabel}>NEXT TRAIN</Text>
                            <Text style={styles.nextTrainHeroTime}>{step.nextDeparture.scheduledTime}</Text>
                          </View>
                          <View style={styles.nextTrainCountdownPill}>
                            <Text style={styles.nextTrainCountdownPillText}>
                              {step.nextDeparture.nextInMinutes !== null
                                ? `In ${step.nextDeparture.nextInMinutes} mins`
                                : 'Closed'}
                            </Text>
                          </View>
                        </View>

                        {/* Consecutive Departures Today */}
                        {step.nextDeparture.departures && step.nextDeparture.departures.length > 1 && (
                          <View style={styles.metroUpcomingSection}>
                            <Text style={styles.metroUpcomingLabel}>Following trains today:</Text>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.metroUpcomingScroll}
                            >
                              {step.nextDeparture.departures.slice(1, 4).map((d, di) => (
                                <View key={di} style={styles.metroDepPill}>
                                  <Text style={styles.metroDepPillTime}>{d.timeFormatted}</Text>
                                  <View style={styles.pillSubBadge}>
                                    <Text style={styles.metroDepPillSub}>+{d.inMinutes}m</Text>
                                  </View>
                                </View>
                              ))}
                            </ScrollView>
                          </View>
                        )}

                        <Text style={styles.metroOperatingFooter}>
                          Daily Service: {step.nextDeparture.operatingHours || '05:00 AM – 23:15 PM'}
                        </Text>
                      </View>
                    )}

                    <View style={styles.gatesGrid}>
                      <View style={styles.gateCol}>
                        <Text style={styles.gateColLabel}>BOARDING ENTRY</Text>
                        <Text style={styles.gateColValue} numberOfLines={1}>
                          {step.platformInfo.entryGate}
                        </Text>
                        <Text style={styles.gateColSub} numberOfLines={1}>
                          {step.platformInfo.originStationName}
                        </Text>
                      </View>
                      <View style={styles.gateColDivider} />
                      <View style={styles.gateCol}>
                        <Text style={styles.gateColLabel}>RECOMMENDED EXIT</Text>
                        <Text style={[styles.gateColValue, { color: colors.accentRamp[700] }]} numberOfLines={1}>
                          {step.platformInfo.exitGate}
                        </Text>
                        <Text style={styles.gateColSub} numberOfLines={1}>
                          {step.platformInfo.destStationName}
                        </Text>
                      </View>
                    </View>

                    {step.platformInfo.destGates && step.platformInfo.destGates.length > 0 && (
                      <View style={styles.destGatesTipsList}>
                        <Text style={styles.destGatesHeader}>Exit Guide for {step.platformInfo.destStationName}:</Text>
                        {step.platformInfo.destGates.map((g, gi) => (
                          <Text key={gi} style={styles.gateExitItemText} numberOfLines={1}>
                            • <Text style={styles.gateExitItemBold}>{g.id}:</Text> {g.exitFor}
                          </Text>
                        ))}
                      </View>
                    )}

                    {/* Direct Blueprint Trigger for Station */}
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setBlueprintPathId(
                          step.type === 'transfer'
                            ? 'purple_to_green_transfer'
                            : 'ksr_to_purple',
                        );
                        setShowBlueprintModal(true);
                      }}
                      style={({ pressed }) => [
                        styles.blueprintActionBtn,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text style={styles.blueprintActionBtnIcon}>🏢</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.blueprintActionBtnTitle}>
                          Majestic Station Concourse Blueprint
                        </Text>
                        <Text style={styles.blueprintActionBtnSub}>
                          {step.type === 'transfer'
                            ? 'See 1-min transfer route between Purple & Green lines'
                            : 'See gate-to-platform route & step-free elevators'}
                        </Text>
                      </View>
                      <Text style={styles.blueprintActionBtnArrow}>➔</Text>
                    </Pressable>
                  </View>
                )}

                {/* Multi-modal switcher for connecting legs (Auto / Bike / Cab / Bus / Walk) */}
                {step.modes && (
                  <ConnectingLegSelector
                    step={step}
                    selectedModeKey={selectedModes[step.id] || step.selectedMode}
                    onSelectMode={(modeKey) => {
                      setSelectedModes((prev) => ({ ...prev, [step.id]: modeKey }));
                    }}
                  />
                )}

                {/* Transfer Tips for non-connecting steps */}
                {step.tip && !step.modes && (
                  <View style={styles.stepTipBox}>
                    <Text style={styles.stepTipText}>💡 {step.tip}</Text>
                  </View>
                )}

                {/* Intermediate Stations Expandable */}
                {step.intermediateStations && step.intermediateStations.length > 2 && (
                  <View style={styles.intermediateBox}>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleIntermediate(step.id);
                      }}
                      style={styles.intermediateToggle}
                    >
                      <Text style={styles.intermediateToggleText}>
                        {expandedStationStep === step.id
                          ? 'Hide station list'
                          : `View all ${step.intermediateStations.length} stations on route`}
                      </Text>
                    </Pressable>

                    {expandedStationStep === step.id && (
                      <View style={styles.intermediateStationsList}>
                        {step.intermediateStations.map((stName, stIdx) => (
                          <View key={stIdx} style={styles.stationNameItem}>
                            <View
                              style={[
                                styles.smallStationDot,
                                { backgroundColor: stepLineColor },
                              ]}
                            />
                            <Text style={styles.stationNameText}>{stName}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Majestic Concourse Blueprint Modal */}
      <StationBlueprintModal
        visible={showBlueprintModal}
        onClose={() => setShowBlueprintModal(false)}
        initialPathId={blueprintPathId}
      />

      {/* 1-Tap Family Safety Ping Modal */}
      <SafetyPingModal
        visible={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        route={route}
        currentStation={safetyStation}
        gate={safetyGate}
        lineName={safetyLine}
        towards={safetyTowards}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingTop: 10,
    paddingBottom: 24,
  },
  summaryHeader: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.sm,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: colors.accentRamp[100],
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  costBadge: {
    backgroundColor: colors.accent2Ramp[200],
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  costBadgeText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.accent2Ramp[800],
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  durationBig: {
    fontSize: 28,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    lineHeight: 32,
  },
  distanceSmall: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  navStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentRamp[500],
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 16,
    ...shadow.md,
  },
  navStartBtnActive: {
    backgroundColor: colors.accent2Ramp[600],
  },
  navStartBtnText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  liveTimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: radius.md,
    padding: 12,
    marginTop: 12,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  liveTimerTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: '#1e40af',
    letterSpacing: 0.5,
  },
  liveTimerSubtitle: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: '#1e3a8a',
    marginTop: 2,
  },
  stepperHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 20,
    marginBottom: 12,
  },
  stepperSectionHeading: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1.1,
    color: colors.neutral[600],
  },
  stepperHelpText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
  },
  stepperList: {
    marginTop: 4,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: radius.md,
    padding: 6,
    marginHorizontal: -6,
  },
  stepRowActive: {
    backgroundColor: colors.accentRamp[100],
    borderWidth: 1.5,
    borderColor: colors.accentRamp[400],
  },
  stepMapActiveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentRamp[500],
    borderRadius: radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 7,
    marginTop: 3,
    marginBottom: 4,
  },
  stepMapActiveBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  railCol: {
    width: 24,
    alignItems: 'center',
  },
  stepBadgeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeCircleActive: {
    transform: [{ scale: 1.15 }],
    ...shadow.sm,
  },
  stepTitleActive: {
    color: colors.accentRamp[900],
  },
  stepBadgeNumber: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  railLine: {
    width: 0,
    flex: 1,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderLeftColor: colors.neutral[300],
    marginVertical: 4,
  },
  stepContentCol: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  stepTitle: {
    fontSize: 14.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
    flex: 1,
  },
  stepFare: {
    fontSize: 14,
    fontFamily: fontFamily.heading,
    color: colors.accentRamp[700],
    marginLeft: 8,
  },
  stepMeta: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  stepDetails: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[800],
    marginTop: 5,
    lineHeight: 18,
  },
  stepTipBox: {
    backgroundColor: colors.accentRamp[100],
    borderRadius: radius.sm,
    padding: 8,
    marginTop: 8,
  },
  stepTipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.accentRamp[800],
    lineHeight: 16,
  },
  intermediateBox: {
    marginTop: 8,
  },
  intermediateToggle: {
    paddingVertical: 4,
  },
  intermediateToggleText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
  },
  intermediateStationsList: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.sm,
    padding: 10,
    marginTop: 6,
    gap: 6,
  },
  stationNameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallStationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stationNameText: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[800],
  },
  // Mom & Dad Mode Card Styles
  seniorToggleCard: {
    backgroundColor: '#fbf8f2',
    borderRadius: radius.md,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(198, 113, 57, 0.25)',
  },
  seniorToggleCardActive: {
    backgroundColor: '#f5efe4',
    borderColor: colors.accentRamp[600],
    borderWidth: 1.5,
  },
  seniorToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  seniorToggleIcon: {
    fontSize: 22,
  },
  seniorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  seniorTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  seniorTitleActive: {
    color: colors.accentRamp[700],
  },
  seniorStatusPill: {
    backgroundColor: colors.neutral[300],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  seniorStatusPillActive: {
    backgroundColor: colors.accentRamp[600],
  },
  seniorStatusText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
    letterSpacing: 0.6,
  },
  seniorStatusTextActive: {
    color: colors.white,
  },
  seniorSubtitle: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
    lineHeight: 15,
  },

  // Comparator & Money Saved Meter Styles
  comparatorCard: {
    backgroundColor: '#fffdf9',
    borderRadius: radius.lg,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 43, 37, 0.1)',
    ...shadow.sm,
  },
  comparatorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  comparatorTagBadge: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  comparatorTagText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    color: colors.neutral[700],
  },
  savingsPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  savingsPillText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: '#166534',
  },
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  cabCol: {
    flex: 1,
    backgroundColor: '#fef2f2',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  transitCol: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  colHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  colEmoji: {
    fontSize: 14,
  },
  colTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  colSub: {
    fontSize: 9.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 1,
  },
  cabFareText: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: '#991b1b',
    marginTop: 4,
  },
  transitFareText: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: '#166534',
    marginTop: 4,
  },
  cabDurationText: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: '#7f1d1d',
    marginTop: 2,
  },
  transitDurationText: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: '#14532d',
    marginTop: 2,
  },
  cabRiskBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  cabRiskText: {
    fontSize: 8.5,
    fontFamily: fontFamily.bodyBold,
    color: '#991b1b',
  },
  transitWinBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  transitWinText: {
    fontSize: 8.5,
    fontFamily: fontFamily.bodyBold,
    color: '#166534',
  },
  vsContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 8.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  foodRewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fffbeb',
    borderRadius: radius.md,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  foodRewardEmoji: {
    fontSize: 22,
  },
  foodRewardTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: '#92400e',
  },
  foodRewardSubtitle: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#78350f',
    marginTop: 1,
    lineHeight: 15,
  },
  scamShieldBox: {
    backgroundColor: '#f8fafc',
    borderRadius: radius.sm,
    padding: 9,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scamShieldTitle: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    color: colors.neutral[700],
    marginBottom: 2,
  },
  scamShieldText: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    lineHeight: 14,
  },
  gatePlatformCard: {
    backgroundColor: '#fffdf9',
    borderRadius: radius.md,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(198, 113, 57, 0.22)',
    ...shadow.sm,
  },
  gatePlatformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  platformBadge: {
    backgroundColor: colors.neutral[900],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  platformBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
  },
  platformTowardsText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  gatesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.sm,
    padding: 8,
  },
  gateCol: {
    flex: 1,
  },
  gateColDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.neutral[300],
    marginHorizontal: 8,
  },
  gateColLabel: {
    fontSize: 8.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    color: colors.neutral[500],
  },
  gateColValue: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
    marginTop: 1,
  },
  gateColSub: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
  },
  destGatesTipsList: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    gap: 2,
  },
  destGatesHeader: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.5,
    color: colors.neutral[600],
    marginBottom: 2,
  },
  gateExitItemText: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    lineHeight: 15,
  },
  gateExitItemBold: {
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  blueprintHubBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: radius.lg,
    padding: 14,
    marginTop: 14,
    marginBottom: 6,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    ...shadow.sm,
  },
  blueprintHubIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueprintHubTitle: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
  },
  blueprint3DBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.xs,
  },
  blueprint3DBadgeText: {
    fontSize: 8.5,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  blueprintHubSub: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 15,
  },
  blueprintHubArrow: {
    fontSize: 14,
    color: '#38bdf8',
    fontFamily: fontFamily.bodyBold,
  },
  blueprintActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: radius.md,
    padding: 10,
    marginTop: 10,
    gap: 10,
  },
  blueprintActionBtnIcon: {
    fontSize: 18,
  },
  blueprintActionBtnTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: '#1e293b',
  },
  blueprintActionBtnSub: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#64748b',
    marginTop: 1,
  },
  blueprintActionBtnArrow: {
    fontSize: 12,
    color: '#0284c7',
    fontFamily: fontFamily.bodyBold,
  },
  utilityActionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  seniorPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 6,
    ...shadow.sm,
  },
  seniorPillBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  seniorPillEmoji: {
    fontSize: 14,
  },
  seniorPillLabel: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#334155',
  },
  seniorPillLabelActive: {
    color: '#1d4ed8',
  },
  savingsCompactPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 12,
    ...shadow.sm,
  },
  savingsCompactEmoji: {
    fontSize: 13,
  },
  savingsCompactText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#166534',
  },
  savingsChevron: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#16a34a',
  },
  safetyPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 5,
    ...shadow.sm,
  },
  safetyPillEmoji: {
    fontSize: 13,
  },
  safetyPillLabel: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  metroLiveTimingsBox: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
    ...shadow.sm,
  },
  metroLiveTimingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  pulseLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  pulseGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  metroLiveTitle: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.5,
    color: '#0f172a',
  },
  metroFreqBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexShrink: 0,
  },
  metroLiveFreq: {
    fontSize: 10,
    fontFamily: fontFamily.bodyMedium,
    color: '#475569',
  },
  nextTrainHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  nextTrainHeroLeft: {
    gap: 2,
  },
  nextTrainHeroLabel: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    color: '#64748b',
  },
  nextTrainHeroTime: {
    fontSize: 16,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  nextTrainCountdownPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  nextTrainCountdownPillText: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
  },
  metroUpcomingSection: {
    marginBottom: 8,
  },
  metroUpcomingLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: '#475569',
    marginBottom: 6,
  },
  metroUpcomingScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 10,
  },
  metroDepPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    ...shadow.sm,
  },
  metroDepPillTime: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  pillSubBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  metroDepPillSub: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#2563eb',
  },
  metroOperatingFooter: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#64748b',
    marginTop: 2,
  },
});

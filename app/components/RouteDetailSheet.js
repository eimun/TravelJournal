import React, { useState, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { PURPLE_LINE, GREEN_LINE } from '../data/transitData';
import { useTrip } from '../../src/context/TripContext';
import ConnectingLegSelector from './ConnectingLegSelector';

export default function RouteDetailSheet({ route, onFocusMap }) {
  const { fireToast, activeStepIndex, setActiveStepIndex } = useTrip();
  const [expandedStationStep, setExpandedStationStep] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedModes, setSelectedModes] = useState({});

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

      {/* Live Metro Departure Alert Banner */}
      {route.steps.find((s) => s.nextDeparture?.status === 'running') && (
        <View style={styles.liveTimerBanner}>
          <View style={styles.pulseDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.liveTimerTitle}>
              NEXT METRO DEPARTURE: In {route.steps.find((s) => s.nextDeparture)?.nextDeparture?.nextInMinutes} min
            </Text>
            <Text style={styles.liveTimerSubtitle}>
              Scheduled at {route.steps.find((s) => s.nextDeparture)?.nextDeparture?.scheduledTime} · {route.steps.find((s) => s.nextDeparture)?.nextDeparture?.note}
            </Text>
          </View>
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

      {/* Auto Advisory Box */}
      {route.autoAdvisory && (
        <View style={styles.autoAdvisoryCard}>
          <View style={styles.advisoryHeaderRow}>
            <Text style={styles.advisoryTitle}>AUTO & CAB COMPARISON</Text>
            <Text style={styles.advisoryFare}>Meter: ~₹{route.autoAdvisory.fare}</Text>
          </View>
          <Text style={styles.advisoryTip}>{route.autoAdvisory.tip}</Text>
        </View>
      )}
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
  autoAdvisoryCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(46, 43, 37, 0.08)',
  },
  advisoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advisoryTitle: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1,
    color: colors.neutral[700],
  },
  advisoryFare: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
  },
  advisoryTip: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 6,
    lineHeight: 17,
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
});

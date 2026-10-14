import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { PURPLE_LINE, GREEN_LINE } from '../data/transitData';
import { useTrip } from '../../src/context/TripContext';
import SearchBar from '../components/SearchBar';
import RouteDetailSheet from '../components/RouteDetailSheet';
import RouteModeSelector from '../components/RouteModeSelector';
import MilestoneRibbon from '../components/MilestoneRibbon';
import DepartureTicker from '../components/DepartureTicker';
import WebRoadMap from '../components/WebRoadMap';
import StationBlueprintModal from '../components/StationBlueprintModal';
import BmtcBusScheduleModal from '../components/BmtcBusScheduleModal';
import CloakroomModal from '../components/CloakroomModal';
import SafetyPingModal from '../components/SafetyPingModal';
import CitymapperTransportGrid from '../components/CitymapperTransportGrid';

let MapView, Marker, Polyline;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} catch {
  // Fallback if not supported
}

export default function NavigateScreen({ contentPadding }) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideScreen = false;

  const {
    userLocation,
    destination,
    selectDestination,
    activeRoute,
    selectedRouteMode,
    activeStepIndex,
    setActiveStepIndex,
    isLocating,
    refreshUserLocation,
    currentCity,
    openCitySwitcher,
    openFareReliability,
  } = useTrip();

  const [mapMode, setMapMode] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);

  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showBmtcModal, setShowBmtcModal] = useState(false);
  const [showCloakroom, setShowCloakroom] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [alertExpanded, setAlertExpanded] = useState(false);

  const envAlert = currentCity?.environmentalAlert;

  // Container height dynamically tracked via onLayout to fit MobileDeviceFrame or native screen
  const [containerHeight, setContainerHeight] = useState(
    Platform.OS === 'web' ? 720 : (windowHeight || 720)
  );

  // Citymapper 3-stage interactive bottom sheet snap points:
  // 1. EXPANDED: covers ~92% of screen (peeks at 54px top, safely below status bar)
  const SNAP_EXPANDED = 54;
  // 2. MID: comfortable half view (30% when route is active so cards have ample breathing room; 40% default)
  const SNAP_MID = Math.round(containerHeight * (destination ? 0.30 : 0.40));
  // 3. COLLAPSED: leaves peek header visible above the ~68px bottom tab bar
  const SNAP_COLLAPSED = Math.max(120, containerHeight - 128);

  const [snapState, setSnapState] = useState('mid');
  const [sheetTopAnim] = useState(() => new Animated.Value(SNAP_MID));
  const currentTopRef = useRef(SNAP_MID);
  const startPosRef = useRef(SNAP_MID);

  const snapExpandedRef = useRef(SNAP_EXPANDED);
  const snapMidRef = useRef(SNAP_MID);
  const snapCollapsedRef = useRef(SNAP_COLLAPSED);
  snapExpandedRef.current = SNAP_EXPANDED;
  snapMidRef.current = SNAP_MID;
  snapCollapsedRef.current = SNAP_COLLAPSED;

  const animateTo = useCallback(
    (target) => {
      currentTopRef.current = target;
      if (target === snapExpandedRef.current) setSnapState('expanded');
      else if (target === snapCollapsedRef.current) setSnapState('collapsed');
      else setSnapState('mid');

      Animated.spring(sheetTopAnim, {
        toValue: target,
        damping: 26,
        stiffness: 200,
        mass: 0.85,
        overshootClamping: true,
        useNativeDriver: false,
      }).start();
    },
    [sheetTopAnim]
  );

  useEffect(() => {
    let target = SNAP_MID;
    if (snapState === 'expanded') target = SNAP_EXPANDED;
    else if (snapState === 'collapsed') target = SNAP_COLLAPSED;

    currentTopRef.current = target;
    sheetTopAnim.setValue(target);
  }, [containerHeight, SNAP_COLLAPSED, SNAP_EXPANDED, SNAP_MID, snapState, sheetTopAnim]);

  // On mount or when destination changes, ensure sheet is in mid position so route planner is immediately visible
  useEffect(() => {
    setSnapState('mid');
    animateTo(SNAP_MID);
  }, [destination]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 3,
        onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dy) > 3,
        onPanResponderGrant: () => {
          startPosRef.current = currentTopRef.current;
        },
        onPanResponderMove: (_, g) => {
          const exp = snapExpandedRef.current;
          const col = snapCollapsedRef.current;
          const nextVal = Math.max(exp, Math.min(col, startPosRef.current + g.dy));
          sheetTopAnim.setValue(nextVal);
        },
        onPanResponderRelease: (_, g) => {
          const exp = snapExpandedRef.current;
          const mid = snapMidRef.current;
          const col = snapCollapsedRef.current;
          // Velocity-aware projected landing position for smooth physics
          const projectedY = startPosRef.current + g.dy + g.vy * 70;

          let target = mid;
          if (g.vy < -0.5) {
            // Fast upward swipe
            target = startPosRef.current > mid + 20 ? mid : exp;
          } else if (g.vy > 0.5) {
            // Fast downward swipe
            target = startPosRef.current < mid - 20 ? mid : col;
          } else {
            // Snap to closest position
            const distExp = Math.abs(projectedY - exp);
            const distMid = Math.abs(projectedY - mid);
            const distCol = Math.abs(projectedY - col);
            if (distExp <= distMid && distExp <= distCol) target = exp;
            else if (distMid <= distExp && distMid <= distCol) target = mid;
            else target = col;
          }

          animateTo(target);
        },
      }),
    [animateTo, sheetTopAnim]
  );

  const fullMapHeight = containerHeight;

  const mapRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto-fit map camera when activeStepIndex or activeRoute changes
  useEffect(() => {
    if (
      activeStepIndex !== null &&
      activeRoute?.steps?.[activeStepIndex]?.coordinates?.length > 1
    ) {
      const stepCoords = activeRoute.steps[activeStepIndex].coordinates;
      mapRef.current?.fitToCoordinates(stepCoords, {
        edgePadding: { top: 45, right: 45, bottom: 45, left: 45 },
        animated: true,
      });
    } else if (activeRoute?.coordinates?.length > 1) {
      mapRef.current?.fitToCoordinates(activeRoute.coordinates, {
        edgePadding: { top: 45, right: 45, bottom: 45, left: 45 },
        animated: true,
      });
    }
  }, [activeStepIndex, activeRoute]);

  const scrollToMap = () => {
    // With the full-screen map living outside the sheet, "back to map" means
    // collapsing the sheet's scroll back to its travel-mode row.
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const renderRealMap = () => {
    if (Platform.OS === 'web') {
      return (
        <WebRoadMap
          userLocation={userLocation}
          destination={destination}
          activeRoute={activeRoute}
          activeStepIndex={activeStepIndex}
          onSelectStep={setActiveStepIndex}
        />
      );
    }

    if (!MapView || !Marker) return null;

    const initialRegion = {
      latitude: (userLocation?.latitude + (destination?.latitude || userLocation.latitude)) / 2,
      longitude: (userLocation?.longitude + (destination?.longitude || userLocation.longitude)) / 2,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };

    return (
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation
        showsCompass={false}
        toolbarEnabled={false}
        loadingEnabled
        loadingIndicatorColor={colors.accentRamp[500]}
      >
        {/* Step-by-Step Road & Rail Polylines */}
        {Polyline &&
          activeRoute?.steps?.map((step, idx) => {
            if (!step.coordinates || step.coordinates.length < 2) return null;
            const isSelected = activeStepIndex === idx;
            const isMetro = step.type === 'metro';
            const isAuto =
              step.type === 'auto' || step.selectedMode === 'auto' || step.type === 'direct_auto';
            const isCab =
              step.type === 'cab' || step.selectedMode === 'cab' || step.type === 'direct_cab';
            const isBus =
              step.type === 'bus' || step.selectedMode === 'bus' || step.type === 'direct_bus';
            // Line colors follow tokens.modeColors — the Citymapper language.
            const baseColor = isMetro
              ? step.line === 'green'
                ? GREEN_LINE
                : PURPLE_LINE
              : isAuto
                ? '#c9a227'
                : isCab
                  ? '#474238'
                  : isBus
                    ? '#728157'
                    : '#d97706';

            return (
              <React.Fragment key={step.id || idx}>
                <Polyline
                  coordinates={step.coordinates}
                  strokeColor={baseColor}
                  strokeWidth={isMetro ? 4.5 : 3.5}
                  lineDashPattern={!isMetro && !isAuto && !isCab && !isBus ? [5, 4] : undefined}
                  zIndex={isSelected ? 5 : 2}
                />

                {isSelected && (
                  <Polyline
                    coordinates={step.coordinates}
                    strokeColor={colors.accentRamp[500]}
                    strokeWidth={7.5}
                    lineDashPattern={[0]}
                    zIndex={12}
                  />
                )}
              </React.Fragment>
            );
          })}

        {/* Milestone Markers */}
        {activeRoute?.milestones?.map((m) => {
          const isOrigin = m.type === 'origin';
          const isDest = m.type === 'destination';
          const isTransfer = m.type === 'transfer';
          const isStation = m.type === 'station';
          const isSelected = activeStepIndex === m.stepIndex;

          return (
            <Marker
              key={m.id}
              coordinate={m.coordinate}
              title={m.title}
              onPress={() => setActiveStepIndex(m.stepIndex)}
            >
              <View style={[styles.milestonePinWrapper, isSelected && styles.milestonePinSelected]}>
                <View
                  style={[
                    styles.milestoneBadge,
                    isOrigin && styles.milestoneBadgeOrigin,
                    isDest && styles.milestoneBadgeDest,
                    isTransfer && styles.milestoneBadgeTransfer,
                    isStation &&
                      (m.line === 'green'
                        ? styles.milestoneBadgeGreen
                        : styles.milestoneBadgePurple),
                  ]}
                >
                  <Text style={styles.milestoneBadgeText}>{m.label}</Text>
                </View>
                <View style={styles.milestoneStem} />
              </View>
            </Marker>
          );
        })}
      </MapView>
    );
  };

  const renderVectorMap = (mapHeight) => {
    const w = isWideScreen ? windowWidth * 0.46 : windowWidth - 40;
    const h = mapHeight || (mapExpanded ? 420 : 310);

    const activeStep = activeStepIndex !== null ? activeRoute?.steps?.[activeStepIndex] : null;

    return (
      <Svg width="100%" height={h} style={StyleSheet.absoluteFill}>
        <Rect width="100%" height={h} rx={16} fill={colors.neutral[200]} />

        {/* City Road Network */}
        <Line
          x1={0}
          y1={h * 0.45}
          x2={w}
          y2={h * 0.45}
          stroke={colors.neutral[300]}
          strokeWidth={4}
        />
        <Line
          x1={w * 0.35}
          y1={0}
          x2={w * 0.35}
          y2={h}
          stroke={colors.neutral[300]}
          strokeWidth={3}
        />
        <Line
          x1={w * 0.65}
          y1={0}
          x2={w * 0.65}
          y2={h}
          stroke={colors.neutral[300]}
          strokeWidth={3}
        />

        {/* Purple Line track */}
        <Line
          x1={w * 0.05}
          y1={h * 0.35}
          x2={w * 0.95}
          y2={h * 0.35}
          stroke={PURPLE_LINE}
          strokeWidth={activeStep?.line === 'purple' ? 8 : 5}
          strokeLinecap="round"
        />

        {/* Green Line track */}
        <Line
          x1={w * 0.45}
          y1={h * 0.08}
          x2={w * 0.45}
          y2={h * 0.92}
          stroke={GREEN_LINE}
          strokeWidth={activeStep?.line === 'green' ? 8 : 5}
          strokeLinecap="round"
        />

        {/* Milestone: Origin Pin */}
        <Circle cx={w * 0.22} cy={h * 0.68} r={activeStepIndex === 0 ? 12 : 9} fill="#2563eb" />
        <Circle cx={w * 0.22} cy={h * 0.68} r={4} fill={colors.white} />

        {/* Milestone: Majestic Interchange Node */}
        <Circle
          cx={w * 0.45}
          cy={h * 0.35}
          r={activeStep?.type === 'transfer' ? 12 : 8}
          fill={colors.white}
          stroke={activeStep?.type === 'transfer' ? colors.accentRamp[700] : colors.neutral[900]}
          strokeWidth={3}
        />

        {/* Milestone: Destination Pin */}
        <Path
          d={`M${w * 0.78} ${h * 0.42} C${w * 0.78 - 7} ${h * 0.42 - 14}, ${w * 0.78 + 7} ${h * 0.42 - 14}, ${w * 0.78} ${h * 0.42} Z`}
          fill={colors.accentRamp[600]}
        />
        <Circle cx={w * 0.78} cy={h * 0.34} r={6} fill={colors.accentRamp[600]} />
        <Circle cx={w * 0.78} cy={h * 0.34} r={2.5} fill={colors.white} />

        {/* Route Connecting Trail */}
        <Path
          d={`M${w * 0.22} ${h * 0.68} L${w * 0.45} ${h * 0.35} L${w * 0.78} ${h * 0.35}`}
          stroke={colors.accentRamp[600]}
          strokeWidth={activeStepIndex !== null ? 4.5 : 3}
          strokeDasharray="5,4"
          fill="none"
        />
      </Svg>
    );
  };

  const renderMapBlock = (customHeight) => {
    const currentHeight = customHeight || (mapExpanded ? 440 : 320);

    return (
      <View style={styles.mapCard}>
        <View style={[styles.mapCanvas, { height: currentHeight }]}>
          {mapMode ? renderRealMap() : renderVectorMap(currentHeight)}

          {/* Google-Maps control column: white round FABs on the right edge */}
          <View style={styles.mapFabColumn} pointerEvents="box-none">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={mapMode ? 'Show transit graph map' : 'Show street map'}
              onPress={() => setMapMode((prev) => !prev)}
              style={({ pressed }) => [styles.mapFab, pressed && { transform: [{ scale: 0.92 }] }]}
            >
              <Svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.neutral[800]}
                strokeWidth={2}
              >
                {mapMode ? (
                  <Path d="M9 20l-5.5-2V4L9 6m0 14l6-2m-6 2V6m6 12l5.5 2V8l-5.5-2m0 12V6m0 12c-2-1.5-4-1.5-6 0M15 6c-2-1.5-4-1.5-6 0" />
                ) : (
                  <Path d="M9 18l-6-2V4l6 2 6-2 6 2v12l-6-2-6 2zm0-12v12m6-14v14" />
                )}
              </Svg>
            </Pressable>

            {!isWideScreen && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={mapExpanded ? 'Collapse map' : 'Expand map'}
                onPress={() => setMapExpanded((prev) => !prev)}
                style={({ pressed }) => [
                  styles.mapFab,
                  pressed && { transform: [{ scale: 0.92 }] },
                ]}
              >
                <Svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.neutral[800]}
                  strokeWidth={2}
                >
                  <Path
                    d={
                      mapExpanded
                        ? 'M4 14h6v6m10-10h-6V4m0 6l7-7M10 14l-7 7'
                        : 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7'
                    }
                  />
                </Svg>
              </Pressable>
            )}
          </View>

          {/* Map legend footer */}
          <View style={styles.mapLegendBar}>
            {currentCity?.id === 'delhi' ? (
              <>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#eab308' }]} />
                  <Text style={styles.legendText}>Yellow</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accent2Ramp[500] }]} />
                  <Text style={styles.legendText}>Blue</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ea580c' }]} />
                  <Text style={styles.legendText}>Airport</Text>
                </View>
              </>
            ) : currentCity?.id === 'mumbai' ? (
              <>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
                  <Text style={styles.legendText}>Western</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#991b1b' }]} />
                  <Text style={styles.legendText}>Central</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#0284c7' }]} />
                  <Text style={styles.legendText}>Metro 1</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: PURPLE_LINE }]} />
                  <Text style={styles.legendText}>Purple</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: GREEN_LINE }]} />
                  <Text style={styles.legendText}>Green</Text>
                </View>
              </>
            )}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent2Ramp[500] }]} />
              <Text style={styles.legendText}>You</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accentRamp[600] }]} />
              <Text style={styles.legendText}>Dest</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEnvironmentalAlert = () => {
    if (!envAlert) return null;

    const aqiColor = envAlert.aqiColor || '#16a34a';
    const aqiText =
      envAlert.aqi <= 50 ? 'Clean Air' : envAlert.aqi <= 100 ? 'Moderate Air' : 'High Smog';

    return (
      <View style={styles.weatherCard}>
        {/* Main Metric Row: Weather on Left, AQI on Right */}
        <View style={styles.weatherRow}>
          {/* Left: Weather condition & temperature */}
          <View style={styles.weatherInfoLeft}>
            <View style={styles.weatherIconCircle}>
              <Text style={styles.weatherEmoji}>{envAlert.weatherIcon || '⛅'}</Text>
            </View>
            <View>
              <Text style={styles.weatherTempText}>{envAlert.temperature || '24°C'}</Text>
              <Text style={styles.weatherConditionText}>
                {envAlert.weatherCondition || 'Pleasant & Breezy'}
              </Text>
            </View>
          </View>

          {/* Right: AQI Indicator */}
          <View style={styles.weatherInfoRight}>
            <View
              style={[
                styles.aqiPillBadge,
                { backgroundColor: `${aqiColor}15`, borderColor: aqiColor },
              ]}
            >
              <View style={[styles.aqiStatusDot, { backgroundColor: aqiColor }]} />
              <Text style={[styles.aqiNumberText, { color: aqiColor }]}>
                AQI {envAlert.aqi}
              </Text>
            </View>
            <Text style={styles.aqiLabelText}>{aqiText}</Text>
          </View>
        </View>

        {/* Short, simple 1-line commute advisory */}
        <View style={styles.weatherTipRow}>
          <Text style={styles.weatherTipIcon}>💡</Text>
          <Text style={styles.weatherTipText} numberOfLines={1}>
            {envAlert.tips?.[0] || 'Great weather for walking & outdoor transit.'}
          </Text>
        </View>
      </View>
    );
  };

  const renderQuickUtilities = () => {
    if (currentCity?.id === 'delhi') {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickUtilityScroll}
        >
          <Pressable
            onPress={() => openFareReliability && openFareReliability()}
            style={({ pressed }) => [
              styles.quickUtilityBtn,
              styles.quickUtilityBtnDel,
              pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={[styles.utilityIconCircle, { backgroundColor: '#e0e7ff' }]}>
              <Text style={styles.quickUtilityEmoji}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quickUtilityTitle, { color: '#3730a3' }]}>DMRC Metro</Text>
              <Text style={[styles.quickUtilitySub, { color: '#6366f1' }]}>12 Lines & Fares</Text>
            </View>
            <Text style={[styles.quickUtilityArrow, { color: '#4f46e5' }]}>➔</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowCloakroom(true)}
            style={({ pressed }) => [
              styles.quickUtilityBtn,
              styles.quickUtilityBtnCloakroom,
              pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={[styles.utilityIconCircle, { backgroundColor: '#ffedd5' }]}>
              <Text style={styles.quickUtilityEmoji}>🧳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quickUtilityTitle, styles.quickUtilityTitleCloakroom]}>
                NDLS Cloakroom
              </Text>
              <Text style={[styles.quickUtilitySub, styles.quickUtilitySubCloakroom]}>
                Platform 16 · ₹30
              </Text>
            </View>
            <Text style={[styles.quickUtilityArrow, styles.quickUtilityArrowCloakroom]}>➔</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowSafetyModal(true)}
            style={({ pressed }) => [
              styles.quickUtilityBtn,
              styles.quickUtilityBtnSafety,
              pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={[styles.utilityIconCircle, { backgroundColor: '#dcfce7' }]}>
              <Text style={styles.quickUtilityEmoji}>🛡️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quickUtilityTitle, { color: '#166534' }]}>Safety Ping</Text>
              <Text style={[styles.quickUtilitySub, { color: '#15803d' }]}>WhatsApp Alert</Text>
            </View>
            <Text style={[styles.quickUtilityArrow, { color: colors.accentRamp[600] }]}>➔</Text>
          </Pressable>
        </ScrollView>
      );
    }

    if (currentCity?.id === 'mumbai') {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickUtilityScroll}
        >
          <Pressable
            onPress={() => openFareReliability && openFareReliability()}
            style={({ pressed }) => [
              styles.quickUtilityBtn,
              styles.quickUtilityBtnBom,
              pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={[styles.utilityIconCircle, { backgroundColor: '#e0f2fe' }]}>
              <Text style={styles.quickUtilityEmoji}>🚆</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quickUtilityTitle, { color: '#075985' }]}>Mumbai Local</Text>
              <Text style={[styles.quickUtilitySub, { color: '#0284c7' }]}>Fast & Slow Lines</Text>
            </View>
            <Text style={[styles.quickUtilityArrow, { color: '#0284c7' }]}>➔</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowCloakroom(true)}
            style={({ pressed }) => [
              styles.quickUtilityBtn,
              styles.quickUtilityBtnCloakroom,
              pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={[styles.utilityIconCircle, { backgroundColor: '#ffedd5' }]}>
              <Text style={styles.quickUtilityEmoji}>🧳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quickUtilityTitle, styles.quickUtilityTitleCloakroom]}>
                CSMT Cloakroom
              </Text>
              <Text style={[styles.quickUtilitySub, styles.quickUtilitySubCloakroom]}>
                Platform 1 · ₹30
              </Text>
            </View>
            <Text style={[styles.quickUtilityArrow, styles.quickUtilityArrowCloakroom]}>➔</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowSafetyModal(true)}
            style={({ pressed }) => [
              styles.quickUtilityBtn,
              styles.quickUtilityBtnSafety,
              pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={[styles.utilityIconCircle, { backgroundColor: '#dcfce7' }]}>
              <Text style={styles.quickUtilityEmoji}>🛡️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quickUtilityTitle, { color: '#166534' }]}>Safety Ping</Text>
              <Text style={[styles.quickUtilitySub, { color: '#15803d' }]}>WhatsApp Alert</Text>
            </View>
            <Text style={[styles.quickUtilityArrow, { color: colors.accentRamp[600] }]}>➔</Text>
          </Pressable>
        </ScrollView>
      );
    }

    // Default: Bengaluru
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickUtilityScroll}
      >
        <Pressable
          onPress={() => setShowBlueprint(true)}
          style={({ pressed }) => [
            styles.quickUtilityBtn,
            pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
          ]}
        >
          <View style={[styles.utilityIconCircle, { backgroundColor: '#f1f5f9' }]}>
            <Text style={styles.quickUtilityEmoji}>🏢</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickUtilityTitle}>Majestic Blueprint</Text>
            <Text style={styles.quickUtilitySub}>3D Concourse & Gates</Text>
          </View>
          <Text style={styles.quickUtilityArrow}>➔</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowBmtcModal(true)}
          style={({ pressed }) => [
            styles.quickUtilityBtn,
            styles.quickUtilityBtnBus,
            pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
          ]}
        >
          <View style={[styles.utilityIconCircle, { backgroundColor: '#dcfce7' }]}>
            <Text style={styles.quickUtilityEmoji}>🚌</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickUtilityTitle, styles.quickUtilityTitleBus]}>
              BMTC Bus Routes
            </Text>
            <Text style={[styles.quickUtilitySub, styles.quickUtilitySubBus]}>
              Feeders & Passes
            </Text>
          </View>
          <Text style={[styles.quickUtilityArrow, styles.quickUtilityArrowBus]}>➔</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowCloakroom(true)}
          style={({ pressed }) => [
            styles.quickUtilityBtn,
            styles.quickUtilityBtnCloakroom,
            pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
          ]}
        >
          <View style={[styles.utilityIconCircle, { backgroundColor: '#ffedd5' }]}>
            <Text style={styles.quickUtilityEmoji}>🧳</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickUtilityTitle, styles.quickUtilityTitleCloakroom]}>
              Station Cloakrooms
            </Text>
            <Text style={[styles.quickUtilitySub, styles.quickUtilitySubCloakroom]}>
              KSR & YPR · ₹30
            </Text>
          </View>
          <Text style={[styles.quickUtilityArrow, styles.quickUtilityArrowCloakroom]}>➔</Text>
        </Pressable>
      </ScrollView>
    );
  };

  const headerView = (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.kicker}>REAL-TIME ROUTE & TRANSIT</Text>
        <Pressable
          onPress={openCitySwitcher}
          style={({ pressed }) => [
            styles.cityHeadingRow,
            pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.heading}>{currentCity?.name || 'Bengaluru'}</Text>
          <View style={styles.cityPillBadge}>
            <View style={styles.cityDotPulse} />
            <Text style={styles.cityPillBadgeText}>{currentCity?.shortName || 'CITY'} ▼</Text>
          </View>
        </Pressable>
      </View>

      <Pressable
        onPress={refreshUserLocation}
        style={({ pressed }) => [
          styles.gpsChip,
          userLocation?.source === 'gps' && styles.gpsChipActive,
          pressed && { opacity: 0.8 },
        ]}
      >
        <View
          style={[
            styles.gpsDot,
            isLocating && { backgroundColor: colors.accentRamp[500] },
            userLocation?.source === 'gps' && { backgroundColor: colors.accentRamp[600] },
            userLocation?.permissionDenied && { backgroundColor: '#ea580c' },
          ]}
        />
        <Text
          style={[styles.gpsChipText, userLocation?.source === 'gps' && styles.gpsChipTextActive]}
        >
          {isLocating
            ? 'Locating...'
            : userLocation?.source === 'gps'
              ? 'GPS Active'
              : userLocation?.permissionDenied
                ? 'Enable GPS'
                : 'Tap for GPS'}
        </Text>
      </Pressable>
    </View>
  );

  // Desktop / Tablet Split-Screen Layout (Both Map and Steps visible side-by-side)
  if (isWideScreen) {
    return (
      <View style={[styles.wideRoot, contentPadding]}>
        {/* Left Column: Fixed Navigation & Map Dashboard */}
        <View style={styles.wideLeftPane}>
          {headerView}
          {renderEnvironmentalAlert()}
          <View style={styles.searchSection}>
            <SearchBar onSelectDestination={selectDestination} />
          </View>
          {renderQuickUtilities()}
          <RouteModeSelector />
          {renderMapBlock(380)}
          <MilestoneRibbon
            milestones={activeRoute?.milestones}
            activeStepIndex={activeStepIndex}
            onSelectMilestone={(stepIdx) => setActiveStepIndex(stepIdx)}
          />
        </View>

        {/* Right Column: Independent Scrollable Route Details */}
        <ScrollView
          style={styles.wideRightPane}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.wideRightContent}
        >
          <RouteDetailSheet route={activeRoute} onFocusMap={() => {}} />
        </ScrollView>

        {/* Station Blueprint Modal (Wide Screen - Bengaluru only) */}
        {(currentCity?.id || 'bengaluru') === 'bengaluru' && (
          <StationBlueprintModal visible={showBlueprint} onClose={() => setShowBlueprint(false)} />
        )}

        {/* BMTC Bus Timetable Modal (Wide Screen - Bengaluru only) */}
        {(currentCity?.id || 'bengaluru') === 'bengaluru' && (
          <BmtcBusScheduleModal visible={showBmtcModal} onClose={() => setShowBmtcModal(false)} />
        )}

        {/* Station Cloakroom Directory Modal (Wide Screen) */}
        <CloakroomModal visible={showCloakroom} onClose={() => setShowCloakroom(false)} />

        {/* Safety Ping Modal (Wide Screen) */}
        <SafetyPingModal visible={showSafetyModal} onClose={() => setShowSafetyModal(false)} />
      </View>
    );
  }

  // Google-Maps/Citymapper-style mobile layout: a full-screen map canvas with
  // top-level city switcher and map control FABs, and a smooth draggable bottom sheet
  // containing the search bar, transit modes, live departures, and route details.
  return (
    <View
      style={styles.mobileRoot}
      onLayout={(e) => {
        const h = Math.round(e.nativeEvent.layout.height);
        if (h > 200 && h !== containerHeight) {
          setContainerHeight(h);
        }
      }}
    >
      {/* ---------- FULL-SCREEN MAP CANVAS ---------- */}
      <View style={styles.mapCanvasFullScreen} pointerEvents="box-none">
        <View style={[styles.mapCard, styles.mapCardFullScreen]}>
          <View style={[styles.mapCanvas, styles.mapCanvasFullScreenInner]}>
            {mapMode ? renderRealMap() : renderVectorMap(fullMapHeight)}

            {/* City header chip pinned to the map's top-left, comfortably below status bar */}
            <View style={styles.mapHeaderChipWrap} pointerEvents="box-none">
              <Pressable
                onPress={openCitySwitcher}
                style={({ pressed }) => [styles.mapCityChip, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.mapCityChipIcon}>🌐</Text>
                <Text style={styles.mapCityChipText}>{currentCity?.name || 'Bengaluru'}</Text>
                <Text style={styles.mapCityChipArrow}>▼</Text>
              </Pressable>
            </View>

            {/* Control column: map type + GPS FAB, top-right */}
            <View style={styles.mapFabColumn} pointerEvents="box-none">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={mapMode ? 'Show transit graph map' : 'Show street map'}
                onPress={() => setMapMode((prev) => !prev)}
                style={({ pressed }) => [
                  styles.mapFab,
                  pressed && { transform: [{ scale: 0.92 }] },
                ]}
              >
                <Svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.neutral[800]}
                  strokeWidth={2}
                >
                  {mapMode ? (
                    <Path d="M9 20l-5.5-2V4L9 6m0 14l6-2m-6 2V6m6 12l5.5 2V8l-5.5-2m0 12V6m0 12c-2-1.5-4-1.5-6 0M15 6c-2-1.5-4-1.5-6 0" />
                  ) : (
                    <Path d="M9 18l-6-2V4l6 2 6-2 6 2v12l-6-2-6 2zm0-12v12m6-14v14" />
                  )}
                </Svg>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Refresh GPS location"
                onPress={refreshUserLocation}
                style={({ pressed }) => [
                  styles.mapFab,
                  pressed && { transform: [{ scale: 0.92 }] },
                ]}
              >
                <Svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.neutral[800]}
                  strokeWidth={2}
                >
                  <Circle cx={12} cy={12} r={7} />
                  <Path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                </Svg>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* ---------- ANIMATED DRAGGABLE BOTTOM SHEET OVERLAY ---------- */}
      <Animated.View style={[styles.sheetOverlay, { top: sheetTopAnim }]}>
        <View
          {...(panResponder ? panResponder.panHandlers : {})}
          style={styles.sheetGrabberWrapFull}
        >
          <Pressable
            onPress={() => {
              if (snapState === 'collapsed') animateTo(SNAP_MID);
              else if (snapState === 'mid') animateTo(SNAP_EXPANDED);
              else animateTo(SNAP_MID);
            }}
            style={styles.grabberPressable}
            hitSlop={12}
          >
            <View style={styles.sheetGrabber} />
          </Pressable>

          <View style={styles.grabberHeaderRow}>
            <Pressable
              onPress={() => {
                if (snapState === 'collapsed') animateTo(SNAP_MID);
                else if (snapState === 'mid') animateTo(SNAP_EXPANDED);
                else animateTo(SNAP_MID);
              }}
              style={{ flex: 1 }}
            >
              <Text style={styles.grabberCityTitle}>
                {destination
                  ? `Route to ${destination.name?.split(',')[0] || destination.name || 'Destination'}`
                  : `${currentCity?.name || 'Bengaluru'} Transit`}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (snapState === 'collapsed') animateTo(SNAP_MID);
                else animateTo(SNAP_COLLAPSED);
              }}
              style={({ pressed }) => [
                styles.grabberSnapBadge,
                pressed && { opacity: 0.8 },
              ]}
              hitSlop={8}
            >
              <Text style={styles.grabberSnapBadgeText}>
                {snapState === 'collapsed' ? '▲ Open routes' : '▼ Pull down'}
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetScrollContent}
          scrollEventThrottle={16}
        >
          {/* Active From/To search card */}
          <SearchBar onSelectDestination={selectDestination} />

          {/* Travel-mode buttons (Metro Combo, Auto, Cab) */}
          <RouteModeSelector />

          {/* Citymapper-style live next-train chips for the active route's metro legs */}
          {activeRoute && (
            <DepartureTicker
              key={selectedRouteMode ?? 'default'}
              route={activeRoute}
              activeStepIndex={activeStepIndex}
              onSelectStep={(stepIdx) => {
                setActiveStepIndex(stepIdx);
              }}
            />
          )}

          {/* Ambient condition strip */}
          {renderEnvironmentalAlert()}

          {/* Step-by-Step Route Card & Advisories (bottom sheet) */}
          {activeRoute && (
            <RouteDetailSheet route={activeRoute} onFocusMap={scrollToMap} />
          )}
        </ScrollView>
      </Animated.View>

      {/* Station Blueprint Modal (Mobile Screen - Bengaluru only) */}
      {(currentCity?.id || 'bengaluru') === 'bengaluru' && (
        <StationBlueprintModal visible={showBlueprint} onClose={() => setShowBlueprint(false)} />
      )}

      {/* BMTC Bus Timetable Modal (Mobile Screen - Bengaluru only) */}
      {(currentCity?.id || 'bengaluru') === 'bengaluru' && (
        <BmtcBusScheduleModal visible={showBmtcModal} onClose={() => setShowBmtcModal(false)} />
      )}

      {/* Station Cloakroom Directory Modal (Mobile Screen) */}
      <CloakroomModal visible={showCloakroom} onClose={() => setShowCloakroom(false)} />

      {/* Safety Ping Modal (Mobile Screen) */}
      <SafetyPingModal visible={showSafetyModal} onClose={() => setShowSafetyModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  mobileRoot: {
    flex: 1,
    position: 'relative',
  },
  // ---------- FULL-SCREEN MAP CANVAS ----------
  // RN 0.86 removed absoluteFillObject — spell the four edges out.
  mapCanvasFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  mapCardFullScreen: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 0,
    borderRadius: 0,
  },
  mapCanvasFullScreenInner: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapHeaderChipWrap: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 15,
    gap: 4,
  },
  mapCityChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...shadow.md,
  },
  mapCityChipIcon: {
    fontSize: 13,
  },
  mapCityChipText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  mapCityChipArrow: {
    fontSize: 10,
    color: '#64748b',
    marginLeft: 1,
  },
  mapLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    marginLeft: 2,
  },
  mapLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  mapKickerText: {
    fontSize: 8.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1,
    color: '#ffffff',
  },
  // ---------- BOTTOM SHEET OVERLAY ----------
  sheetOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.accentRamp[600],
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 20,
    overflow: 'hidden',
  },
  sheetGrabberWrapFull: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.accentRamp[600],
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    cursor: 'grab',
    userSelect: 'none',
  },
  grabberPressable: {
    paddingVertical: 4,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  sheetGrabber: {
    width: 44,
    height: 4.5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  grabberHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  grabberCityTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  grabberSnapBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  grabberSnapBadgeText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  sheetScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 130,
    backgroundColor: colors.accentRamp[600],
    gap: 10,
  },
  wideRoot: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  wideLeftPane: {
    flex: 1.1,
    maxWidth: 620,
  },
  wideRightPane: {
    flex: 1,
  },
  wideRightContent: {
    paddingBottom: 60,
  },
  container: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 150,
    backgroundColor: colors.accentRamp[600],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  kicker: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 26,
    fontFamily: fontFamily.heading,
    color: '#ffffff',
    marginTop: 3,
    lineHeight: 30,
  },
  cityHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginTop: 2,
  },
  cityDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  cityPillBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  gpsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  gpsChipActive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  gpsChipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: 'rgba(255,255,255,0.85)',
  },
  gpsChipTextActive: {
    color: '#ffffff',
  },
  searchSection: {
    marginTop: 14,
  },
  // Map sits edge-to-edge inside the full-screen canvas layer.
  mapCard: {
    marginTop: 0,
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
    borderWidth: 0,
    flex: 1,
  },
  mapCanvas: {
    width: '100%',
    position: 'relative',
  },
  // Google's white circular map controls, stacked at the right edge, safely below status bar.
  mapFabColumn: {
    position: 'absolute',
    top: 52,
    right: 14,
    alignItems: 'center',
    gap: 9,
    zIndex: 15,
  },
  mapFab: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  quickUtilityScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 12,
    paddingRight: 10,
  },
  quickUtilityBtn: {
    width: 172,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: 10,
    gap: 8,
    ...shadow.sm,
  },
  quickUtilityBtnBus: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  quickUtilityBtnCloakroom: {
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
  },
  quickUtilityBtnDel: {
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
  },
  quickUtilityBtnBom: {
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
  },
  quickUtilityBtnSafety: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  utilityIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickUtilityEmoji: {
    fontSize: 18,
  },
  quickUtilityTitle: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  quickUtilityTitleBus: {
    color: '#14532d',
  },
  quickUtilityTitleCloakroom: {
    color: '#9a3412',
  },
  quickUtilitySub: {
    fontSize: 9.5,
    fontFamily: fontFamily.body,
    color: '#64748b',
    marginTop: 1,
  },
  quickUtilitySubBus: {
    color: colors.accentRamp[600],
  },
  quickUtilitySubCloakroom: {
    color: '#c2410c',
  },
  quickUtilityArrow: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: fontFamily.bodyBold,
  },
  quickUtilityArrowBus: {
    color: '#15803d',
  },
  quickUtilityArrowCloakroom: {
    color: '#ea580c',
  },
  mapLegendBar: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  mapLegendBarFullScreen: {
    bottom: 12,
    left: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  milestonePinWrapper: {
    alignItems: 'center',
  },
  milestonePinSelected: {
    transform: [{ scale: 1.2 }],
    zIndex: 20,
  },
  milestoneBadge: {
    backgroundColor: colors.neutral[800],
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: colors.white,
    ...shadow.md,
  },
  milestoneBadgeOrigin: {
    backgroundColor: colors.accent2Ramp[500],
  },
  milestoneBadgeDest: {
    backgroundColor: colors.accentRamp[600],
  },
  milestoneBadgeTransfer: {
    backgroundColor: '#d97706',
  },
  milestoneBadgePurple: {
    backgroundColor: PURPLE_LINE,
  },
  milestoneBadgeGreen: {
    backgroundColor: GREEN_LINE,
  },
  milestoneBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  milestoneStem: {
    width: 2,
    height: 7,
    backgroundColor: colors.neutral[900],
  },
  floatingMapBtn: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent2Ramp[500],
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderWidth: 0,
    ...shadow.lg,
    zIndex: 99,
  },
  floatingMapIcon: {
    fontSize: 13,
  },
  floatingMapText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  weatherCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 4,
    ...shadow.sm,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherEmoji: {
    fontSize: 20,
  },
  weatherTempText: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: '#0f172a',
    lineHeight: 20,
  },
  weatherConditionText: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: '#64748b',
    marginTop: 1,
  },
  weatherInfoRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  aqiPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  aqiStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  aqiNumberText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
  },
  aqiLabelText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyMedium,
    color: '#64748b',
    marginRight: 2,
  },
  weatherTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  weatherTipIcon: {
    fontSize: 12,
  },
  weatherTipText: {
    flex: 1,
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#475569',
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
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
import MilestoneRibbon from '../components/MilestoneRibbon';
import WebRoadMap from '../components/WebRoadMap';

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
  const isWideScreen = false;

  const {
    userLocation,
    destination,
    selectDestination,
    activeRoute,
    activeStepIndex,
    setActiveStepIndex,
    isLocating,
    refreshUserLocation,
  } = useTrip();

  const [mapMode, setMapMode] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const mapRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto-fit map camera when activeStepIndex or activeRoute changes
  useEffect(() => {
    if (activeStepIndex !== null && activeRoute?.steps?.[activeStepIndex]?.coordinates?.length > 1) {
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
        {Polyline && activeRoute?.steps?.map((step, idx) => {
          if (!step.coordinates || step.coordinates.length < 2) return null;
          const isSelected = activeStepIndex === idx;
          const isMetro = step.type === 'metro';
          const isAuto = step.type === 'auto' || step.selectedMode === 'auto';
          const baseColor = isMetro
            ? step.line === 'green' ? GREEN_LINE : PURPLE_LINE
            : isAuto ? '#0284c7' : '#d97706';

          return (
            <React.Fragment key={step.id || idx}>
              <Polyline
                coordinates={step.coordinates}
                strokeColor={baseColor}
                strokeWidth={isMetro ? 4.5 : 3.5}
                lineDashPattern={!isMetro ? [5, 4] : undefined}
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
                    isStation && (m.line === 'green' ? styles.milestoneBadgeGreen : styles.milestoneBadgePurple),
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
    const w = isWideScreen ? (windowWidth * 0.46) : (windowWidth - 40);
    const h = mapHeight || (mapExpanded ? 420 : 310);

    const activeStep = activeStepIndex !== null ? activeRoute?.steps?.[activeStepIndex] : null;

    return (
      <Svg width="100%" height={h} style={StyleSheet.absoluteFill}>
        <Rect width="100%" height={h} rx={16} fill={colors.neutral[200]} />

        {/* City Road Network */}
        <Line x1={0} y1={h * 0.45} x2={w} y2={h * 0.45} stroke={colors.neutral[300]} strokeWidth={4} />
        <Line x1={w * 0.35} y1={0} x2={w * 0.35} y2={h} stroke={colors.neutral[300]} strokeWidth={3} />
        <Line x1={w * 0.65} y1={0} x2={w * 0.65} y2={h} stroke={colors.neutral[300]} strokeWidth={3} />

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

          {/* Map Controls (Expand & Mode Toggle) */}
          <View style={styles.mapControlsRow}>
            {!isWideScreen && (
              <Pressable
                onPress={() => setMapExpanded((prev) => !prev)}
                style={({ pressed }) => [
                  styles.mapControlBtn,
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
              >
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[800]} strokeWidth={2.5}>
                  <Path d={mapExpanded ? "M4 14h6v6m10-10h-6V4m0 6l7-7M10 14l-7 7" : "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"} />
                </Svg>
                <Text style={styles.mapControlBtnText}>
                  {mapExpanded ? 'Collapse' : 'Expand'}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => setMapMode((prev) => !prev)}
              style={({ pressed }) => [
                styles.mapControlBtn,
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[800]} strokeWidth={2.5}>
                <Path d="M9 18l6-6-6-6" />
              </Svg>
              <Text style={styles.mapControlBtnText}>
                {mapMode ? 'Transit Graph' : 'Google Map'}
              </Text>
            </Pressable>
          </View>

          {/* Map legend footer */}
          <View style={styles.mapLegendBar}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: PURPLE_LINE }]} />
              <Text style={styles.legendText}>Purple</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: GREEN_LINE }]} />
              <Text style={styles.legendText}>Green</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
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

  const headerView = (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.kicker}>REAL-TIME ROUTE & TRANSIT</Text>
        <Text style={styles.heading}>Bengaluru Guide</Text>
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
            userLocation?.source === 'gps' && { backgroundColor: '#16a34a' },
            userLocation?.permissionDenied && { backgroundColor: '#ea580c' },
          ]}
        />
        <Text
          style={[
            styles.gpsChipText,
            userLocation?.source === 'gps' && styles.gpsChipTextActive,
          ]}
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
          <View style={styles.searchSection}>
            <SearchBar onSelectDestination={selectDestination} />
          </View>
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
          <RouteDetailSheet
            route={activeRoute}
            onFocusMap={() => {}}
          />
        </ScrollView>
      </View>
    );
  }

  // Mobile Screen Layout with Milestone Ribbon & Floating "View Map ⬆️" Button
  return (
    <View style={styles.mobileRoot}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, contentPadding]}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {headerView}

        <View style={styles.searchSection}>
          <SearchBar onSelectDestination={selectDestination} />
        </View>

        {renderMapBlock()}

        {/* Milestone Quick Navigation Ribbon */}
        <MilestoneRibbon
          milestones={activeRoute?.milestones}
          activeStepIndex={activeStepIndex}
          onSelectMilestone={(stepIdx) => {
            setActiveStepIndex(stepIdx);
          }}
        />

        {/* Step-by-Step Route Card & Advisories */}
        <RouteDetailSheet
          route={activeRoute}
          onFocusMap={scrollToMap}
        />
      </ScrollView>

      {/* Floating "View Map ⬆️" Button when scrolled down */}
      {scrollY > 280 && (
        <Pressable
          onPress={scrollToMap}
          style={({ pressed }) => [
            styles.floatingMapBtn,
            pressed && { transform: [{ scale: 0.94 }] },
          ]}
        >
          <Text style={styles.floatingMapIcon}>🗺️</Text>
          <Text style={styles.floatingMapText}>View Map ⬆️</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mobileRoot: {
    flex: 1,
    position: 'relative',
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90,
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
    color: colors.accentRamp[700],
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 26,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    marginTop: 3,
    lineHeight: 30,
  },
  gpsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  gpsChipActive: {
    backgroundColor: colors.accent2Ramp[200],
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  gpsChipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  gpsChipTextActive: {
    color: colors.accent2Ramp[800],
  },
  searchSection: {
    marginTop: 14,
  },
  mapCard: {
    marginTop: 14,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
    ...shadow.sm,
  },
  mapCanvas: {
    width: '100%',
    position: 'relative',
  },
  mapControlsRow: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
    zIndex: 15,
  },
  mapControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
    ...shadow.sm,
  },
  mapControlBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
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
    backgroundColor: '#2563eb',
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
    bottom: 85,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentRamp[700],
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 15,
    ...shadow.lg,
    zIndex: 99,
  },
  floatingMapIcon: {
    fontSize: 14,
  },
  floatingMapText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
});

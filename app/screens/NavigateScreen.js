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
import RouteModeSelector from '../components/RouteModeSelector';
import MilestoneRibbon from '../components/MilestoneRibbon';
import WebRoadMap from '../components/WebRoadMap';
import StationBlueprintModal from '../components/StationBlueprintModal';
import BmtcBusScheduleModal from '../components/BmtcBusScheduleModal';
import CloakroomModal from '../components/CloakroomModal';
import SafetyPingModal from '../components/SafetyPingModal';

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
  const { width: windowWidth } = useWindowDimensions();
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
    currentCity,
    openCitySwitcher,
    openFareReliability,
  } = useTrip();

  const [mapMode, setMapMode] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showBmtcModal, setShowBmtcModal] = useState(false);
  const [showCloakroom, setShowCloakroom] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [alertExpanded, setAlertExpanded] = useState(false);

  const envAlert = currentCity?.environmentalAlert;

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
          const isAuto = step.type === 'auto' || step.selectedMode === 'auto' || step.type === 'direct_auto';
          const isCab = step.type === 'cab' || step.selectedMode === 'cab' || step.type === 'direct_cab';
          const isBus = step.type === 'bus' || step.selectedMode === 'bus' || step.type === 'direct_bus';
          const baseColor = isMetro
            ? step.line === 'green' ? GREEN_LINE : PURPLE_LINE
            : isAuto ? '#0284c7' : isCab ? '#0f172a' : isBus ? '#16a34a' : '#d97706';

          return (
            <React.Fragment key={step.id || idx}>
              <Polyline
                coordinates={step.coordinates}
                strokeColor={baseColor}
                strokeWidth={isMetro ? 4.5 : 3.5}
                lineDashPattern={(!isMetro && !isAuto && !isCab && !isBus) ? [5, 4] : undefined}
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
            {currentCity?.id === 'delhi' ? (
              <>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#eab308' }]} />
                  <Text style={styles.legendText}>Yellow</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
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

  const renderEnvironmentalAlert = () => {
    if (!envAlert) return null;

    return (
      <View style={styles.envAlertCard}>
        <Pressable
          onPress={() => setAlertExpanded((prev) => !prev)}
          style={({ pressed }) => [
            styles.envAlertHeaderRow,
            pressed && { opacity: 0.9 },
          ]}
        >
          <View style={styles.envAlertIconBadge}>
            <Text style={styles.envAlertIcon}>{envAlert.weatherIcon}</Text>
          </View>

          <View style={{ flex: 1, paddingRight: 4 }}>
            <View style={styles.envAlertTitleRow}>
              <Text style={styles.envAlertHeadline} numberOfLines={1}>
                {envAlert.headline}
              </Text>
              <View style={[styles.envAqiBadge, { backgroundColor: envAlert.aqiColor }]}>
                <Text style={styles.envAqiBadgeText}>AQI {envAlert.aqi}</Text>
              </View>
            </View>

            <Text style={styles.envAlertSubtext} numberOfLines={alertExpanded ? undefined : 2}>
              {envAlert.subtext}
            </Text>
          </View>

          <Text style={styles.envAlertToggleArrow}>{alertExpanded ? '▲' : '▼'}</Text>
        </Pressable>

        {/* Dynamic Badge Strip */}
        <View style={styles.envBadgesRow}>
          {envAlert.badges?.map((badge, idx) => (
            <View key={idx} style={styles.envBadgePill}>
              <Text style={styles.envBadgePillText}>{badge}</Text>
            </View>
          ))}
          <View style={styles.envTempPill}>
            <Text style={styles.envTempPillText}>{envAlert.weatherCondition} · {envAlert.temperature}</Text>
          </View>
        </View>

        {/* Expandable Notice & Local Commuter Tips */}
        {alertExpanded && (
          <View style={styles.envExpandedBox}>
            <View style={styles.envTransitNoticeBox}>
              <Text style={styles.envTransitNoticeText}>{envAlert.transitNotice}</Text>
            </View>
            {envAlert.tips?.map((tip, idx) => (
              <View key={idx} style={styles.envTipItem}>
                <Text style={styles.envTipBullet}>•</Text>
                <Text style={styles.envTipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
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
              <Text style={[styles.quickUtilityTitle, styles.quickUtilityTitleCloakroom]}>NDLS Cloakroom</Text>
              <Text style={[styles.quickUtilitySub, styles.quickUtilitySubCloakroom]}>Platform 16 · ₹30</Text>
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
            <Text style={[styles.quickUtilityArrow, { color: '#16a34a' }]}>➔</Text>
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
              <Text style={[styles.quickUtilityTitle, styles.quickUtilityTitleCloakroom]}>CSMT Cloakroom</Text>
              <Text style={[styles.quickUtilitySub, styles.quickUtilitySubCloakroom]}>Platform 1 · ₹30</Text>
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
            <Text style={[styles.quickUtilityArrow, { color: '#16a34a' }]}>➔</Text>
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
            <Text style={[styles.quickUtilityTitle, styles.quickUtilityTitleBus]}>BMTC Bus Routes</Text>
            <Text style={[styles.quickUtilitySub, styles.quickUtilitySubBus]}>Feeders & Passes</Text>
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
            <Text style={[styles.quickUtilityTitle, styles.quickUtilityTitleCloakroom]}>Station Cloakrooms</Text>
            <Text style={[styles.quickUtilitySub, styles.quickUtilitySubCloakroom]}>KSR & YPR · ₹30</Text>
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
          <RouteDetailSheet
            route={activeRoute}
            onFocusMap={() => {}}
          />
        </ScrollView>

        {/* Station Blueprint Modal (Wide Screen - Bengaluru only) */}
        {(currentCity?.id || 'bengaluru') === 'bengaluru' && (
          <StationBlueprintModal
            visible={showBlueprint}
            onClose={() => setShowBlueprint(false)}
          />
        )}

        {/* BMTC Bus Timetable Modal (Wide Screen - Bengaluru only) */}
        {(currentCity?.id || 'bengaluru') === 'bengaluru' && (
          <BmtcBusScheduleModal
            visible={showBmtcModal}
            onClose={() => setShowBmtcModal(false)}
          />
        )}

        {/* Station Cloakroom Directory Modal (Wide Screen) */}
        <CloakroomModal
          visible={showCloakroom}
          onClose={() => setShowCloakroom(false)}
        />

        {/* Safety Ping Modal (Wide Screen) */}
        <SafetyPingModal
          visible={showSafetyModal}
          onClose={() => setShowSafetyModal(false)}
        />
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
        {renderEnvironmentalAlert()}

        <View style={styles.searchSection}>
          <SearchBar onSelectDestination={selectDestination} />
        </View>

        {/* Transit Quick Utilities Row */}
        {renderQuickUtilities()}

        {/* Multimodal Alternative Mode Selector */}
        <RouteModeSelector />

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

      {/* Station Blueprint Modal (Mobile Screen - Bengaluru only) */}
      {(currentCity?.id || 'bengaluru') === 'bengaluru' && (
        <StationBlueprintModal
          visible={showBlueprint}
          onClose={() => setShowBlueprint(false)}
        />
      )}

      {/* BMTC Bus Timetable Modal (Mobile Screen - Bengaluru only) */}
      {(currentCity?.id || 'bengaluru') === 'bengaluru' && (
        <BmtcBusScheduleModal
          visible={showBmtcModal}
          onClose={() => setShowBmtcModal(false)}
        />
      )}

      {/* Station Cloakroom Directory Modal (Mobile Screen) */}
      <CloakroomModal
        visible={showCloakroom}
        onClose={() => setShowCloakroom(false)}
      />

      {/* Safety Ping Modal (Mobile Screen) */}
      <SafetyPingModal
        visible={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
      />
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
    paddingBottom: 150,
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
  cityHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentRamp[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accentRamp[300],
    marginTop: 2,
  },
  cityDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentRamp[600],
  },
  cityPillBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
    letterSpacing: 0.5,
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
    color: '#16a34a',
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
    bottom: 90,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentRamp[700],
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
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
  envAlertCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginTop: 10,
    marginBottom: 4,
    ...shadow.sm,
  },
  envAlertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  envAlertIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  envAlertIcon: {
    fontSize: 20,
  },
  envAlertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 2,
  },
  envAlertHeadline: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
    flex: 1,
  },
  envAqiBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  envAqiBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  envAlertSubtext: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: '#475569',
    lineHeight: 16,
  },
  envAlertToggleArrow: {
    fontSize: 10,
    color: '#94a3b8',
    marginLeft: 2,
  },
  envBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  envBadgePill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  envBadgePillText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: '#334155',
  },
  envTempPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  envTempPillText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: '#1d4ed8',
  },
  envExpandedBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 6,
  },
  envTransitNoticeBox: {
    backgroundColor: '#f8fafc',
    borderRadius: radius.sm,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentRamp[600],
  },
  envTransitNoticeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: '#1e293b',
    lineHeight: 16,
  },
  envTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 4,
  },
  envTipBullet: {
    fontSize: 12,
    color: colors.accentRamp[700],
    marginTop: -1,
  },
  envTipText: {
    flex: 1,
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#475569',
    lineHeight: 15,
  },
});

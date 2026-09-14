import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function MobileDeviceFrame({ children }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isFrameEnabled, setIsFrameEnabled] = useState(true);

  // If on actual mobile native or screen is already narrow, render full screen directly
  const isDesktop = Platform.OS === 'web' && screenWidth >= 640;

  if (!isDesktop || !isFrameEnabled) {
    return (
      <View style={styles.fullRoot}>
        {children}
        {isDesktop && (
          <Pressable
            onPress={() => setIsFrameEnabled(true)}
            style={styles.floatingToggleButton}
          >
            <Text style={styles.floatingToggleText}>📱 Switch to iPhone View</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // Calculate phone frame dimensions scaled comfortably to window height
  const frameHeight = Math.min(screenHeight * 0.94, 880);
  const frameWidth = Math.min(frameHeight * (393 / 852), 430);

  return (
    <View style={styles.studioBackdrop}>
      {/* Top Floating Control Bar */}
      <View style={styles.topControlBar}>
        <View style={styles.brandingRow}>
          <View style={styles.appIconDot} />
          <Text style={styles.brandTitle}>TravelJournal · Bengaluru Guide</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => setIsFrameEnabled(false)}
            style={({ pressed }) => [
              styles.toggleModeBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth={2}>
              <Path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </Svg>
            <Text style={styles.toggleModeText}>Full Screen View</Text>
          </Pressable>
        </View>
      </View>

      {/* Centered iPhone 15 Pro Hardware Frame */}
      <View
        style={[
          styles.deviceChassis,
          {
            width: frameWidth,
            height: frameHeight,
          },
        ]}
      >
        {/* Left Side Buttons (Volume / Action) */}
        <View style={[styles.sideButton, styles.sideActionBtn]} />
        <View style={[styles.sideButton, styles.sideVolUpBtn]} />
        <View style={[styles.sideButton, styles.sideVolDownBtn]} />

        {/* Right Side Button (Power) */}
        <View style={[styles.sideButton, styles.sidePowerBtn]} />

        {/* Screen Display Container */}
        <View style={styles.screenInner}>
          {/* Dynamic Island */}
          <View style={styles.dynamicIslandContainer}>
            <View style={styles.dynamicIsland}>
              <View style={styles.cameraLens} />
              <View style={styles.sensorDot} />
            </View>
          </View>

          {/* Actual Mobile App Rendered Here */}
          <View style={styles.appContainer}>
            {children}
          </View>

          {/* Bottom Home Indicator Bar */}
          <View style={styles.homeIndicatorWrapper}>
            <View style={styles.homeIndicatorBar} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullRoot: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FAF8F5',
  },
  floatingToggleButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
  },
  floatingToggleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  studioBackdrop: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#090d16',
    backgroundImage: 'radial-gradient(ellipse at center top, #1e293b 0%, #090d16 80%)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  topControlBar: {
    position: 'absolute',
    top: 12,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appIconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d97706',
  },
  brandTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  toggleModeText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  deviceChassis: {
    position: 'relative',
    backgroundColor: '#1c1f26',
    borderRadius: 50,
    padding: 10,
    borderWidth: 3,
    borderColor: '#383d48',
    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12)',
  },
  sideButton: {
    position: 'absolute',
    backgroundColor: '#383d48',
    borderRadius: 2,
  },
  sideActionBtn: {
    left: -6,
    top: 90,
    width: 4,
    height: 24,
  },
  sideVolUpBtn: {
    left: -6,
    top: 130,
    width: 4,
    height: 44,
  },
  sideVolDownBtn: {
    left: -6,
    top: 185,
    width: 4,
    height: 44,
  },
  sidePowerBtn: {
    right: -6,
    top: 140,
    width: 4,
    height: 60,
  },
  screenInner: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    borderRadius: 42,
    overflow: 'hidden',
    position: 'relative',
  },
  dynamicIslandContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
    pointerEvents: 'none',
  },
  dynamicIsland: {
    width: 108,
    height: 26,
    backgroundColor: '#000000',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10,
    gap: 8,
  },
  cameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0d1322',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sensorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#05070d',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  homeIndicatorWrapper: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 998,
    pointerEvents: 'none',
  },
  homeIndicatorBar: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0f172a',
    opacity: 0.35,
  },
});

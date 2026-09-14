import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { PURPLE_LINE, GREEN_LINE } from '../data/bengaluruData';

let MapView, Marker;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch {
  // Fallback if not supported
}

const INITIAL_REGION = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export default function ExploreMap({
  places = [],
  budget = 1200,
  dayPlan = [],
  onOpenPlace,
}) {
  const [bobAnim] = useState(() => new Animated.Value(0));
  const [mapMode, setMapMode] = useState(Platform.OS !== 'web'); // real map by default on mobile
  const mapRef = useRef(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -6,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bobAnim]);

  const inPlan = (id) => dayPlan.some((p) => p.id === id);

  const renderRealMap = () => {
    if (!MapView || !Marker) return null;

    return (
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsCompass={false}
        toolbarEnabled={false}
        loadingEnabled
        loadingIndicatorColor={colors.accentRamp[500]}
      >
        {places.map((place) => {
          if (!place.latitude || !place.longitude) return null;
          const fits = place.total <= budget;
          const hot = inPlan(place.id);

          return (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              onPress={() => onOpenPlace(place.id)}
              opacity={fits ? 1 : 0.45}
            >
              <View style={styles.pinButton}>
                <View
                  style={[
                    styles.pinChip,
                    hot ? styles.pinChipHot : styles.pinChipCold,
                  ]}
                >
                  <Text
                    style={[
                      styles.pinText,
                      hot ? styles.pinTextHot : styles.pinTextCold,
                    ]}
                  >
                    ₹{place.total}
                  </Text>
                </View>
                <View
                  style={[
                    styles.pinStem,
                    hot ? styles.pinStemHot : styles.pinStemCold,
                  ]}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>
    );
  };

  const renderVectorMap = () => {
    return (
      <>
        {/* Background Stylized Vector Map */}
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 250">
          <Rect width="400" height="250" fill="#e8dfce" />
          
          <Path
            d="M 160 50 Q 200 60 210 100 Q 180 120 150 90 Z"
            fill="#d5dec2"
            opacity={0.8}
          />
          <Path
            d="M 130 140 Q 180 150 170 190 Q 130 200 120 160 Z"
            fill="#d5dec2"
            opacity={0.8}
          />

          <Line x1="40" y1="20" x2="360" y2="230" stroke="#f6f0e4" strokeWidth="6" strokeLinecap="round" />
          <Line x1="30" y1="180" x2="370" y2="70" stroke="#f6f0e4" strokeWidth="5" strokeLinecap="round" />
          <Line x1="180" y1="10" x2="180" y2="240" stroke="#f6f0e4" strokeWidth="4" />
          <Line x1="20" y1="110" x2="380" y2="110" stroke="#f6f0e4" strokeWidth="4" />
          <Line x1="80" y1="10" x2="280" y2="240" stroke="#f6f0e4" strokeWidth="3" />

          {/* Purple Line */}
          <Path
            d="M 30 70 L 170 80 L 260 90 L 370 100"
            stroke={PURPLE_LINE}
            strokeWidth="3.5"
            strokeDasharray="4 2"
            fill="none"
            opacity={0.85}
          />
          {/* Green Line */}
          <Path
            d="M 190 20 L 180 80 L 170 145 L 140 230"
            stroke={GREEN_LINE}
            strokeWidth="3.5"
            strokeDasharray="4 2"
            fill="none"
            opacity={0.85}
          />

          <Circle cx="175" cy="80" r="5" fill="#201e1d" stroke="#ffffff" strokeWidth="2" />
        </Svg>

        {/* Interactive Price Pins on Vector Canvas */}
        {places.map((place) => {
          const fits = place.total <= budget;
          const hot = inPlan(place.id);
          const transformStyle = hot ? [{ translateY: bobAnim }] : [];

          return (
            <Animated.View
              key={place.id}
              style={[
                styles.pinWrapper,
                {
                  left: `${place.x}%`,
                  top: `${place.y}%`,
                  opacity: fits ? 1 : 0.4,
                  transform: transformStyle,
                },
              ]}
            >
              <Pressable
                onPress={() => onOpenPlace(place.id)}
                style={({ pressed }) => [
                  styles.pinButton,
                  pressed && { transform: [{ scale: 0.92 }] },
                ]}
                hitSlop={12}
              >
                <View
                  style={[
                    styles.pinChip,
                    hot ? styles.pinChipHot : styles.pinChipCold,
                  ]}
                >
                  <Text
                    style={[
                      styles.pinText,
                      hot ? styles.pinTextHot : styles.pinTextCold,
                    ]}
                  >
                    ₹{place.total}
                  </Text>
                </View>
                <View
                  style={[
                    styles.pinStem,
                    hot ? styles.pinStemHot : styles.pinStemCold,
                  ]}
                />
              </Pressable>
            </Animated.View>
          );
        })}
      </>
    );
  };

  const isRealMapActive = mapMode && Boolean(MapView);

  return (
    <View style={styles.container}>
      {isRealMapActive ? renderRealMap() : renderVectorMap()}

      {/* Map Mode Toggle Chip & Cache Badge */}
      <View style={styles.bottomBarRow}>
        <View style={styles.cacheBadge}>
          <Text style={styles.cacheText}>
            {isRealMapActive ? 'Live GPS · Bengaluru' : 'Tiles cached 12 Aug'}
          </Text>
        </View>

        {MapView && Platform.OS !== 'web' && (
          <Pressable
            onPress={() => setMapMode(!mapMode)}
            style={({ pressed }) => [
              styles.toggleBtn,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <Text style={styles.toggleBtnText}>
              {isRealMapActive ? 'Vector View' : 'Real Map'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 270,
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(46, 43, 37, 0.08)',
    ...shadow.sm,
  },
  pinWrapper: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    marginLeft: -24,
    marginTop: -32,
  },
  pinButton: {
    alignItems: 'center',
  },
  pinChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    ...shadow.md,
  },
  pinChipHot: {
    backgroundColor: colors.accentRamp[500],
  },
  pinChipCold: {
    backgroundColor: colors.white,
  },
  pinText: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
  },
  pinTextHot: {
    color: colors.white,
  },
  pinTextCold: {
    color: colors.neutral[900],
  },
  pinStem: {
    width: 3,
    height: 9,
    marginTop: -1,
  },
  pinStemHot: {
    backgroundColor: colors.accentRamp[500],
  },
  pinStemCold: {
    backgroundColor: colors.white,
  },
  bottomBarRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  cacheBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 5,
    ...shadow.sm,
  },
  cacheText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  toggleBtn: {
    backgroundColor: colors.accentRamp[500],
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...shadow.sm,
  },
  toggleBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
});

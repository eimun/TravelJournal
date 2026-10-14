import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { searchCityLocations } from '../services/searchService';
import { useTrip } from '../../src/context/TripContext';

export default function SearchBar({ onSelectDestination }) {
  const {
    destination,
    userLocation,
    swapOriginDestination,
    openSearch,
    currentCity,
    selectDestination,
  } = useTrip();

  const [showPlacesStrip, setShowPlacesStrip] = useState(false);

  const displayOrigin = () => {
    if (!userLocation?.name) return 'Current Location';
    if (/^\d+\.\d+,\s*\d+\.\d+$/.test(userLocation.name.trim())) {
      return `Current Location (${currentCity?.name || 'Bengaluru'})`;
    }
    return userLocation.name;
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputsCard}>
        {/* FROM ROW */}
        <Pressable
          onPress={() => openSearch('origin')}
          style={({ pressed }) => [styles.inputRow, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.originIndicatorDot} />
          <View style={styles.inputTextsCol}>
            <Text style={styles.fieldLabel}>FROM</Text>
            <Text numberOfLines={1} style={styles.fieldValue}>
              {displayOrigin()}
            </Text>
          </View>
          <View style={styles.editPill}>
            <Text style={styles.editPillText}>
              {userLocation?.source === 'gps' ? 'GPS' : 'Change'}
            </Text>
          </View>
        </Pressable>

        {/* DIVIDER & SWAP BUTTON */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Pressable
            onPress={swapOriginDestination}
            style={({ pressed }) => [
              styles.swapCircleBtn,
              pressed && { transform: [{ scale: 0.9 }] },
            ]}
            hitSlop={8}
          >
            <Svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.neutral[700]}
              strokeWidth={2.5}
            >
              <Path d="M7 10l5-5 5 5M7 14l5 5 5-5" />
            </Svg>
          </Pressable>
        </View>

        {/* TO ROW */}
        <Pressable
          onPress={() => openSearch('destination')}
          style={({ pressed }) => [styles.inputRow, pressed && { opacity: 0.85 }]}
        >
          <View style={[styles.destIndicatorPin, !destination && styles.destIndicatorPinEmpty]} />
          <View style={styles.inputTextsCol}>
            <Text style={styles.fieldLabel}>TO</Text>
            <Text
              numberOfLines={1}
              style={[styles.fieldValue, !destination && styles.fieldValuePlaceholder]}
            >
              {destination ? (destination.name || destination.title) : 'Where to? Choose destination...'}
            </Text>
          </View>
          {destination ? (
            <Pressable
              onPress={() => selectDestination(null)}
              style={({ pressed }) => [
                styles.clearPill,
                pressed && { opacity: 0.7 },
              ]}
              hitSlop={8}
            >
              <Text style={styles.clearPillText}>✕</Text>
            </Pressable>
          ) : (
            <View style={styles.searchPill}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth={2.5}>
                <Circle cx={11} cy={11} r={8} />
                <Path d="M21 21l-4.35-4.35" />
              </Svg>
              <Text style={styles.searchPillText}>Search</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  // Inputs card when destination selected
  inputsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingVertical: 4,
    paddingHorizontal: 16,
    ...shadow.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  originIndicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#0284c7',
  },
  destIndicatorPin: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#16a34a',
    transform: [{ rotate: '45deg' }],
  },
  inputTextsCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1,
    color: colors.neutral[500],
  },
  fieldValue: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
    marginTop: 1,
  },
  editPill: {
    backgroundColor: colors.neutral[100],
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  editPillText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  clearPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearPillText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
    marginLeft: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  swapCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  quickChipsList: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  destIndicatorPinEmpty: {
    backgroundColor: '#94a3b8',
  },
  fieldValuePlaceholder: {
    color: '#94a3b8',
    fontFamily: fontFamily.body,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  searchPillText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0284c7',
  },
  quickChip: {
    backgroundColor: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...shadow.sm,
  },
  quickChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  quickChipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  quickChipTextActive: {
    color: '#ffffff',
  },
});

import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { searchBengaluruLocations } from '../services/searchService';
import { useTrip } from '../../src/context/TripContext';

export default function SearchBar({ onSelectDestination }) {
  const {
    destination,
    userLocation,
    swapOriginDestination,
    openSearch,
  } = useTrip();

  return (
    <View style={styles.container}>
      {/* Route Inputs Card (From / To with Swap Button) */}
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
              {userLocation?.name || 'Your Location'}
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
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[700]} strokeWidth={2.5}>
              <Path d="M7 10l5-5 5 5M7 14l5 5 5-5" />
            </Svg>
          </Pressable>
        </View>

        {/* TO ROW */}
        <Pressable
          onPress={() => openSearch('destination')}
          style={({ pressed }) => [styles.inputRow, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.destIndicatorPin} />
          <View style={styles.inputTextsCol}>
            <Text style={styles.fieldLabel}>TO</Text>
            <Text numberOfLines={1} style={styles.fieldValue}>
              {destination ? destination.name : 'Search any destination in Bengaluru...'}
            </Text>
          </View>
          <View style={[styles.editPill, styles.editPillActive]}>
            <Text style={[styles.editPillText, styles.editPillTextActive]}>Search</Text>
          </View>
        </Pressable>
      </View>

      {/* Quick Hub Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickChipsList}
      >
        {['Cubbon Park', 'Lalbagh', 'HSR Layout', 'Indiranagar', 'Koramangala', 'BTM Layout', 'Whitefield', 'MG Road'].map((name) => {
          const isSelected = destination?.name.includes(name);
          return (
            <Pressable
              key={name}
              onPress={() => {
                searchBengaluruLocations(name).then((res) => {
                  if (res && res.length > 0) onSelectDestination(res[0]);
                });
              }}
              style={({ pressed }) => [
                styles.quickChip,
                isSelected && styles.quickChipActive,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <Text
                style={[
                  styles.quickChipText,
                  isSelected && styles.quickChipTextActive,
                ]}
              >
                {name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  inputsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    ...shadow.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 7,
  },
  originIndicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: '#93c5fd',
  },
  destIndicatorPin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentRamp[600],
    borderWidth: 2,
    borderColor: colors.accentRamp[300],
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
  editPillActive: {
    backgroundColor: colors.accentRamp[100],
  },
  editPillText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  editPillTextActive: {
    color: colors.accentRamp[700],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    marginLeft: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  swapCircleBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: 'rgba(46, 43, 37, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  quickChipsList: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  quickChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(46, 43, 37, 0.08)',
  },
  quickChipActive: {
    backgroundColor: colors.accentRamp[500],
    borderColor: colors.accentRamp[500],
  },
  quickChipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  quickChipTextActive: {
    color: colors.white,
  },
});

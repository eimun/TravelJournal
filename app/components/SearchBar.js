import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { PURPLE_LINE, GREEN_LINE } from '../data/transitData';
import { searchBengaluruLocations } from '../services/searchService';
import { useTrip } from '../../src/context/TripContext';

export default function SearchBar({ onSelectDestination }) {
  const {
    destination,
    userLocation,
    isLocating,
    refreshUserLocation,
    changeUserLocation,
    swapOriginDestination,
  } = useTrip();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState('destination'); // 'origin' | 'destination'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const debounceTimer = useRef(null);

  // Initial load of default hubs
  useEffect(() => {
    let mounted = true;
    searchBengaluruLocations('').then((res) => {
      if (mounted) setResults(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Debounced search whenever query changes
  useEffect(() => {
    clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const matches = await searchBengaluruLocations(query);
        setResults(matches);
      } catch {
        // keep previous results
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const openSearch = (target) => {
    setSearchTarget(target);
    setQuery('');
    setIsOpen(true);
  };

  const handlePick = (item) => {
    if (searchTarget === 'destination') {
      onSelectDestination(item);
    } else {
      changeUserLocation({
        latitude: item.latitude,
        longitude: item.longitude,
        name: item.name,
        isDefault: false,
        source: 'manual',
      });
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleUseGPS = async () => {
    await refreshUserLocation();
    setIsOpen(false);
  };

  return (
    <>
      {/* Route Inputs Card (From / To with Swap Button) */}
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
                style={[
                  styles.quickChip,
                  isSelected && styles.quickChipActive,
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

      {/* Full-Screen Search Modal with Live Geocoding */}
      <Modal visible={isOpen} animationType="slide" transparent onRequestClose={() => setIsOpen(false)}>
        <View style={styles.modalScrim}>
          <View style={styles.modalContent}>
            {/* Header & Search Input */}
            <View style={styles.inputHeader}>
              <View style={styles.inputWrapper}>
                <Svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.neutral[500]}
                  strokeWidth={2.5}
                >
                  <Circle cx="11" cy="11" r="8" />
                  <Path d="M21 21l-4.35-4.35" />
                </Svg>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={
                    searchTarget === 'origin'
                      ? 'Search your starting point / area...'
                      : 'Search any colony, street, mall, metro or area...'
                  }
                  placeholderTextColor={colors.neutral[500]}
                  style={styles.textInput}
                  autoFocus
                  returnKeyType="search"
                />
                {isSearching && <ActivityIndicator size="small" color={colors.accentRamp[500]} />}
                {query.length > 0 && !isSearching && (
                  <Pressable onPress={() => setQuery('')} hitSlop={12}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </Pressable>
                )}
              </View>
              <Pressable onPress={() => setIsOpen(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>Done</Text>
              </Pressable>
            </View>

            {/* Target Mode Bar & GPS shortcut */}
            <View style={styles.targetBar}>
              <Text style={styles.targetBarText}>
                {searchTarget === 'origin'
                  ? '📍 Selecting STARTING POINT'
                  : '🏁 Selecting DESTINATION'}
              </Text>
              <Pressable
                onPress={handleUseGPS}
                disabled={isLocating}
                style={styles.gpsUseBtn}
              >
                <View style={styles.gpsPulseDot} />
                <Text style={styles.gpsUseBtnText}>
                  {isLocating ? 'Locating...' : 'Use My Current GPS'}
                </Text>
              </Pressable>
            </View>

            {/* Suggestions list */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsList}
            >
              <Text style={styles.sectionHeader}>
                {query.trim()
                  ? `SEARCH RESULTS FOR "${query}"`
                  : 'POPULAR BENGALURU HUBS & STATIONS'}
              </Text>

              {results.map((item) => {
                const isPurple = item.metroLine === 'purple';
                const tagColor = isPurple ? PURPLE_LINE : GREEN_LINE;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handlePick(item)}
                    style={({ pressed }) => [
                      styles.suggestionRow,
                      pressed && { backgroundColor: colors.neutral[200] },
                    ]}
                  >
                    <View style={[styles.metroIndicator, { backgroundColor: tagColor }]}>
                      <Text style={styles.metroIndicatorText}>
                        {isPurple ? 'M' : 'M'}
                      </Text>
                    </View>
                    <View style={styles.suggestionTextCol}>
                      <Text style={styles.suggestionTitle}>{item.name}</Text>
                      <Text style={styles.suggestionMeta}>
                        {item.area} · {item.category}
                      </Text>
                      {item.nearestMetro && (
                        <Text style={styles.metroHint}>
                          Nearest Metro: {item.nearestMetro}
                        </Text>
                      )}
                    </View>
                    {item.estimatedCost > 0 && (
                      <View style={styles.fareCol}>
                        <Text style={styles.fareText}>~₹{item.estimatedCost}</Text>
                        <Text style={styles.fareLabel}>est. fare</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}

              {results.length === 0 && !isSearching && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No matching locations found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try typing the neighborhood (e.g. HSR Layout, BTM, Indiranagar, Whitefield, MG Road) or check internet connection.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
    backgroundColor: colors.neutral[200],
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 9,
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
    color: colors.accentRamp[800],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(46, 43, 37, 0.08)',
    marginLeft: 24,
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
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(32, 30, 29, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '92%',
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 18,
    ...shadow.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.body,
    color: colors.neutral[900],
    padding: 0,
  },
  clearBtnText: {
    fontSize: 14,
    color: colors.neutral[600],
    fontWeight: 'bold',
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  closeBtnText: {
    fontSize: 14.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
  },
  targetBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  targetBarText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
    letterSpacing: 0.5,
  },
  gpsUseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent2Ramp[200],
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  gpsPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
  },
  gpsUseBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.accent2Ramp[800],
  },
  sectionHeader: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1.1,
    color: colors.neutral[600],
    marginTop: 16,
    marginBottom: 8,
  },
  suggestionsList: {
    paddingBottom: 40,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 13,
    marginBottom: 8,
  },
  metroIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metroIndicatorText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  suggestionTextCol: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  suggestionMeta: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  metroHint: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.accentRamp[700],
    marginTop: 3,
  },
  fareCol: {
    alignItems: 'flex-end',
  },
  fareText: {
    fontSize: 15,
    fontFamily: fontFamily.heading,
    color: colors.accentRamp[700],
  },
  fareLabel: {
    fontSize: 9.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
});

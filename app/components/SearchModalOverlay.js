import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fontFamily, radius, shadow, space } from '../theme/tokens';
import { PURPLE_LINE, GREEN_LINE } from '../data/transitData';
import { searchBengaluruLocations } from '../services/searchService';
import { useTrip } from '../../src/context/TripContext';

const POPULAR_HUBS = [
  { name: 'Cubbon Park', emoji: '🌳' },
  { name: 'Lalbagh', emoji: '🌿' },
  { name: 'Indiranagar', emoji: '⚡' },
  { name: 'Koramangala', emoji: '☕' },
  { name: 'MG Road', emoji: '🛍️' },
  { name: 'Whitefield', emoji: '🏢' },
  { name: 'HSR Layout', emoji: '🏡' },
  { name: 'BTM Layout', emoji: '🎓' },
];

export default function SearchModalOverlay() {
  const {
    isSearchOpen,
    searchTarget,
    closeSearch,
    selectDestination,
    changeUserLocation,
    userLocation,
    destination,
    refreshUserLocation,
    isLocating,
    fireToast,
  } = useTrip();

  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  // Focus input and preload default results when opened
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      searchBengaluruLocations('').then((data) => {
        if (Array.isArray(data)) setResults(data);
      });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isSearchOpen]);

  // Live search as user types
  useEffect(() => {
    if (!isSearchOpen) return;
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchBengaluruLocations(query).then((data) => {
        if (Array.isArray(data)) setResults(data);
        setIsSearching(false);
      });
    }, 120);
    return () => clearTimeout(timer);
  }, [query, isSearchOpen]);

  if (!isSearchOpen) return null;

  const handleSelect = (item) => {
    if (searchTarget === 'origin') {
      changeUserLocation(item);
      fireToast(`Starting point set to ${item.name}`);
    } else {
      selectDestination(item);
      fireToast(`Destination set to ${item.name}`);
    }
    closeSearch();
  };

  const handleUseCurrentGPS = async () => {
    fireToast('Fetching real-time GPS location...');
    await refreshUserLocation();
    closeSearch();
  };

  const Container = Platform.OS === 'web' ? View : Modal;
  const containerProps = Platform.OS === 'web'
    ? { style: [StyleSheet.absoluteFill, { zIndex: 1200 }] }
    : { visible: true, animationType: 'slide', transparent: false, onRequestClose: closeSearch };

  const topInset = Math.max(insets.top, 20) + 8;

  return (
    <Container {...containerProps}>
      <View style={[styles.root, { paddingTop: topInset }]}>
        {/* Top Navigation Header */}
        <View style={styles.topHeader}>
          <Pressable
            onPress={closeSearch}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[800]} strokeWidth={2.5} strokeLinecap="round">
              <Path d="M19 12H5M12 19l-7-7 7-7" />
            </Svg>
          </Pressable>

          <View style={styles.titleCol}>
            <Text style={styles.headerTitle}>
              {searchTarget === 'origin' ? 'Choose Starting Point' : 'Where to in Bengaluru?'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Search metro, landmark, colony, or tap quick hubs
            </Text>
          </View>

          <Pressable
            onPress={closeSearch}
            style={({ pressed }) => [styles.closeIconBtn, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </View>

        {/* Clean Pill Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.accentRamp[700]} strokeWidth={2.5}>
              <Circle cx="11" cy="11" r="8" />
              <Path d="M21 21l-4.35-4.35" />
            </Svg>
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder={searchTarget === 'origin' ? 'Search starting point...' : 'Search street, mall, metro or area...'}
              placeholderTextColor={colors.neutral[400]}
              style={[
                styles.textInput,
                Platform.OS === 'web' && { outlineStyle: 'none' },
              ]}
              returnKeyType="search"
            />
            {isSearching && <ActivityIndicator size="small" color={colors.accentRamp[600]} />}
            {query.length > 0 && !isSearching && (
              <Pressable onPress={() => setQuery('')} hitSlop={10} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* GPS Shortcut Strip */}
        <View style={styles.gpsStrip}>
          <Pressable
            onPress={handleUseCurrentGPS}
            disabled={isLocating}
            style={({ pressed }) => [styles.gpsBtn, pressed && { opacity: 0.8 }]}
          >
            <View style={styles.gpsDot} />
            <Text style={styles.gpsBtnText}>
              {isLocating ? 'Locating GPS...' : '📍 Use My Current Location'}
            </Text>
          </Pressable>

          {destination && (
            <View style={styles.activeTargetBadge}>
              <Text style={styles.activeTargetText} numberOfLines={1}>
                To: {destination.name.split(',')[0]}
              </Text>
            </View>
          )}
        </View>

        {/* Popular Hubs Strip */}
        <View style={styles.hubsSection}>
          <Text style={styles.sectionLabel}>POPULAR BENGALURU HUBS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hubsScroll}
          >
            {POPULAR_HUBS.map((hub) => (
              <Pressable
                key={hub.name}
                onPress={() => setQuery(hub.name)}
                style={({ pressed }) => [
                  styles.hubChip,
                  pressed && { transform: [{ scale: 0.96 }] },
                ]}
              >
                <Text style={styles.hubEmoji}>{hub.emoji}</Text>
                <Text style={styles.hubName}>{hub.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Live Search Results List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.resultsList}
        >
          {results.map((item) => {
            const isMetro = item.type === 'metro' || item.type === 'station';
            const isPurple = item.line === 'purple' || item.metroLine === 'purple';
            const lineColor = isMetro ? (isPurple ? PURPLE_LINE : GREEN_LINE) : colors.accentRamp[600];

            return (
              <Pressable
                key={item.id}
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [
                  styles.resultCard,
                  pressed && { backgroundColor: colors.neutral[100] },
                ]}
              >
                <View style={[styles.resultIconBox, { backgroundColor: `${lineColor}15` }]}>
                  <Text style={styles.resultIconEmoji}>
                    {isMetro ? '🚇' : item.type === 'hub' ? '🏢' : '📍'}
                  </Text>
                </View>

                <View style={styles.resultInfoCol}>
                  <Text style={styles.resultTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {item.area || 'Bengaluru'}
                    {item.nearestMetro ? ` · Near ${item.nearestMetro}` : ''}
                    {isMetro ? ` (${isPurple ? 'Purple' : 'Green'} Line)` : ''}
                  </Text>
                </View>

                {item.estimatedCost > 0 && (
                  <View style={styles.fareBadge}>
                    <Text style={styles.fareAmount}>~₹{item.estimatedCost}</Text>
                    <Text style={styles.fareLabel}>est. fare</Text>
                  </View>
                )}
              </Pressable>
            );
          })}

          {results.length === 0 && !isSearching && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No matching spot found</Text>
              <Text style={styles.emptySubtitle}>
                Try searching by area (e.g. HSR Layout, Koramangala, Indiranagar, Whitefield) or choose from the popular hubs above.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  titleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    lineHeight: 20,
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 1,
  },
  closeIconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.accentRamp[300],
    gap: 10,
    ...shadow.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.body,
    color: colors.neutral[900],
    padding: 0,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  gpsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 10,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentRamp[100],
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  gpsDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.accentRamp[600],
  },
  gpsBtnText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
  },
  activeTargetBadge: {
    backgroundColor: colors.neutral[100],
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    maxWidth: '45%',
  },
  activeTargetText: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
  },
  hubsSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1,
    color: colors.neutral[500],
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  hubsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  hubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadow.sm,
  },
  hubEmoji: {
    fontSize: 12,
  },
  hubName: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 6,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    gap: 12,
    ...shadow.sm,
  },
  resultIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconEmoji: {
    fontSize: 16,
  },
  resultInfoCol: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 13.5,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  resultSubtitle: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 2,
  },
  fareBadge: {
    alignItems: 'flex-end',
  },
  fareAmount: {
    fontSize: 12.5,
    fontFamily: fontFamily.heading,
    color: colors.accentRamp[700],
  },
  fareLabel: {
    fontSize: 9.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[400],
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: fontFamily.heading,
    color: colors.neutral[800],
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
});

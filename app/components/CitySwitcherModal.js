import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { getAllCities } from '../data/citiesRegistry';
import { useTrip } from '../../src/context/TripContext';

export default function CitySwitcherModal({ visible, onClose }) {
  const { currentCity, switchCity, fireToast } = useTrip();

  if (!visible) return null;

  const cities = getAllCities();

  const handleSelect = (city) => {
    if (city.id === currentCity.id) {
      onClose();
      return;
    }
    switchCity(city.id);
    fireToast(`Switched to ${city.name}! Loaded transit network and local fare cards.`);
    onClose();
  };

  const Container = Platform.OS === 'web' ? View : Modal;
  const containerProps =
    Platform.OS === 'web'
      ? { style: [StyleSheet.absoluteFill, { zIndex: 12000 }] }
      : { transparent: true, visible: true, animationType: 'slide', onRequestClose: onClose };

  return (
    <Container {...containerProps}>
      {/* Dimmed backdrop */}
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </View>

      {/* Main Sheet */}
      <View style={styles.modalCard}>
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.headerBadgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>MULTI-CITY COMPANION</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>3 Metros Live</Text>
              </View>
            </View>
            <Text style={styles.title}>Select Explorer City</Text>
            <Text style={styles.subtitle}>
              Switch transit maps, auto meter cards & cloakrooms instantly
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[700]} strokeWidth={2.5}>
              <Path d="M18 6L6 18M6 6l12 12" />
            </Svg>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {cities.map((city) => {
            const isSelected = currentCity.id === city.id;
            return (
              <Pressable
                key={city.id}
                onPress={() => handleSelect(city)}
                style={({ pressed }) => [
                  styles.cityCard,
                  isSelected && styles.cityCardSelected,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <View style={styles.cityCardTopRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cityNameRow}>
                      <Text style={styles.cityName}>{city.name}</Text>
                      <View style={[styles.cityBadge, isSelected && styles.cityBadgeSelected]}>
                        <Text style={[styles.cityBadgeText, isSelected && styles.cityBadgeTextSelected]}>
                          {city.badge}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.cityTagline}>{city.tagline}</Text>
                  </View>

                  <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    <Text style={[styles.checkText, isSelected && styles.checkTextSelected]}>
                      {isSelected ? '✓' : '➔'}
                    </Text>
                  </View>
                </View>

                {/* Transit Details Grid */}
                <View style={styles.cityMetaGrid}>
                  <View style={styles.cityMetaItem}>
                    <Text style={styles.metaLabel}>TRANSIT AGENCY</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>{city.transitAgency}</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.cityMetaItem}>
                    <Text style={styles.metaLabel}>INTERCHANGE HUB</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>{city.interchangeHub}</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.cityMetaItem}>
                    <Text style={styles.metaLabel}>AUTO BASE RATE</Text>
                    <Text style={[styles.metaValue, { color: '#16a34a' }]}>
                      ₹{city.autoFareFormula.baseFare} ({city.autoFareFormula.baseDistanceKm}km)
                    </Text>
                  </View>
                </View>

                {/* Local Phrase Snippet */}
                <View style={styles.lingoRow}>
                  <Text style={styles.lingoEmoji}>🗣️</Text>
                  <Text style={styles.lingoText}>
                    Say: <Text style={styles.lingoBold}>"{city.autoFareFormula.lingoPhrase}"</Text> ({city.autoFareFormula.hindiMeaning})
                  </Text>
                </View>
              </Pressable>
            );
          })}

          <View style={styles.footerNoteCard}>
            <Text style={styles.footerNoteTitle}>💡 Seamless Transit Adaptation</Text>
            <Text style={styles.footerNoteText}>
              Switching city automatically loads that city’s official gazetted meter tariff formula, railway station cloakrooms, and popular tourist hubs without needing internet or app relaunch.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  modalCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '90%',
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.lg,
    overflow: 'hidden',
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.neutral[300],
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: '#ffffff',
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: '#1d4ed8',
    letterSpacing: 0.5,
  },
  activePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  activePillText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    marginLeft: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
    gap: 12,
  },
  cityCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    padding: 14,
    gap: 10,
    ...shadow.sm,
  },
  cityCardSelected: {
    borderColor: colors.accentRamp[700],
    backgroundColor: '#ffffff',
    borderWidth: 2,
  },
  cityCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityName: {
    fontSize: 16,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  cityBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  cityBadgeSelected: {
    backgroundColor: colors.accentRamp[100],
  },
  cityBadgeText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[600],
  },
  cityBadgeTextSelected: {
    color: colors.accentRamp[800],
  },
  cityTagline: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#64748b',
    marginTop: 2,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: colors.accentRamp[700],
  },
  checkText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
  },
  checkTextSelected: {
    color: '#ffffff',
  },
  cityMetaGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cityMetaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#cbd5e1',
  },
  metaLabel: {
    fontSize: 8,
    fontFamily: fontFamily.bodyBold,
    color: '#64748b',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#1e293b',
  },
  lingoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fdf4ff',
    borderRadius: radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#f5d0fe',
  },
  lingoEmoji: {
    fontSize: 13,
  },
  lingoText: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#86198f',
  },
  lingoBold: {
    fontFamily: fontFamily.bodyBold,
  },
  footerNoteCard: {
    backgroundColor: '#fffbeb',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 12,
    marginTop: 4,
  },
  footerNoteTitle: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#92400e',
    marginBottom: 4,
  },
  footerNoteText: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#78350f',
    lineHeight: 16,
  },
});

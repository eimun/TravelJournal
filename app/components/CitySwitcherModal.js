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

const CITY_ICONS = {
  bengaluru: '🌳',
  delhi: '🏛️',
  mumbai: '🌊',
};

const CITY_TRANSIT_SUBTITLES = {
  bengaluru: 'Namma Metro & BMTC Bus',
  delhi: 'Delhi Metro (DMRC) & DTC',
  mumbai: 'Mumbai Local Rail & Metro',
};

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
    fireToast(`Switched to ${city.name}!`);
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

      {/* Main Bottom Sheet */}
      <View style={styles.modalCard}>
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Select City</Text>
            <Text style={styles.subtitle}>Choose your region for local transit & fares</Text>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.neutral[700]}
              strokeWidth={2.5}
            >
              <Path d="M18 6L6 18M6 6l12 12" />
            </Svg>
          </Pressable>
        </View>

        {/* Clean City Cards List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {cities.map((city) => {
            const isSelected = currentCity.id === city.id;
            const emoji = CITY_ICONS[city.id] || '🏙️';
            const transitLabel =
              CITY_TRANSIT_SUBTITLES[city.id] || city.transitAgency || 'Metro & Transit';

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
                {/* City Emoji Icon Disc */}
                <View
                  style={[
                    styles.iconDisc,
                    isSelected ? styles.iconDiscSelected : styles.iconDiscDefault,
                  ]}
                >
                  <Text style={styles.iconEmoji}>{emoji}</Text>
                </View>

                {/* City Information */}
                <View style={styles.cityInfo}>
                  <View style={styles.cityNameRow}>
                    <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
                      {city.name}
                    </Text>
                    <View style={[styles.codeBadge, isSelected && styles.codeBadgeSelected]}>
                      <Text
                        style={[
                          styles.codeBadgeText,
                          isSelected && styles.codeBadgeTextSelected,
                        ]}
                      >
                        {city.shortName || city.name.substring(0, 3).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cityTransitSub}>{transitLabel}</Text>
                </View>

                {/* State Indicator */}
                <View style={[styles.statusPill, isSelected && styles.statusPillSelected]}>
                  <Text
                    style={[
                      styles.statusPillText,
                      isSelected && styles.statusPillTextSelected,
                    ]}
                  >
                    {isSelected ? '✓ Active' : 'Switch ➔'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.60)',
  },
  modalCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.lg,
    overflow: 'hidden',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[300],
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.heading,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    padding: 7,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    marginLeft: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 10,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    ...shadow.sm,
  },
  cityCardSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  iconDisc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDiscDefault: {
    backgroundColor: '#f1f5f9',
  },
  iconDiscSelected: {
    backgroundColor: '#dcfce7',
  },
  iconEmoji: {
    fontSize: 22,
  },
  cityInfo: {
    flex: 1,
  },
  cityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityName: {
    fontSize: 15.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  cityNameSelected: {
    color: '#15803d',
  },
  codeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  codeBadgeSelected: {
    backgroundColor: '#dcfce7',
  },
  codeBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#64748b',
    letterSpacing: 0.5,
  },
  codeBadgeTextSelected: {
    color: '#166534',
  },
  cityTransitSub: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: '#64748b',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#f1f5f9',
  },
  statusPillSelected: {
    backgroundColor: '#16a34a',
  },
  statusPillText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#64748b',
  },
  statusPillTextSelected: {
    color: '#ffffff',
  },
});

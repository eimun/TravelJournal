import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { useTrip } from '../../src/context/TripContext';
import { DIET_OPTIONS, DISHES } from '../data/bengaluruData';

export default function EatScreen({ contentPadding }) {
  const { dish, setDish, diets, toggleDiet, filteredEateries } = useTrip();

  const activeDishObj = DISHES.find((d) => d.id === dish) || DISHES[0];

  const getTagStyle = (tag) => {
    if (tag === 'nonveg') {
      return {
        bg: colors.accentRamp[200],
        text: colors.accentRamp[800],
        label: 'Non-veg',
      };
    }
    if (tag === 'cash') {
      return {
        bg: colors.neutral[200],
        text: colors.neutral[700],
        label: 'Cash only',
      };
    }
    if (tag === 'nog') {
      return {
        bg: colors.accent2Ramp[200],
        text: colors.accent2Ramp[800],
        label: 'No onion-garlic',
      };
    }
    if (tag === 'halal') {
      return {
        bg: colors.accent2Ramp[200],
        text: colors.accent2Ramp[800],
        label: 'Halal',
      };
    }
    return {
      bg: colors.accent2Ramp[200],
      text: colors.accent2Ramp[800],
      label: 'Pure veg',
    };
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.container, contentPadding]}
    >
      {/* Header */}
      <Text style={styles.kicker}>EAT · FAIR PRICES, NOT MENUS</Text>
      <Text style={styles.heading}>Pick the dish first</Text>

      {/* Dietary Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dietScroll}
      >
        {DIET_OPTIONS.map((opt) => {
          const isSelected = diets.includes(opt.id);
          return (
            <Pressable
              key={opt.id}
              onPress={() => toggleDiet(opt.id)}
              style={({ pressed }) => [
                styles.dietChip,
                isSelected && styles.dietChipActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
            >
              <Text
                style={[
                  styles.dietChipText,
                  isSelected && styles.dietChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 2-Column Dish Grid */}
      <View style={styles.dishGrid}>
        {DISHES.map((item) => {
          const isSelected = dish === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setDish(item.id)}
              style={({ pressed }) => [
                styles.dishCard,
                isSelected && styles.dishCardActive,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={[styles.dishDot, { backgroundColor: item.tint }]} />
              <Text style={styles.dishName}>{item.name}</Text>
              <Text
                style={[
                  styles.dishPrice,
                  isSelected && { color: colors.accentRamp[800] },
                ]}
              >
                {item.price}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Eateries for selected dish */}
      <View style={styles.eateriesHeaderRow}>
        <Text style={styles.eateriesTitle}>
          Where to eat {activeDishObj.name.toLowerCase()}
        </Text>
        <Text style={styles.eateriesCount}>
          {filteredEateries.length} places
          {diets.length > 0 ? ' after filters' : ''}
        </Text>
      </View>

      <View style={styles.eateriesList}>
        {filteredEateries.map((eatery, idx) => (
          <View key={idx} style={styles.eateryCard}>
            <View style={styles.eateryTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eateryName}>{eatery.name}</Text>
                <Text style={styles.eateryArea}>{eatery.area}</Text>
              </View>
              <View style={styles.eateryPriceCol}>
                <Text style={styles.eateryPrice}>₹{eatery.price}</Text>
                <Text style={styles.fairPriceLabel}>FAIR PRICE</Text>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {eatery.tags.map((t, tIdx) => {
                const tagInfo = getTagStyle(t);
                return (
                  <View
                    key={tIdx}
                    style={[styles.tagPill, { backgroundColor: tagInfo.bg }]}
                  >
                    <Text style={[styles.tagText, { color: tagInfo.text }]}>
                      {tagInfo.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Text style={styles.eateryNote}>{eatery.note}</Text>
          </View>
        ))}
      </View>

      {/* Advisory Banner: What the fair price looks like */}
      <View style={styles.fairPriceBanner}>
        <View style={styles.bannerHeader}>
          <Svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.accentRamp[800]}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 8v4" />
            <Path d="M12 16h.01" />
          </Svg>
          <Text style={styles.bannerTitle}>What the fair price looks like</Text>
        </View>
        <Text style={styles.bannerText}>
          A darshini breakfast is ₹30–₹90 and a filter coffee is ₹15–₹40. If a
          place near a tourist gate quotes triple, walk two streets inland — the
          same dish, the local price. Most of the best ones are cash only and
          shut before noon.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 90,
  },
  kicker: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1.2,
    color: colors.accentRamp[700],
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 26,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    marginTop: 4,
    lineHeight: 30,
  },
  dietScroll: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingBottom: 4,
  },
  dietChip: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 15,
    ...shadow.sm,
  },
  dietChipActive: {
    backgroundColor: colors.accentRamp[500],
  },
  dietChipText: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  dietChipTextActive: {
    color: colors.white,
  },
  dishGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  dishCard: {
    width: '48%',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: 14,
    ...shadow.sm,
  },
  dishCardActive: {
    backgroundColor: colors.accentRamp[200],
    borderWidth: 1.5,
    borderColor: colors.accentRamp[500],
  },
  dishDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  dishName: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
    marginTop: 10,
    lineHeight: 18,
  },
  dishPrice: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[600],
    marginTop: 4,
  },
  eateriesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 22,
    marginBottom: 10,
  },
  eateriesTitle: {
    fontSize: 18,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  eateriesCount: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
  },
  eateriesList: {
    gap: 11,
  },
  eateryCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: 15,
    ...shadow.sm,
  },
  eateryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  eateryName: {
    fontSize: 14.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  eateryArea: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 3,
  },
  eateryPriceCol: {
    alignItems: 'flex-end',
  },
  eateryPrice: {
    fontSize: 18,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  fairPriceLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.6,
    color: colors.accent2Ramp[700],
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tagPill: {
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  eateryNote: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    lineHeight: 18,
    marginTop: 10,
  },
  fairPriceBanner: {
    marginTop: 16,
    backgroundColor: colors.accentRamp[200],
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.sm,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
  },
  bannerText: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.accentRamp[800],
    lineHeight: 18,
    marginTop: 8,
  },
});

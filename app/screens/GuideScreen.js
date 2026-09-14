import React, { useState } from 'react';
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
import { DISHES, DIET_OPTIONS, PACK_ITEMS } from '../data/bengaluruData';
import CircularProgress from '../components/CircularProgress';

const KANNADA_PHRASES = [
  { phrase: 'Meter haaki', english: 'Please put the meter on', context: 'When boarding an auto' },
  { phrase: 'Yeshtu aaguthe?', english: 'How much will it cost?', context: 'Asking fare / price' },
  { phrase: 'Left / Right thagoli', english: 'Take a left / right turn', context: 'Giving directions to driver' },
  { phrase: 'Illi nillisi', english: 'Please stop here', context: 'When reaching your spot' },
  { phrase: 'Majestic-ge hogutha?', english: 'Does this go to Majestic?', context: 'Asking BMTC bus conductor' },
  { phrase: 'Bega banni', english: 'Please come quickly', context: 'Calling auto / cab' },
];

export default function GuideScreen({ contentPadding }) {
  const {
    dish,
    setDish,
    diets,
    toggleDiet,
    filteredEateries,
    packStatus,
    packPct,
    startPackDownload,
  } = useTrip();

  const [guideSubTab, setGuideSubTab] = useState('tips'); // 'tips' | 'food' | 'offline'

  const isDone = packStatus === 'done';
  const isBusy = packStatus === 'busy';

  const selectedDishObj = DISHES.find((d) => d.id === dish);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.container, contentPadding]}
    >
      {/* Header */}
      <Text style={styles.kicker}>BENGALURU GUIDE</Text>
      <Text style={styles.heading}>Survival & Local Tips</Text>

      {/* Segmented Sub-Tabs */}
      <View style={styles.subTabRow}>
        <Pressable
          onPress={() => setGuideSubTab('tips')}
          style={[styles.subTabBtn, guideSubTab === 'tips' && styles.subTabBtnActive]}
        >
          <Text style={[styles.subTabBtnText, guideSubTab === 'tips' && styles.subTabBtnTextActive]}>
            Transit & Tips
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setGuideSubTab('food')}
          style={[styles.subTabBtn, guideSubTab === 'food' && styles.subTabBtnActive]}
        >
          <Text style={[styles.subTabBtnText, guideSubTab === 'food' && styles.subTabBtnTextActive]}>
            Food & Darshinis
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setGuideSubTab('offline')}
          style={[styles.subTabBtn, guideSubTab === 'offline' && styles.subTabBtnActive]}
        >
          <Text style={[styles.subTabBtnText, guideSubTab === 'offline' && styles.subTabBtnTextActive]}>
            Offline Pack
          </Text>
        </Pressable>
      </View>

      {/* Subtab 1: Transit & City Tips */}
      {guideSubTab === 'tips' && (
        <View style={styles.tabContent}>
          {/* Auto Rickshaw Rules Card */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeaderRow}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.accentRamp[700]} strokeWidth={2.5}>
                <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </Svg>
              <Text style={styles.tipCardTitle}>AUTO-RICKSHAW SURVIVAL</Text>
            </View>
            <Text style={styles.tipCardBody}>
              • Minimum fare is ₹30 for first 1.9 km, then ₹15/km.{'\n'}
              • Between 10 PM and 5 AM, fare is 1.5x (Onduvare / one-and-a-half).{'\n'}
              • Say “Meter haaki” firmly before stepping in.{'\n'}
              • If drivers refuse or quote double, use Namma Yatri or Uber Auto.
            </Text>
          </View>

          {/* Namma Metro Hacks */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeaderRow}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.accent2Ramp[700]} strokeWidth={2.5}>
                <Circle cx="12" cy="12" r="10" />
                <Path d="M12 6v6l4 2" />
              </Svg>
              <Text style={styles.tipCardTitle}>METRO TIMINGS & HACKS</Text>
            </View>
            <Text style={styles.tipCardBody}>
              • First train departs 5:00 AM from terminal stations.{'\n'}
              • Last train departs 11:00 PM (11:30 PM on Sundays/holidays).{'\n'}
              • WhatsApp QR tickets give 5% discount on WhatsApp (+91 81055 56677).{'\n'}
              • Majestic interchange takes 3-4 mins walk inside the paid concourse.
            </Text>
          </View>

          {/* Useful Kannada Transit Phrases */}
          <Text style={styles.sectionHeading}>Helpful Kannada Phrases</Text>
          <View style={styles.phrasesList}>
            {KANNADA_PHRASES.map((item, idx) => (
              <View key={idx} style={styles.phraseCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.kannadaText}>“{item.phrase}”</Text>
                  <Text style={styles.englishText}>{item.english}</Text>
                  <Text style={styles.phraseContext}>When to say: {item.context}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Subtab 2: Food & Darshinis */}
      {guideSubTab === 'food' && (
        <View style={styles.tabContent}>
          {/* Dietary Filter Chips */}
          <View style={styles.dietRow}>
            {DIET_OPTIONS.map((opt) => {
              const active = diets.includes(opt.id);
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => toggleDiet(opt.id)}
                  style={[styles.dietChip, active && styles.dietChipActive]}
                >
                  <Text style={[styles.dietChipText, active && styles.dietChipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Dish Picker Carousel */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dishCarousel}>
            {DISHES.map((item) => {
              const active = dish === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setDish(item.id)}
                  style={[styles.dishCard, active && styles.dishCardActive]}
                >
                  <View style={[styles.dishTintCircle, { backgroundColor: item.tint }]} />
                  <Text numberOfLines={1} style={styles.dishCardName}>{item.name}</Text>
                  <Text style={styles.dishCardPrice}>{item.price}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Eateries List */}
          <Text style={styles.sectionHeading}>
            Where to eat {selectedDishObj?.name}
          </Text>

          <View style={styles.eateryList}>
            {filteredEateries.map((eat, idx) => (
              <View key={idx} style={styles.eateryCard}>
                <View style={styles.eateryTopRow}>
                  <Text style={styles.eateryName}>{eat.name}</Text>
                  <Text style={styles.eateryPrice}>₹{eat.price}</Text>
                </View>
                <Text style={styles.eateryArea}>{eat.area}</Text>
                <Text style={styles.eateryNote}>{eat.note}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Subtab 3: Offline Pack */}
      {guideSubTab === 'offline' && (
        <View style={styles.tabContent}>
          {/* Main Download Card */}
          <View style={styles.offlineCard}>
            <View style={styles.progressRow}>
              <CircularProgress
                size={64}
                strokeWidth={6}
                pct={packPct}
                done={isDone}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.offlineTitle}>
                  {isDone ? 'Bengaluru pack installed' : isBusy ? 'Downloading...' : 'Bengaluru pack · 63 MB'}
                </Text>
                <Text style={styles.offlineSubtitle}>
                  {isDone ? 'Works completely offline with SIM out' : 'Includes offline metro graph & places'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={startPackDownload}
              style={[
                styles.downloadBtn,
                isDone && styles.downloadBtnDone,
                isBusy && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.downloadBtnText}>
                {isDone ? 'Installed · Check for updates' : isBusy ? 'Downloading...' : 'Download pack'}
              </Text>
            </Pressable>
          </View>

          {/* Checklist */}
          <Text style={styles.sectionHeading}>What is in the pack</Text>
          <View style={styles.packChecklist}>
            {PACK_ITEMS.map((item) => (
              <View key={item.id} style={styles.packItemRow}>
                <View style={styles.packItemDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.packItemLabel}>{item.label}</Text>
                  <Text style={styles.packItemMeta}>{item.meta}</Text>
                </View>
                <Text style={styles.packItemSize}>{item.size}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90,
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
  subTabRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
    backgroundColor: colors.neutral[200],
    borderRadius: radius.pill,
    padding: 3,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  subTabBtnActive: {
    backgroundColor: colors.white,
    ...shadow.sm,
  },
  subTabBtnText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[600],
  },
  subTabBtnTextActive: {
    color: colors.neutral[900],
  },
  tabContent: {
    marginTop: 16,
  },
  tipCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    ...shadow.sm,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipCardTitle: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1,
    color: colors.neutral[800],
  },
  tipCardBody: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    lineHeight: 20,
    color: colors.neutral[700],
  },
  sectionHeading: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    marginTop: 16,
    marginBottom: 10,
  },
  phrasesList: {
    gap: 8,
  },
  phraseCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 14,
    ...shadow.sm,
  },
  kannadaText: {
    fontSize: 15,
    fontFamily: fontFamily.heading,
    color: colors.accentRamp[700],
  },
  englishText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
    marginTop: 2,
  },
  phraseContext: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  dietRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  dietChip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral[200],
  },
  dietChipActive: {
    backgroundColor: colors.accent2Ramp[600],
  },
  dietChipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  dietChipTextActive: {
    color: colors.white,
  },
  dishCarousel: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  dishCard: {
    width: 130,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadow.sm,
  },
  dishCardActive: {
    borderColor: colors.accentRamp[500],
    backgroundColor: colors.accentRamp[100],
  },
  dishTintCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  dishCardName: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  dishCardPrice: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  eateryList: {
    gap: 10,
  },
  eateryCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 14,
    ...shadow.sm,
  },
  eateryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  eateryName: {
    fontSize: 14.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  eateryPrice: {
    fontSize: 15,
    fontFamily: fontFamily.heading,
    color: colors.accentRamp[700],
  },
  eateryArea: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  eateryNote: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[800],
    marginTop: 6,
    lineHeight: 18,
  },
  offlineCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: 18,
    ...shadow.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  offlineTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  offlineSubtitle: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  downloadBtn: {
    marginTop: 16,
    backgroundColor: colors.accentRamp[500],
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  downloadBtnDone: {
    backgroundColor: colors.accent2Ramp[600],
  },
  downloadBtnText: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  packChecklist: {
    gap: 8,
  },
  packItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 12,
  },
  packItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent2Ramp[600],
  },
  packItemLabel: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  packItemMeta: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 1,
  },
  packItemSize: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
});

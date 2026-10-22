import React, { useState } from 'react';
import {
  Image,
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
import { getCityHeritageGuide } from '../data/cityHeritageData';
import CircularProgress from '../components/CircularProgress';
import CloakroomModal from '../components/CloakroomModal';
import SafetyPingModal from '../components/SafetyPingModal';
import { openDiagnostics } from '../../src/logging/diagnosticsBus';
import { useIssueCounts } from '../../src/logging/useIssueCounts';

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
    activeRoute,
    currentCity,
    openCitySwitcher,
    cityDishes,
    selectDestination,
    setTab,
  } = useTrip();
  const issueCounts = useIssueCounts();

  const [guideSubTab, setGuideSubTab] = useState('tips'); // 'tips' | 'heritage' | 'food' | 'offline'
  const [monumentFilter, setMonumentFilter] = useState('All');
  const [showCloakroomModal, setShowCloakroomModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const isDone = packStatus === 'done';
  const isBusy = packStatus === 'busy';

  const currentDishes = (cityDishes && cityDishes.length > 0) ? cityDishes : DISHES;
  const selectedDishObj = currentDishes.find((d) => d.id === dish) || currentDishes[0];

  const cityHeritage = getCityHeritageGuide(currentCity?.id || 'bengaluru');
  const displayedMonuments = (cityHeritage?.monuments || []).filter((m) => {
    if (monumentFilter === 'All') return true;
    return m.category.toLowerCase().includes(monumentFilter.toLowerCase());
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.container, contentPadding]}
    >
      {/* Header */}
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>{(currentCity?.name || 'BENGALURU').toUpperCase()} GUIDE</Text>
          <Text style={styles.heading}>Survival & Local Tips</Text>
        </View>
        <Pressable
          onPress={openCitySwitcher}
          style={({ pressed }) => [styles.guideCityPill, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.guideCityPillText}>📍 {currentCity?.shortName || 'BLR'} ▼</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => openDiagnostics('guide_button')}
        style={({ pressed }) => [styles.logsPill, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.logsPillText}>🐞 Diagnostics & logs</Text>
        {issueCounts.major > 0 && (
          <View style={styles.logsBadgeMajor}>
            <Text style={styles.logsBadgeText}>{issueCounts.major} major</Text>
          </View>
        )}
        {issueCounts.minor > 0 && (
          <View style={styles.logsBadgeMinor}>
            <Text style={styles.logsBadgeText}>{issueCounts.minor} minor</Text>
          </View>
        )}
      </Pressable>

      {/* Segmented Sub-Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subTabRow}
      >
        <Pressable
          onPress={() => setGuideSubTab('tips')}
          style={[styles.subTabBtn, guideSubTab === 'tips' && styles.subTabBtnActive]}
        >
          <Text style={[styles.subTabBtnText, guideSubTab === 'tips' && styles.subTabBtnTextActive]}>
            Transit & Tips
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setGuideSubTab('heritage')}
          style={[styles.subTabBtn, guideSubTab === 'heritage' && styles.subTabBtnActive]}
        >
          <Text style={[styles.subTabBtnText, guideSubTab === 'heritage' && styles.subTabBtnTextActive]}>
            🏛️ History & Heritage
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setGuideSubTab('food')}
          style={[styles.subTabBtn, guideSubTab === 'food' && styles.subTabBtnActive]}
        >
          <Text style={[styles.subTabBtnText, guideSubTab === 'food' && styles.subTabBtnTextActive]}>
            {currentCity?.id === 'bengaluru' ? 'Food & Darshinis' : 'Food & Legends'}
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
      </ScrollView>

      {/* Subtab 1: Transit & City Tips */}
      {guideSubTab === 'tips' && (
        <View style={styles.tabContent}>
          {/* Auto Rickshaw Rules Card */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeaderRow}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.accentRamp[700]} strokeWidth={2.5}>
                <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </Svg>
              <Text style={styles.tipCardTitle}>{(currentCity?.autoFareFormula?.vehicleType || 'AUTO-RICKSHAW').toUpperCase()} SURVIVAL</Text>
            </View>
            <Text style={styles.tipCardBody}>
              • Meter fare: ₹{currentCity?.autoFareFormula?.baseFare} for first {currentCity?.autoFareFormula?.baseDistanceKm} km, then ₹{currentCity?.autoFareFormula?.perKm}/km (tariff effective {currentCity?.autoFareFormula?.effectiveFrom}).{'\n'}
              • Night fare ({currentCity?.autoFareFormula?.nightHours}): {currentCity?.autoFareFormula?.nightMultiplier}× standard rate.{'\n'}
              • Essential local phrase: “{currentCity?.autoFareFormula?.lingoPhrase || 'Meter haaki'}” ({currentCity?.autoFareFormula?.hindiMeaning || 'Run by meter'}).{'\n'}
              • {currentCity?.scamAlert || 'Demand meter or book via verified mobility apps.'}
            </Text>
          </View>

          {/* City Transit Hacks */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeaderRow}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.accent2Ramp[700]} strokeWidth={2.5}>
                <Circle cx="12" cy="12" r="10" />
                <Path d="M12 6v6l4 2" />
              </Svg>
              <Text style={styles.tipCardTitle}>{(currentCity?.transitAgency || 'TRANSIT NETWORK').toUpperCase()} GUIDE</Text>
            </View>
            <Text style={styles.tipCardBody}>
              {(currentCity?.transitTips || [
                'First train departs 5:00 AM from terminal stations; last train 11:00 PM.',
                'WhatsApp QR tickets give 5% discount on official transit bots.',
                'Major interchanges take 3-4 mins walk inside the paid concourse.',
              ]).map((tip, idx) => `• ${tip}`).join('\n')}
            </Text>
          </View>

          {/* Explorer Safety & Luggage Tools */}
          <Text style={styles.sectionHeading}>Explorer Safety & Luggage Tools</Text>
          <View style={styles.toolsRow}>
            <Pressable
              onPress={() => setShowCloakroomModal(true)}
              style={({ pressed }) => [
                styles.toolCard,
                { borderColor: '#fed7aa', backgroundColor: '#fff7ed' },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.toolEmoji}>🧳</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toolTitle, { color: '#9a3412' }]}>Station Cloakroom Guide</Text>
                <Text style={styles.toolSub}>{currentCity?.cloakroomHighlight || 'Verified 24/7 railway cloakrooms & locker rules'}</Text>
              </View>
              <Text style={[styles.toolArrow, { color: '#ea580c' }]}>➔</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowSafetyModal(true)}
              style={({ pressed }) => [
                styles.toolCard,
                { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.toolEmoji}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toolTitle, { color: '#14532d' }]}>1-Tap Family Safety Ping</Text>
                <Text style={styles.toolSub}>Share live transit gate & arrival updates directly on WhatsApp</Text>
              </View>
              <Text style={[styles.toolArrow, { color: '#15803d' }]}>➔</Text>
            </Pressable>
          </View>

          {/* Useful City Transit Phrases */}
          <Text style={styles.sectionHeading}>Helpful {currentCity?.localLanguage || 'Local'} Phrases</Text>
          <View style={styles.phrasesList}>
            {(currentCity?.localPhrases || KANNADA_PHRASES).map((item, idx) => (
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

      {/* Subtab 2: Heritage, History & Monuments Guidebook */}
      {guideSubTab === 'heritage' && (
        <View style={styles.tabContent}>
          {/* City Moniker & Story Card */}
          <View style={styles.heritageHeroCard}>
            <View style={styles.heritageHeroTop}>
              <View style={styles.heritageBadge}>
                <Text style={styles.heritageBadgeText}>FOUNDED {cityHeritage.foundingYear.toUpperCase()}</Text>
              </View>
              <Text style={styles.heritageCityName}>{cityHeritage.cityName} Historical Guide</Text>
              <Text style={styles.heritageMoniker}>{cityHeritage.moniker}</Text>
            </View>

            <View style={styles.heritageStoryBox}>
              <Text style={styles.heritageStoryText}>{cityHeritage.historySummary}</Text>
              <View style={styles.founderRow}>
                <Text style={styles.founderLabel}>Founder / Historical Roots:</Text>
                <Text style={styles.founderName}>{cityHeritage.founder}</Text>
              </View>
            </View>
          </View>

          {/* Historical Eras Timeline */}
          <Text style={styles.sectionHeading}>Historical Eras & Timeline</Text>
          <View style={styles.erasList}>
            {cityHeritage.historicalEras.map((era, eIdx) => (
              <View key={eIdx} style={styles.eraCard}>
                <View style={styles.eraHeaderRow}>
                  <View style={styles.eraTimelineDot} />
                  <Text style={styles.eraTimeRange}>{era.era}</Text>
                  <Text style={styles.eraTitle}>{era.title}</Text>
                </View>
                <Text style={styles.eraDesc}>{era.desc}</Text>
              </View>
            ))}
          </View>

          {/* Category Filter Chips for Monuments */}
          <View style={styles.monumentFilterRow}>
            <Text style={styles.sectionHeading}>Iconic Monuments & Heritage Places</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monumentCategoryScroll}>
              {['All', 'Palace', 'Fort', 'Temple', 'Mausoleum', 'Monument'].map((cat) => {
                const active = (monumentFilter === cat) || (cat === 'All' && monumentFilter === 'All');
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setMonumentFilter(cat)}
                    style={[styles.monumentFilterChip, active && styles.monumentFilterChipActive]}
                  >
                    <Text style={[styles.monumentFilterText, active && styles.monumentFilterTextActive]}>{cat}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Monuments List */}
          <View style={styles.monumentsList}>
            {displayedMonuments.map((m) => (
              <View key={m.id} style={styles.monumentCard}>
                <View style={styles.monumentImageContainer}>
                  <Image source={{ uri: m.image }} style={styles.monumentImage} resizeMode="cover" />
                  <View style={styles.builtYearBadge}>
                    <Text style={styles.builtYearText}>Est. {m.builtYear}</Text>
                  </View>
                  <View style={styles.monumentCategoryPill}>
                    <Text style={styles.monumentCategoryPillText}>{m.emoji} {m.category}</Text>
                  </View>
                </View>

                <View style={styles.monumentBody}>
                  <Text style={styles.monumentTitle}>{m.name}</Text>
                  <Text style={styles.monumentBuilder}>Built by: {m.builder}</Text>

                  <Text style={styles.monumentSignificance}>{m.significance}</Text>

                  <View style={styles.monumentMetaGrid}>
                    <View style={styles.monumentMetaItem}>
                      <Text style={styles.monumentMetaLabel}>TIMINGS</Text>
                      <Text style={styles.monumentMetaVal}>{m.visitingHours}</Text>
                    </View>
                    <View style={styles.monumentMetaItem}>
                      <Text style={styles.monumentMetaLabel}>ENTRY TICKET</Text>
                      <Text style={styles.monumentMetaVal}>{m.entryTicket}</Text>
                    </View>
                  </View>

                  <View style={styles.nearestMetroBox}>
                    <Text style={styles.metroIcon}>🚇</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nearestMetroLabel}>NEAREST TRANSIT ACCESS</Text>
                      <Text style={styles.nearestMetroVal}>{m.nearestMetro}</Text>
                    </View>
                  </View>

                  {m.insiderTip && (
                    <View style={styles.insiderTipBox}>
                      <Text style={styles.insiderTipText}>💡 {m.insiderTip}</Text>
                    </View>
                  )}

                  <Pressable
                    onPress={() => {
                      selectDestination({
                        id: m.id,
                        name: m.name,
                        area: cityHeritage.cityName,
                        category: m.category,
                        latitude: m.latitude,
                        longitude: m.longitude,
                        nearestMetro: m.nearestMetro,
                      });
                      setTab('navigate');
                    }}
                    style={({ pressed }) => [styles.getRouteButton, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
                  >
                    <Text style={styles.getRouteButtonText}>🧭 Plan Route to {m.name}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Subtab 3: Food & Darshinis */}
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
            {currentDishes.map((item) => {
              const active = (dish === item.id) || (!dish && item.id === currentDishes[0]?.id);
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
            Where to eat {selectedDishObj?.name || 'legendary food'}
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
                  {isDone ? `${currentCity?.name || 'City'} pack installed` : isBusy ? 'Downloading...' : `${currentCity?.name || 'City'} pack · 63 MB`}
                </Text>
                <Text style={styles.offlineSubtitle}>
                  {isDone ? 'Works completely offline with SIM out' : `Includes offline transit graph & places for ${currentCity?.name || 'city'}`}
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

      {/* Cloakroom Directory Modal */}
      <CloakroomModal
        visible={showCloakroomModal}
        onClose={() => setShowCloakroomModal(false)}
      />

      {/* Safety Ping Modal */}
      <SafetyPingModal
        visible={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        route={activeRoute}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  logsPillText: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  logsBadgeMajor: {
    backgroundColor: '#dc2626',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  logsBadgeMinor: {
    backgroundColor: '#f59e0b',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  logsBadgeText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: '#fff',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  guideCityPill: {
    backgroundColor: colors.accentRamp[100],
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accentRamp[300],
    marginBottom: 2,
  },
  guideCityPillText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
    letterSpacing: 0.5,
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
    gap: 8,
    marginTop: 14,
    paddingVertical: 4,
  },
  subTabBtn: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.neutral[200],
  },
  subTabBtnActive: {
    backgroundColor: colors.accentRamp[700],
    ...shadow.sm,
  },
  subTabBtnText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  subTabBtnTextActive: {
    color: '#ffffff',
  },
  heritageHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: 16,
    ...shadow.sm,
  },
  heritageHeroTop: {
    marginBottom: 4,
  },
  heritageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    marginBottom: 6,
  },
  heritageBadgeText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    color: '#92400e',
    letterSpacing: 0.8,
  },
  heritageCityName: {
    fontSize: 20,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  heritageMoniker: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
    marginTop: 3,
    lineHeight: 18,
  },
  heritageStoryBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  heritageStoryText: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    lineHeight: 20,
  },
  founderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: radius.sm,
  },
  founderLabel: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[600],
  },
  founderName: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
    flex: 1,
  },
  erasList: {
    gap: 10,
    marginBottom: 18,
  },
  eraCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  eraHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  eraTimelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentRamp[600],
  },
  eraTimeRange: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
  },
  eraTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
    flex: 1,
  },
  eraDesc: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    lineHeight: 16,
  },
  monumentFilterRow: {
    marginTop: 4,
    marginBottom: 10,
  },
  monumentCategoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  monumentFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  monumentFilterChipActive: {
    backgroundColor: colors.accentRamp[700],
    borderColor: colors.accentRamp[800],
  },
  monumentFilterText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  monumentFilterTextActive: {
    color: '#ffffff',
  },
  monumentsList: {
    gap: 16,
    marginBottom: 20,
  },
  monumentCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadow.sm,
  },
  monumentImageContainer: {
    height: 170,
    position: 'relative',
    backgroundColor: colors.neutral[200],
  },
  monumentImage: {
    width: '100%',
    height: '100%',
  },
  builtYearBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  builtYearText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
  },
  monumentCategoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  monumentCategoryPillText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  monumentBody: {
    padding: 14,
  },
  monumentTitle: {
    fontSize: 17,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  monumentBuilder: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.accentRamp[800],
    marginTop: 2,
    marginBottom: 8,
  },
  monumentSignificance: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    lineHeight: 18,
    marginBottom: 10,
  },
  monumentMetaGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  monumentMetaItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  monumentMetaLabel: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
    letterSpacing: 0.5,
  },
  monumentMetaVal: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[800],
    marginTop: 2,
  },
  nearestMetroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 10,
  },
  metroIcon: {
    fontSize: 16,
  },
  nearestMetroLabel: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: '#166534',
    letterSpacing: 0.5,
  },
  nearestMetroVal: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
    marginTop: 1,
  },
  insiderTipBox: {
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 12,
  },
  insiderTipText: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#92400e',
    lineHeight: 16,
  },
  getRouteButton: {
    backgroundColor: colors.accentRamp[700],
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getRouteButtonText: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
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
  toolsRow: {
    gap: 10,
    marginBottom: 6,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    ...shadow.sm,
  },
  toolEmoji: {
    fontSize: 22,
  },
  toolTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
  },
  toolSub: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  toolArrow: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
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

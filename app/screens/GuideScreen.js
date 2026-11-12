import React, { useState, useEffect, useMemo } from 'react';
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
import { DISHES, DIET_OPTIONS } from '../data/bengaluruData';
import { getCityHeritageGuide } from '../data/cityHeritageData';
import { getRestaurantsForCity } from '../data/cityPlacesData';
import CircularProgress from '../components/CircularProgress';
import CloakroomModal from '../components/CloakroomModal';
import SafetyPingModal from '../components/SafetyPingModal';
import { openDiagnostics } from '../../src/logging/diagnosticsBus';
import { useIssueCounts } from '../../src/logging/useIssueCounts';

const DEFAULT_PHRASES = [
  { phrase: 'Meter haaki', english: 'Please put the meter on', context: 'When boarding an auto' },
  { phrase: 'Yeshtu aaguthe?', english: 'How much will it cost?', context: 'Asking fare / price' },
  { phrase: 'Left / Right thagoli', english: 'Take a left / right turn', context: 'Giving directions to driver' },
  { phrase: 'Illi nillisi', english: 'Please stop here', context: 'When reaching your spot' },
  { phrase: 'Majestic-ge hogutha?', english: 'Does this go to Majestic?', context: 'Asking bus conductor' },
  { phrase: 'Bega banni', english: 'Please come quickly', context: 'Calling auto / cab' },
];

function formatDossierFounded(val) {
  if (!val) return 'Historic';
  if (val.includes('3rd Century BCE')) return '3rd C. BCE / 1510';
  if (val.includes('1200–1000 BCE')) return '~1200 BCE';
  if (val.includes('8th Century CE')) return '8th C. / 1730s';
  if (val.includes('1341 CE')) return '1341 CE';
  if (val.includes('1638 CE')) return '1638 CE';
  if (val.includes('1661 CE')) return '1661 CE';
  if (val.includes('1639 CE')) return '1639 CE';
  return val.replace(/\(.*?\)/g, '').split('/')[0].trim();
}

function formatDossierLanguage(lang) {
  if (!lang) return 'Local / English';
  const parts = lang.split('/').map((s) => s.trim()).filter(Boolean);
  if (parts.length > 2) {
    return `${parts[0]} / ${parts[1]}`;
  }
  return lang;
}

function formatDossierTransit(transit, cId) {
  const custom = {
    goa: 'Kadamba & Ferry',
    bengaluru: 'Namma Metro & BMTC',
    delhi: 'Delhi Metro & DTC',
    mumbai: 'Local Train & Metro',
    kolkata: 'Kolkata Metro & Tram',
    hyderabad: 'Hyderabad Metro',
    chennai: 'Chennai Metro & EMU',
    jaipur: 'Jaipur Metro & JCTSL',
    pune: 'Maha Metro & PMPML',
    ahmedabad: 'GMRC Metro & BRTS',
    kochi: 'KMRL & Water Metro',
    varanasi: 'Auto, Ferry & E-Bus',
  };
  if (cId && custom[cId]) return custom[cId];
  if (!transit) return 'Metro & Bus';
  return transit.split('&')[0].replace(/\(.*?\)/g, '').trim();
}

function getMonumentGroup(m) {
  if (m.categoryGroup) return m.categoryGroup;
  const c = (m.category || '').toLowerCase();
  if (c.includes('palace')) return 'Palace';
  if (c.includes('fort') || c.includes('bastion')) return 'Fort';
  if (c.includes('temple') || c.includes('shrine') || c.includes('jyotirlinga') || c.includes('stupa') || c.includes('synagogue')) return 'Temple';
  if (c.includes('church') || c.includes('basilica') || c.includes('cathedral')) return 'Church';
  if (c.includes('ghat') || c.includes('riverfront')) return 'Ghat';
  if (c.includes('museum') || c.includes('gallery') || c.includes('scientific')) return 'Museum';
  if (c.includes('garden') || c.includes('park') || c.includes('botanical')) return 'Garden';
  return 'Heritage';
}

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

  // Chapters: 'heritage' (Ch 1) | 'transit' (Ch 2) | 'food' (Ch 3) | 'districts' (Ch 4) | 'offline' (Ch 5)
  const [activeChapter, setActiveChapter] = useState('heritage');
  const [monumentFilter, setMonumentFilter] = useState('All');
  const [showCloakroomModal, setShowCloakroomModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const isDone = packStatus === 'done';
  const isBusy = packStatus === 'busy';

  const currentDishes = (cityDishes && cityDishes.length > 0) ? cityDishes : DISHES;
  const selectedDishObj = currentDishes.find((d) => d.id === dish) || currentDishes[0];

  const cityId = currentCity?.id || 'bengaluru';
  const cityName = currentCity?.name || 'Bengaluru';
  const cityState = currentCity?.state || 'Karnataka';

  const cityHeritage = getCityHeritageGuide(cityId);
  const cityRestaurants = getRestaurantsForCity(cityId);

  // Reset filter when switching cities
  useEffect(() => {
    setMonumentFilter('All');
  }, [cityId]);

  const monumentsList = useMemo(() => cityHeritage?.monuments || [], [cityHeritage]);

  // Dynamically compute categories that actually exist in this city
  const availableCategories = useMemo(() => {
    const counts = {};
    monumentsList.forEach((m) => {
      const g = getMonumentGroup(m);
      counts[g] = (counts[g] || 0) + 1;
    });

    const chips = [{ id: 'All', label: `All (${monumentsList.length})` }];
    Object.keys(counts)
      .sort()
      .forEach((cat) => {
        chips.push({ id: cat, label: `${cat} (${counts[cat]})` });
      });
    return chips;
  }, [monumentsList]);

  const displayedMonuments = useMemo(() => {
    if (monumentFilter === 'All') return monumentsList;
    return monumentsList.filter((m) => {
      const grp = getMonumentGroup(m);
      return (
        grp.toLowerCase() === monumentFilter.toLowerCase() ||
        (m.category || '').toLowerCase().includes(monumentFilter.toLowerCase())
      );
    });
  }, [monumentsList, monumentFilter]);

  const cityPackItems = useMemo(() => {
    const transitName = currentCity?.transitAgency
      ? currentCity.transitAgency.split('&')[0].replace(/\(.*?\)/g, '').trim()
      : 'Transit Network';
    const lang = currentCity?.localLanguage
      ? currentCity.localLanguage.split('/')[0].trim()
      : 'Local';
    return [
      { id: '1', label: `Vector map tiles, ${cityName}`, meta: 'Zoom 11–16 · whole metropolitan area', size: '46 MB' },
      { id: '2', label: 'Complete guidebook & places directory', meta: 'Heritage history, timings, entry fees, photos', size: '9 MB' },
      { id: '3', label: `${transitName} network graph`, meta: 'All stations, lines, fare slabs, first & last services', size: '4 MB' },
      { id: '4', label: 'Curated legendary eateries & fair prices', meta: 'Iconic dishes, dietary tags, street food hacks', size: '3 MB' },
      { id: '5', label: `${lang} survival phrase card`, meta: 'Auto meter negotiation, directions & ordering audio cues', size: '1 MB' },
    ];
  }, [currentCity, cityName]);

  const envAlert = currentCity?.environmentalAlert;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.container, contentPadding]}
    >
      {/* ─── GUIDEBOOK TOP EDITION HEADER ───────────────────────────────── */}
      <View style={styles.guideBookHeaderCard}>
        <View style={styles.editionRow}>
          <View style={styles.editionPill}>
            <Text style={styles.editionPillText}>📖 FIELD GUIDE · {cityName.toUpperCase()} EDITION</Text>
          </View>
          <Pressable
            onPress={openCitySwitcher}
            style={({ pressed }) => [styles.citySelectorBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.citySelectorBtnText}>📍 {currentCity?.shortName || 'BLR'} ▼</Text>
          </Pressable>
        </View>

        <Text style={styles.guideBookTitle}>{cityName}</Text>
        <Text style={styles.guideBookTagline}>{currentCity?.tagline || 'Urban Explorer & Transit Companion'}</Text>

        <View style={styles.guideBookBadgeRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{currentCity?.badge || '🟢 Full Transit Pack'}</Text>
          </View>
          <View style={styles.stateBadge}>
            <Text style={styles.stateBadgeText}>🏛️ {cityState}</Text>
          </View>
        </View>

        {/* ─── QUICK AT-A-GLANCE DOSSIER ───────────────────────────────── */}
        <View style={styles.dossierGrid}>
          <View style={styles.dossierItem}>
            <Text style={styles.dossierIcon}>⏳</Text>
            <View style={styles.dossierTextCol}>
              <Text style={styles.dossierLabel}>FOUNDED</Text>
              <Text numberOfLines={2} style={styles.dossierVal}>{formatDossierFounded(cityHeritage?.foundingYear)}</Text>
            </View>
          </View>

          <View style={styles.dossierItem}>
            <Text style={styles.dossierIcon}>🗣️</Text>
            <View style={styles.dossierTextCol}>
              <Text style={styles.dossierLabel}>LANGUAGE</Text>
              <Text numberOfLines={2} style={styles.dossierVal}>{formatDossierLanguage(currentCity?.localLanguage)}</Text>
            </View>
          </View>

          <View style={styles.dossierItem}>
            <Text style={styles.dossierIcon}>🚇</Text>
            <View style={styles.dossierTextCol}>
              <Text style={styles.dossierLabel}>TRANSIT</Text>
              <Text numberOfLines={2} style={styles.dossierVal}>{formatDossierTransit(currentCity?.transitAgency, cityId)}</Text>
            </View>
          </View>

          <View style={styles.dossierItem}>
            <Text style={styles.dossierIcon}>{envAlert?.weatherIcon || '🌤️'}</Text>
            <View style={styles.dossierTextCol}>
              <Text style={styles.dossierLabel}>AQI / TEMP</Text>
              <Text numberOfLines={2} style={styles.dossierVal}>AQI {envAlert?.aqi || '42'} · {envAlert?.temperature || '26°C'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Diagnostics / Logs bar */}
      <Pressable
        onPress={() => openDiagnostics('guide_button')}
        style={({ pressed }) => [styles.logsPill, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.logsPillText}>🐞 Diagnostics & live logs</Text>
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

      {/* ─── CHAPTER SELECTOR TABS ───────────────────────────────────────── */}
      <View style={styles.chapterNavContainer}>
        <Text style={styles.chapterNavTitle}>GUIDEBOOK CHAPTERS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chapterNavScroll}
        >
          {[
            { id: 'heritage', num: 'CH 1', title: '🏛️ History & Roots' },
            { id: 'transit', num: 'CH 2', title: '🚇 Transit & Hacks' },
            { id: 'food', num: 'CH 3', title: '🍲 Food & Legends' },
            { id: 'districts', num: 'CH 4', title: '🗺️ Districts & Vibe' },
            { id: 'offline', num: 'CH 5', title: '📦 Offline Pack' },
          ].map((ch) => {
            const active = activeChapter === ch.id;
            return (
              <Pressable
                key={ch.id}
                onPress={() => setActiveChapter(ch.id)}
                style={[styles.chapterTabBtn, active && styles.chapterTabBtnActive]}
              >
                <Text style={[styles.chapterTabNum, active && styles.chapterTabNumActive]}>{ch.num}</Text>
                <Text style={[styles.chapterTabTitle, active && styles.chapterTabTitleActive]}>{ch.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CHAPTER 1: HISTORY & ROOTS                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeChapter === 'heritage' && (
        <View style={styles.chapterContent}>
          {/* Chronicles Hero Card */}
          <View style={styles.heritageHeroCard}>
            <View style={styles.heritageHeroHeader}>
              <View style={styles.heritageBadge}>
                <Text style={styles.heritageBadgeText}>ORIGINS & FOUNDING</Text>
              </View>
              <Text style={styles.heritageCityName}>{cityHeritage?.cityName || cityName} Chronicles</Text>
              <Text style={styles.heritageMoniker}>{cityHeritage?.moniker || currentCity?.tagline}</Text>
            </View>

            <View style={styles.heritageStoryBox}>
              <Text style={styles.heritageStoryText}>{cityHeritage?.historySummary}</Text>
              <View style={styles.founderRow}>
                <Text style={styles.founderIcon}>📜</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.founderLabel}>Founder / Historical Roots:</Text>
                  <Text style={styles.founderName}>{cityHeritage?.founder || 'Traditional Heritage'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Historical Eras Timeline */}
          <Text style={styles.sectionHeading}>Historical Eras & Timeline</Text>
          <View style={styles.erasList}>
            {(cityHeritage?.historicalEras || []).map((era, eIdx) => (
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
            <Text style={styles.sectionHeading}>Iconic Monuments & Living Heritage</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monumentCategoryScroll}>
              {availableCategories.map((cat) => {
                const active = monumentFilter === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setMonumentFilter(cat.id)}
                    style={[styles.monumentFilterChip, active && styles.monumentFilterChipActive]}
                  >
                    <Text style={[styles.monumentFilterText, active && styles.monumentFilterTextActive]}>{cat.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Monuments List */}
          {displayedMonuments.length === 0 ? (
            <View style={styles.emptyFilterBox}>
              <Text style={styles.emptyFilterEmoji}>🏛️</Text>
              <Text style={styles.emptyFilterTitle}>No {monumentFilter} landmarks found in {cityName}</Text>
              <Pressable onPress={() => setMonumentFilter('All')} style={styles.resetFilterBtn}>
                <Text style={styles.resetFilterBtnText}>Show all {monumentsList.length} monuments</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.monumentsList}>
              {displayedMonuments.map((m) => (
              <View key={m.id} style={styles.monumentCard}>
                <View style={styles.monumentImageContainer}>
                  <Image source={{ uri: m.image }} style={styles.monumentImage} resizeMode="cover" />
                  <View style={styles.builtYearBadge}>
                    <Text style={styles.builtYearText}>Est. {m.builtYear}</Text>
                  </View>
                  <View style={styles.monumentCategoryPill}>
                    <Text style={styles.monumentCategoryPillText}>{m.emoji || '🏛️'} {m.category}</Text>
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
                    <View style={styles.metroIconCircle}>
                      <Text style={styles.metroIcon}>🚇</Text>
                    </View>
                    <View style={styles.nearestMetroTextCol}>
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
                        area: cityHeritage?.cityName || cityName,
                        category: m.category,
                        latitude: m.latitude,
                        longitude: m.longitude,
                        nearestMetro: m.nearestMetro,
                      });
                      setTab('navigate');
                    }}
                    style={({ pressed }) => [
                      styles.getRouteButton,
                      pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
                    ]}
                  >
                    <View style={styles.getRouteButtonLeft}>
                      <Text style={styles.getRouteIcon}>🧭</Text>
                      <Text numberOfLines={2} style={styles.getRouteButtonText}>
                        Plan Route to {m.name.split('(')[0].trim()}
                      </Text>
                    </View>
                    <Text style={styles.getRouteArrow}>➔</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CHAPTER 2: TRANSIT & CITY HACKS                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeChapter === 'transit' && (
        <View style={styles.chapterContent}>
          {/* Auto Rickshaw / Taxi Fare Card */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeaderRow}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.accentRamp[700]} strokeWidth={2.5}>
                <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </Svg>
              <Text style={styles.tipCardTitle}>{(currentCity?.autoFareFormula?.vehicleType || 'AUTO-RICKSHAW').toUpperCase()} FARE GUIDE</Text>
            </View>
            <Text style={styles.tipCardBody}>
              • Official Meter Rate: ₹{currentCity?.autoFareFormula?.baseFare} for first {currentCity?.autoFareFormula?.baseDistanceKm} km, then ₹{currentCity?.autoFareFormula?.perKm}/km (gazetted tariff).{'\n'}
              • Night Multiplier ({currentCity?.autoFareFormula?.nightHours || '11 PM – 5 AM'}): {currentCity?.autoFareFormula?.nightMultiplier}× day fare.{'\n'}
              • Local Lingo: “{currentCity?.autoFareFormula?.lingoPhrase || 'Meter haaki'}” ({currentCity?.autoFareFormula?.hindiMeaning || 'Run by meter'}).{'\n'}
              • Driver Advice: {currentCity?.scamAlert || 'Insist on meter before boarding or book via app.'}
            </Text>
          </View>

          {/* Transit Agency Network Tips */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeaderRow}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.accent2Ramp[700]} strokeWidth={2.5}>
                <Circle cx="12" cy="12" r="10" />
                <Path d="M12 6v6l4 2" />
              </Svg>
              <Text style={styles.tipCardTitle}>{(currentCity?.transitAgency || 'LOCAL TRANSIT').toUpperCase()} SURVIVAL HACKS</Text>
            </View>
            <Text style={styles.tipCardBody}>
              {(currentCity?.transitTips || [
                'First metro departs 5:00 AM from terminal stations; last train around 11:00 PM.',
                'WhatsApp QR ticketing offers instant discounts without ticket queues.',
                'Interchange hubs take 3-4 minutes to navigate between platforms.',
              ]).map((tip, idx) => `• ${tip}`).join('\n\n')}
            </Text>
          </View>

          {/* Explorer Safety & Baggage Drop Tools */}
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

          {/* Useful Local Language Phrasebook */}
          <Text style={styles.sectionHeading}>Helpful {currentCity?.localLanguage || 'Local'} Phrasebook</Text>
          <View style={styles.phrasesList}>
            {(currentCity?.localPhrases || DEFAULT_PHRASES).map((item, idx) => (
              <View key={idx} style={styles.phraseCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.phraseText}>“{item.phrase}”</Text>
                  <Text style={styles.englishText}>{item.english}</Text>
                  <View style={styles.contextBadge}>
                    <Text style={styles.contextBadgeText}>📌 {item.context}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CHAPTER 3: FOOD CULTURE & LEGENDS                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeChapter === 'food' && (
        <View style={styles.chapterContent}>
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
          <Text style={styles.sectionHeading}>Signature Dishes & Delicacies</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dishCarousel}>
            {currentDishes.map((item) => {
              const active = (dish === item.id) || (!dish && item.id === currentDishes[0]?.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setDish(item.id)}
                  style={[styles.dishCard, active && styles.dishCardActive]}
                >
                  <View style={[styles.dishTintCircle, { backgroundColor: item.tint || colors.accentRamp[500] }]} />
                  <Text numberOfLines={1} style={styles.dishCardName}>{item.name}</Text>
                  <Text style={styles.dishCardPrice}>{item.price}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Eateries specifically for selected dish */}
          <Text style={styles.sectionHeading}>
            Where to taste authentic {selectedDishObj?.name || 'local food'}
          </Text>
          <View style={styles.eateryList}>
            {filteredEateries.map((eat, idx) => (
              <View key={idx} style={styles.eateryCard}>
                <View style={styles.eateryTopRow}>
                  <Text style={styles.eateryName}>{eat.name}</Text>
                  <Text style={styles.eateryPrice}>₹{eat.price}</Text>
                </View>
                <Text style={styles.eateryArea}>📍 {eat.area}</Text>
                <Text style={styles.eateryNote}>{eat.note}</Text>
              </View>
            ))}
          </View>

          {/* Iconic City Restaurants */}
          {cityRestaurants && cityRestaurants.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>Heritage Culinary Institutions of {cityName}</Text>
              <View style={styles.restaurantList}>
                {cityRestaurants.map((r) => (
                  <View key={r.id} style={styles.historicRestCard}>
                    <View style={styles.historicRestTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historicRestName}>{r.name}</Text>
                        <Text style={styles.historicRestArea}>📍 {r.area}</Text>
                      </View>
                      {r.established && (
                        <View style={styles.estBadge}>
                          <Text style={styles.estBadgeText}>{r.established}</Text>
                        </View>
                      )}
                    </View>

                    {r.mustTry && (
                      <View style={styles.mustTryBox}>
                        <Text style={styles.mustTryLabel}>MUST-TRY SIGNATURE</Text>
                        <Text style={styles.mustTryDish}>{r.mustTry.dish} · ₹{r.mustTry.price}</Text>
                      </View>
                    )}

                    <Text style={styles.historicRestNote}>{r.insiderNote}</Text>

                    <View style={styles.restMetaFooter}>
                      <Text style={styles.restTiming}>🕒 {r.openTime} – {r.closeTime}</Text>
                      <Text style={styles.restRating}>⭐ {r.rating}</Text>
                      {r.nearestMetro && <Text style={styles.restMetro}>🚇 {r.nearestMetro}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CHAPTER 4: DISTRICTS & VIBE                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeChapter === 'districts' && (
        <View style={styles.chapterContent}>
          {/* Environmental & Weather Advisory Card */}
          {envAlert && (
            <View style={styles.advisoryCard}>
              <View style={styles.advisoryTopRow}>
                <View style={[styles.aqiIndicator, { backgroundColor: envAlert.aqiColor || '#10b981' }]}>
                  <Text style={styles.aqiIndicatorText}>{envAlert.weatherIcon || '🍃'} AQI {envAlert.aqi}</Text>
                </View>
                <Text style={styles.weatherTempText}>{envAlert.temperature} · {envAlert.weatherCondition}</Text>
              </View>
              <Text style={styles.advisoryHeadline}>{envAlert.headline}</Text>
              <Text style={styles.advisorySubtext}>{envAlert.subtext}</Text>
              <View style={styles.advisoryNoticeBox}>
                <Text style={styles.advisoryNoticeText}>{envAlert.transitNotice}</Text>
              </View>
            </View>
          )}

          {/* Popular Hubs & Quarters */}
          <Text style={styles.sectionHeading}>Prominent Districts & Transit Hubs</Text>
          <View style={styles.hubsGrid}>
            {(currentCity?.popularHubs || []).map((hub, hIdx) => (
              <Pressable
                key={hIdx}
                onPress={() => {
                  selectDestination({
                    id: `hub_${hIdx}`,
                    name: hub.name,
                    area: hub.area,
                    category: 'District Hub',
                    latitude: hub.lat,
                    longitude: hub.lon,
                  });
                  setTab('navigate');
                }}
                style={({ pressed }) => [styles.hubCard, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.hubEmoji}>{hub.emoji || '🏙️'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hubName}>{hub.name}</Text>
                  <Text style={styles.hubArea}>{hub.area}</Text>
                </View>
                <Text style={styles.hubArrow}>➔</Text>
              </Pressable>
            ))}
          </View>

          {/* Quick Explore Chips */}
          <Text style={styles.sectionHeading}>Iconic Neighborhood Highlights</Text>
          <View style={styles.quickChipsWrap}>
            {(currentCity?.quickChips || []).map((chip, cIdx) => (
              <View key={cIdx} style={styles.quickChipBadge}>
                <Text style={styles.quickChipText}>✨ {chip}</Text>
              </View>
            ))}
          </View>

          {/* Cultural Etiquette & Local Wisdom */}
          <Text style={styles.sectionHeading}>Traveler Etiquette & Cultural Wisdom</Text>
          <View style={styles.wisdomCard}>
            <Text style={styles.wisdomItem}>• **Temple & Heritage Etiquette**: Remove shoes before entering sacred premises. Modest shoulder-and-knee coverage is customary.</Text>
            <Text style={styles.wisdomItem}>• **Meter Negotiation**: Always ask “Meter se chaloge?” before sitting in autos or use government prepaid counters at railway hubs.</Text>
            <Text style={styles.wisdomItem}>• **Peak Hour Avoidance**: Rush hours run 8:30–11:00 AM and 5:30–8:30 PM. Always prefer Metro / suburban trains over congested arterial roads.</Text>
            <Text style={styles.wisdomItem}>• **Hydration & Street Food**: Opt for busy heritage stalls where hot turnover is rapid. Tapri chai and tender coconut water are dependable refreshments.</Text>
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CHAPTER 5: OFFLINE PACK                                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeChapter === 'offline' && (
        <View style={styles.chapterContent}>
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
                  {isDone ? `${cityName} pack installed` : isBusy ? 'Downloading...' : `${cityName} offline pack · 63 MB`}
                </Text>
                <Text style={styles.offlineSubtitle}>
                  {isDone ? 'Works completely offline with mobile data turned off' : `Includes full transit network, vector trails & places directory for ${cityName}`}
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
                {isDone ? 'Installed · Check for updates' : isBusy ? 'Downloading...' : 'Download offline field pack'}
              </Text>
            </Pressable>
          </View>

          {/* Checklist */}
          <Text style={styles.sectionHeading}>What is included in this pack</Text>
          <View style={styles.packChecklist}>
            {cityPackItems.map((item) => (
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

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}
      <CloakroomModal
        visible={showCloakroomModal}
        onClose={() => setShowCloakroomModal(false)}
      />

      <SafetyPingModal
        visible={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        route={activeRoute}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 90,
  },
  // Guide Book Edition Header
  guideBookHeaderCard: {
    backgroundColor: '#fffcf7',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e8ded0',
    ...shadow.sm,
  },
  editionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  editionPill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  editionPillText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    color: '#92400e',
    letterSpacing: 0.8,
  },
  citySelectorBtn: {
    backgroundColor: colors.accentRamp[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accentRamp[300],
  },
  citySelectorBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
  },
  guideBookTitle: {
    fontSize: 28,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    letterSpacing: -0.5,
  },
  guideBookTagline: {
    fontSize: 13,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[700],
    marginTop: 2,
    lineHeight: 18,
  },
  guideBookBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  statusBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
  },
  stateBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stateBadgeText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyMedium,
    color: '#475569',
  },
  // Dossier 4-Item Grid
  dossierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1e8db',
  },
  dossierItem: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#ede4d8',
    minHeight: 56,
  },
  dossierIcon: {
    fontSize: 18,
  },
  dossierTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  dossierLabel: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  dossierVal: {
    fontSize: 11.5,
    lineHeight: 15,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  // Diagnostics Pill
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
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  logsPillText: {
    fontSize: 12,
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
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#fff',
  },
  // Chapter Navigation
  chapterNavContainer: {
    marginTop: 14,
  },
  chapterNavTitle: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
    letterSpacing: 1,
    marginBottom: 6,
    marginLeft: 2,
  },
  chapterNavScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chapterTabBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: '#e8ded0',
    alignItems: 'center',
  },
  chapterTabBtnActive: {
    backgroundColor: colors.accentRamp[700],
    borderColor: colors.accentRamp[800],
    ...shadow.sm,
  },
  chapterTabNum: {
    fontSize: 8.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[400],
    letterSpacing: 0.5,
  },
  chapterTabNumActive: {
    color: '#fed7aa',
  },
  chapterTabTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
    marginTop: 1,
  },
  chapterTabTitleActive: {
    color: '#ffffff',
  },
  chapterContent: {
    marginTop: 16,
  },
  // Heritage Card
  heritageHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: 16,
    ...shadow.sm,
  },
  heritageHeroHeader: {
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
    fontSize: 21,
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
    gap: 8,
    marginTop: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: radius.sm,
  },
  founderIcon: {
    fontSize: 18,
  },
  founderLabel: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
  },
  founderName: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
    marginTop: 1,
  },
  // Eras
  sectionHeading: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    marginTop: 16,
    marginBottom: 10,
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
  // Monument filter
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
  // Empty filter state
  emptyFilterBox: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: 20,
    marginTop: 8,
  },
  emptyFilterEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyFilterTitle: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
    marginBottom: 12,
    textAlign: 'center',
  },
  resetFilterBtn: {
    backgroundColor: colors.accentRamp[700],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  resetFilterBtnText: {
    color: '#ffffff',
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
  },
  // Monument cards
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
    height: 175,
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
    gap: 10,
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 10,
  },
  metroIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metroIcon: {
    fontSize: 16,
  },
  nearestMetroTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nearestMetroLabel: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    color: '#166534',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  nearestMetroVal: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
    lineHeight: 16,
  },
  insiderTipBox: {
    backgroundColor: '#fffbeb',
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 12,
  },
  insiderTipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: '#92400e',
    lineHeight: 17,
  },
  getRouteButton: {
    backgroundColor: colors.accentRamp[700],
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.sm,
  },
  getRouteButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  getRouteIcon: {
    fontSize: 17,
  },
  getRouteButtonText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
    textAlign: 'left',
    flexShrink: 1,
    lineHeight: 18,
  },
  getRouteArrow: {
    fontSize: 15,
    color: '#ffffff',
    fontFamily: fontFamily.bodyBold,
  },
  // Transit & Tips Styles
  tipCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
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
    letterSpacing: 0.8,
    color: colors.neutral[800],
  },
  tipCardBody: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    lineHeight: 20,
    color: colors.neutral[700],
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
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadow.sm,
  },
  phraseText: {
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
  contextBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: 6,
  },
  contextBadgeText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[600],
  },
  // Food & Legends
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
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
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
    marginBottom: 16,
  },
  eateryCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.neutral[200],
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
    fontSize: 11.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[600],
    marginTop: 2,
  },
  eateryNote: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    marginTop: 6,
    lineHeight: 17,
  },
  // Historic Restaurants
  restaurantList: {
    gap: 12,
    marginBottom: 20,
  },
  historicRestCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...shadow.sm,
  },
  historicRestTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  historicRestName: {
    fontSize: 15,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  historicRestArea: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[600],
    marginTop: 2,
  },
  estBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  estBadgeText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    color: '#92400e',
  },
  mustTryBox: {
    backgroundColor: '#fff7ed',
    padding: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#ffedd5',
    marginTop: 8,
  },
  mustTryLabel: {
    fontSize: 8.5,
    fontFamily: fontFamily.bodyBold,
    color: '#c2410c',
    letterSpacing: 0.5,
  },
  mustTryDish: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: '#9a3412',
    marginTop: 2,
  },
  historicRestNote: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    marginTop: 8,
    lineHeight: 18,
  },
  restMetaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  restTiming: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[600],
  },
  restRating: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: '#d97706',
  },
  restMetro: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyMedium,
    color: '#15803d',
    flex: 1,
  },
  // Districts & Vibe
  advisoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: 14,
    ...shadow.sm,
  },
  advisoryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  aqiIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  aqiIndicatorText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
  },
  weatherTempText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  advisoryHeadline: {
    fontSize: 14,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    marginTop: 4,
  },
  advisorySubtext: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    marginTop: 3,
    lineHeight: 18,
  },
  advisoryNoticeBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: radius.sm,
    marginTop: 8,
  },
  advisoryNoticeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: '#0369a1',
  },
  hubsGrid: {
    gap: 8,
    marginBottom: 16,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadow.sm,
  },
  hubEmoji: {
    fontSize: 20,
  },
  hubName: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  hubArea: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 1,
  },
  hubArrow: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
  },
  quickChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickChipBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickChipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  wisdomCard: {
    backgroundColor: '#fffbeb',
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 8,
    marginBottom: 20,
  },
  wisdomItem: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: '#78350f',
    lineHeight: 18,
  },
  // Offline Pack Styles
  offlineCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral[200],
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
    lineHeight: 17,
  },
  downloadBtn: {
    marginTop: 16,
    backgroundColor: colors.accentRamp[700],
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
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
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

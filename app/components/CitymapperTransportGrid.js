import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, fontFamily, radius, shadow, space } from '../theme/tokens';
import { useTrip } from '../../src/context/TripContext';


const CITY_DEPARTURES = {
  bengaluru: [
    {
      mode: 'bus',
      badgeBg: '#15803d',
      emoji: '🚌',
      line: '500D',
      title: 'Silk Board ↔ Hebbal Outer Ring Rd',
      sub: 'Every 6 min · BMTC AC Volvo & Ordinary',
      eta: '3 min',
      platform: 'Stop A',
      isBmtc: true,
    },
    {
      mode: 'metro',
      badgeBg: '#6d28d9',
      emoji: '🚇',
      line: 'Purple',
      title: 'Whitefield (Kadugodi) ↔ Challaghatta',
      sub: 'Next train via Majestic Interchange',
      eta: '5 min',
      platform: 'Plat 1',
      isMetro: true,
    },
  ],
  delhi: [
    {
      mode: 'metro',
      badgeBg: '#eab308',
      emoji: '🚇',
      line: 'Yellow',
      title: 'Samaypur Badli ↔ Millennium City Centre',
      sub: 'Every 3 min · DMRC via Rajiv Chowk Interchange',
      eta: '2 min',
      platform: 'Plat 2',
      isMetro: true,
    },
    {
      mode: 'bus',
      badgeBg: '#dc2626',
      emoji: '🚌',
      line: 'Airport Exp',
      title: 'Kashmere Gate ISBT ↔ IGI Airport T3',
      sub: 'Every 15 min · DTC Electric AC Express',
      eta: '6 min',
      platform: 'Bay 4',
    },
  ],
  mumbai: [
    {
      mode: 'train',
      badgeBg: '#0284c7',
      emoji: '🚆',
      line: 'Western',
      title: 'Churchgate ↔ Bandra ↔ Borivali (Fast)',
      sub: 'Every 4 min · Mumbai Suburban Local',
      eta: '3 min',
      platform: 'Plat 3',
      isMetro: true,
    },
    {
      mode: 'bus',
      badgeBg: '#dc2626',
      emoji: '🚌',
      line: 'A-115',
      title: 'CSMT Station ↔ Nariman Point NCPA',
      sub: 'Every 8 min · BEST Electric AC Bus',
      eta: '5 min',
      platform: 'Stop C',
    },
  ],
  kolkata: [
    {
      mode: 'metro',
      badgeBg: '#16a34a',
      emoji: '🚇',
      line: 'Green',
      title: 'Howrah Maidan ↔ Esplanade (Underwater)',
      sub: 'Every 8 min · India’s first River Metro',
      eta: '4 min',
      platform: 'Plat 1',
      isMetro: true,
    },
    {
      mode: 'bus',
      badgeBg: '#2563eb',
      emoji: '🚌',
      line: 'S-12',
      title: 'Howrah Station ↔ Salt Lake Sector V',
      sub: 'Every 10 min · WBTC Electric AC',
      eta: '6 min',
      platform: 'Stand 2',
    },
  ],
  hyderabad: [
    {
      mode: 'metro',
      badgeBg: '#dc2626',
      emoji: '🚇',
      line: 'Red',
      title: 'Miyapur ↔ Ameerpet ↔ LB Nagar',
      sub: 'Every 4.5 min · Hyderabad Metro Rail',
      eta: '3 min',
      platform: 'Plat 1',
      isMetro: true,
    },
    {
      mode: 'bus',
      badgeBg: '#0284c7',
      emoji: '🚌',
      line: 'Pushpak',
      title: 'Secunderabad ↔ Rajiv Gandhi Airport RGIA',
      sub: 'Every 20 min · TSRTC Airport Liner',
      eta: '9 min',
      platform: 'Bay 1',
    },
  ],
  chennai: [
    {
      mode: 'metro',
      badgeBg: '#2563eb',
      emoji: '🚇',
      line: 'Blue',
      title: 'Wimco Nagar ↔ Chennai Central ↔ Airport',
      sub: 'Every 6 min · CMRL Direct Airport Corridor',
      eta: '4 min',
      platform: 'Plat 2',
      isMetro: true,
    },
    {
      mode: 'bus',
      badgeBg: '#16a34a',
      emoji: '🚌',
      line: '21G',
      title: 'Broadway ↔ Marina Beach ↔ Tambaram',
      sub: 'Every 8 min · MTC Deluxe Express',
      eta: '5 min',
      platform: 'Stop B',
    },
  ],
  jaipur: [
    {
      mode: 'metro',
      badgeBg: '#ec4899',
      emoji: '🚇',
      line: 'Pink',
      title: 'Mansarovar ↔ Railway Station ↔ Badi Chaupar',
      sub: 'Every 8 min · JMRC Old City underground',
      eta: '4 min',
      platform: 'Plat 1',
      isMetro: true,
    },
    {
      mode: 'bus',
      badgeBg: '#059669',
      emoji: '🚌',
      line: 'AC-1',
      title: 'Sanganer Airport ↔ Ajmeri Gate ↔ Amer Fort',
      sub: 'Every 12 min · JCTSL Low-floor AC',
      eta: '6 min',
      platform: 'Bay 3',
    },
  ],
  pune: [
    {
      mode: 'metro',
      badgeBg: '#7c3aed',
      emoji: '🚇',
      line: 'Purple',
      title: 'PCMC Pimpri ↔ Shivajinagar ↔ Swargate',
      sub: 'Every 7 min · Maha Metro Line 1',
      eta: '5 min',
      platform: 'Plat 2',
      isMetro: true,
    },
    {
      mode: 'bus',
      badgeBg: '#ea580c',
      emoji: '🚌',
      line: '24',
      title: 'Katraj ↔ Pune Station ↔ Nigdi Pavana',
      sub: 'Every 10 min · PMPML Rainbow BRTS',
      eta: '4 min',
      platform: 'Stop A',
    },
  ],
  ahmedabad: [
    {
      mode: 'metro',
      badgeBg: '#2563eb',
      emoji: '🚇',
      line: 'Blue',
      title: 'Thaltej Gam ↔ Old High Court ↔ Vastral Gam',
      sub: 'Every 8 min · GMRC East-West Corridor',
      eta: '3 min',
      platform: 'Plat 1',
      isMetro: true,
    },
    {
      mode: 'bus',
      badgeBg: '#16a34a',
      emoji: '🚌',
      line: 'BRTS 1',
      title: 'RTO Circle ↔ Kalupur Station ↔ Maninagar',
      sub: 'Every 5 min · Janmarg Dedicated Corridor',
      eta: '2 min',
      platform: 'Bay RTO',
    },
  ],
  kochi: [
    {
      mode: 'metro',
      badgeBg: '#0284c7',
      emoji: '🚇',
      line: 'KMRL',
      title: 'Aluva ↔ MG Road ↔ Ernakulam South ↔ SN Jn',
      sub: 'Every 6 min · Kochi Metro Rail',
      eta: '4 min',
      platform: 'Plat 1',
      isMetro: true,
    },
    {
      mode: 'ferry',
      badgeBg: '#0d9488',
      emoji: '⛴️',
      line: 'Water Metro',
      title: 'High Court Terminal ↔ Fort Kochi / Bolgatty',
      sub: 'Every 15 min · Battery-electric Catamaran',
      eta: '6 min',
      platform: 'Jetty 1',
    },
  ],
  goa: [
    {
      mode: 'bus',
      badgeBg: '#15803d',
      emoji: '🚌',
      line: 'KTCL AC',
      title: 'Panaji KTC Stand ↔ Calangute / Baga Coastal',
      sub: 'Every 15 min · Kadamba Electric AC',
      eta: '7 min',
      platform: 'Bay 5',
    },
    {
      mode: 'ferry',
      badgeBg: '#0284c7',
      emoji: '⛴️',
      line: 'Ferry',
      title: 'Betim Jetty ↔ Panaji Mandovi Terminal',
      sub: 'Every 15 min · Free Government River Ferry',
      eta: '5 min',
      platform: 'Jetty B',
    },
  ],
  varanasi: [
    {
      mode: 'bus',
      badgeBg: '#ea580c',
      emoji: '🚌',
      line: 'E-Bus 102',
      title: 'Varanasi Cantt Station ↔ Godowlia ↔ BHU Lanka',
      sub: 'Every 10 min · Kashi Smart City AC E-Bus',
      eta: '4 min',
      platform: 'Cantt Stand',
    },
    {
      mode: 'boat',
      badgeBg: '#0284c7',
      emoji: '⛵',
      line: 'Ro-Pax',
      title: 'Assi Ghat ↔ Dashashwamedh ↔ Namo Ghat',
      sub: 'Every 30 min · Inland Waterways Ganga Cruise',
      eta: '12 min',
      platform: 'Ghat Steps',
    },
  ],
};

export default function CitymapperTransportGrid({
  onOpenBmtc,
  onOpenBlueprint,
  onOpenFareAudit,
  onOpenCitySwitcher,
  onToggleMapMode,
  onToggleAlert,
}) {
  const { currentCity, setTab, setRouteMode, fireToast } = useTrip();

  const cityName = currentCity?.name || 'Bengaluru';

  const modes = [
    {
      id: 'all',
      label: 'All',
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2}>
          <Rect x={2} y={5} width={9} height={14} rx={2} />
          <Rect x={13} y={5} width={9} height={14} rx={2} />
          <Circle cx={6.5} cy={15.5} r={1} fill="#ffffff" />
          <Circle cx={17.5} cy={15.5} r={1} fill="#ffffff" />
        </Svg>
      ),
      onPress: () => {
        setRouteMode('metro');
        fireToast('Showing all multi-modal transit options');
      },
    },
    {
      id: 'walk',
      label: 'Walk',
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2}>
          <Circle cx={12} cy={4} r={2} />
          <Path d="M10 20l2-6 2 2v4M14 9l-3 3-2-2-3 3" />
        </Svg>
      ),
      onPress: () => {
        setRouteMode('walk');
        fireToast('Pedestrian walking mode selected');
      },
    },
    {
      id: 'cycle',
      label: 'Bike',
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2}>
          <Circle cx={5.5} cy={17.5} r={3.5} />
          <Circle cx={18.5} cy={17.5} r={3.5} />
          <Path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L15 6h3m-9.5 5.5l3.5-6" />
        </Svg>
      ),
      onPress: () => {
        const bikeToast = currentCity?.id === 'goa'
          ? 'Goa Motorcycle Pilot & Rental Scooters active'
          : `${cityName} Bike Taxi & Metro feeder docks active`;
        fireToast(bikeToast);
      },
    },
    {
      id: 'maps',
      label: 'Lines',
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2}>
          <Path d="M9 20l-5.5-2V4L9 6m0 14l6-2m-6 2V6m6 12l5.5 2V8l-5.5-2m0 12V6" />
        </Svg>
      ),
      onPress: onToggleMapMode,
    },
    {
      id: 'issues',
      label: 'Issues',
      badgeColor: '#eab308',
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fef08a" strokeWidth={2}>
          <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <Path d="M12 9v4m0 4h.01" />
        </Svg>
      ),
      onPress: onToggleAlert,
    },
    {
      id: 'bus',
      label: 'Bus',
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2}>
          <Rect x={4} y={3} width={16} height={16} rx={3} />
          <Path d="M4 11h16M8 15h.01M16 15h.01M6 19v2M18 19v2" />
        </Svg>
      ),
      onPress: onOpenBmtc,
    },
    {
      id: 'metro',
      label: 'Metro',
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2}>
          <Rect x={4} y={3} width={16} height={15} rx={3} />
          <Path d="M4 11h16M9 19l-2 3M15 19l2 3M8 15h.01M16 15h.01" />
        </Svg>
      ),
      onPress: onOpenBlueprint,
    },
    {
      id: 'auto',
      label: 'Auto',
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2}>
          <Path d="M5 16h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3L14 3H9L7 7H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z" />
          <Circle cx={7.5} cy={16.5} r={2.5} />
          <Circle cx={16.5} cy={16.5} r={2.5} />
        </Svg>
      ),
      onPress: () => {
        setRouteMode('auto');
        const autoToast = currentCity?.id === 'goa'
          ? 'GoaMiles & Auto cab route enabled'
          : currentCity?.id === 'mumbai'
          ? 'Kaali-Peeli & Meter auto route enabled'
          : `${cityName} Auto & Meter route enabled`;
        fireToast(autoToast);
      },
    },
    {
      id: 'train',
      label: 'Train',
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2}>
          <Rect x={3} y={4} width={18} height={14} rx={2} />
          <Path d="M7 8h10M7 12h10M5 18l-2 3M19 18l2 3" />
        </Svg>
      ),
      onPress: () => {
        fireToast('Suburban MEMU/DEMU services live');
      },
    },
    {
      id: 'cabs',
      label: 'Cabs',
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2}>
          <Path d="M5 11l2-5h10l2 5M3 11h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z" />
          <Circle cx={7.5} cy={15.5} r={1.5} />
          <Circle cx={16.5} cy={15.5} r={1.5} />
        </Svg>
      ),
      onPress: onOpenFareAudit,
    },
  ];

  return (
    <View style={styles.gridSection}>
      {/* 2-row x 5-column Citymapper Green Grid */}
      <View style={styles.modeGrid}>
        {modes.map((m) => (
          <Pressable
            key={m.id}
            onPress={m.onPress}
            style={({ pressed }) => [
              styles.modeTile,
              pressed && styles.modeTilePressed,
            ]}
          >
            <View style={styles.tileIconWrap}>{m.icon}</View>
            <Text numberOfLines={1} style={styles.tileLabel}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Nearby Real-time Departures Card (Reference IMG_6483) ── */}
      <View style={styles.nearbyCard}>
        <View style={styles.nearbyHeaderRow}>
          <View style={styles.livePulseDot} />
          <Text style={styles.nearbyHeaderTitle}>Nearby Departures in {cityName}</Text>
          <Text style={styles.liveTag}>LIVE</Text>
        </View>

        {/* Dynamic Departures for current city */}
        {(() => {
          const normCity = (currentCity?.id || 'bengaluru').toLowerCase();
          const cityDeps = CITY_DEPARTURES[normCity] || CITY_DEPARTURES.bengaluru;
          const baseFare = currentCity?.autoFareFormula?.baseFare || 30;
          const autoBrand = normCity === 'goa' ? 'GoaMiles & Auto Stand' : normCity === 'mumbai' ? 'Auto Stand & Kaali-Peeli' : `${cityName} Auto Stand & Apps`;

          return (
            <>
              {cityDeps.map((dep, idx) => {
                const handlePress = () => {
                  if (dep.isBmtc && normCity === 'bengaluru') {
                    onOpenBmtc && onOpenBmtc();
                  } else if (dep.isMetro) {
                    onOpenBlueprint && onOpenBlueprint();
                  } else {
                    fireToast(`${dep.line}: ${dep.title} (${dep.sub})`);
                  }
                };

                return (
                  <React.Fragment key={dep.line + idx}>
                    {idx > 0 && <View style={styles.depDivider} />}
                    <Pressable
                      onPress={handlePress}
                      style={({ pressed }) => [styles.departureItem, pressed && { opacity: 0.8 }]}
                    >
                      <View style={[styles.depModeBadge, { backgroundColor: dep.badgeBg }]}>
                        <Text style={styles.depBadgeEmoji}>{dep.emoji}</Text>
                        <Text style={styles.depLineNum}>{dep.line}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.depDestTitle} numberOfLines={1}>
                          {dep.title}
                        </Text>
                        <Text style={styles.depSubTitle}>{dep.sub}</Text>
                      </View>
                      <View style={styles.depEtaCol}>
                        <Text style={styles.depEtaText}>{dep.eta}</Text>
                        <Text style={styles.depPlatformText}>{dep.platform}</Text>
                      </View>
                    </Pressable>
                  </React.Fragment>
                );
              })}

              <View style={styles.depDivider} />

              {/* Departure Row 3: Auto & Cab Compare */}
              <Pressable
                onPress={onOpenFareAudit}
                style={({ pressed }) => [styles.departureItem, pressed && { opacity: 0.8 }]}
              >
                <View style={[styles.depModeBadge, { backgroundColor: '#d97706' }]}>
                  <Text style={styles.depBadgeEmoji}>🛺</Text>
                  <Text style={styles.depLineNum}>Auto</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.depDestTitle} numberOfLines={1}>
                    {autoBrand}
                  </Text>
                  <Text style={styles.depSubTitle}>Government Meter ₹{baseFare} · Live App Compare</Text>
                </View>
                <View style={styles.depEtaCol}>
                  <Text style={[styles.depEtaText, { color: '#16a34a' }]}>Instant</Text>
                  <Text style={styles.depPlatformText}>Compare</Text>
                </View>
              </Pressable>
            </>
          );
        })()}
      </View>

      {/* ── Trip Stats / CO2 Savings Card (Reference IMG_6482) ── */}
      <Pressable
        onPress={() => setTab('passport')}
        style={({ pressed }) => [styles.tripStatsCard, pressed && { opacity: 0.88 }]}
      >
        <View style={styles.statsIconCircle}>
          <Text style={{ fontSize: 20 }}>🌱</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.statsCardTitle}>Track CO2 Savings with Transit</Text>
          <Text style={styles.statsCardSub}>
            You saved ₹140 & 2.4 kg CO2 choosing metro over direct cabs!
          </Text>
        </View>
        <View style={styles.goBadge}>
          <Text style={styles.goBadgeText}>GO ➔</Text>
        </View>
      </Pressable>

      {/* ── City Switcher Banner (Reference IMG_6481 & IMG_6482) ── */}
      <Pressable
        onPress={onOpenCitySwitcher}
        style={({ pressed }) => [styles.coverageBanner, pressed && { opacity: 0.88 }]}
      >
        <View style={styles.coverageIcon}>
          <Text style={{ fontSize: 20 }}>🌐</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.coverageTitle}>
            Exploring {cityName}
          </Text>
          <Text style={styles.coverageSub}>
            Tap to switch: Delhi, Mumbai, Hyderabad & more ➔
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  gridSection: {
    paddingHorizontal: 0,
    paddingTop: 4,
    gap: 12,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  modeTile: {
    width: '18.4%',
    aspectRatio: 1,
    backgroundColor: '#126d2c',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadow.sm,
  },
  modeTilePressed: {
    backgroundColor: '#0c4d1e',
    transform: [{ scale: 0.94 }],
  },
  tileIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
  },
  tileLabel: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
    marginTop: 2,
    textAlign: 'center',
  },
  // ── Nearby Card ──
  nearbyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space[3],
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...shadow.md,
  },
  nearbyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  nearbyHeaderTitle: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
    flex: 1,
  },
  liveTag: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  departureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  depModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    gap: 4,
  },
  depBadgeEmoji: {
    fontSize: 12,
  },
  depLineNum: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
  },
  depDestTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  depSubTitle: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#64748b',
    marginTop: 1,
  },
  depEtaCol: {
    alignItems: 'flex-end',
    marginLeft: 6,
  },
  depEtaText: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  depPlatformText: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: '#64748b',
  },
  depDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 2,
  },
  // ── Trip Stats Card ──
  tripStatsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...shadow.md,
  },
  statsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCardTitle: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  statsCardSub: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#475569',
    marginTop: 2,
  },
  goBadge: {
    backgroundColor: colors.accentRamp[600],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  goBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
  },
  // ── Coverage Banner ──
  coverageBanner: {
    backgroundColor: '#0284c7',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.md,
  },
  coverageIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverageTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
  },
  coverageSub: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
  },
});

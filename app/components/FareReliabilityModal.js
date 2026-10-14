import React from 'react';
import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { useTrip } from '../../src/context/TripContext';
import { computeOfficialFare, FALLBACK_DETOUR_FACTOR, TARIFFS } from '../../src/domain/tariffs';
import { FEATURES, log } from '../../src/logging';

const VEHICLES = [
  { id: 'auto', emoji: '🛺', name: 'Auto rickshaw' },
  { id: 'cab', emoji: '🚕', name: 'Cab / taxi' },
  { id: 'bike', emoji: '🛵', name: 'Bike taxi' },
];
const EXAMPLE_KM = [2, 5, 10];

/**
 * "Where do these fares come from?" — lists the official tariff, its legal source,
 * effective date and last verification date for the current city, plus worked
 * examples computed by the same engine the route screens use.
 */
export default function FareReliabilityModal({ visible, onClose }) {
  const { fireToast, currentCity } = useTrip();
  if (!visible) return null;

  const cityId = currentCity?.id || 'bengaluru';
  const cityTariffs = TARIFFS[cityId] || {};
  const noon = new Date();
  noon.setHours(12, 0, 0, 0);

  const openSource = (url) => {
    log.info(FEATURES.FARE, 'tariff.source_opened', { url });
    Linking.openURL(url).catch(() => fireToast('Could not open the link.'));
  };

  const Container = Platform.OS === 'web' ? View : Modal;
  const containerProps =
    Platform.OS === 'web'
      ? { style: [StyleSheet.absoluteFill, { zIndex: 12000 }] }
      : { transparent: true, visible: true, animationType: 'slide', onRequestClose: onClose };

  return (
    <Container {...containerProps}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </View>

      <View style={styles.modalCard}>
        <View style={styles.handleBar} />
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>OFFICIAL TARIFFS · {(currentCity?.name || 'Bengaluru').toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>Where these fares come from</Text>
            <Text style={styles.subtitle}>Government meter tariffs with source and date. App prices are not published.</Text>
          </View>
          <Pressable onPress={onClose} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={12}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[700]} strokeWidth={2.5}>
              <Path d="M18 6L6 18M6 6l12 12" />
            </Svg>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightTitle}>How the fare is calculated</Text>
            <Text style={styles.highlightText}>
              Meter fare = base fare for the first km + per-km rate × remaining road distance, × night multiplier
              where the tariff has one. Road distance comes from OSRM routing; if routing is unavailable, straight-line
              distance × {FALLBACK_DETOUR_FACTOR} is used and the fare is shown with a ~ sign.
            </Text>
          </View>

          {VEHICLES.map((v) => {
            const t = cityTariffs[v.id];
            if (!t) {
              return (
                <View key={v.id} style={styles.tariffCard}>
                  <Text style={styles.tariffTitle}>
                    {v.emoji} {v.name}
                  </Text>
                  <Text style={styles.warnText}>No tariff configured for this city.</Text>
                </View>
              );
            }
            return (
              <View key={v.id} style={styles.tariffCard}>
                <View style={styles.tariffHeader}>
                  <Text style={styles.tariffTitle}>
                    {v.emoji} {t.label}
                  </Text>
                  <View style={[styles.statusPill, { backgroundColor: t.regulated ? '#dcfce7' : '#f1f5f9' }]}>
                    <Text style={[styles.statusPillText, { color: t.regulated ? '#15803d' : '#475569' }]}>
                      {t.regulated ? 'GOVT TARIFF' : 'NO GOVT TARIFF'}
                    </Text>
                  </View>
                </View>

                {t.regulated ? (
                  <>
                    <Text style={styles.rateLine}>
                      ₹{t.baseFare} for first {t.baseKm} km · ₹{t.perKm}/km after
                    </Text>
                    {t.night && <Text style={styles.metaLine}>Night: {t.night.label}</Text>}
                    {t.waiting && <Text style={styles.metaLine}>Waiting: {t.waiting}</Text>}
                    {t.tiers && (
                      <View style={styles.tierBox}>
                        {t.tiers.map((tier) => (
                          <Text key={tier.label} style={styles.metaLine}>
                            • {tier.label}: ₹{tier.baseFare} first {tier.baseKm} km, ₹{tier.perKm}/km
                          </Text>
                        ))}
                      </View>
                    )}
                    <View style={styles.exampleRow}>
                      {EXAMPLE_KM.map((km) => {
                        const r = computeOfficialFare(cityId, v.id, { roadMeters: km * 1000, date: noon });
                        return (
                          <View key={km} style={styles.exampleCell}>
                            <Text style={styles.exampleKm}>{km} km</Text>
                            <Text style={styles.exampleFare}>₹{r.fare}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </>
                ) : (
                  <Text style={styles.metaLine}>{t.legalStatus}</Text>
                )}

                {t.appNote && <Text style={styles.noteText}>{t.appNote}</Text>}
                <Text style={styles.metaLine}>
                  {t.authority ? `${t.authority}. ` : ''}
                  {t.effectiveFrom ? `Effective ${t.effectiveFrom}. ` : ''}Last checked {t.verifiedOn}.
                </Text>
                {(t.sources || []).map((url) => (
                  <Pressable key={url} onPress={() => openSource(url)}>
                    <Text style={styles.linkText} numberOfLines={1}>
                      {url.replace(/^https?:\/\/(www\.)?/, '')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            );
          })}

          <Text style={styles.footer}>
            Wrong or outdated? Open the Diagnostics screen (Guide tab) and share logs — every fare the app shows is logged
            with its distance source and tariff.
          </Text>
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  modalCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '92%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
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
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
    letterSpacing: 0.5,
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
    borderRadius: radius.pill,
    backgroundColor: colors.neutral[100],
    marginLeft: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  highlightCard: {
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
  },
  highlightTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
    marginBottom: 4,
  },
  highlightText: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#475569',
    lineHeight: 16,
  },
  tariffCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 12,
    gap: 4,
  },
  tariffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tariffTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.4,
  },
  rateLine: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
    marginTop: 2,
  },
  metaLine: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    lineHeight: 15,
  },
  tierBox: {
    marginTop: 2,
  },
  exampleRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  exampleCell: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: radius.sm,
    paddingVertical: 6,
  },
  exampleKm: {
    fontSize: 10,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[500],
  },
  exampleFare: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  noteText: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#92400e',
    backgroundColor: '#fffbeb',
    borderRadius: radius.sm,
    padding: 8,
    lineHeight: 15,
  },
  warnText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: '#b91c1c',
  },
  linkText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: '#1d4ed8',
    textDecorationLine: 'underline',
  },
  footer: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    lineHeight: 15,
    textAlign: 'center',
  },
});

import React, { useState } from 'react';
import {
  Linking,
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
import { BENGALURU_CLOAKROOMS, CLOAKROOM_CHECKLIST, getCloakroomsForCity } from '../data/cloakroomData';
import { useTrip } from '../../src/context/TripContext';

export default function CloakroomModal({ visible, onClose }) {
  const { fireToast, currentCity } = useTrip();
  const [selectedHub, setSelectedHub] = useState('all'); // 'all' | 'railway' | 'airport'

  if (!visible) return null;

  const cityCloakrooms = getCloakroomsForCity(currentCity?.id || 'bengaluru');
  const filteredCloakrooms =
    selectedHub === 'all'
      ? cityCloakrooms
      : cityCloakrooms.filter((c) => c.category === selectedHub);

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {
      fireToast(`Helpline copied: ${phone}`);
    });
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
                <Text style={styles.badgeText}>BAGGAGE & CLOAKROOM DIRECTORY</Text>
              </View>
              <View style={styles.rateBadge}>
                <Text style={styles.rateBadgeText}>From ₹30 / 24 hrs</Text>
              </View>
            </View>
            <Text style={styles.title}>Station Cloakroom Guide</Text>
            <Text style={styles.subtitle}>
              Hands-free exploration · KSR Majestic, Yesvantpur & Airport
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

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'All Cloakrooms' },
            { id: 'railway', label: '🚆 Railway Stations (₹30)' },
            { id: 'airport', label: '✈️ Airport (KIA)' },
          ].map((tab) => {
            const active = selectedHub === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setSelectedHub(tab.id)}
                style={[styles.filterPill, active && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Padlock & Rule Warning Banner */}
          <View style={styles.warningCard}>
            <Text style={styles.warningCardTitle}>🔒 MANDATORY RULE: Bring a Brass Padlock</Text>
            <Text style={styles.warningCardText}>
              Indian Railways cloakroom staff will strictly reject any bag without a physical lock on the zipper. Buy a small ₹30 padlock outside Platform 1 before queuing!
            </Text>
          </View>

          {/* List of Cloakrooms */}
          {filteredCloakrooms.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{c.name}</Text>
                  <Text style={styles.cardOperator}>{c.operator} · {c.hub}</Text>
                </View>
                <View style={styles.timingBadge}>
                  <Text style={styles.timingBadgeText}>{c.timings.includes('24 Hours') ? '🟢 24/7 OPEN' : c.timings}</Text>
                </View>
              </View>

              {/* Location & Metro Skywalk Details */}
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>{c.locationDetails}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🚇</Text>
                <Text style={[styles.infoText, { color: '#2563eb' }]}>{c.metroProximity}</Text>
              </View>

              {/* Tariff Grid */}
              <View style={styles.tariffGrid}>
                <View style={styles.tariffCol}>
                  <Text style={styles.tariffLabel}>FIRST 24 HOURS</Text>
                  <Text style={styles.tariffPrice}>{c.tariff.first24Hours}</Text>
                </View>
                <View style={styles.tariffDivider} />
                <View style={styles.tariffCol}>
                  <Text style={styles.tariffLabel}>SUBSEQUENT DAY</Text>
                  <Text style={styles.tariffPrice}>{c.tariff.subsequentDay}</Text>
                </View>
                {c.tariff.lockerOption && (
                  <>
                    <View style={styles.tariffDivider} />
                    <View style={styles.tariffCol}>
                      <Text style={styles.tariffLabel}>STEEL LOCKER</Text>
                      <Text style={styles.tariffPrice}>{c.tariff.lockerOption}</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Rules List */}
              <View style={styles.rulesBox}>
                <Text style={styles.rulesHeading}>Key Requirements:</Text>
                {c.rules.map((rule, ri) => (
                  <Text key={ri} style={styles.ruleItem}>• {rule}</Text>
                ))}
              </View>

              {/* Insider Tip & Phone Action */}
              <View style={styles.tipBox}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>{c.insiderTip}</Text>
              </View>

              {c.verifiedPhone && (
                <Pressable
                  onPress={() => handleCall(c.verifiedPhone)}
                  style={({ pressed }) => [styles.phoneBtn, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.phoneBtnText}>📞 Call Cloakroom Desk ({c.verifiedPhone})</Text>
                </Pressable>
              )}
            </View>
          ))}

          {/* Traveler Checklist Section */}
          <Text style={styles.sectionHeading}>4-POINT CLOAKROOM CHECKLIST</Text>
          <View style={styles.checklistCard}>
            {CLOAKROOM_CHECKLIST.map((item, idx) => (
              <View key={idx} style={styles.checkItemRow}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkNum}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkItemTitle}>{item.item}</Text>
                  <Text style={styles.checkItemReason}>{item.reason}</Text>
                </View>
              </View>
            ))}
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
    maxHeight: '92%',
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
  rateBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  rateBadgeText: {
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  filterPillActive: {
    backgroundColor: colors.accentRamp[700],
    borderColor: colors.accentRamp[700],
  },
  filterPillText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[700],
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontFamily: fontFamily.bodyBold,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  warningCard: {
    backgroundColor: '#fffbeb',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 12,
  },
  warningCardTitle: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#92400e',
    marginBottom: 4,
  },
  warningCardText: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#78350f',
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 14,
    gap: 10,
    ...shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  cardOperator: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#64748b',
    marginTop: 2,
  },
  timingBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  timingBadgeText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  infoIcon: {
    fontSize: 13,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    lineHeight: 16,
  },
  tariffGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tariffCol: {
    flex: 1,
    alignItems: 'center',
  },
  tariffDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#cbd5e1',
  },
  tariffLabel: {
    fontSize: 8.5,
    fontFamily: fontFamily.bodyBold,
    color: '#64748b',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  tariffPrice: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#16a34a',
  },
  rulesBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: radius.sm,
    padding: 9,
    gap: 3,
  },
  rulesHeading: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#334155',
    marginBottom: 2,
  },
  ruleItem: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: '#475569',
    lineHeight: 14,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderRadius: radius.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  tipIcon: {
    fontSize: 13,
  },
  tipText: {
    flex: 1,
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#166534',
    lineHeight: 15,
  },
  phoneBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  phoneBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  sectionHeading: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    color: colors.neutral[500],
    marginTop: 6,
  },
  checklistCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 12,
    gap: 12,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentRamp[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkNum: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
  },
  checkItemTitle: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  checkItemReason: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#64748b',
    marginTop: 1,
    lineHeight: 15,
  },
});

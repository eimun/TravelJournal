import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { useTrip } from '../../src/context/TripContext';

export default function DynamicAutoFareCard({ dynamicFare, distanceMeters }) {
  const { fireToast, openFareReliability } = useTrip();
  const [copied, setCopied] = useState(false);

  if (!dynamicFare || !dynamicFare.providers) return null;

  const { surge, providers, negotiationPhrase } = dynamicFare;

  const handleCopyPhrase = () => {
    setCopied(true);
    fireToast('Copied: "Meter hakisi banni" (ಮೀಟರ್ ಹಾಕಿ ಬನ್ನಿ)');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <View style={styles.card}>
      {/* Surge Status Banner */}
      <View style={[styles.surgeBanner, { borderColor: surge.color, backgroundColor: `${surge.color}15` }]}>
        <View style={styles.surgeHeaderRow}>
          <Text style={styles.surgeEmoji}>{surge.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.surgeTitleRow}>
              <Text style={[styles.surgeLabel, { color: surge.color }]}>
                {surge.label}
              </Text>
              <View style={[styles.surgeMultiplierBadge, { backgroundColor: surge.color }]}>
                <Text style={styles.surgeMultiplierText}>{surge.multiplier}x</Text>
              </View>
            </View>
            <Text style={styles.surgeAdvice}>{surge.advice}</Text>
          </View>
        </View>
      </View>

      {/* Provider Price Comparison Grid */}
      <View style={styles.matrixHeaderRow}>
        <View>
          <Text style={styles.matrixHeading}>REAL-TIME PRICE COMPARISON</Text>
          <Text style={styles.matrixSub}>{dynamicFare.distanceKm} km ride</Text>
        </View>
        <Pressable
          onPress={openFareReliability}
          style={({ pressed }) => [styles.auditPill, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.auditPillText}>🛡️ Price Reliability</Text>
        </Pressable>
      </View>

      <View style={styles.providersList}>
        {/* 1. Namma Yatri (Recommended) */}
        <View style={[styles.providerRow, styles.providerRowFeatured]}>
          <View style={styles.providerLeftCol}>
            <View style={styles.providerNameRow}>
              <Text style={styles.providerName}>{providers.nammaYatri.name}</Text>
              <View style={[styles.tagPill, { backgroundColor: '#dbeafe' }]}>
                <Text style={[styles.tagPillText, { color: '#1e40af' }]}>
                  {providers.nammaYatri.tag}
                </Text>
              </View>
            </View>
            <Text style={styles.providerSub}>{providers.nammaYatri.subtitle}</Text>
          </View>
          <View style={styles.providerRightCol}>
            <Text style={[styles.providerFare, { color: '#1d4ed8' }]}>
              {providers.nammaYatri.fareText}
            </Text>
            <Text style={styles.providerBadge}>{providers.nammaYatri.badge}</Text>
          </View>
        </View>

        {/* 2. Uber / Ola Auto (Surging) */}
        <View style={styles.providerRow}>
          <View style={styles.providerLeftCol}>
            <View style={styles.providerNameRow}>
              <Text style={styles.providerName}>{providers.uberOla.name}</Text>
              <View style={[styles.tagPill, { backgroundColor: surge.multiplier > 1.3 ? '#fee2e2' : '#f1f5f9' }]}>
                <Text style={[styles.tagPillText, { color: surge.multiplier > 1.3 ? '#dc2626' : '#475569' }]}>
                  {providers.uberOla.tag}
                </Text>
              </View>
            </View>
            <Text style={styles.providerSub}>{providers.uberOla.subtitle}</Text>
          </View>
          <View style={styles.providerRightCol}>
            <Text style={styles.providerFare}>{providers.uberOla.fareText}</Text>
            <Text style={styles.providerBadge}>{providers.uberOla.badge}</Text>
          </View>
        </View>

        {/* 3. Govt RTO Meter */}
        <View style={styles.providerRow}>
          <View style={styles.providerLeftCol}>
            <View style={styles.providerNameRow}>
              <Text style={styles.providerName}>{providers.rtoMeter.name}</Text>
              <View style={[styles.tagPill, { backgroundColor: '#dcfce7' }]}>
                <Text style={[styles.tagPillText, { color: '#15803d' }]}>
                  {providers.rtoMeter.tag}
                </Text>
              </View>
            </View>
            <Text style={styles.providerSub}>{providers.rtoMeter.subtitle}</Text>
          </View>
          <View style={styles.providerRightCol}>
            <Text style={[styles.providerFare, { color: '#16a34a' }]}>
              {providers.rtoMeter.fareText}
            </Text>
            <Text style={styles.providerBadge}>{providers.rtoMeter.badge}</Text>
          </View>
        </View>

        {/* 4. Rapido Bike Taxi */}
        <View style={styles.providerRow}>
          <View style={styles.providerLeftCol}>
            <View style={styles.providerNameRow}>
              <Text style={styles.providerName}>{providers.rapidoBike.name}</Text>
              <View style={[styles.tagPill, { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.tagPillText, { color: '#b45309' }]}>
                  {providers.rapidoBike.tag}
                </Text>
              </View>
            </View>
            <Text style={styles.providerSub}>{providers.rapidoBike.subtitle}</Text>
          </View>
          <View style={styles.providerRightCol}>
            <Text style={styles.providerFare}>{providers.rapidoBike.fareText}</Text>
            <Text style={styles.providerBadge}>{providers.rapidoBike.badge}</Text>
          </View>
        </View>

        {/* 5. Street Driver Offline Demand */}
        <View style={[styles.providerRow, styles.providerRowWarning]}>
          <View style={styles.providerLeftCol}>
            <View style={styles.providerNameRow}>
              <Text style={styles.providerName}>{providers.streetQuote.name}</Text>
              <View style={[styles.tagPill, { backgroundColor: '#fef2f2' }]}>
                <Text style={[styles.tagPillText, { color: '#ef4444' }]}>
                  {providers.streetQuote.tag}
                </Text>
              </View>
            </View>
            <Text style={styles.providerSub}>{providers.streetQuote.subtitle}</Text>
          </View>
          <View style={styles.providerRightCol}>
            <Text style={[styles.providerFare, { color: '#dc2626', textDecorationLine: 'line-through' }]}>
              {providers.streetQuote.fareText}
            </Text>
            <Text style={[styles.providerBadge, { color: '#dc2626' }]}>Don't Pay This</Text>
          </View>
        </View>
      </View>

      {/* Driver Negotiation Assistant Phrase */}
      <Pressable
        onPress={handleCopyPhrase}
        style={({ pressed }) => [
          styles.phraseCard,
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        <View style={styles.phraseIconCircle}>
          <Text style={{ fontSize: 16 }}>🗣️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.phraseLabel}>ASK DRIVER IN KANNADA (TAP TO SHOW)</Text>
          <Text style={styles.phraseKannada}>{negotiationPhrase.kannada}</Text>
          <Text style={styles.phraseHindi}>"{negotiationPhrase.hindi}"</Text>
        </View>
        <View style={styles.copyPill}>
          <Text style={styles.copyPillText}>{copied ? '✓ Copied' : 'Copy'}</Text>
        </View>
      </Pressable>

      {/* Fare Reliability & Multi-Platform Audit Link */}
      <Pressable
        onPress={openFareReliability}
        style={({ pressed }) => [
          styles.auditBannerBtn,
          pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
        ]}
      >
        <Text style={styles.auditBannerIcon}>📊</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.auditBannerTitle}>Why do auto & cab prices fluctuate?</Text>
          <Text style={styles.auditBannerSub}>
            Empirical multi-platform benchmark (Uber vs Rapido vs Namma Yatri)
          </Text>
        </View>
        <Text style={styles.auditBannerArrow}>➔</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 14,
    marginTop: 12,
    ...shadow.sm,
  },
  surgeBanner: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  surgeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  surgeEmoji: {
    fontSize: 20,
    marginTop: 1,
  },
  surgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  surgeLabel: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
  },
  surgeMultiplierBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: radius.xs,
  },
  surgeMultiplierText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
  },
  surgeAdvice: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    lineHeight: 15,
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  matrixHeading: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    color: colors.neutral[500],
  },
  matrixSub: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
  },
  providersList: {
    gap: 8,
    marginBottom: 14,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface[50],
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  providerRowFeatured: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  providerRowWarning: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  providerLeftCol: {
    flex: 1,
    marginRight: 8,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  providerName: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  tagPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  tagPillText: {
    fontSize: 8.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.3,
  },
  providerSub: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
  },
  providerRightCol: {
    alignItems: 'flex-end',
  },
  providerFare: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  providerBadge: {
    fontSize: 9.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 1,
  },
  phraseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 10,
    gap: 10,
  },
  phraseIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseLabel: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.5,
    color: colors.neutral[500],
  },
  phraseKannada: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
    marginTop: 1,
  },
  phraseHindi: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
  },
  copyPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  copyPillText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  auditPill: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: radius.full,
  },
  auditPillText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#1d4ed8',
  },
  auditBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: radius.md,
    padding: 10,
    marginTop: 10,
    gap: 10,
  },
  auditBannerIcon: {
    fontSize: 18,
  },
  auditBannerTitle: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: '#1e40af',
  },
  auditBannerSub: {
    fontSize: 9.5,
    fontFamily: fontFamily.body,
    color: '#3b82f6',
    marginTop: 1.5,
  },
  auditBannerArrow: {
    fontSize: 12,
    color: '#1d4ed8',
    fontFamily: fontFamily.bodyBold,
  },
});

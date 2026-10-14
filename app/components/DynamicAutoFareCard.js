import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';

export default function DynamicAutoFareCard({ dynamicFare, distanceMeters }) {
  if (!dynamicFare || !dynamicFare.providers) return null;

  const { surge, providers } = dynamicFare;

  return (
    <View style={styles.card}>
      {/* Surge Status Banner */}
      {surge && (
        <View style={[styles.surgeBanner, { borderColor: surge.color || '#2563eb', backgroundColor: `${surge.color || '#2563eb'}12` }]}>
          <View style={styles.surgeHeaderRow}>
            <Text style={styles.surgeEmoji}>{surge.emoji || '⚡'}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.surgeTitleRow}>
                <Text style={[styles.surgeLabel, { color: surge.color || '#2563eb' }]}>
                  {surge.label}
                </Text>
                {surge.multiplier && (
                  <View style={[styles.surgeMultiplierBadge, { backgroundColor: surge.color || '#2563eb' }]}>
                    <Text style={styles.surgeMultiplierText}>{surge.multiplier}x</Text>
                  </View>
                )}
              </View>
              <Text style={styles.surgeAdvice}>{surge.advice}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Provider Price Comparison Grid Header */}
      <View style={styles.matrixHeaderRow}>
        <Text style={styles.matrixHeading}>REAL-TIME PRICE COMPARISON</Text>
        <Text style={styles.matrixSub}>{dynamicFare.distanceKm} km ride</Text>
      </View>

      <View style={styles.providersList}>
        {/* 1. Namma Yatri (Recommended) */}
        {providers.nammaYatri && (
          <View style={[styles.providerRow, styles.providerRowFeatured]}>
            <View style={styles.providerLeftCol}>
              <View style={styles.providerNameRow}>
                <Text style={styles.providerName}>{providers.nammaYatri.name}</Text>
                {providers.nammaYatri.tag && (
                  <View style={[styles.tagPill, { backgroundColor: '#dbeafe' }]}>
                    <Text style={[styles.tagPillText, { color: '#1e40af' }]}>
                      {providers.nammaYatri.tag}
                    </Text>
                  </View>
                )}
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
        )}

        {/* 2. Uber / Ola Auto */}
        {providers.uberOla && (
          <View style={styles.providerRow}>
            <View style={styles.providerLeftCol}>
              <View style={styles.providerNameRow}>
                <Text style={styles.providerName}>{providers.uberOla.name}</Text>
                {providers.uberOla.tag && (
                  <View style={[styles.tagPill, { backgroundColor: (surge && surge.multiplier > 1.3) ? '#fee2e2' : '#f1f5f9' }]}>
                    <Text style={[styles.tagPillText, { color: (surge && surge.multiplier > 1.3) ? '#dc2626' : '#475569' }]}>
                      {providers.uberOla.tag}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.providerSub}>{providers.uberOla.subtitle}</Text>
            </View>
            <View style={styles.providerRightCol}>
              <Text style={styles.providerFare}>{providers.uberOla.fareText}</Text>
              <Text style={styles.providerBadge}>{providers.uberOla.badge}</Text>
            </View>
          </View>
        )}

        {/* 3. Govt RTO Meter */}
        {providers.rtoMeter && (
          <View style={styles.providerRow}>
            <View style={styles.providerLeftCol}>
              <View style={styles.providerNameRow}>
                <Text style={styles.providerName}>{providers.rtoMeter.name}</Text>
                {providers.rtoMeter.tag && (
                  <View style={[styles.tagPill, { backgroundColor: '#dcfce7' }]}>
                    <Text style={[styles.tagPillText, { color: '#15803d' }]}>
                      {providers.rtoMeter.tag}
                    </Text>
                  </View>
                )}
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
        )}

        {/* 4. Rapido Bike Taxi */}
        {providers.rapidoBike && (
          <View style={styles.providerRow}>
            <View style={styles.providerLeftCol}>
              <View style={styles.providerNameRow}>
                <Text style={styles.providerName}>{providers.rapidoBike.name}</Text>
                {providers.rapidoBike.tag && (
                  <View style={[styles.tagPill, { backgroundColor: '#fef3c7' }]}>
                    <Text style={[styles.tagPillText, { color: '#b45309' }]}>
                      {providers.rapidoBike.tag}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.providerSub}>{providers.rapidoBike.subtitle}</Text>
            </View>
            <View style={styles.providerRightCol}>
              <Text style={styles.providerFare}>{providers.rapidoBike.fareText}</Text>
              <Text style={styles.providerBadge}>{providers.rapidoBike.badge}</Text>
            </View>
          </View>
        )}
      </View>
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
    marginBottom: 10,
  },
  matrixHeading: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    color: colors.neutral[500],
  },
  matrixSub: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[500],
  },
  providersList: {
    gap: 8,
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
});

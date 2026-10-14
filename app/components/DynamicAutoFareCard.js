import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';

/**
 * Fare comparison for a road leg. Only official tariffs show a rupee amount;
 * app prices are described as "Set by app" because they are not published.
 */
export default function DynamicAutoFareCard({ dynamicFare }) {
  if (!dynamicFare || !dynamicFare.providers) return null;

  const { surge, providers, official } = dynamicFare;
  const rows = [providers.rtoMeter, providers.appAuto, providers.bike, providers.cab].filter(Boolean);
  const isEstimatedDistance = dynamicFare.distanceSource === 'estimated';
  const autoTariff = official?.auto?.tariff;

  return (
    <View style={styles.card}>
      {surge && (
        <View style={[styles.surgeBanner, { borderColor: surge.color || '#2563eb', backgroundColor: `${surge.color || '#2563eb'}12` }]}>
          <View style={styles.surgeHeaderRow}>
            <Text style={styles.surgeEmoji}>{surge.emoji || '⚡'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.surgeLabel, { color: surge.color || '#2563eb' }]}>{surge.label}</Text>
              <Text style={styles.surgeAdvice}>{surge.advice}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.matrixHeaderRow}>
        <Text style={styles.matrixHeading}>FARES FOR THIS RIDE</Text>
        <Text style={styles.matrixSub}>
          {isEstimatedDistance ? `~${dynamicFare.distanceKm} km road (est.)` : `${dynamicFare.distanceKm} km by road`}
        </Text>
      </View>

      <View style={styles.providersList}>
        {rows.map((p) => {
          const hasFare = p.fare !== null && p.fare !== undefined;
          return (
            <View key={p.id} style={[styles.providerRow, p.id === 'rto_meter' && styles.providerRowFeatured]}>
              <View style={styles.providerLeftCol}>
                <View style={styles.providerNameRow}>
                  <Text style={styles.providerName} numberOfLines={1}>
                    {p.name}
                  </Text>
                </View>
                {!!p.tag && (
                  <View style={[styles.tagPill, { backgroundColor: `${p.tagColor}18`, alignSelf: 'flex-start' }]}>
                    <Text style={[styles.tagPillText, { color: p.tagColor }]}>{p.tag}</Text>
                  </View>
                )}
                {!!p.subtitle && <Text style={styles.providerSub}>{p.subtitle}</Text>}
              </View>
              <View style={styles.providerRightCol}>
                <Text style={[styles.providerFare, !hasFare && styles.providerFareMuted]}>{p.fareText}</Text>
                {!!p.badge && <Text style={styles.providerBadge}>{p.badge}</Text>}
              </View>
            </View>
          );
        })}
      </View>

      {autoTariff && (
        <Text style={styles.sourceNote}>
          Source: {autoTariff.authority}, effective {autoTariff.effectiveFrom} · checked {autoTariff.verifiedOn}
          {isEstimatedDistance ? '. Road distance estimated from straight-line distance until routing loads.' : '.'}
        </Text>
      )}
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
  surgeLabel: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    marginBottom: 4,
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
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  providerRowFeatured: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  providerLeftCol: {
    flex: 1,
    marginRight: 8,
    gap: 3,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerName: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
    flexShrink: 1,
  },
  tagPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
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
    lineHeight: 14,
  },
  providerRightCol: {
    alignItems: 'flex-end',
  },
  providerFare: {
    fontSize: 15,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  providerFareMuted: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  providerBadge: {
    fontSize: 9.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 1,
  },
  sourceNote: {
    marginTop: 10,
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    lineHeight: 14,
  },
});

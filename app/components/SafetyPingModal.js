import React, { useState } from 'react';
import {
  Clipboard,
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
import { generateSafetyMessage, sendSafetyPingWhatsApp } from '../services/safetyPingService';
import { useTrip } from '../../src/context/TripContext';

export default function SafetyPingModal({
  visible,
  onClose,
  route,
  currentStation = 'Bengaluru Transit Hub',
  gate = 'Gate 1',
  lineName = 'Purple Line Metro',
  towards = 'Towards Vidhana Soudha',
}) {
  const { fireToast } = useTrip();
  const [recipient, setRecipient] = useState('Mummy / Papa');

  if (!visible) return null;

  const destination = route?.destinationName || 'Destination';
  const etaMinutes = route?.totalDurationMinutes || 25;

  const safetyMessage = generateSafetyMessage({
    currentStation,
    gate,
    lineName,
    towards,
    destination,
    etaMinutes,
    recipient,
  });

  const handleSendWhatsApp = async () => {
    const success = await sendSafetyPingWhatsApp(safetyMessage, () => {
      Clipboard.setString(safetyMessage);
      fireToast('WhatsApp could not be opened. Message copied to clipboard!');
    });
    if (success) {
      fireToast('WhatsApp opened! Tap Send to notify family.');
      onClose();
    }
  };

  const handleCopy = () => {
    Clipboard.setString(safetyMessage);
    fireToast('✅ Safety message copied to clipboard!');
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
                <Text style={styles.badgeText}>FAMILY TRAVEL ASSISTANT</Text>
              </View>
              <View style={styles.whatsappBadge}>
                <Text style={styles.whatsappBadgeText}>1-Tap WhatsApp Ping</Text>
              </View>
            </View>
            <Text style={styles.title}>Send Family Safety Ping</Text>
            <Text style={styles.subtitle}>
              Keep parents & loved ones informed with verified live route details
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Recipient Picker */}
          <Text style={styles.sectionHeading}>WHO ARE YOU NOTIFYING?</Text>
          <View style={styles.recipientRow}>
            {['Mummy / Papa', 'Family Group', 'Spouse / Partner', 'Friend'].map((name) => {
              const active = recipient === name;
              return (
                <Pressable
                  key={name}
                  onPress={() => setRecipient(name)}
                  style={[styles.recipientPill, active && styles.recipientPillActive]}
                >
                  <Text style={[styles.recipientPillText, active && styles.recipientPillTextActive]}>
                    {name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* WhatsApp Style Chat Bubble Preview */}
          <Text style={styles.sectionHeading}>MESSAGE PREVIEW</Text>
          <View style={styles.chatBubbleContainer}>
            <View style={styles.chatBubbleHeader}>
              <Text style={styles.chatBubbleSender}>🟢 TravelJournal Verified Update</Text>
              <Text style={styles.chatBubbleTime}>Just now</Text>
            </View>
            <Text style={styles.chatBubbleText}>{safetyMessage}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsCol}>
            <Pressable
              onPress={handleSendWhatsApp}
              style={({ pressed }) => [
                styles.whatsappSendBtn,
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.btnIcon}>💬</Text>
              <Text style={styles.whatsappSendBtnText}>Open in WhatsApp & Send</Text>
            </Pressable>

            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [
                styles.copyBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.btnIcon}>📋</Text>
              <Text style={styles.copyBtnText}>Copy Text to Clipboard</Text>
            </Pressable>
          </View>

          {/* Why Send this Card */}
          <View style={styles.peaceCard}>
            <Text style={styles.peaceCardTitle}>🛡️ Peace of Mind for Parents</Text>
            <Text style={styles.peaceCardText}>
              Includes exact station gate, platform towards direction, and arrival estimate so family knows you are safely traveling on Namma Metro without worrying about traffic or delays.
            </Text>
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
  whatsappBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  whatsappBadgeText: {
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
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
    gap: 12,
  },
  sectionHeading: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    color: colors.neutral[500],
  },
  recipientRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recipientPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  recipientPillActive: {
    backgroundColor: colors.accentRamp[700],
    borderColor: colors.accentRamp[700],
  },
  recipientPillText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[700],
  },
  recipientPillTextActive: {
    color: '#ffffff',
    fontFamily: fontFamily.bodyBold,
  },
  chatBubbleContainer: {
    backgroundColor: '#e7f9ee',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 14,
    ...shadow.sm,
  },
  chatBubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
    paddingBottom: 6,
  },
  chatBubbleSender: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
  },
  chatBubbleTime: {
    fontSize: 9.5,
    fontFamily: fontFamily.body,
    color: '#166534',
  },
  chatBubbleText: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: '#14532d',
    lineHeight: 18,
  },
  actionsCol: {
    gap: 10,
    marginTop: 6,
  },
  whatsappSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 8,
    ...shadow.md,
  },
  btnIcon: {
    fontSize: 16,
  },
  whatsappSendBtnText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 16,
    gap: 8,
  },
  copyBtnText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  peaceCard: {
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    marginTop: 4,
  },
  peaceCardTitle: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
    marginBottom: 4,
  },
  peaceCardText: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#475569',
    lineHeight: 16,
  },
});

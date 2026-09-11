import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow } from '../theme/tokens';
import { family } from '../theme/fonts';
import { daySheetRows } from '../data/sampleTrip';
import { ChunkyButton } from './Chunky';
import Icon from './Icon';

/**
 * The day sheet — one calendar date of the trip and its stops — as the canvas
 * draws it: a cream sheet that springs up (`tj-sheet`) over a dimmed trail.
 *
 * Today carries a clash notice. It states the overlap rather than blocking it,
 * because US-005 lets the traveller keep an overlap on purpose.
 */
export default function DaySheet({ day, onClose, onLogSpend }) {
  const [slide] = useState(() => new Animated.Value(0));
  const open = Boolean(day);

  useEffect(() => {
    if (!open) return undefined;
    slide.setValue(0);
    // cubic-bezier(.34,1.4,.64,1) on the canvas — a spring that overshoots a touch.
    const animation = Animated.spring(slide, {
      toValue: 1,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [open, slide]);

  if (!open) return null;

  const hasClash = day.state === 'now';

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close the day sheet"
        style={styles.backdrop}
        onPress={onClose}
      />

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [
              { translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [480, 0] }) },
            ],
          },
        ]}
      >
        <View style={styles.grabber} />

        <Text style={[styles.date, { fontFamily: family('bodyBold') }]}>{day.date}</Text>
        <Text style={[styles.title, { fontFamily: family('heading') }]}>{day.title}</Text>

        <View style={styles.rows}>
          {daySheetRows.map((row) => (
            <View key={row.id} style={styles.row}>
              <Text style={[styles.time, { fontFamily: family('bodyBold') }]}>{row.time}</Text>
              <View style={styles.rowCopy}>
                <Text style={[styles.rowName, { fontFamily: family('bodyBold') }]}>{row.name}</Text>
                <Text style={[styles.rowMeta, { fontFamily: family('body') }]}>{row.meta}</Text>
              </View>
            </View>
          ))}
        </View>

        {hasClash ? (
          <View style={styles.clash}>
            <Icon name="warning" size={18} color={colors.accentRamp[800]} />
            <Text style={[styles.clashText, { fontFamily: family('bodyBold') }]}>
              Two stops overlap at 19:00 — keep it or shift one
            </Text>
          </View>
        ) : null}

        <ChunkyButton
          accessibilityRole="button"
          accessibilityLabel="Log a spend for this day"
          onPress={onLogSpend}
          depth={5}
          depthColor={colors.accentRamp[700]}
          style={styles.ctaWrap}
          innerStyle={styles.cta}
        >
          <Text style={[styles.ctaText, { fontFamily: family('bodyBold') }]}>
            Log a spend for this day
          </Text>
        </ChunkyButton>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(32,30,29,0.42)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    ...shadow.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.neutral[400],
    marginBottom: 14,
  },
  date: {
    fontSize: 11.5,
    letterSpacing: 1.38,
    color: colors.accentRamp[700],
  },
  title: {
    fontSize: 24,
    lineHeight: 31,
    marginTop: 5,
    marginBottom: 14,
    color: colors.text,
    includeFontPadding: false,
  },
  rows: {
    gap: 9,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 14,
    ...shadow.sm,
  },
  time: {
    fontSize: 13,
    color: colors.accentRamp[700],
    minWidth: 44,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontSize: 14.5,
    color: colors.text,
  },
  rowMeta: {
    fontSize: 12,
    color: colors.neutral[600],
    marginTop: 3,
  },
  clash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 11,
    backgroundColor: colors.accentRamp[200],
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  clashText: {
    flex: 1,
    fontSize: 12.5,
    color: colors.accentRamp[800],
  },
  ctaWrap: {
    marginTop: 15,
  },
  cta: {
    backgroundColor: colors.accentRamp[500],
    paddingVertical: 15,
    minHeight: 48,
  },
  ctaText: {
    fontSize: 15,
    color: colors.white,
  },
});

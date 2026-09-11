import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, radius, shadow } from '../theme/tokens';
import { family } from '../theme/fonts';
import { formatInr } from '../../src/domain/format';

const RING = 52;
const STROKE = 7;
const R = (RING - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * The budget card from the canvas: a donut filled to the share still left,
 * the percentage in its middle, and the amount beside it.
 *
 * The canvas paints the donut with `conic-gradient(accent-500 N%, neutral-300 0)`
 * behind a 7 px inset — which is exactly a 7 px stroked ring starting at 12
 * o'clock, so that is how it is drawn here. Over budget empties the ring and
 * says so, without blocking anything (PRD 8.4).
 */
export default function BudgetRing({ budget, spent }) {
  const remaining = budget - spent;
  const overBudget = remaining < 0;
  const pct = budget > 0 ? Math.max(0, Math.round((remaining / budget) * 100)) : 0;

  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={
        overBudget
          ? `Over budget by ${formatInr(-remaining)}`
          : `Budget left ${formatInr(remaining)} of ${formatInr(budget)}, ${pct} percent`
      }
    >
      <Text style={[styles.kicker, { fontFamily: family('bodyBold') }]}>
        {overBudget ? 'OVER BUDGET' : 'BUDGET LEFT'}
      </Text>

      <View style={styles.row}>
        <View style={styles.ring}>
          <Svg width={RING} height={RING}>
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={R}
              stroke={colors.neutral[300]}
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={R}
              stroke={colors.accentRamp[500]}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)}
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={[styles.pct, { fontFamily: family('bodyBold') }]}>{`${pct}%`}</Text>
          </View>
        </View>

        <View style={styles.copy}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.amount, { fontFamily: family('heading') }]}
          >
            {formatInr(Math.abs(remaining))}
          </Text>
          <Text style={[styles.of, { fontFamily: family('body') }]}>
            {overBudget ? 'over' : `of ${formatInr(budget)}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    padding: 14,
    ...shadow.sm,
  },
  kicker: {
    fontSize: 11.5,
    letterSpacing: 1.15,
    color: colors.neutral[600],
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  ring: {
    width: RING,
    height: RING,
  },
  ringCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: {
    fontSize: 11.5,
    color: colors.text,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  amount: {
    fontSize: 19,
    lineHeight: 24,
    color: colors.text,
    includeFontPadding: false,
  },
  of: {
    fontSize: 11.5,
    color: colors.neutral[600],
    marginTop: 2,
  },
});

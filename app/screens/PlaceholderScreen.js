import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import { colors, radius, space, type } from '../theme/tokens';
import { family } from '../theme/fonts';
import { Kicker } from '../components/primitives';

const statusBarInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

/**
 * The empty state each remaining tab shows until its feature branch lands.
 *
 * PRD 8.4 asks every empty state for one short line explaining what will appear,
 * so the shell is honest about what is built rather than showing a blank tab.
 */
export default function PlaceholderScreen({ title, icon, blurb, branch }) {
  return (
    <View style={styles.screen}>
      <View style={styles.badge}>
        <Feather name={icon} size={26} color={colors.accentRamp[700]} />
      </View>

      <Kicker tone="accent">Coming next</Kicker>
      <Text style={[styles.title, { fontFamily: family('heading') }]}>{title}</Text>
      <Text style={[styles.blurb, { fontFamily: family('body') }]}>{blurb}</Text>

      <View style={styles.branchChip}>
        <Feather name="git-branch" size={13} color={colors.neutral[700]} />
        <Text style={[styles.branchText, { fontFamily: family('bodyBold') }]}>{branch}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: statusBarInset,
    paddingHorizontal: space[8],
    gap: space[2],
  },
  badge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.accentRamp[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  title: {
    ...type.title,
    color: colors.text,
    textAlign: 'center',
    includeFontPadding: false,
  },
  blurb: {
    ...type.body,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  branchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: space[3],
    backgroundColor: colors.neutral[200],
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  branchText: {
    ...type.meta,
    color: colors.neutral[700],
  },
});

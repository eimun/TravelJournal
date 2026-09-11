import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { colors, space } from './app/theme/tokens';
import { paletteFor } from './app/theme/weatherPalette';
import { useOrganicFonts } from './app/theme/fonts';
import AmbientLayer from './app/components/AmbientLayer';
import BottomTabBar from './app/components/BottomTabBar';
import Confetti from './app/components/Confetti';
import DaySheet from './app/components/DaySheet';
import XpToast from './app/components/XpToast';
import HomeScreen from './app/screens/HomeScreen';
import TrailScreen from './app/screens/TrailScreen';
import MapScreen from './app/screens/MapScreen';
import JournalScreen from './app/screens/JournalScreen';
import ProfileScreen from './app/screens/ProfileScreen';
import { TripProvider, useTrip } from './src/context/TripContext';
import { trailDays } from './app/data/sampleTrip';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden — nothing to do, and this must never block startup.
});

const statusBarInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

const SCREENS = {
  home: HomeScreen,
  trail: TrailScreen,
  map: MapScreen,
  journal: JournalScreen,
  profile: ProfileScreen,
};

/**
 * The shell: the weather-tinted ground, the active tab, and everything that
 * floats above it — the day sheet, the reward toast and the confetti.
 */
function Shell() {
  const { tab, setTab, reading, openDay, setOpenDay, toast, clearToast, celebrating, reward } =
    useTrip();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((on) => {
      if (alive) setReduceMotion(on);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);

  const palette = paletteFor(reading.kind);
  const Screen = SCREENS[tab] ?? HomeScreen;
  const day = openDay == null ? null : { ...trailDays[openDay], index: openDay };

  return (
    <View style={[styles.root, { backgroundColor: palette.sky }]}>
      <ExpoStatusBar style="dark" />

      {/* The weather sits behind every tab, so the mood follows you around. */}
      <AmbientLayer kind={reading.kind} reduceMotion={reduceMotion} />

      <View style={styles.body}>
        <Screen
          contentPadding={{
            paddingTop: statusBarInset + space[3],
            paddingBottom: space[8],
          }}
        />
      </View>

      <BottomTabBar active={tab} onChange={setTab} />

      <DaySheet
        day={day}
        onClose={() => setOpenDay(null)}
        onLogSpend={() => {
          setOpenDay(null);
          reward('Spend logged', 5);
        }}
      />

      <XpToast toast={toast} onDone={clearToast} />
      <Confetti active={celebrating} />
    </View>
  );
}

export default function App() {
  const { fontsReady } = useOrganicFonts();

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady]);

  // Holding the splash until the display face is ready avoids a visible reflow
  // from the system font into Caprasimo on the first frame.
  if (!fontsReady) return null;

  return (
    <TripProvider>
      <Shell />
    </TripProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  body: {
    flex: 1,
  },
});

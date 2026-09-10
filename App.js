import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { colors } from './app/theme/tokens';
import { useOrganicFonts } from './app/theme/fonts';
import BottomTabBar from './app/components/BottomTabBar';
import HomeScreen from './app/screens/HomeScreen';
import PlaceholderScreen from './app/screens/PlaceholderScreen';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden — nothing to do, and this must never block startup.
});

/**
 * The tabs that are not built yet, with the branch each one lands on so the app
 * itself points at the roadmap in PRD 5.6.
 */
const PENDING = {
  trips: {
    title: 'Trips',
    icon: 'briefcase',
    blurb:
      'Your trips by state, then day sheets, budget, checklist and documents for the one you open.',
    branch: 'feat/F-02-trip-management',
  },
  map: {
    title: 'Map and places',
    icon: 'map',
    blurb:
      'Trip pins coloured by day, place search, saved places and the route between one day’s stops.',
    branch: 'feat/F-04-map-places',
  },
  journal: {
    title: 'Journal',
    icon: 'book-open',
    blurb:
      'Photos and notes attached to the day they belong to, kept on this device and readable offline.',
    branch: 'feat/F-07-photo-journal',
  },
  profile: {
    title: 'You',
    icon: 'user',
    blurb:
      'Traveller details, home currency, theme, permissions and how much storage each trip is using.',
    branch: 'feat/F-01-login-profile',
  },
};

export default function App() {
  const [tab, setTab] = useState('home');
  const { fontsReady } = useOrganicFonts();

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady]);

  const openTab = useCallback((next) => setTab(next), []);

  // Holding the splash until the display face is ready avoids a visible reflow
  // from the system font into Caprasimo on the first frame.
  if (!fontsReady) return null;

  const pending = PENDING[tab];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor={colors.bg} />

      <View style={styles.body}>
        {tab === 'home' ? (
          <HomeScreen onOpenTab={openTab} />
        ) : (
          <PlaceholderScreen
            title={pending.title}
            icon={pending.icon}
            blurb={pending.blurb}
            branch={pending.branch}
          />
        )}
      </View>

      <BottomTabBar active={tab} onChange={openTab} />
    </View>
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

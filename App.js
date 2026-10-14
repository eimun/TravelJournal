import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { colors, space } from './app/theme/tokens';
import { useOrganicFonts } from './app/theme/fonts';
import BengaluruTabBar from './app/components/BengaluruTabBar';
import PlaceDetailSheet from './app/components/PlaceDetailSheet';
import BengaluruToast from './app/components/BengaluruToast';
import NavigateScreen from './app/screens/NavigateScreen';
import ExploreScreen from './app/screens/ExploreScreen';
import GuideScreen from './app/screens/GuideScreen';
import TrailWalkScreen from './app/screens/TrailWalkScreen';
import PassportScreen from './app/screens/PassportScreen';
import RestaurantDetailSheet from './app/components/RestaurantDetailSheet';
import SearchModalOverlay from './app/components/SearchModalOverlay';
import FareReliabilityModal from './app/components/FareReliabilityModal';
import CitySwitcherModal from './app/components/CitySwitcherModal';
import MobileDeviceFrame from './app/components/MobileDeviceFrame';
import { TripProvider, useTrip } from './src/context/TripContext';
import { openDatabase } from './src/db';
import { seedBengaluruPack } from './src/db/seed';
import DiagnosticsModal from './app/components/DiagnosticsModal';
import ErrorBoundary from './src/logging/ErrorBoundary';
import { FEATURES, log, reportIssue, serializeError, setupLogging } from './src/logging';

// Logging starts before anything renders so startup crashes are captured too.
setupLogging({
  appVersion: Constants.expoConfig?.version,
  runtime: Constants.executionEnvironment, // 'storeClient' = Expo Go, 'bare' = dev/release build
});

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden — nothing to do.
});

const SCREENS = {
  navigate: NavigateScreen,
  explore: ExploreScreen,
  trails: TrailWalkScreen,
  passport: PassportScreen,
  guide: GuideScreen,
  eat: GuideScreen,
  offline: GuideScreen,
};

function Shell() {
  const {
    tab,
    setTab,
    selectedPlace,
    closePlace,
    addedPlaces,
    togglePlaceInDay,
    toast,
    isFareReliabilityOpen,
    closeFareReliability,
    isCitySwitcherOpen,
    closeCitySwitcher,
  } = useTrip();

  const insets = useSafeAreaInsets();
  const Screen = SCREENS[tab] ?? NavigateScreen;
  const isAdded = selectedPlace ? addedPlaces.includes(selectedPlace.id) : false;

  // Ensure plenty of breathing room below iPhone status bar / dynamic island
  const topPadding = Math.max(insets.top, 46) + space[2];
  const bottomPadding = Math.max(insets.bottom, 16) + 70;

  return (
    <View style={styles.root}>
      <ExpoStatusBar style="dark" />

      {/* Screen Body with Dynamic Safe Insets */}
      <View style={styles.body}>
        <ErrorBoundary name={tab} resetKey={tab}>
          <Screen
            contentPadding={{
              paddingTop: topPadding,
              paddingBottom: bottomPadding,
            }}
          />
        </ErrorBoundary>
      </View>

      {/* 3-Tab Bottom Navigation with Safe Bottom Inset */}
      <BengaluruTabBar
        active={tab}
        onChange={setTab}
        bottomInset={insets.bottom}
      />

      {/* Search Modal Overlay (Full Mobile Screen) */}
      <SearchModalOverlay />

      {/* Place Detail Bottom Sheet Modal */}
      <PlaceDetailSheet
        place={selectedPlace}
        isAdded={isAdded}
        onClose={closePlace}
        onToggleAdd={togglePlaceInDay}
      />

      {/* Restaurant Detail Bottom Sheet Modal */}
      <RestaurantDetailSheet />

      {/* Fare Reliability & Multi-Platform Audit Modal */}
      <FareReliabilityModal
        visible={isFareReliabilityOpen}
        onClose={closeFareReliability}
      />

      {/* Multi-City Explorer Switcher Modal */}
      <CitySwitcherModal
        visible={isCitySwitcherOpen}
        onClose={closeCitySwitcher}
      />

      {/* Diagnostics & logs (Guide tab → 🐞 Logs, or long-press the Guide tab) */}
      <DiagnosticsModal />

      {/* Popup Notification Toast */}
      <BengaluruToast toast={toast} topInset={insets.top} />
    </View>
  );
}

export default function App() {
  const { fontsReady } = useOrganicFonts();

  useEffect(() => {
    async function initDatabase() {
      const done = log.time(FEATURES.DB, 'db.init');
      try {
        const db = await openDatabase();
        await seedBengaluruPack(db);
        done({ ok: true });
      } catch (err) {
        done.fail(err);
        reportIssue('DB_INIT_FAILED', { key: 'open_seed', message: err && err.message, data: serializeError(err) });
      }
    }
    initDatabase();
  }, []);

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady]);

  return (
    <SafeAreaProvider>
      <TripProvider>
        <MobileDeviceFrame>
          <Shell />
        </MobileDeviceFrame>
      </TripProvider>
    </SafeAreaProvider>
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

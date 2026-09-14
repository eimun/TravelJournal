import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
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
import RestaurantDetailSheet from './app/components/RestaurantDetailSheet';
import MobileDeviceFrame from './app/components/MobileDeviceFrame';
import { TripProvider, useTrip } from './src/context/TripContext';
import { openDatabase } from './src/db';
import { seedBengaluruPack } from './src/db/seed';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden — nothing to do.
});

const SCREENS = {
  navigate: NavigateScreen,
  explore: ExploreScreen,
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
  } = useTrip();

  const insets = useSafeAreaInsets();
  const Screen = SCREENS[tab] ?? NavigateScreen;
  const isAdded = selectedPlace ? addedPlaces.includes(selectedPlace.id) : false;

  // Ensure plenty of breathing room below iPhone notch / dynamic island
  const topPadding = Math.max(insets.top, 24) + space[2];
  const bottomPadding = Math.max(insets.bottom, 16) + 70;

  return (
    <View style={styles.root}>
      <ExpoStatusBar style="dark" />

      {/* Screen Body with Dynamic Safe Insets */}
      <View style={styles.body}>
        <Screen
          contentPadding={{
            paddingTop: topPadding,
            paddingBottom: bottomPadding,
          }}
        />
      </View>

      {/* 3-Tab Bottom Navigation with Safe Bottom Inset */}
      <BengaluruTabBar
        active={tab}
        onChange={setTab}
        bottomInset={insets.bottom}
      />

      {/* Place Detail Bottom Sheet Modal */}
      <PlaceDetailSheet
        place={selectedPlace}
        isAdded={isAdded}
        onClose={closePlace}
        onToggleAdd={togglePlaceInDay}
      />

      {/* Restaurant Detail Bottom Sheet Modal */}
      <RestaurantDetailSheet />

      {/* Popup Notification Toast */}
      <BengaluruToast toast={toast} topInset={insets.top} />
    </View>
  );
}

export default function App() {
  const { fontsReady } = useOrganicFonts();

  useEffect(() => {
    async function initDatabase() {
      try {
        const db = await openDatabase();
        await seedBengaluruPack(db);
      } catch {
        // Fallback or web notification
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

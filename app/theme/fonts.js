import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree';

import { fontFamily } from './tokens';

/**
 * Loads the two Organic faces. Both are SIL Open Font License, vendored through
 * the @expo-google-fonts packages so the app carries its own type rather than
 * depending on whatever the device happens to ship.
 */
export function useOrganicFonts() {
  const [loaded, error] = useFonts({
    Caprasimo_400Regular,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });

  return { fontsReady: loaded || Boolean(error), fontsError: error ?? null };
}

const systemFallback = Platform.select({ android: 'sans-serif', default: 'System' });

/**
 * Resolves a token font family to something safe to hand React Native.
 *
 * If a face failed to load we return undefined so RN falls back to the platform
 * face rather than rendering boxes — the layout stays intact and only the voice
 * changes.
 */
export function family(key, ready = true) {
  if (!ready) return undefined;
  return fontFamily[key] ?? systemFallback;
}

export default { useOrganicFonts, family };

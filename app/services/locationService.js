import { Platform } from 'react-native';
import * as Location from 'expo-location';

// Default central Bengaluru coordinates (Vidhana Soudha / MG Road)
export const DEFAULT_BENGALURU_LOCATION = {
  latitude: 12.9754,
  longitude: 77.6067,
  name: 'MG Road (Default Location)',
  isDefault: true,
};

/**
 * Requests location permission and gets accurate user GPS position.
 * Uses High accuracy with fallback to LastKnownPosition.
 */
export async function getCurrentUserLocation() {
  try {
    // 1. Web browser fallback if running on web
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      const webPos = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          () => resolve(null),
          { timeout: 5000, enableHighAccuracy: true },
        );
      });

      if (webPos) {
        return {
          latitude: webPos.latitude,
          longitude: webPos.longitude,
          name: await getReadableAddress(webPos.latitude, webPos.longitude),
          isDefault: false,
          source: 'gps',
        };
      }
    }

    // 2. Native Expo Location request
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        ...DEFAULT_BENGALURU_LOCATION,
        permissionDenied: true,
        source: 'fallback',
      };
    }

    // Try High Accuracy with a reasonable timeout
    let loc = null;
    try {
      loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
      });
    } catch {
      // If High accuracy times out (e.g. indoors), fallback to last known location
      loc = await Location.getLastKnownPositionAsync();
    }

    if (!loc || !loc.coords) {
      return {
        ...DEFAULT_BENGALURU_LOCATION,
        gpsUnavailable: true,
        source: 'fallback',
      };
    }

    const latitude = loc.coords.latitude;
    const longitude = loc.coords.longitude;
    const readableName = await getReadableAddress(latitude, longitude);

    return {
      latitude,
      longitude,
      name: readableName,
      isDefault: false,
      source: 'gps',
    };
  } catch (error) {
    console.log('Location fetch error (using fallback):', error.message);
    return {
      ...DEFAULT_BENGALURU_LOCATION,
      error: error.message,
      source: 'fallback',
    };
  }
}

/**
 * Reverse geocodes coordinates to a clean, recognizable Bengaluru neighborhood / street name
 */
export async function getReadableAddress(latitude, longitude) {
  try {
    const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (addresses && addresses.length > 0) {
      const addr = addresses[0];
      const locality = addr.district || addr.subregion || addr.neighbourhood || addr.city;
      const street = addr.street || addr.name;

      if (street && locality && street !== locality) {
        return `${street}, ${locality}`;
      }
      if (locality) {
        return `${locality}, Bengaluru`;
      }
      if (street) {
        return `${street}, Bengaluru`;
      }
    }
  } catch {
    // Reverse geocode fallback
  }

  // If inside central Bengaluru
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

/**
 * Formats distance in meters into human readable "X m" or "X.X km"
 */
export function formatDistance(meters) {
  if (!meters && meters !== 0) return '';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Calculates estimated walking time based on average pace (~75m per minute)
 */
export function estimateWalkMinutes(meters) {
  const paceMetersPerMin = 75;
  return Math.max(1, Math.round(meters / paceMetersPerMin));
}

/**
 * Dynamic Expo config on top of app.json.
 *
 * Google Maps on Android needs an API key, otherwise a native build crashes on the
 * Navigate screen ("API key not found"). The key is read from the environment so it
 * is never committed:
 *
 *   PowerShell:  $env:GOOGLE_MAPS_ANDROID_API_KEY="AIza..."; npx expo run:android
 *   bash:        GOOGLE_MAPS_ANDROID_API_KEY=AIza... npx expo run:android
 *
 * Without a key the app shows a "map unavailable" panel instead of the map and logs
 * MAP_API_KEY_MISSING (MAJOR) — routes and fares keep working.
 */
module.exports = ({ config }) => {
  const key = process.env.GOOGLE_MAPS_ANDROID_API_KEY || '';
  const plugins = [...(config.plugins || [])];
  if (key) plugins.push(['react-native-maps', { androidGoogleMapsApiKey: key }]);
  return {
    ...config,
    plugins,
    extra: { ...(config.extra || {}), googleMapsConfigured: Boolean(key) },
  };
};

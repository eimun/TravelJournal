/**
 * Issue catalog — the single place that decides whether a problem is MAJOR or MINOR.
 *
 * MAJOR = a feature is broken, or the user is shown information that is wrong
 *         or presented as fact without a source (wrong fare, wrong location,
 *         crash, every data provider failing).
 * MINOR = the feature still works but is degraded: a fallback was used, a field
 *         is missing, a single request failed and was retried, data is old.
 *
 * Every reportIssue() call must use a code from this catalog so the same kind of
 * problem is always classified the same way in the exported report.
 */

export const SEVERITY = {
  MAJOR: 'major',
  MINOR: 'minor',
};

export const ISSUE_CATALOG = {
  // ── App / runtime ──────────────────────────────────────────────
  APP_JS_CRASH: {
    severity: SEVERITY.MAJOR,
    feature: 'APP',
    title: 'Unhandled JavaScript error',
    hint: 'Check the stack in the entry data; the screen named in "screen" crashed.',
  },
  APP_RENDER_CRASH: {
    severity: SEVERITY.MAJOR,
    feature: 'APP',
    title: 'Screen failed to render (error boundary caught it)',
    hint: 'componentStack in the entry shows which component threw.',
  },
  APP_UNHANDLED_PROMISE: {
    severity: SEVERITY.MINOR,
    feature: 'APP',
    title: 'Unhandled promise rejection',
    hint: 'An async call threw without a catch. Usually a network or storage call.',
  },
  APP_CONSOLE_ERROR: {
    severity: SEVERITY.MINOR,
    feature: 'APP',
    title: 'console.error was called',
    hint: 'Often a React warning (keys, props) or a library error message.',
  },
  DB_INIT_FAILED: {
    severity: SEVERITY.MAJOR,
    feature: 'DB',
    title: 'Local database could not be opened or seeded',
    hint: 'Offline data will be missing. Check the error message for SQLite errors.',
  },

  // ── Location ──────────────────────────────────────────────────
  LOCATION_PERMISSION_DENIED: {
    severity: SEVERITY.MINOR,
    feature: 'LOCATION',
    title: 'Location permission denied — using city default location',
    hint: 'Distances and "near you" sorting are measured from the default point.',
  },
  LOCATION_FAILED: {
    severity: SEVERITY.MINOR,
    feature: 'LOCATION',
    title: 'GPS fix failed or timed out — using default location',
    hint: 'Emulator: set a location with "adb emu geo fix <lon> <lat>".',
  },

  // ── Fares (auto / cab / bike / bus) ───────────────────────────
  FARE_INVALID: {
    severity: SEVERITY.MAJOR,
    feature: 'FARE',
    title: 'Fare is not a valid amount (NaN, zero or negative)',
    hint: 'A distance or tariff input was missing. See data.inputs.',
  },
  FARE_BELOW_OFFICIAL_MINIMUM: {
    severity: SEVERITY.MAJOR,
    feature: 'FARE',
    title: 'Displayed fare is below the official minimum fare',
    hint: 'Some code path is not using src/domain/tariffs.js.',
  },
  FARE_TARIFF_MISSING: {
    severity: SEVERITY.MAJOR,
    feature: 'FARE',
    title: 'No official tariff configured for this city / vehicle',
    hint: 'Add the tariff (with source URL and dates) to src/domain/tariffs.js.',
  },
  FARE_IMPLAUSIBLE_TRIP: {
    severity: SEVERITY.MAJOR,
    feature: 'FARE',
    title: 'Fare computed for an impossible in-city trip (> 100 km)',
    hint: 'Origin and destination are in different cities — check the LOCATION / CITY entries just before it.',
  },
  FARE_TARIFF_STALE: {
    severity: SEVERITY.MINOR,
    feature: 'FARE',
    title: 'Tariff has not been re-verified recently',
    hint: 'Re-check the source URL in src/domain/tariffs.js and update verifiedOn.',
  },
  FARE_ROAD_DISTANCE_ESTIMATED: {
    severity: SEVERITY.MINOR,
    feature: 'FARE',
    title: 'Road distance unavailable — fare uses straight-line × detour factor',
    hint: 'OSRM routing request failed or is still loading. Fare may be off by ±20%.',
  },

  // ── Navigation / routing ──────────────────────────────────────
  NAV_PLAN_FAILED: {
    severity: SEVERITY.MAJOR,
    feature: 'NAV',
    title: 'Route planning threw an error',
    hint: 'See data.origin / data.destination and the stack.',
  },
  MAP_API_KEY_MISSING: {
    severity: SEVERITY.MAJOR,
    feature: 'NAV',
    title: 'Map hidden: no Google Maps Android API key configured',
    hint: 'Set GOOGLE_MAPS_ANDROID_API_KEY before building (see app.config.js). Without it a native build crashes on the map.',
  },
  NAV_ROAD_GEOMETRY_FAILED: {
    severity: SEVERITY.MINOR,
    feature: 'NAV',
    title: 'Road geometry request failed — straight line drawn instead',
    hint: 'OSRM demo server is rate-limited (1 req/s) and has no uptime guarantee.',
  },

  // ── Food / restaurants ────────────────────────────────────────
  FOOD_ALL_PROVIDERS_FAILED: {
    severity: SEVERITY.MAJOR,
    feature: 'FOOD',
    title: 'Live restaurant discovery failed on every provider',
    hint: 'Only curated restaurants are shown. See NET entries for status codes.',
  },
  FOOD_PROVIDER_ERROR: {
    severity: SEVERITY.MAJOR,
    feature: 'FOOD',
    title: 'Restaurant API returned an error (bad key, quota, bad request)',
    hint: 'data.body contains the provider error message.',
  },
  FOOD_DATA_INVALID: {
    severity: SEVERITY.MAJOR,
    feature: 'FOOD',
    title: 'Restaurant record has invalid data (coordinates, hours, city)',
    hint: 'Fix the record in app/data or the transform in the service.',
  },
  FOOD_LOCATION_MISMATCH: {
    // Minor: the app already shows the corrected OSM pin; only the curated source is stale.
    severity: SEVERITY.MINOR,
    feature: 'FOOD',
    title: 'Curated pin was wrong — corrected from OpenStreetMap',
    hint: 'Update latitude/longitude in app/data to the OSM pin shown in data.osm, then re-run "npm run verify:restaurants".',
  },
  FOOD_USER_REPORTED: {
    severity: SEVERITY.MAJOR,
    feature: 'FOOD',
    title: 'User reported wrong restaurant information',
    hint: 'data.reason says what the user flagged.',
  },
  FOOD_NOT_VERIFIED: {
    severity: SEVERITY.MINOR,
    feature: 'FOOD',
    title: 'Restaurant could not be matched to an independent source',
    hint: 'Shown with an "Unverified" label. Verify manually or remove.',
  },
  FOOD_FIELD_MISSING: {
    severity: SEVERITY.MINOR,
    feature: 'FOOD',
    title: 'Restaurant is missing hours / menu / diet information',
    hint: 'The UI shows "not available" instead of guessing.',
  },
  FOOD_IMAGE_FAILED: {
    severity: SEVERITY.MINOR,
    feature: 'FOOD',
    title: 'Restaurant image failed to load — cuisine fallback shown',
    hint: 'data.uri is the broken URL.',
  },
  FOOD_PROVIDER_NOT_CONFIGURED: {
    severity: SEVERITY.MINOR,
    feature: 'FOOD',
    title: 'Optional restaurant provider has no API key',
    hint: 'Set EXPO_PUBLIC_GOOGLE_PLACES_KEY / EXPO_PUBLIC_FOURSQUARE_API_KEY to enable.',
  },

  // ── Network (generic) ─────────────────────────────────────────
  NET_REQUEST_FAILED: {
    severity: SEVERITY.MINOR,
    feature: 'NETWORK',
    title: 'Network request failed or timed out',
    hint: 'data.name identifies the request; data.status / data.error say why.',
  },
};

export function getIssueDefinition(code) {
  return (
    ISSUE_CATALOG[code] || {
      severity: SEVERITY.MINOR,
      feature: 'APP',
      title: `Uncatalogued issue: ${code}`,
      hint: 'Add this code to src/logging/issueCatalog.js.',
    }
  );
}

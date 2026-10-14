# TravelJournal → TravelBuddy · v1 Feature Spec

**Status:** Draft v1.0 — agreed in interview, October 2026
**Supersedes:** feature ordering in `docs/PROJECT_SPEC_UPDATES.md` Sprints 3–4 (partially)
**Companion docs:** `docs/TravelJournal-PRD.pdf`, `docs/PROJECT_SPEC_UPDATES.md`, `docs/FARE_RELIABILITY_ANALYSIS.md`

---

## 1. Context

TravelJournal began as an offline-first trip journal but has evolved (per
`PROJECT_SPEC_UPDATES.md`) into a **Smart City Explorer & Transit Companion**:
transit-first navigation, unmanipulated local food discovery, and explorer safety
tooling. Recent work has landed multimodal routing with fare comparison, multi-city
registries (BLR/DEL/BOM), restaurant live photos, safety ping, and cloakroom
directories.

This spec defines the **v1 (Play-Store-quality) feature set** — what gets built next,
with the decisions locked in this interview.

---

## 2. Decisions from interview (locked)

| Decision | Choice |
| --- | --- |
| Product rebrand | **Full rebrand to "TravelBuddy"** including package/bundle id for the store listing |
| Spec/documentation naming | Keep under the `TravelJournal` repo/documentation naming for now |
| v1 feature picks | **Walking trails + milestones · Saved-Money Meter · Heritage Passport & stamps · Rain Mode (Plan B)** |
| City scope v1 | **Bengaluru deep, scale-ready** — schema/architecture admits future cities without rework |
| Data strategy | **Live-first** where a source exists, curated fixtures as base, per-feature offline policy (§6) |
| Fare data | **Gazetted tariffs + live cab estimates** (clearly labelled as estimates) |
| Live sources | **Free-tier set + cab APIs**: Foursquare, OpenWeather, Open-Meteo AQI, OSM, plus Uber/Ola estimate APIs where accessible |
| Check-ins | **GPS auto check-in** (geofence); without location permission milestones stay locked with an enable-GPS guidance screen (no manual override in v1) |
| Stamp unlocking | **Trail check-ins + Heritage Legend/City Icon food landmarks** (no transit-line stamps in v1) |
| Savings meter | **Per-ride card + cumulative trip savings wallet**, persisted |
| Sharing / summary card | **Deferred** — "we will add this later" |
| Audio stories | **Deferred to v1.1** — ship text-story cards readable on a phone in the sun |
| Mom & Dad Mode | **Deferred** |
| Scam Shield | **Deferred to v1.1** |
| Gamification beyond stamps | **Skip** — no XP/leaderboards; keep existing confetti/toasts as-is |
| Language | **English UI + local phrases** (Kannada romanized + native script) |
| Data QA | **Strict data-audit test** — every venue carries years-active, signature dish, price range, hours; audit test fails on gaps |
| Performance budget | **Relaxed for v1** — function over polish; record observed numbers rather than enforce README's 3s/60fps/50MB targets |
| 300-line rule | **Relaxed fully** — guideline only (ESLint already treats `max-lines` as warning) |
| Definition of done | **Full DoD** — Jest suites incl. extended data-audit test, device walkthrough, ESLint + Prettier clean, airplane-mode walkthrough documented |
| Privacy | **Privacy policy + Play Store data-safety declaration are required** for the release |
| Trail visuals | **New neighbourhood map** — walkable mini-map with numbered stops (not the existing trail-stone metaphor) |
| Content authorship | **Agent researches web sources and populates fixtures with cited facts**, user verifies ground truth |

---

## 3. Feature specs

### F-1 · Neighbourhood Walking Trails (Pillar 1)

Curated half-day (2–3 h) walking circuits in one Bengali neighbourhood, rendered as
a **numbered walkable mini-map** with ordered stops.

- **Trail schema** (per city, in a new `app/data/<city>Trails.js`, excluded from
  coverage like other data modules):
  - `id`, `cityId`, `title`, `neighbourhood`, `theme`, `totalDistanceKm`, `estDurationMin`, `estCostInr`
  - `stops[]`: `id`, `order`, `name`, `lat/lng`, `type` (market | temple | eatery | park | museum), `walkFromPrevM`, `spendTimeMin`, `note`, `citations[]`
  - `indoorFallbackStopId[]` — see Rain Mode (F-4)
  - `weatherRiskTags[]` (e.g. `"open-air"`, `"covered"`)
- **Visual:** stylized static mini-map (SVG path over a light ground) with numbered
  stop dots; tapped stop opens a detail card (hours, tip, food link if eatery).
  Reuses Organic tokens; per-feature visual latitude is allowed but must not
  hardcode hexes — extend `tokens.js` if a new colour role is genuinely needed.
- **Check-in (GPS):** when `locationService` reports the user within a geofence
  radius (default 75 m, configurable per stop for large sites), the stop auto
  checks-in: dot fills, next stop highlights.
- **No permission fallback:** if location permission is denied/off while a trail is
  active, stops stay locked and the screen shows **guidance only** — a clear
  explanation and a path to system settings (`Linking.openSettings()`).
  No manual check-in in v1.
- **Offline:** trails are curated fixtures — **fully offline**.

**Acceptance:** ≥ 3 Bengaluru trails shipped with cited content; geofence check-in
verified on device; locked-state guidance screen verified with permissions off;
data-audit test extended to trails (all stops must have `lat/lng`, `type`, hours or
`spentTimeMin`, `citations`).

### F-2 · Heritage Passport & Stamps (Pillar 5, reduced)

Digital stamps unlock at **trail stop check-ins** and **Heritage Legend / City Icon
eatery visits** (matches existing restaurant registry "since 19xx" data).

- **Unlock sources:** geofence at trail stop; geofence at registered heritage eatery
  (same 75 m mechanism — one `checkInService` owns both).
- **Stamp data:** `id`, `cityId`, `sourceType` (`trail_stop` | `heritage_eatery`),
  `sourceId`, `title`, `unlockedLabel` (e.g. `"Unlocked: Heritage Taster — Vidyarthi Bhavan (1943)"`), `year`.
- **Visual:** a passport grid (one card per unlocked stamp) on the Journal screen —
  no XP, no levels, no streaks. Existing confetti/toast components may be reused for
  the unlock moment.
- **No sharing:** the shareable summary card is explicitly out of scope for v1.
- **Persistence:** stamps are personal content — stored in **SQLite via a new
  migration** (see §7), consistent with device-is-system-of-record.

**Acceptance:** stamp unlocks verified on device for both source types; persisted
across app restart; audit test verifies every registered stamp has a resolvable
source (stop or eatery) in city data.

### F-3 · Saved-Money Meter (Pillar 3)

Monetizes the transit-vs-cab decision the Navigate screen already compares.

- **Per-ride card:** after a route decision, compute
  `directCabFare − multimodalFare` and surface a card, e.g.
  *"You saved ₹520 — that's 6 Benne Masala Dosas + 3 Filter Coffees."*
  Food conversion reuses the existing restaurant/dishes price data (dosa/coffee
  anchors per city).
- **Savings Wallet:** cumulative total across the trip, **persisted in SQLite**
  (same migration as F-2), shown on Home as a small card with trip-day breakdown.
- **Fare correctness:** gazetted tariffs (metro fare matrix, RTO auto/cab cards —
  already in registries) are the source of truth; cab estimates from live APIs are
  **always labelled "est."** and never used for the wallet without a gazetted
  fallback.
- **Offline:** computation is local (existing `fare`/`dynamicFare` domain modules);
  wallet writes are local. Fully offline-safe.

**Acceptance:** wallet survives restart; per-ride card math covered by Jest tests
(reuse/extend `dynamicFare.test.js` patterns); cab-estimate labelling present in UI.

### F-4 · Rain Mode (Plan B)

- Ontrail screens, a **Plan B toggle** switches open-air circuits to indoor/covered
  alternatives: metro-connected museums, galleries, underground markets, sheltered
  arcades.
- Implemented as trail variants: each trail carries `indoorFallbackStopId[]`/a
  companion indoor trail `id`; toggling re-renders the map onto the fallback path.
- **Weather hook:** on live AQI/weather (free-tier OpenWeather/Open-Meteo), heavy
  rain in the forecast auto-nudges the toggle (a banner, not a forced switch).
- **Curation:** rainy-day circuit sets curated in Bengaluru data with citations.

**Acceptance:** toggle switches paths without loss of check-in state; nudged banner
appears under mocked rainy forecast; curated indoor circuits present with citations.

### F-5 · TravelBuddy full rebrand

- App display name, icon/splash wording, in-app headers/toasts → **TravelBuddy**.
- `app.json` name/slug updated; **package/bundle id changes** for the store listing.
- Repo folder and documentation keep `TravelJournal` naming for now (per decision).
- README gains a note documenting the rebrand mapping.

**Acceptance:** fresh `expo prebuild` succeeds; app installs and launches under the
new id; no leftover user-visible "TravelJournal" strings.

### F-6 · Privacy policy & data-safety declaration (release blocker)

- Because live-first features now leave the device (coords, currency pair, cab
  estimate requests — never itinerary text/photos/journal, per the offline rules),
  v1 ships a **privacy policy page** and the Play Store **data-safety form
  contents** documented in `docs/`.
- Statement to honour: personal content never leaves the device without an explicit
  user-triggered action.

**Acceptance:** privacy policy text reviewed against every networked service used
(OpenWeather, Foursquare, cab estimate API, OSM); data-safety draft in docs.

---

## 4. Feature states / offline policy (per-feature, per interview)

| Feature | Online behaviour | Offline behaviour |
| --- | --- | --- |
| F-1 Trails | n/a (static data) + GPS fixes | Fully usable; GPS check-in works offline (local fix only) |
| F-2 Passport | n/a | Fully usable; persisted in SQLite |
| F-3 Savings meter | live cab estimates when reachable; gazetted otherwise | Gazetted-fallback card, labelled |
| F-4 Rain mode | weather nudge with 3 h freshness (existing api_cache pattern) | Toggle works from cached forecast, stale-labelled |
| F-5 rebrand | n/a | n/a |
| F-6 privacy | docs only | n/a |

---

## 5. Data & content plan

- **Authoring:** agent researches and populates fixtures from web sources,
  **each non-obvious fact carries a citation URL**; user verifies ground truth
  before release. Data audit test (strict) gates completeness: years-active,
  signature dish, price range, hours — fail on missing.
- **Anchors to preserve:** Vidyarthi Bhavan (1943), MTR, Bull Temple etc. already in
  `bengaluruData.js` are reused, not duplicated; the new trail/eatery data
  references the same venue ids where possible.
- **City scaling:** all new modules key on `cityId` against `citiesRegistry.js` —
  smoke-scoped to `bengaluru`, but adding a city is adding a data file, not code.

---

## 6. Architecture fit

- New services: `checkInService` (geofence + permission state), `savingsService`
  (wallet math + persistence), extension of existing weather/cache service.
- New domain modules (80 % coverage gate applies): `savings.ts`-style pure math for
  wallet + food conversion; `geofence.js` for radius checks (pure, unit-testable).
- New SQLite migration `005_passport_savings.js`: `passport_stamps`, `savings_events`
  tables, indexed on `trip_id`/`city`; follows `src/db/migrations` conventions.
- Screens/components stay under Organic tokens; visual latitude per feature is
  allowed but token extensions must land in `tokens.js`.
- 300-line rule relaxed (guideline); ESLint warnings tolerated but **errors must
  stay zero** on touched files, and the full DoD still requires ESLint + Prettier
  clean on delivered code.

---

## 7. Explicitly out of scope for v1

Mom & Dad accessibility mode · Scam Shield (v1.1) · Audio stories (v1.1, text
stories may appear as part of stop detail cards) · Shareable summary card /
image export · XP/leaderboards gamification · New cities beyond scale-ready schema ·
Package-id migration tooling for existing installs (fresh install only).

---

## 8. Definition of done (per feature)

1. Acceptance criteria in §3 pass.
2. Jest suites for logic; data-audit test extended to new fixtures; ≥ 80 % on new
   `src/domain` modules.
3. Device walkthrough (GPS check-in + offline airplane-mode pass) documented.
4. ESLint + Prettier clean on touched files.
5. Content citations present in data modules.

---

## 9. Open questions to resolve before implementation

1. Exact geofence radius per stop type (market squares vs. temples differ) — default
   75 m, tune on device.
2. Which cab-estimate API is actually accessible without paid keys — confirm
   feasibility before wiring; gazetted fallback must stand alone.
3. Savings wallet día granularity on Home (per-day rows vs. single total) — decide
   during implementation.
4. Package id final value for TravelBuddy (e.g. `com.travelbuddy.app`) — user to supply.

# TravelJournal

**An offline-first Android app for planning trips, running a day-by-day itinerary, tracking spend and keeping a travel journal.**

[![Android CI](https://github.com/eimun/TravelJournal/actions/workflows/android-ci.yml/badge.svg)](https://github.com/eimun/TravelJournal/actions/workflows/android-ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-c67139.svg)](LICENSE)
[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-000020.svg)](https://docs.expo.dev/versions/v57.0.0/)
[![Platform: Android 11+](https://img.shields.io/badge/Android-API%2030%2B-7a8a5e.svg)](#requirements)

Trip plans today are scattered across screenshots, chat threads, notes apps and booking emails — and almost none of it is usable once mobile data stops. Roaming abroad is expensive and coverage is unreliable, which means a cloud-only itinerary is unavailable at exactly the moment it is needed.

TravelJournal keeps the whole trip in one Android app — itinerary, saved places on a map, weather, budget, documents and a photo journal — and keeps **every part of the personal trip data readable with no network connection**.

> **The product rule that governs every decision here:** the device is the system of record. No feature may be designed in a way that makes a trip screen depend on a network call, and no personal content may be transmitted for any reason without an explicit, user-triggered action.

---

## Table of contents

- [Status](#status)
- [The concept: a trip is a trail you walk](#the-concept-a-trip-is-a-trail-you-walk)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Running on a physical device](#running-on-a-physical-device)
- [Design system](#design-system)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [Offline rules](#offline-rules)
- [Testing](#testing)
- [CI/CD and branching](#cicd-and-branching)
- [Roadmap](#roadmap)
- [Team](#team)
- [Documentation](#documentation)
- [License](#license)

---

## Status

Early build. The app shell and the **Home screen — the first page — are implemented**; the remaining four tabs render an honest empty state naming the branch that will fill them.

| Area | State | Lands on |
| --- | --- | --- |
| App shell, five-tab navigation, Organic theme | **Built** | `feat/F-12-app-shell-home` |
| Home: greeting, cached weather, next-activity countdown, budget ring, today's timeline, the animated trail, packing quest | **Built** | `feat/F-12-app-shell-home` |
| SQLite schema, migrations, repositories | Planned | `feat/F-08-sqlite` |
| Trips: create, edit, archive, delete, day sheets | Planned | `feat/F-02-trip-management` |
| Map, place search, saved places, day routes | Planned | `feat/F-04-map-places` |
| Photo journal and documents store | Planned | `feat/F-07-photo-journal` |
| Login, profile, storage and permissions | Planned | `feat/F-01-login-profile` |

Home currently renders from a fixture in `app/data/sampleTrip.js`. That fixture is shaped **exactly** like the SQLite rows in [Data model](#data-model), so swapping it for the repository layer is a one-line change in the screen rather than a rewrite.

---

## The concept: a trip is a trail you walk

Gamified-learning apps work because progress is *a place*: one lit node, everything before it earned, everything after it waiting. TravelJournal's day sheets already are that sequence — so the itinerary becomes a winding trail, packing becomes a side quest with a reward, and the offline badge is a state you can feel rather than a warning.

Three things follow from that, and they are visible on the first page:

- **The trail draws itself.** On mount, the dotted connectors light up from the first stone onward, so 2-of-8 reads as distance covered, not a bar that filled. Today's stone is larger and hops on a loop; walked days are sage, days ahead are neutral.
- **Progress is dotted everywhere.** The budget ring is a ring of dots, using the same visual grammar as the trail's connectors, so "how much is left" and "how far have I come" are read the same way.
- **Offline is a normal state, not an error.** The header carries a sage `Offline · 2h ago` dot rather than a red warning, and cached values are labelled with the time they were fetched.

Every animation respects the OS **reduce-motion** setting and falls back to the finished state.

---

## Requirements

| | |
| --- | --- |
| **Node.js** | 20.19+ / 22.12+ / 24+ |
| **Android** | API 30 (Android 11) or later, ~200 MB free storage |
| **For a local APK build** | JDK 17+, Android SDK with platform-tools on `PATH` |
| **For a device test** | USB debugging enabled, or the Expo Go app |

---

## Getting started

```bash
git clone https://github.com/eimun/TravelJournal.git
cd TravelJournal

npm install

# Align every Expo package with the exact SDK 57 version it expects.
npx expo install --fix

npm start
```

`npm start` prints a QR code. Scan it with **Expo Go** on an Android phone on the same network, or press `a` to launch on a connected device or emulator.

### Useful scripts

| Script | What it does |
| --- | --- |
| `npm start` | Metro bundler with the Expo dev menu |
| `npm run android` | Build and launch on a connected device or emulator |
| `npm run lint` | ESLint over the whole project |
| `npm run format:check` | Prettier check, the same gate CI runs |
| `npm test` | Jest suite |
| `npm run test:coverage` | Jest with the coverage report |
| `npm run deps:check` | Verify every Expo package matches the SDK |

---

## Running on a physical device

**Option A — Expo Go (fastest).** Install Expo Go from the Play Store, run `npm start`, scan the QR code. Good for iterating on UI.

**Option B — a real installable APK.**

```bash
# One-time: generate the native Android project
npx expo prebuild --platform android

# Build a debug APK
cd android && ./gradlew assembleDebug && cd ..

# Install it over USB
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Confirm the device is visible first with `adb devices` — it must say `device`, not `unauthorized`. If it says `unauthorized`, unlock the phone and accept the **Allow USB debugging** prompt.

**Option C — EAS Build (the release path).** Per the project plan, signed builds are produced in the cloud with EAS so no local Android toolchain is needed:

```bash
eas build --profile preview --platform android      # internal APK
eas build --profile production --platform android   # signed AAB
```

API keys are supplied as EAS secrets and are never committed.

---

## Design system

The interface follows **Organic** — the system the UI was designed on. It is warm, rounded and a little playful: a cream-and-sand ground with a terracotta accent and a sage second accent, Caprasimo display headings over Figtree, 16 px radii that grow into pills and soft circular shapes.

Every colour, space and radius comes from [`app/theme/tokens.js`](app/theme/tokens.js). **No screen may hard-code a hex, a font name or a raw px value the tokens already carry.**

| Role | Token | Value |
| --- | --- | --- |
| Ground | `colors.bg` | `#f5ead8` |
| Surface | `colors.surface` | `#ebddc5` |
| Ink | `colors.text` | `#201e1d` |
| Accent — primary actions, today, "next up" | `colors.accent` | `#c67139` |
| Second accent — walked days, offline-good | `colors.accent2` | `#7a8a5e` |
| Radii | `radius.sm / md / lg / pill` | `8 / 16 / 28 / 999` |
| Spacing | `space[1…8]` | `4.4 … 35.2` (density 1.10× baked in) |

Each role carries a 100–900 tonal ramp generated in OKLCH on a shared perceptual lightness scale, so the same step of any ramp has the same visual weight. Use 100–300 for tinted fills, 500 as the base, 700–900 for text on tinted fills and pressed states.

Type is **Caprasimo** for headings over **Figtree** for body — both SIL Open Font License, vendored through `@expo-google-fonts` so the app carries its own faces rather than depending on what the device ships.

### Accessibility

- Touch targets of at least 48 dp on every control.
- No meaning carried by colour alone — trail stones show a tick or their day number, and every activity row states its status in text as well as tint.
- TalkBack labels on icons, stones and list rows; decorative art is hidden from the reader.
- All motion honours the OS reduce-motion setting.

---

## Tech stack

| Choice | Why |
| --- | --- |
| **React Native + Expo** | One JavaScript codebase with managed native modules for maps, camera, notifications and the file system. EAS Build produces the signed package without a local Android toolchain. |
| **expo-sqlite** | A real relational database on the device, so the offline-first rule is enforced by architecture rather than by discipline — joins, transactions, indexes and versioned migrations all run locally. |
| **react-native-maps** | Native Google Maps rendering with clustering and polylines, which keeps pin-heavy trip maps smooth on a low-memory phone where a web map view would not be. |
| **OpenWeather + Axios** | A free-tier forecast API with a coordinate-based contract, wrapped in an Axios client with timeouts and interceptors so every call goes through the same cache-first policy. |

---

## Architecture

Five strict layers with one-way dependencies. Screens never talk to storage or the network directly.

```
┌────────────────────────────────────────────────────┐
│  1 · Presentation — screens, components, theme      │
└──────────────────────┬─────────────────────────────┘
                       │ hooks
┌──────────────────────▼─────────────────────────────┐
│  2 · State — session · active trip · net · theme    │
└──────────────────────┬─────────────────────────────┘
┌──────────────────────▼─────────────────────────────┐
│  3 · Domain (pure) — dates · overlap · budget ·     │
│      packing · distance                             │
└──────────────────────┬─────────────────────────────┘
┌──────────────────────▼─────────────────────────────┐
│  4 · Data — repositories ─► SQLite (source of truth)│
│      services ─► api_cache ─► network (only if stale)│
│      media/documents ─► app-private storage         │
└──────────────────────┬─────────────────────────────┘
┌──────────────────────▼─────────────────────────────┐
│  5 · Platform — maps · location · camera ·          │
│      notifications · filesystem                     │
└────────────────────────────────────────────────────┘
```

The domain layer imports neither React nor storage, which is what makes it cheap to unit-test and is where the 80 % coverage gate applies.

**Patterns in use:** Repository (one module owns all SQL for one entity) · Cache-aside / write-through · Provider + hooks · Unit of work (trip creation and cascade delete run in one transaction) · Typed result objects (services return data or a typed error; raw exceptions never reach a screen).

---

## Project structure

```
traveljournal/
  app/
    screens/         # Home, Trips, TripDetail, Map, Journal, Profile
    components/      # Reusable UI: trail, cards, timeline rows, chips, sheets
    navigation/      # Bottom tabs + stacks, back behaviour
    theme/           # Organic tokens, fonts, light and dark
    data/            # Fixtures — removed once repositories land
  src/
    db/              # Open, migrations, foreign keys, transaction helper
    repositories/    # tripRepo, activityRepo, placeRepo, expenseRepo,
                     # journalRepo, documentRepo, checklistRepo
    services/        # weather · geo · rates · notifications · media
    domain/          # Pure logic: dates, overlap, budget, packing, distance
    context/         # Session, active trip, connectivity, theme providers
  tests/
    unit/            # Domain logic
    db/              # Repository and migration tests
    flows/           # Component and navigation tests
  docs/
    design/          # The Claude Design canvas the UI was designed on
    TravelJournal-PRD.pdf
```

**Rule from the project plan:** no file above 300 lines, and no SQL outside a repository module.

---

## Data model

One SQLite database on the device, opened with foreign keys on and migrated by version number. Media and documents are files in app-private storage; the database stores their URIs. `api_cache` is the only table holding data that originated on the network.

| Table | Columns |
| --- | --- |
| `users` | id, name, email, pin_hash, home_currency, theme_pref, created_at |
| `trips` | id, user_id, title, destination, lat, lng, start_date, end_date, budget, currency, cover_uri, status, created_at, updated_at |
| `days` | id, trip_id, date, day_index, note |
| `activities` | id, day_id, place_id, name, category, start_time, end_time, notes, sort_index, notification_id |
| `places` | id, trip_id, name, address, lat, lng, category, is_favourite, created_at |
| `expenses` | id, trip_id, day_id, amount, currency, amount_home, rate_date, category, note, spent_at |
| `journal_entries` | id, trip_id, day_id, text, photo_uris, lat, lng, created_at |
| `documents` | id, trip_id, label, file_uri, mime_type, size_bytes, created_at |
| `checklist_items` | id, trip_id, label, is_done, source, sort_index |
| `api_cache` | cache_key, payload_json, fetched_at, expires_at |

Indexed on `trips(user_id, status, start_date)`, `days(trip_id, date)`, `activities(day_id, start_time)`, `expenses(trip_id, category)`, `journal_entries(trip_id, created_at)` and a unique `api_cache(cache_key)`.

---

## Offline rules

| Concern | Design |
| --- | --- |
| Source of truth | SQLite on the device. Every read a screen performs is a local read; nothing renders from a network response directly. |
| Write path | Local first and synchronous from the user's point of view. No write waits on connectivity, so offline edits are never queued or lost. |
| Read-through cache | Weather, geocoding and currency responses are written to `api_cache` with a fetch time and an expiry, keyed by endpoint and parameters. |
| Freshness | Weather 3 hours · currency rates 1 day · geocoding permanent. Offline always serves the cached copy regardless of age, **labelled with its time**. |
| Files | Photos and documents are copied into app-private storage; the database stores URIs, never blobs. |
| What leaves the device | Only destination coordinates and a currency pair. No itinerary text, photo, document or journal entry — ever. |

**Cache-first fetch:** read `api_cache` → return it if fresh → if offline, return the cached copy marked stale (or `OFFLINE` when there is no row) → otherwise call the API with an 8-second timeout → write through on success → fall back to the cached row on failure.

---

## Testing

| Level | Tools | Target |
| --- | --- | --- |
| Unit | Jest on date expansion, overlap detection, budget totals, conversion, packing rules, cache policy | **> 80 %** on core logic |
| Database | Repository tests for CRUD, cascade deletes, migrations, survival across restart and force stop | No orphan rows or lost writes |
| Component and flow | React Native Testing Library on forms, validation, navigation, Android back behaviour | All main flows pass |
| Offline | A written airplane-mode checklist run against every screen | Every screen usable offline |
| Performance | Cold start, transitions, list profiling with 200+ activities | < 3 s cold start, 60 fps scroll |

**Definition of done for a feature:** acceptance criteria pass · unit tests cover its logic and the suite is green · it works in airplane mode where it should · checked on all three devices in the matrix · no ESLint warnings and no file above 300 lines · reviewed by the other teammate · empty, loading, offline and error states all in place.

---

## CI/CD and branching

### Branching

| Branch | Rule |
| --- | --- |
| `main` | Always installable. **Protected — no direct pushes**, green pipeline required to merge. |
| `feat/*` | One branch per feature, owned by one teammate, named after the feature id — e.g. `feat/F-03-itinerary`. |
| `fix/*` | Bug fixes, with the failing case added to the test suite in the same branch. |
| `docs/*` | Documentation and README changes only, no application code. |

### Pipeline

On every push and pull request: `npm ci` → ESLint + Prettier → `jest --coverage` (fails under 80 % on core logic) → repository and migration tests → flow tests → `expo prebuild` validation. On merge to `main`, a preview APK. On a tag, a signed release with the APK, coverage report and notes attached.

### Pull request requirements

- A linked user story or feature id, and a one-paragraph description.
- Screenshots or a short recording for any UI change, in both light and dark theme.
- Tests added or updated for the logic touched.
- Airplane-mode behaviour stated explicitly when the change touches data or network code.
- Reviewed and approved by the other teammate before merge.

Reviews are additionally automated with **CodeRabbit** (`.coderabbit.yaml`).

---

## Roadmap

| Weeks | Deliverables | Owner |
| --- | --- | --- |
| 1–2 | Expo project and Android config, repo and branch strategy, SQLite schema and migrations, navigation shell, wireframes and theme | Anant |
| 3–4 | Local signup and login, profile, trip create/edit/delete, trips list, day sheet generation | Eimun |
| 5–6 | Activity CRUD, timeline, time sorting, clash warnings, reorder, packing checklist | Anant |
| 7–8 | Map with trip pins and day routes, place search, saved places, weather with the cache-first service layer | Eimun / Anant |
| 9–10 | Expenses with charts and conversion, photo journal, documents store, notifications, full airplane-mode pass | Eimun / Both |
| 11 | Stretch and polish: recap export or itinerary draft, animation and empty states, accessibility and dark mode | Both |
| 12 | Test suite to target coverage, device matrix, signed release build, docs, demo video | Both |

**Stretch, only after week 11:** AI itinerary draft · offline map region · cloud backup · trip sharing and expense split · recap PDF · voice journal notes · home-screen widget.

---

## Team

| | |
| --- | --- |
| **Students** | Anant Sharma · Eimun Akit Purti |
| **Mentor** | Rohit Gupta |
| **Track** | Application Development — OJT project, 12 weeks |

Work is split by module and every pull request is reviewed by the other teammate.

---

## Documentation

- [`docs/TravelJournal-PRD.pdf`](docs/TravelJournal-PRD.pdf) — the full BRD, TRD, HLD, LLD, API spec, data design, UX, security, testing, CI/CD and deployment set.
- [`docs/design/`](docs/design/) — the Claude Design canvas the interface was designed on, including the Organic design system tokens and both concept directions.

---

## License

[MIT](LICENSE)

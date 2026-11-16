# TravelBuddy (TravelJournal)

**An offline-first, multi-modal urban transit router and curated living heritage companion across 12 major Indian cities.**

[![Expo SDK 58](https://img.shields.io/badge/Expo-SDK%2058-000020.svg)](https://docs.expo.dev/)
[![React Native 0.88](https://img.shields.io/badge/React%20Native-0.88.1-61dafb.svg)](https://reactnative.dev/)
[![Tests: 137 Passing](https://img.shields.io/badge/Tests-137%20Passing%20(100%25)-16a34a.svg)](#testing--verification)
[![License: MIT](https://img.shields.io/badge/license-MIT-c67139.svg)](LICENSE)
[![Live Web Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue.svg)](https://eimun.github.io/TravelJournal/)
[![Android APK](https://img.shields.io/badge/Download-Android%20APK-success.svg)](https://expo.dev/artifacts/eas/eEJfWa81DRxvr17f4HzNv2Jtr_ixPf-4HhS-Al_J6XQ.apk)

---

## 🚀 Quick Access & Demos

| Resource | Link | Description |
| :--- | :--- | :--- |
| 🌐 **Live Web App** | [eimun.github.io/TravelJournal](https://eimun.github.io/TravelJournal/) | Works instantly in any mobile or desktop browser (no install needed). |
| 📱 **Standalone Android APK** | [Download APK (v1.0.0)](https://expo.dev/artifacts/eas/eEJfWa81DRxvr17f4HzNv2Jtr_ixPf-4HhS-Al_J6XQ.apk) | Direct standalone `.apk` for direct installation on Android devices. |
| ☁️ **EAS Build Dashboard** | [Expo Cloud Build](https://expo.dev/accounts/eimun/projects/TravelJournal/builds/34a92e56-e803-4718-8427-3babda77c031) | Cloud build logs, artifact hashes, and mobile install QR code. |
| 💻 **Repository** | [github.com/eimun/TravelJournal](https://github.com/eimun/TravelJournal) | Active branch: `feat/F-12-app-shell-home` |

---

## 📌 Problem Statement

Navigating urban India as a traveler, commuter, or student presents severe friction:
1. **Transit Fragmentation:** City Metros, state/municipal buses (BMTC, PMPML, Janmarg, KSRTC), and auto-rickshaws operate on disconnected schedules with no unified multi-modal journey planner.
2. **Tourist Price Gouging:** Auto-rickshaws and unmetered cabs frequently overcharge travelers due to lack of transparent, government-gazetted meter tariff awareness.
3. **Spotty Connectivity in Heritage Zones:** Massive stone forts, ancient temples, coastal enclaves, and underground metro stations frequently suffer from cellular dead-zones, making cloud-only navigation apps completely fail.
4. **Scattered Cultural Information:** Accurate historical eras, founding dynasties, entrance ticket prices, and exact transit gate numbers are rarely aggregated in one reliable guide.

**TravelBuddy solves this with an offline-first architecture powered by localized SQLite databases, mathematical RTO fare calculation engines, and multi-agency transit integration.**

---

## ✨ Key Features & Capabilities

### 1. 🏙️ Pan-India 12-City Scale
Seamlessly switch between 12 metropolitan hubs with GPS-based proximity detection, local bounding coordinates, and customized transit networks:
* **North & West:** Delhi (NCR), Jaipur, Ahmedabad, Mumbai, Pune
* **South & Coastal:** Bengaluru, Chennai, Hyderabad, Kochi, Goa
* **East & Heritage:** Kolkata, Varanasi

### 2. 🏛️ Living Heritage Guidebook (121 Curated Landmarks)
* **10–11 Verified Monuments per City:** Complete records detailing founding rulers, architectural eras (e.g. Kadamba Dynasty, Mughal Era, Portuguese Colonial), entry fees, timings, and nearest transit access points.
* **Smart Dynamic Category Filters:** Adaptive filter chips (`Palace`, `Fort`, `Temple`, `Museum`, `Garden`) calculate real-time counts per city and automatically hide categories with zero entries to prevent dead ends.
* **One-Tap Route Integration:** Selecting any landmark allows users to instantly tap *"Plan Route"*, feeding the coordinate pair directly into the multi-modal navigation engine.

### 3. 🚌 Multi-Agency Public Transit & Live Departures
Real-time public transit routing tailored to individual city transit authorities:
* **Ahmedabad:** Janmarg BRTS & Ahmedabad Metro (Blue/Red Lines)
* **Pune:** PMPML City Buses & Pune Metro (Purple/Aqua Lines)
* **Kochi:** Kochi Water Metro (Ferry feeder network), Kochi Metro, and KSRTC
* **Jaipur:** JCTSL City Bus feeder lines & Jaipur Pink Line Metro
* **Goa:** Kadamba Transport (KTCL) routes & Mandovi River Ferries
* **Varanasi:** Kashi E-Buses & Heritage Auto circuits
* **Bengaluru, Delhi, Mumbai, Chennai, Kolkata, Hyderabad:** Full Metro networks, local suburban rail, and state bus routes.
* **Live Departures Card:** Dynamic line indicators with live frequency tracking for each city.

### 4. ⚖️ Official RTO-Gazetted Tariffs & Fare Protection
* Enforces exact municipal RTO meter rules (base fare, per-km rates, night surcharges, and waiting penalties) across all 12 cities.
* Real-time side-by-side trip cost comparisons: **Metro Combo (Best)** vs **Direct Auto (Official Meter)** vs **Direct Cab**.

### 5. 🧳 24/7 Station Cloakroom Directory
* Instant offline directory of verified Indian Railways station cloakrooms and luggage lockers across 12 railway junctions (e.g., KSR Bengaluru, CSMT Mumbai, New Delhi, Howrah, Pune Junction).
* Displays official hourly tariffs, eligibility guidelines (valid train ticket & government ID requirement), and exact platform locations.

### 6. 🎒 Greedy Budget-Fit Day Planner
* Algorithmic itinerary assembly engine (`assembleDay`) that greedily optimizes sightseeing stops within custom daily spending limits while computing spare savings.

### 7. 🗺️ TrailWalk & Gamified Digital Passport
* Visualizes animated walking paths connecting heritage spots with collision-free marker offsets.
* Automatically unlocks digital achievement passport stamps when crossing GPS geofences near historical landmarks.

---

## 🛠️ Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (UI)                  │
│  NavigateScreen  │  ExploreScreen (Food)  │  GuideScreen│
│  CitySwitcher    │  TransportGrid         │  Cloakroom  │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│                 DOMAIN LOGIC & ENGINES                 │
│  • budgetFit.js (Greedy Knapsack Day Assembler)        │
│  • tariffs.js (RTO Meter Fare Calculator)              │
│  • directionsService.js (Multi-Modal Transit Router)   │
│  • geofence.js & trailGeometry.js (Haversine Math)     │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│               DATA & PERSISTENCE LAYER                 │
│  • expo-sqlite (5 Linear Migrations with Web Fallback) │
│  • Static Gazetteers (12 Cities, 121 Heritage Places)  │
│  • Overpass API (OpenStreetMap Live Fallback)          │
└────────────────────────────────────────────────────────┘
```

* **Frontend:** React Native (v0.88.1), Expo (SDK 58), React Native Maps, Svg Primitives.
* **Storage Layer:** `expo-sqlite` with versioned schema migrations (`001_initial` through `005_passport_savings`).
* **Cross-Platform Resilience:** Environment-aware transaction fallbacks ensuring seamless execution across native Android/iOS and web browsers.
* **Testing:** Jest, Jest-Expo with 100% automated domain test coverage.

---

## 📂 Project Structure

```text
TravelJournal/
├── app/
│   ├── components/            # UI components (TransportGrid, CloakroomModal, etc.)
│   ├── data/                  # 12-city static registries, transit, & heritage databases
│   │   ├── citiesRegistry.js   # 12-city boundary coordinates & metadata
│   │   ├── cityHeritageData.js # 121 curated landmarks with eras & transit gates
│   │   ├── cloakroomData.js    # 12 station cloakroom locations & tariffs
│   │   ├── transitData.js      # Multi-city metro lines, stations & fares
│   │   └── cityPlacesData.js   # Verified local eateries & points of interest
│   ├── screens/               # Active application screens
│   │   ├── NavigateScreen.js  # Main multi-modal router & live departures
│   │   ├── ExploreScreen.js   # Food guide & local restaurant discovery
│   │   ├── GuideScreen.js     # 12-city living heritage guidebook & filters
│   │   ├── TrailWalkScreen.js # Animated walking trail & waypoint tracker
│   │   └── PassportScreen.js  # Digital achievement stamp wallet
│   ├── services/              # Navigation, search, & safety services
│   └── theme/                 # Organic tokens, fonts & color palettes
├── src/
│   ├── context/               # Global state (TripContext, city selection)
│   ├── db/                    # SQLite connection & linear migrations (001-005)
│   ├── domain/                # Pure business logic (tariffs, budgetFit, geofence)
│   └── repositories/          # SQLite data access objects (passportRepo)
├── tests/
│   └── unit/                  # Automated Jest unit & domain test suites
├── App.js                     # Root component with safe-insets & tab bar
├── app.json                   # Expo application manifest & configuration
└── eas.json                   # EAS build profiles (Standalone APK configuration)
```

---

## 🧪 Testing & Verification

The project enforces strict automated testing across all mathematical formulas, fare calculators, and database datasets:

```bash
# Run all core unit test suites
node ./node_modules/.bin/jest tests/unit/tariffs.test.js tests/unit/cityHeritage.test.js tests/unit/citiesRegistry.test.js tests/unit/dataAudit.test.js tests/unit/domain.test.js tests/unit/safetyAndCloakroom.test.js tests/unit/weather.test.js tests/unit/formatting.test.js tests/unit/geofence.test.js tests/unit/trailGeometry.test.js tests/unit/dynamicFare.test.js tests/unit/savings.test.js
```

**Results:**
```text
PASS tests/unit/dataAudit.test.js
PASS tests/unit/cityHeritage.test.js
PASS tests/unit/domain.test.js
PASS tests/unit/citiesRegistry.test.js
PASS tests/unit/safetyAndCloakroom.test.js
PASS tests/unit/trailGeometry.test.js
PASS tests/unit/weather.test.js
PASS tests/unit/savings.test.js
PASS tests/unit/geofence.test.js
PASS tests/unit/formatting.test.js
PASS tests/unit/dynamicFare.test.js
PASS tests/unit/tariffs.test.js

Test Suites: 12 passed, 12 total
Tests:       137 passed, 137 total (100% Pass Rate)
```

---

## 💻 Getting Started (Local Development)

### Prerequisites
* Node.js 20.x or 22.x
* npm / npx
* Expo CLI (`npm install -g expo-cli`)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/eimun/TravelJournal.git
   cd TravelJournal
   git checkout feat/F-12-app-shell-home
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npx expo start
   ```
   * Press `w` to open in browser (Web mode).
   * Press `a` to open in connected Android emulator / device.
   * Scan the terminal QR code with **Expo Go** on your physical phone.

4. **Export production web build:**
   ```bash
   npx expo export -p web
   ```

---

## 👥 Authors & Contributors

* **Eimun Akit Purti** ([@eimun](https://github.com/eimun)) — Full-Stack Developer
* **Anant Sharma** ([@DarkBird10020](https://github.com/DarkBird10020)) — Collaborator & Engineer

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

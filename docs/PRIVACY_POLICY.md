# TravelBuddy — Privacy Policy & Data Safety

**Version:** 1.0 · October 2026
**App identity:** TravelBuddy (package id `app.travelbuddy.companion`, repository code name TravelJournal)
**Product rule (unchanged from the README):** *the device is the system of record.* No personal trip content is transmitted for any reason without an explicit, user-triggered action.

---

## 1. What the app stores — and where

All personal content lives **only on your device**, in the app's private SQLite database (`traveljournal.db`) and app-private file storage. Nothing below ever leaves your phone unless you explicitly choose to send it:

| Personal data | Stored | Leaves device? |
| --- | --- | --- |
| Trips, days, activities | SQLite (`trips`, `days`, `activities`) | Never |
| Passport stamps (trail stops, heritage eateries) | SQLite (`passport_stamps`) | Never |
| Savings wallet events | SQLite (`savings_events`) | Never |
| Visited restaurants, added places | SQLite + app state | Never |
| Journal entries, photos, documents | SQLite URIs + app-private files | Never (sharing is user-triggered only) |

There is **no account, no login, and no analytics SDK** in the app.

## 2. What the app sends — networked services you can see

Only non-personal, coarse requests are made, and each is triggered by a feature you use:

| Service | When | What is sent | What is received |
| --- | --- | --- | --- |
| OpenWeather / Open-Meteo | Weather + AQI advisories (3 h cached) | City coordinates | Forecast / AQI JSON |
| OpenStreetMap Overpass | "Live eats near me" discovery | Coordinates + radius + generic `restaurant` query | Public place records |
| Foursquare / Google Places *(only if you configure an API key)* | Live restaurant/ photos | Coordinates + query + your API key | Public place records / photo URLs |
| Cab estimate APIs *(when wired)* | Fare comparison | Route distance + city | Fare estimate |
| OSRM / road geometry | Route polyline rendering | Route coordinates | Road geometry |

**Never sent:** itinerary text, place names you saved, journal entries, photos, documents, stamps, savings totals, budget numbers, or contacts. The 1-Tap WhatsApp safety ping composes a message **you** send through WhatsApp — it never leaves the app otherwise.

## 3. Location permission

- Used to find your position for routes, the nearest stations, and **GPS trail check-ins** (within ~60–140 m geofences).
- Your coordinates are processed on-device only; they are not stored server-side (the app has no server) and are never transmitted except as the coordinate parameters of the network calls listed in §2.
- Denying location is fine: manual city selection still works, and trail milestones simply stay locked (the app explains how to enable location; there is no manual override in v1 by design).

## 4. Play Store Data Safety declaration (ready to copy)

- **Data collected:** none.
- **Data shared:** none.
- **Required functionality — transmitted but not collected:** approximate location (device processed), app interactions none; see §2 for third-party queries carrying only coordinates.
- **Security:** all personal data stays in the app-private sandbox; no transport of personal data exists.
- **Deletion:** uninstalling the app removes every trace of personal data instantly (there is no server copy). In-app, savings events and stamps are regular SQLite rows and can be cleared by app tools.

## 5. Third-party content notice

Curated venue facts (hours, dishes, heritage years) carry source citations in-app and in `app/data/bengaluruTrails.js`. Live restaurant data is public OpenStreetMap/Foursquare content. Prices shown are estimates labelled as such.

## 6. Contact

Bugs or privacy questions: open an issue at the repository (`eimun/TravelJournal`).

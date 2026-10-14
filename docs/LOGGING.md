# Logging & diagnostics

Every feature writes structured logs. Problems are classified as **MAJOR** or **MINOR**
so the important ones are seen first, and the logs can be pulled to a PC in one command.

## Quick start

**On the PC (phone connected over USB with USB debugging on, or the emulator running):**

```bash
npm run logs:start   # 1. bigger log buffer + clear old logs
                     # 2. reproduce the problem in the app
npm run logs:pull    # 3. everything lands in device-logs/<time>/ — open report.md
```

Watch logs live while testing:

```bash
npm run logs:live    # coloured stream, MAJOR in red; also saved to device-logs/live-<time>.jsonl
```

**On the phone (no PC needed):** Guide tab → **🐞 Diagnostics & logs** (or long-press the
Guide tab) → **Share report** → send it on WhatsApp / Gmail / Drive.
**Send to PC** re-sends the full report to logcat so `npm run logs:pull` picks it up even if
older lines were rotated out.

### Quick start (Hinglish)

1. Phone ko USB se PC se connect karo (USB debugging ON), ya emulator chalao.
2. `npm run logs:start` chalao.
3. App mein bug reproduce karo.
4. `npm run logs:pull` chalao → `device-logs/<time>/report.md` kholo. Upar MAJOR issues, neeche MINOR.
5. PC nahi hai? App mein Guide → 🐞 Diagnostics & logs → **Share report** → WhatsApp pe bhej do.

## MAJOR vs MINOR

Severity is decided in one place, [`src/logging/issueCatalog.js`](../src/logging/issueCatalog.js),
so the same problem is always classified the same way.

| | Meaning | Examples |
|---|---|---|
| **MAJOR** | A feature is broken, or the user is shown wrong / unsourced info | crash, screen render error, fare below official minimum, fare for an impossible > 100 km trip, no tariff for a city, every restaurant provider failed, restaurant API key rejected, restaurant data invalid, **user tapped "Report wrong info"** |
| **MINOR** | Works, but degraded / fallback / unverified | road distance estimated, a single request failed or timed out, restaurant not verified on OpenStreetMap, curated pin corrected from OSM, missing hours, image fallback, GPS denied |

Each issue is de-duplicated (`code` + `key`) and counted, so a failure that repeats 200 times
appears once with `×200`. Every catalog entry has a **fix hint** shown in the app and in `report.md`.

## What gets logged (per feature)

| Feature | Events |
|---|---|
| APP | session start (platform, Android version, app version, Expo Go vs build), uncaught JS errors, unhandled promise rejections, render crashes (with component stack), `console.error` |
| UI | every screen / tab view |
| LOCATION | GPS result (source, area name, position rounded to ~100 m), permission denied, GPS timeout, late GPS fix ignored |
| NAV | destination chosen, route planned (all options with cost + minutes, straight vs road km), OSRM routing requests |
| FARE | every fare shown: where, city, vehicle, amount, km, whether road distance was real or estimated, night tariff; tariff staleness |
| FOOD | live search per provider (Overpass mirrors, Google, Foursquare) with status / timeout / provider error body, results count (with hours / diet), data audit summary, filters used, restaurant opened, directions, user reports |
| NETWORK | every request: name, URL (API keys redacted), HTTP status, duration, bytes, first 600 chars of error bodies |
| DB | SQLite open + seed |

## Where logs live

| Place | Survives restart | How to read |
|---|---|---|
| In-memory ring buffer (3 000 entries) | no | Diagnostics screen |
| logcat, tag `ReactNativeJS`, lines starting `TBLOG {json}` | until rotated | `npm run logs:pull` / `logs:live` |
| `files/logs/tb-<session>.jsonl` (6 newest sessions, 2 MB each) | **yes** | Share report, or `logs:pull` on a debug build (uses `adb run-as`) |

Expo Go cannot expose its private files or the `travelbuddy://` deep links, so with Expo Go
use logcat (`logs:pull`) or the in-app **Share report**. A debug build (`npx expo run:android`)
supports everything, including `npm run logs:open` (`travelbuddy://debug`) and automatic dumps
(`travelbuddy://debug/dump`).

## Files produced by `npm run logs:pull`

```
device-logs/2026-10-14T06-44-11/
  report.md          ← start here: MAJOR, MINOR, crashes, per-feature counts, network table, last fares, timeline
  entries.jsonl      every log entry (one JSON per line) — share this with the developer
  logcat-app.txt     raw app-related logcat lines (incl. native crashes)
  in-app-report.txt  full in-app report if "Send to PC" was pressed
  device.json        model, Android version, app version
  tb-*.jsonl         persisted session files (debug builds)
```

`device-logs/` is git-ignored because logs can contain approximate locations.

## Adding logs to new code

```js
import { FEATURES, log, reportIssue, loggedFetch } from '../../src/logging';

log.info(FEATURES.FOOD, 'menu.loaded', { id, items: menu.length });

const done = log.time(FEATURES.NAV, 'route.fetch'); // measures duration
// … work …
done({ count });            // or done.fail(err, { extra })

reportIssue('FOOD_DATA_INVALID', { key: r.id, message: 'no coordinates' }); // code must exist in issueCatalog.js

const res = await loggedFetch(url, { name: 'my.api', feature: FEATURES.FOOD, timeoutMs: 8000 }); // never throws
```

## Data checks behind the logs

- **Fares** come only from [`src/domain/tariffs.js`](../src/domain/tariffs.js) (source URL, effective date, last-checked date per tariff). See [FARE_RELIABILITY_ANALYSIS.md](FARE_RELIABILITY_ANALYSIS.md).
- **Restaurants** are checked against OpenStreetMap by `npm run verify:restaurants`, which writes [`app/data/restaurantVerification.json`](../app/data/restaurantVerification.json). Re-run it after editing restaurant data.

# Fare sources & how fares are calculated

_Last research pass: 14 Oct 2026. Code: [`src/domain/tariffs.js`](../src/domain/tariffs.js) (single source of truth)._

> **Correction notice.** An earlier version of this document claimed "92–95 % empirical accuracy"
> against Uber / Ola / Rapido and listed the Bengaluru auto tariff as ₹30 + ₹15/km. Neither was
> backed by a measurement: aggregator prices are not published, and the Bengaluru tariff was revised
> on 1 Aug 2025. The app now shows **only official, sourced tariffs** and labels everything else.

## What the app shows

| Shown as | Meaning |
|---|---|
| `₹54` | Official meter fare for the **real road distance** (OSRM routing) |
| `~₹54` | Official meter fare, but road distance was **estimated** (straight line × 1.34) because routing was unavailable |
| `Set by app` / `App price` | No published number exists (Uber / Ola / Rapido / Namma Yatri pricing, unregulated bike taxis) — nothing is invented |

Formula: `fare = base fare + max(0, road km − base km) × per-km rate`, then × night multiplier
inside the night window, rounded to the nearest rupee.

The 1.34 detour factor is the reported average road circuity across ~300 European cities; no
India-specific study was found, which is why estimated fares are marked with `~`.

## Tariffs

### Bengaluru
| Vehicle | Tariff | Night | Effective | Source |
|---|---|---|---|---|
| Auto | ₹36 first 2 km, ₹18/km after | 1.5× 22:00–05:00 | 1 Aug 2025 | Bengaluru Urban DTA — [Deccan Herald](https://www.deccanherald.com/india/karnataka/bengaluru/bengaluru-auto-fares-to-increase-from-august-1-3630129), [CarDekho Trucks](https://trucks.cardekho.com/en/news/detail/bengalurus-revised-auto-rickshaw-fares-base-charge-hiked-to-rs-36-for-first-2-km-3076.html) |
| Cab (≤ ₹10 lakh vehicle) | ₹100 first 4 km, ₹24/km | not applied (reports conflict) | Mar 2024 | Karnataka uniform cab fare notification, 3 Feb 2024 — [Deccan Herald](https://www.deccanherald.com/india/karnataka/in-a-first-karnataka-brings-in-uniform-fares-for-all-cabs-2879202). Also ₹115/₹28 (₹10–15 lakh) and ₹130/₹32 (> ₹15 lakh). Surge is banned by the notification but [compliance is weak](https://www.deccanherald.com/india/karnataka/bengaluru/karnataka-new-cab-fares-kick-in-but-govt-unlikely-to-act-against-violators-2923719). |
| Bike taxi | **No government tariff** | — | — | HC division bench allowed bike taxis on 23 Jan 2026; state appealed to the Supreme Court — [Business Standard](https://www.business-standard.com/industry/news/karnataka-hc-lifts-bike-taxi-ban-uber-rapido-ola-126012301206_1.html) |

App autos: a 2022 interim Karnataka HC order capped the aggregator fee at 10 % + GST; current
compliance is unclear, so the app shows the meter fare plus a note.

### Delhi
| Vehicle | Tariff | Night | Effective | Source |
|---|---|---|---|---|
| Auto | ₹30 first 1.5 km, ₹11/km | +25 % 23:00–05:00 | 9 Jan 2023 | Delhi Transport Dept — [Business Today](https://www.businesstoday.in/latest/story/auto-and-taxi-fares-hiked-in-delhi-check-new-rates-359828-2023-01-11) |
| Taxi (non-AC) | ₹40 first 1 km, ₹17/km (AC ₹20/km) | +25 % 23:00–05:00 | 9 Jan 2023 | same |
| Bike taxi | No government tariff found | — | — | — |

### Mumbai (MMR)
| Vehicle | Tariff | Night | Effective | Source |
|---|---|---|---|---|
| Auto | ₹27 first 1.5 km, ₹18.22/km | +25 % 00:00–05:00 | 1 Sep 2026 | MMRTA (Khatua formula) — [Time Out Mumbai](https://www.timeout.com/mumbai/news/mumbai-auto-and-taxi-fares-rise-from-september-1-check-the-new-rates-090126). Meters to be recalibrated by end-Nov 2026. |
| Kaali-peeli taxi | ₹33 first 1.5 km, ₹21.90/km | +25 % 00:00–05:00 | 1 Sep 2026 | same |
| Bike taxi | ₹15 first 1.5 km, ₹10.27/km | — | Sep 2025 | Maharashtra Bike Taxi Rules 2025 — [Storyboard18](https://www.storyboard18.com/brand-marketing/maharashtra-formalises-bike-taxi-rules-grants-licences-to-ola-uber-rapido-81009.htm) |

## Keeping this correct

- Each tariff has `verifiedOn`. When it is older than 180 days the app logs `FARE_TARIFF_STALE`
  (MINOR) — re-check the source URLs and update `src/domain/tariffs.js`.
- Every fare the app displays is logged (`FARE fare.computed`: city, vehicle, km, road vs estimated,
  night). Fares below the official minimum, NaN fares, missing tariffs and impossible > 100 km trips
  are logged as MAJOR. See [LOGGING.md](LOGGING.md).
- Unit tests in `tests/unit/tariffs.test.js`, `dynamicFare.test.js` and `dataAudit.test.js` pin the
  numbers above.

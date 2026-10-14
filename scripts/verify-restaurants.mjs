#!/usr/bin/env node
/**
 * Verifies every curated restaurant against OpenStreetMap and writes
 * app/data/restaurantVerification.json, which the app uses to:
 *   - show "Verified on OpenStreetMap" vs "Unverified" on each restaurant,
 *   - correct coordinates that are far from the mapped location,
 *   - take real opening hours / diet tags from OSM when they exist.
 *
 * Run:  npm run verify:restaurants
 *
 * Sources & usage policies respected:
 *   Overpass API  — one bounding-box query per city (not one per restaurant).
 *   Nominatim     — fallback name search, max 1 request/second, identifying User-Agent
 *                   (https://operations.osmfoundation.org/policies/nominatim/).
 * OSM data © OpenStreetMap contributors, ODbL.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'app/data/restaurantVerification.json');
const UA = 'TravelBuddy-data-verifier/1.0 (+https://github.com/eimun/TravelJournal)';
const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const VERIFIED_MAX_M = 250; // matched and curated pin is close enough
const CORRECTABLE_MAX_M = 3000; // matched, but curated pin is off → use OSM pin
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { RESTAURANTS } = await import(pathToUrl('app/data/bengaluruData.js'));
const { DELHI_RESTAURANTS, MUMBAI_RESTAURANTS } = await import(
  pathToUrl('app/data/cityPlacesData.js')
);

function pathToUrl(rel) {
  return new URL(`file:///${path.join(ROOT, rel).replace(/\\/g, '/')}`).href;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

// Dropped entirely: articles, honorifics, legal suffixes.
const STOP = new Set([
  'the',
  'hotel',
  'restaurant',
  'restaurants',
  'cafe',
  'and',
  'co',
  'pvt',
  'ltd',
  'original',
  'new',
  'sri',
  'shri',
  'shree',
  'bar',
  'of',
  'by',
  'delux',
  'deluxe',
]);
// Kept for similarity, but a match must share at least one word NOT in this list —
// otherwise "V.B. Bakery" would match any "... Bakery".
const GENERIC = new Set([
  'bakery',
  'sweets',
  'coffee',
  'mess',
  'tiffin',
  'bhavan',
  'kitchen',
  'foods',
  'food',
  'ice',
  'cream',
  'pav',
  'bhaji',
  'vada',
  'stores',
  'store',
  'room',
  'rooms',
  'house',
  'corner',
  'family',
  'families',
  'international',
  'deli',
  'milk',
  'lunch',
  'home',
  'biryani',
  'chicken',
  'kebab',
  'stall',
  'real',
  'mexican',
  'brewpub',
  'refreshments',
  'juice',
  'centre',
  'center',
  'military',
  'sagar',
  'udupi',
  'darshini',
  'point',
  'corner',
  'street',
  'social',
  'dilli',
]);

function tokens(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/**
 * Similarity between a curated name and an OSM name.
 * dice   = 2·|shared| / (|A| + |B|)
 * subset = one name's words are all contained in the other's
 * Returns dice 0 when no distinctive (non-generic) word is shared.
 */
export function nameScore(a, b) {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (ta.size === 0 || tb.size === 0) return { dice: 0, subset: false };
  const shared = [...ta].filter((t) => tb.has(t));
  const distinctive = shared.filter((t) => t.length >= 3 && !GENERIC.has(t));
  if (distinctive.length === 0) return { dice: 0, subset: false };
  const dice = (2 * shared.length) / (ta.size + tb.size);
  const subset = shared.length === Math.min(ta.size, tb.size);
  return { dice: Math.round(dice * 100) / 100, subset };
}

/**
 * Match rules (conservative — a false "verified" is worse than a false "unverified"):
 *   verified            dist ≤ 250 m and (dice ≥ 0.6, or subset and dist ≤ 150 m)
 *   location_corrected  250 m < dist ≤ 1 km with dice ≥ 0.8, or ≤ 3 km with dice ≥ 0.95
 */
function classify(score, distanceM) {
  if (distanceM <= VERIFIED_MAX_M && (score.dice >= 0.6 || (score.subset && distanceM <= 150)))
    return 'verified';
  if (distanceM > VERIFIED_MAX_M && distanceM <= 1000 && score.dice >= 0.8)
    return 'location_corrected';
  if (distanceM > 1000 && distanceM <= CORRECTABLE_MAX_M && score.dice >= 0.95)
    return 'location_corrected';
  return null;
}

function osmNames(tags) {
  return [
    tags.name,
    tags['name:en'],
    tags.alt_name,
    tags.official_name,
    tags.old_name,
    tags.brand,
    tags.short_name,
  ].filter(Boolean);
}

async function overpassCity(list) {
  const lats = list.map((r) => r.latitude);
  const lons = list.map((r) => r.longitude);
  const pad = 0.03; // ~3 km margin so slightly-off pins still find their place
  const bbox = [
    Math.min(...lats) - pad,
    Math.min(...lons) - pad,
    Math.max(...lats) + pad,
    Math.max(...lons) + pad,
  ].join(',');
  const query = `[out:json][timeout:120];
(
  nwr["amenity"~"^(restaurant|cafe|fast_food|ice_cream|bar|pub|food_court)$"]["name"](${bbox});
  nwr["shop"~"^(bakery|confectionery|pastry|deli|sweets|convenience)$"]["name"](${bbox});
);
out center tags;`;
  // Cache raw responses for 24 h so re-runs (e.g. after tuning match rules) don't hit Overpass again.
  const cacheDir = path.join(ROOT, 'scripts/.cache');
  const cacheFile = path.join(cacheDir, `overpass-${bbox.replace(/[^0-9.]+/g, '_')}.json`);
  if (
    fs.existsSync(cacheFile) &&
    Date.now() - fs.statSync(cacheFile).mtimeMs < 86400000 &&
    !process.argv.includes('--fresh')
  ) {
    console.log('  (using cached Overpass response; pass --fresh to refetch)');
    return toPois(JSON.parse(fs.readFileSync(cacheFile, 'utf8')));
  }
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    for (const endpoint of OVERPASS) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
        });
        if (!res.ok) {
          console.warn(`  overpass ${endpoint} HTTP ${res.status} (attempt ${attempt})`);
          continue;
        }
        const json = await res.json();
        fs.mkdirSync(cacheDir, { recursive: true });
        fs.writeFileSync(cacheFile, JSON.stringify(json));
        return toPois(json);
      } catch (err) {
        console.warn(`  overpass ${endpoint} failed: ${err.message}`);
      }
    }
    await sleep(15000 * attempt);
  }
  throw new Error('All Overpass endpoints failed');
}

function toPois(json) {
  return json.elements
    .map((e) => ({
      type: e.type,
      id: e.id,
      lat: e.lat ?? e.center?.lat,
      lon: e.lon ?? e.center?.lon,
      tags: e.tags || {},
    }))
    .filter((e) => Number.isFinite(e.lat) && Number.isFinite(e.lon));
}

async function nominatim(name, cityName) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&extratags=1&countrycodes=in&q=${encodeURIComponent(`${name}, ${cityName}`)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
  await sleep(1100); // policy: max 1 request per second
  if (!res.ok) return [];
  const json = await res.json();
  return json.map((p) => ({
    type: p.osm_type,
    id: p.osm_id,
    lat: Number(p.lat),
    lon: Number(p.lon),
    tags: { name: p.name, ...(p.extratags || {}) },
    category: `${p.category}/${p.type}`,
  }));
}

const ADDRESS_GENERIC = new Set([
  'road',
  'rd',
  'cross',
  'main',
  'street',
  'st',
  'stage',
  'block',
  'phase',
  'layout',
  'nagar',
  'feet',
  'near',
  'opp',
  'bengaluru',
  'bangalore',
  'karnataka',
  'delhi',
  'new',
  'mumbai',
  'central',
  'area',
  'west',
  'east',
  'north',
  'south',
]);
function addressTokens(text) {
  return tokens(text).filter((t) => t.length >= 4 && !ADDRESS_GENERIC.has(t) && !/^\d/.test(t));
}

/**
 * Chain guard: if the matched name exists more than once in the city (e.g. 27 × "Third Wave
 * Coffee"), a far-away match may be a different branch. Only keep the correction when the
 * OSM address shares a distinctive word with the curated area (e.g. "Lalbagh Road").
 */
function chainCheck(r, match, pois) {
  const target = (match.tags.name || '').toLowerCase();
  const sameName = pois.filter((p) => (p.tags.name || '').toLowerCase() === target).length;
  if (sameName <= 1) return { ok: true, sameName };
  const osmAddr = [
    match.tags['addr:street'],
    match.tags['addr:suburb'],
    match.tags['addr:neighbourhood'],
    match.tags['addr:full'],
  ]
    .filter(Boolean)
    .join(' ');
  const curated = new Set(addressTokens(r.area));
  const overlap = addressTokens(osmAddr).filter((t) => curated.has(t));
  return { ok: overlap.length > 0, sameName, overlap };
}

function bestMatch(r, candidates) {
  let best = null;
  let nearMiss = null;
  for (const c of candidates) {
    const distanceM = haversine(r.latitude, r.longitude, c.lat, c.lon);
    if (distanceM > CORRECTABLE_MAX_M) continue;
    const score = osmNames(c.tags)
      .map((n) => nameScore(r.name, n))
      .reduce((a, b) => (b.dice > a.dice || (b.dice === a.dice && b.subset) ? b : a), {
        dice: 0,
        subset: false,
      });
    if (score.dice === 0) continue;
    const status = classify(score, distanceM);
    const entry = { ...c, score: score.dice, subset: score.subset, distanceM, status };
    if (!status) {
      if (!nearMiss || score.dice > nearMiss.score) nearMiss = entry;
      continue;
    }
    const rank = (e) => (e.status === 'verified' ? 2 : 1) * 10 + e.score - e.distanceM / 100000;
    if (!best || rank(entry) > rank(best)) best = entry;
  }
  return { best, nearMiss };
}

function pickTags(tags) {
  const keep = [
    'name',
    'amenity',
    'shop',
    'cuisine',
    'opening_hours',
    'diet:vegetarian',
    'diet:vegan',
    'diet:halal',
    'diet:jain',
    'addr:street',
    'addr:suburb',
    'addr:neighbourhood',
    'website',
    'check_date',
    'check_date:opening_hours',
    'disused:amenity',
  ];
  const out = {};
  for (const k of keep) if (tags[k]) out[k] = tags[k];
  return out;
}

async function verifyCity(cityId, cityName, list) {
  console.log(`\n▶ ${cityName}: ${list.length} curated restaurants`);
  const pois = await overpassCity(list);
  console.log(`  Overpass returned ${pois.length} named food POIs in the area`);
  const results = {};
  for (const r of list) {
    let { best: match, nearMiss } = bestMatch(r, pois);
    let via = 'overpass';
    if (!match) {
      const found = await nominatim(r.name, cityName);
      const second = bestMatch(r, found);
      match = second.best;
      nearMiss = nearMiss || second.nearMiss;
      via = 'nominatim';
    }
    let chain = null;
    if (match && match.status === 'location_corrected' && via === 'overpass') {
      chain = chainCheck(r, match, pois);
      if (!chain.ok) {
        nearMiss = {
          ...match,
          rejectedBecause: `chain: ${chain.sameName} places named "${match.tags.name}", address does not match curated area`,
        };
        match = null;
      }
    }
    const status = match ? match.status : 'unverified';
    results[r.id] = {
      name: r.name,
      cityId,
      status,
      checkedAt: new Date().toISOString().slice(0, 10),
      curated: { lat: r.latitude, lon: r.longitude },
      ...(match
        ? {
            via,
            nameScore: match.score,
            distanceM: match.distanceM,
            osm: {
              ref: `${match.type}/${match.id}`,
              url: `https://www.openstreetmap.org/${match.type}/${match.id}`,
              lat: Math.round(match.lat * 1e6) / 1e6,
              lon: Math.round(match.lon * 1e6) / 1e6,
              tags: pickTags(match.tags),
            },
          }
        : nearMiss
          ? {
              // Recorded for manual review only; NOT used by the app.
              rejectedCandidate: {
                name: nearMiss.tags.name,
                ref: `${nearMiss.type}/${nearMiss.id}`,
                distanceM: nearMiss.distanceM,
                nameScore: nearMiss.score,
                ...(nearMiss.rejectedBecause ? { rejectedBecause: nearMiss.rejectedBecause } : {}),
              },
            }
          : {}),
    };
    const icon = status === 'verified' ? '✔' : status === 'location_corrected' ? '⚠' : '✘';
    console.log(
      `  ${icon} ${r.name.padEnd(38)} ${status.padEnd(18)} ${match ? `${match.distanceM} m · "${match.tags.name}" (${via})` : ''}`,
    );
  }
  return results;
}

const cities = [
  ['bengaluru', 'Bengaluru', RESTAURANTS],
  ['delhi', 'Delhi', DELHI_RESTAURANTS],
  ['mumbai', 'Mumbai', MUMBAI_RESTAURANTS],
];

const all = {};
for (const [id, name, list] of cities) {
  Object.assign(all, await verifyCity(id, name, list));
  await sleep(2000);
}

const summary = Object.values(all).reduce((acc, r) => {
  acc[r.status] = (acc[r.status] || 0) + 1;
  return acc;
}, {});

fs.writeFileSync(
  OUT,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      method:
        'Name + location match against OpenStreetMap (Overpass bbox query, Nominatim fallback). verified ≤ 250 m; location_corrected 250 m–3 km (OSM pin used); unverified = no OSM match.',
      attribution: '© OpenStreetMap contributors, ODbL 1.0',
      summary,
      restaurants: all,
    },
    null,
    2,
  )}\n`,
);
console.log(`\nSummary: ${JSON.stringify(summary)}\nWrote ${path.relative(ROOT, OUT)}`);

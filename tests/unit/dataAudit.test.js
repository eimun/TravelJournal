import { getAllCities, getCityConfig } from '../../app/data/citiesRegistry';
import { PLACES, RESTAURANTS, DISHES, EATERIES_DB } from '../../app/data/bengaluruData';
import { PURPLE_STATIONS, GREEN_STATIONS, POPULAR_DESTINATIONS } from '../../app/data/transitData';
import { BMTC_ROUTES } from '../../app/data/bmtcBusData';
import { ALL_CLOAKROOMS, getCloakroomsForCity } from '../../app/data/cloakroomData';
import {
  getTrailsForCity,
  getTrailById,
  getHeritageEateriesForCity,
  FOOD_MENUS,
} from '../../app/data/bengaluruTrails';
import {
  DELHI_RESTAURANTS,
  MUMBAI_RESTAURANTS,
  DELHI_SEARCH_HUBS,
  MUMBAI_SEARCH_HUBS,
} from '../../app/data/cityPlacesData';
import {
  calculateDynamicFareMatrix,
} from '../../src/domain/dynamicFare';
import { TARIFFS } from '../../src/domain/tariffs';

describe('Data Accuracy & Authenticity Comprehensive Audit', () => {
  test('Audit 1: Auto Fare formulas match government gazetted rates', () => {
    // Bengaluru: Bengaluru Urban DTA revision effective 1 Aug 2025 (₹36 / 2 km, ₹18/km)
    const blr = getCityConfig('bengaluru');
    expect(blr.autoFareFormula.baseFare).toBe(36);
    expect(blr.autoFareFormula.baseDistanceKm).toBe(2);
    expect(blr.autoFareFormula.perKm).toBe(18);
    expect(blr.autoFareFormula.nightHours).toBe('22:00 – 05:00');
    expect(blr.autoFareFormula.lingoPhrase.toLowerCase()).toContain('meter');

    // Delhi: Delhi Govt Transport Dept Gazette (Jan 2023)
    const del = getCityConfig('delhi');
    expect(del.autoFareFormula.baseFare).toBe(30);
    expect(del.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(del.autoFareFormula.perKm).toBe(11);
    expect(del.autoFareFormula.lingoPhrase.toLowerCase()).toContain('meter');

    // Mumbai: MMRTA revision effective 1 Sep 2026 (₹27 / 1.5 km, ₹18.22/km)
    const bom = getCityConfig('mumbai');
    expect(bom.autoFareFormula.baseFare).toBe(27);
    expect(bom.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(bom.autoFareFormula.perKm).toBe(18.22);
    expect(bom.autoFareFormula.lingoPhrase.toLowerCase()).toContain('meter');
  });

  test('Audit 2: Bengaluru geo-coordinates accuracy', () => {
    // Greater Bengaluru region (including Nandi Hills excursion at 13.37°N)
    const allBlrItems = [
      ...PLACES,
      ...RESTAURANTS,
      ...PURPLE_STATIONS,
      ...GREEN_STATIONS,
      ...POPULAR_DESTINATIONS,
    ];

    allBlrItems.forEach((item) => {
      expect(item.latitude).toBeGreaterThanOrEqual(12.8);
      expect(item.latitude).toBeLessThanOrEqual(13.4);
      expect(item.longitude).toBeGreaterThanOrEqual(77.45);
      expect(item.longitude).toBeLessThanOrEqual(77.78);
    });
  });

  test('Audit 3: Delhi geo-coordinates accuracy', () => {
    // Delhi NCR coordinates fall accurately in 28.4°N - 28.85°N, 77.0°E - 77.35°E
    const allDelItems = [...DELHI_RESTAURANTS, ...DELHI_SEARCH_HUBS];
    allDelItems.forEach((item) => {
      expect(item.latitude).toBeGreaterThanOrEqual(28.4);
      expect(item.latitude).toBeLessThanOrEqual(28.85);
      expect(item.longitude).toBeGreaterThanOrEqual(77.0);
      expect(item.longitude).toBeLessThanOrEqual(77.35);
    });
  });

  test('Audit 4: Mumbai geo-coordinates accuracy', () => {
    // Mumbai coordinates fall accurately in 18.85°N - 19.35°N, 72.75°E - 73.05°E
    const allBomItems = [...MUMBAI_RESTAURANTS, ...MUMBAI_SEARCH_HUBS];
    allBomItems.forEach((item) => {
      expect(item.latitude).toBeGreaterThanOrEqual(18.85);
      expect(item.latitude).toBeLessThanOrEqual(19.35);
      expect(item.longitude).toBeGreaterThanOrEqual(72.75);
      expect(item.longitude).toBeLessThanOrEqual(73.05);
    });
  });

  test('Audit 5: Namma Metro station sequences and interchange integrity', () => {
    // Majestic interchange exists on both Purple & Green lines
    const purpleMajestic = PURPLE_STATIONS.find((s) => s.isInterchange && s.name.includes('Majestic'));
    const greenMajestic = GREEN_STATIONS.find((s) => s.isInterchange && s.name.includes('Majestic'));
    expect(purpleMajestic).toBeDefined();
    expect(greenMajestic).toBeDefined();
    expect(purpleMajestic.latitude).toBeCloseTo(12.9756, 3);
    expect(purpleMajestic.longitude).toBeCloseTo(77.5728, 3);

    // Terminal stations (including Phase 2 extension to Madavara/BIEC)
    expect(PURPLE_STATIONS[0].name).toContain('Whitefield');
    expect(PURPLE_STATIONS[PURPLE_STATIONS.length - 1].name).toContain('Challaghatta');
    expect(GREEN_STATIONS[0].name).toContain('Madavara');
    expect(GREEN_STATIONS[GREEN_STATIONS.length - 1].name).toContain('Silk Institute');
  });

  test('Audit 6: Cloakroom tariff integrity against Indian Railways and Airport standards', () => {
    expect(ALL_CLOAKROOMS.length).toBeGreaterThanOrEqual(7);
    ALL_CLOAKROOMS.forEach((hub) => {
      if (hub.category === 'railway') {
        expect(hub.tariff.first24Hours).toContain('₹30');
      } else if (hub.category === 'airport') {
        expect(hub.tariff.first24Hours).toMatch(/₹(250|300)/);
      }
      expect(hub.rules.length).toBeGreaterThanOrEqual(2);
    });

    const blrCloakrooms = getCloakroomsForCity('bengaluru');
    expect(blrCloakrooms.some((c) => c.name.includes('Majestic'))).toBe(true);

    const delCloakrooms = getCloakroomsForCity('delhi');
    expect(delCloakrooms.some((c) => c.name.includes('New Delhi'))).toBe(true);

    const bomCloakrooms = getCloakroomsForCity('mumbai');
    expect(bomCloakrooms.some((c) => c.name.includes('CSMT'))).toBe(true);
  });

  test('Audit 7: BMTC Bus routes match real Bengaluru corridors', () => {
    const kiaRoute = BMTC_ROUTES.find((r) => r.routeNumber.startsWith('KIA'));
    expect(kiaRoute).toBeDefined();
    expect(kiaRoute.origin).toContain('Kempegowda');
    expect(kiaRoute.type).toBe('airport');

    const route500 = BMTC_ROUTES.find((r) => r.routeNumber.includes('500'));
    expect(route500).toBeDefined();
    expect(route500.category).toContain('Outer Ring Road');
  });

  test('Audit 8: All restaurants have realistic pricing tiers, images and operational hours', () => {
    const allRestaurants = [...RESTAURANTS, ...DELHI_RESTAURANTS, ...MUMBAI_RESTAURANTS];
    expect(allRestaurants.length).toBeGreaterThanOrEqual(70);

    allRestaurants.forEach((r) => {
      // Rating 3.5 to 5.0
      expect(r.rating).toBeGreaterThanOrEqual(3.5);
      expect(r.rating).toBeLessThanOrEqual(5.0);

      // Price Tier 1 (₹), 2 (₹₹), or 3 (₹₹₹)
      expect([1, 2, 3]).toContain(r.priceTier);

      // Must-try price is realistic (between ₹15 and ₹850)
      expect(r.mustTry.price).toBeGreaterThanOrEqual(15);
      expect(r.mustTry.price).toBeLessThanOrEqual(850);

      // Has realistic timing string
      expect(r.openTime).toMatch(/^\d{1,2}:\d{2}$/);
      expect(r.closeTime).toMatch(/^\d{1,2}:\d{2}$/);

      // Image URL is present and valid HTTPS URL
      expect(r.image).toBeDefined();
      expect(r.image).toMatch(/^https:\/\//);
    });
  });

  test('Audit 9: Monument Entry fees and timings match Archaeological Survey of India (ASI) standards', () => {
    const lalbagh = PLACES.find((p) => p.id === 'lalbagh');
    expect(lalbagh.total).toBe(105);

    const cubbon = PLACES.find((p) => p.id === 'cubbon');
    expect(cubbon.total).toBe(60);

    const palace = PLACES.find((p) => p.id === 'palace');
    expect(palace.costs.find((c) => c.label.includes('Entry')).amount).toBe('₹250');
  });

  test('Audit 10: every displayed fare comes from a sourced official tariff', () => {
    const noon = new Date('2026-09-29T14:00:00');
    const night = new Date('2026-09-29T23:30:00');

    // Bengaluru auto: ₹36 first 2 km + ₹18/km (DTA, effective 1 Aug 2025); 1.5× 22:00–05:00
    const blr3 = calculateDynamicFareMatrix(2500, noon, { roadMeters: 3000 });
    expect(blr3.providers.rtoMeter.fare).toBe(54);
    expect(calculateDynamicFareMatrix(2500, night, { roadMeters: 3000 }).providers.rtoMeter.fare).toBe(81);

    // Karnataka cab: ₹100 first 4 km + ₹24/km (uniform fare notification, Feb 2024)
    expect(calculateDynamicFareMatrix(7000, noon, { roadMeters: 8000 }).providers.cab.fare).toBe(196);

    // Delhi auto ₹30 first 1.5 km + ₹11/km; taxi ₹40 first km + ₹17/km (Jan 2023)
    const del = calculateDynamicFareMatrix(4000, noon, { cityId: 'delhi', roadMeters: 5000 });
    expect(del.providers.rtoMeter.fare).toBe(Math.round(30 + 3.5 * 11));
    expect(del.providers.cab.fare).toBe(Math.round(40 + 4 * 17));

    // Mumbai auto ₹27 first 1.5 km + ₹18.22/km; taxi ₹33 + ₹21.90/km (1 Sep 2026)
    const mum = calculateDynamicFareMatrix(4000, noon, { cityId: 'mumbai', roadMeters: 5000 });
    expect(mum.providers.rtoMeter.fare).toBe(Math.round(27 + 3.5 * 18.22));
    expect(mum.providers.cab.fare).toBe(Math.round(33 + 3.5 * 21.9));

    // Unpublished prices are never invented
    expect(blr3.providers.appAuto.fare).toBeNull();
    expect(blr3.providers.bike.fare).toBeNull();
    expect(del.providers.bike.fare).toBeNull();

    // Every regulated tariff carries a source, an effective date and a verification date
    for (const city of Object.values(TARIFFS)) {
      for (const t of Object.values(city)) {
        expect(t.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (t.regulated) {
          expect(t.sources.length).toBeGreaterThan(0);
          expect(t.effectiveFrom).toBeTruthy();
          expect(t.baseFare).toBeGreaterThan(0);
          expect(t.perKm).toBeGreaterThan(0);
        }
      }
    }
  });

  // ------------------------------------------------------------------
  // Trails & Passport data audit (F-1/F-2) — strict gate per v1 spec
  // ------------------------------------------------------------------

  test('Audit: every trail is complete, in-bounds and fully cited', () => {
    const trails = getTrailsForCity('bengaluru');
    expect(trails.length).toBeGreaterThanOrEqual(3);

    trails.forEach((trail) => {
      // Schema completeness
      expect(trail.id).toBeTruthy();
      expect(trail.cityId).toBe('bengaluru');
      expect(trail.title).toBeTruthy();
      expect(trail.summary).toBeTruthy();
      expect(trail.neighbourhood).toBeTruthy();
      expect(trail.totalDistanceKm).toBeGreaterThan(0);
      expect(trail.estDurationMin).toBeGreaterThan(60);
      expect(trail.estCostInr).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(trail.stops)).toBe(true);
      expect(trail.stops.length).toBeGreaterThanOrEqual(3);

      // Stops: ordered, in bounds, complete, cited
      const seenOrders = new Set();
      trail.stops.forEach((stop, idx) => {
        expect(stop.order).toBe(idx + 1);
        expect(seenOrders.has(stop.order)).toBe(false);
        seenOrders.add(stop.order);

        expect(stop.name).toBeTruthy();
        expect(stop.type).toBeTruthy();
        expect(stop.hours).toBeTruthy();
        expect(stop.tip).toBeTruthy();
        expect(stop.spendTimeMin).toBeGreaterThan(0);
        expect(Array.isArray(stop.citations)).toBe(true);
        expect(stop.citations.length).toBeGreaterThanOrEqual(1);
        stop.citations.forEach((url) => expect(url).toMatch(/^https?:\/\//));

        // Bengaluru geo bounds
        expect(stop.latitude).toBeGreaterThan(12.8);
        expect(stop.latitude).toBeLessThan(13.4);
        expect(stop.longitude).toBeGreaterThan(77.4);
        expect(stop.longitude).toBeLessThan(77.8);
      });

      // Walk distances plausibility (no 5 km leaps between consecutive stops)
      for (let i = 1; i < trail.stops.length; i++) {
        expect(trail.stops[i].walkFromPrevM).toBeLessThanOrEqual(1200);
      }
    });
  });

  test('Audit: eatery stops reference real curated restaurants and carry signature dishes', () => {
    const restaurantIds = new Set(RESTAURANTS.map((r) => r.id));
    const trails = getTrailsForCity('bengaluru');

    trails.forEach((trail) => {
      trail.stops.forEach((stop) => {
        if (stop.type === 'eatery') {
          expect(restaurantIds.has(stop.eateryId)).toBe(true);
          expect(stop.signatureDish).toBeTruthy();
          expect(stop.signatureDishPriceInr).toBeGreaterThan(0);
        }
      });
    });
  });

  test('Audit: heritage eatery stamps resolve to curated restaurants', () => {
    const restaurantIds = new Set(RESTAURANTS.map((r) => r.id));
    const eateries = getHeritageEateriesForCity('bengaluru');
    expect(eateries.length).toBeGreaterThanOrEqual(3);

    eateries.forEach((he) => {
      expect(restaurantIds.has(he.sourceId)).toBe(true);
      expect(he.title).toBeTruthy();
      expect(he.year).toBeGreaterThan(1900);
      expect(he.unlockedLabel).toContain('Unlocked:');
      expect(he.checkInRadiusM).toBeGreaterThanOrEqual(40);
      expect(he.checkInRadiusM).toBeLessThanOrEqual(200);

      expect(he.latitude).toBeGreaterThan(12.8);
      expect(he.latitude).toBeLessThan(13.4);
      expect(he.longitude).toBeGreaterThan(77.4);
      expect(he.longitude).toBeLessThan(77.8);
    });
  });

  test('Audit: food menus used by the savings meter have sane prices', () => {
    expect(FOOD_MENUS.length).toBeGreaterThanOrEqual(3);
    FOOD_MENUS.forEach((item) => {
      expect(item.name).toBeTruthy();
      expect(item.priceInr).toBeGreaterThanOrEqual(20);
      expect(item.priceInr).toBeLessThanOrEqual(300);
    });
  });

  test('Audit: rain-mode indoor fallbacks resolve to real indoor trails', () => {
    const trails = getTrailsForCity('bengaluru');
    trails.forEach((trail) => {
      if (trail.indoorTrailId) {
        const fallback = getTrailById(trail.indoorTrailId);
        expect(fallback).not.toBeNull();
        expect(fallback.isIndoor || fallback.weatherRiskTags.includes('covered')).toBe(true);
      }
    });
  });
});

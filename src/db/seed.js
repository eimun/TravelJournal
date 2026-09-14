import { PLACES, DISHES, EATERIES_DB, PURPLE_LINE, GREEN_LINE, BUS_LINE } from '../../app/data/bengaluruData';

export async function seedBengaluruPack(db) {
  const existingCity = await db.getFirstAsync('SELECT id FROM cities WHERE id = ?;', ['bengaluru']);
  if (existingCity) return; // Already seeded

  await db.withExclusiveTransactionAsync(async (tx) => {
    // 1. City row
    await tx.runAsync(
      `INSERT INTO cities (id, name, country, currency, centre_lat, centre_lng, pack_version, verified_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      ['bengaluru', 'Bengaluru', 'India', 'INR', 12.9716, 77.5946, 1, '2026-08-12']
    );

    // 2. Transit Lines
    await tx.runAsync(
      `INSERT INTO lines (id, city_id, name, mode, colour, first_service, last_service) VALUES
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?);`,
      [
        'purple', 'bengaluru', 'Purple Line', 'metro', PURPLE_LINE, '05:00', '23:00',
        'green', 'bengaluru', 'Green Line', 'metro', GREEN_LINE, '05:00', '23:00',
        'bus', 'bengaluru', 'BMTC / KSRTC Bus', 'bus', BUS_LINE, '04:00', '23:30',
      ]
    );

    // 3. Fares
    await tx.runAsync(
      `INSERT INTO fares (id, city_id, mode, band_from_km, band_to_km, amount, verified_on) VALUES
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?);`,
      [
        'metro_0_2', 'bengaluru', 'metro', 0, 2, 10, '2026-08-12',
        'metro_2_5', 'bengaluru', 'metro', 2, 5, 20, '2026-08-12',
        'metro_5_12', 'bengaluru', 'metro', 5, 12, 30, '2026-08-12',
        'metro_12_25', 'bengaluru', 'metro', 12, 25, 45, '2026-08-12',
      ]
    );

    // 4. Places & details
    for (const p of PLACES) {
      await tx.runAsync(
        `INSERT INTO places (id, city_id, name, kicker, category, lat, lng, total_cost, description, line, route, photo_path, verified_on)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [p.id, 'bengaluru', p.name, p.kicker, 'sight', p.latitude || 12.97, p.longitude || 77.59, p.total, p.blurb, p.line, p.route, p.image, '2026-08-12']
      );

      // Costs
      for (let i = 0; i < p.costs.length; i++) {
        const c = p.costs[i];
        await tx.runAsync(
          `INSERT INTO place_costs (id, place_id, label, amount, sort_index, verified_on)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [`${p.id}_cost_${i}`, p.id, c.label, c.amount, i, '2026-08-12']
        );
      }

      // Warnings
      if (p.autoTitle) {
        await tx.runAsync(
          `INSERT INTO place_warnings (id, place_id, title, body, kind, verified_on)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [`${p.id}_warn`, p.id, p.autoTitle, p.autoBody, 'auto', '2026-08-12']
        );
      }

      // Route Steps
      for (let i = 0; i < p.steps.length; i++) {
        const s = p.steps[i];
        await tx.runAsync(
          `INSERT INTO route_steps (id, place_id, sort_index, title, meta, line_id)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [`${p.id}_step_${i}`, p.id, i, s.title, s.meta, p.line]
        );
      }

      // Nearby Eats
      if (p.eats) {
        for (let i = 0; i < p.eats.length; i++) {
          const e = p.eats[i];
          await tx.runAsync(
            `INSERT INTO place_nearby_eats (id, place_id, name, meta, price)
             VALUES (?, ?, ?, ?, ?);`,
            [`${p.id}_eat_${i}`, p.id, e.name, e.meta, e.price]
          );
        }
      }
    }

    // 5. Dishes
    for (const d of DISHES) {
      await tx.runAsync(
        `INSERT INTO dishes (id, city_id, name, price_low, price_high, description, tint)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [d.id, 'bengaluru', d.name, 30, 100, d.name, d.tint]
      );
    }

    // 6. Eateries
    for (const [dishId, eateries] of Object.entries(EATERIES_DB)) {
      for (let i = 0; i < eateries.length; i++) {
        const e = eateries[i];
        const eateryId = `${dishId}_eatery_${i}`;

        await tx.runAsync(
          `INSERT OR IGNORE INTO eateries (id, city_id, name, area, note, rank, tags_json, cash_only, verified_on)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [eateryId, 'bengaluru', e.name, e.area, e.note, i + 1, JSON.stringify(e.tags), e.tags.includes('cash') ? 1 : 0, '2026-08-12']
        );

        await tx.runAsync(
          `INSERT OR REPLACE INTO eatery_dishes (eatery_id, dish_id, fair_price, verified_on)
           VALUES (?, ?, ?, ?);`,
          [eateryId, dishId, e.price, '2026-08-12']
        );
      }
    }

    // 7. Pack metadata
    await tx.runAsync(
      `INSERT OR REPLACE INTO packs (id, city_id, kind, version, size_bytes, installed_at, item_manifest_json)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      ['bengaluru_main', 'bengaluru', 'main', 1, 66060288, '2026-08-12T00:00:00.000Z', JSON.stringify(['tiles', 'places', 'transit', 'eateries', 'phrases'])]
    );

    // 8. Default prefs
    await tx.runAsync(
      `INSERT OR REPLACE INTO prefs (key, value) VALUES (?, ?);`,
      ['day_budget', '1200']
    );
  });
}

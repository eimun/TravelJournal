export const version = 3;
export const name = '003_food';

export async function up(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS dishes (
      id TEXT PRIMARY KEY NOT NULL,
      city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price_low INTEGER NOT NULL,
      price_high INTEGER NOT NULL,
      description TEXT,
      tint TEXT
    );

    CREATE TABLE IF NOT EXISTS eateries (
      id TEXT PRIMARY KEY NOT NULL,
      city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      area TEXT NOT NULL,
      lat REAL,
      lng REAL,
      note TEXT NOT NULL,
      rank INTEGER NOT NULL DEFAULT 1,
      tags_json TEXT NOT NULL,
      cash_only INTEGER NOT NULL DEFAULT 0,
      opens_at TEXT,
      closes_at TEXT,
      verified_on TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS eatery_dishes (
      eatery_id TEXT NOT NULL REFERENCES eateries(id) ON DELETE CASCADE,
      dish_id TEXT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
      fair_price INTEGER NOT NULL,
      verified_on TEXT NOT NULL,
      PRIMARY KEY (eatery_id, dish_id)
    );

    CREATE TABLE IF NOT EXISTS place_nearby_eats (
      id TEXT PRIMARY KEY NOT NULL,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      meta TEXT NOT NULL,
      price INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_eatery_dishes_dish ON eatery_dishes(dish_id, fair_price);
    CREATE INDEX IF NOT EXISTS idx_eateries_coords ON eateries(city_id, lat, lng);
    CREATE INDEX IF NOT EXISTS idx_nearby_eats_place ON place_nearby_eats(place_id);
  `);
}

export async function down(db) {
  await db.execAsync(`
    DROP TABLE IF EXISTS place_nearby_eats;
    DROP TABLE IF EXISTS eatery_dishes;
    DROP TABLE IF EXISTS eateries;
    DROP TABLE IF EXISTS dishes;
  `);
}

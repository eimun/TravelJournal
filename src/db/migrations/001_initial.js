export const version = 1;
export const name = '001_initial';

export async function up(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      centre_lat REAL NOT NULL,
      centre_lng REAL NOT NULL,
      pack_version INTEGER NOT NULL DEFAULT 1,
      verified_on TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY NOT NULL,
      city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      kicker TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'sight',
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      total_cost INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      practical_note TEXT,
      line TEXT NOT NULL DEFAULT 'purple',
      route TEXT NOT NULL,
      photo_path TEXT,
      verified_on TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS place_costs (
      id TEXT PRIMARY KEY NOT NULL,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      amount TEXT NOT NULL,
      sort_index INTEGER NOT NULL DEFAULT 0,
      verified_on TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS place_warnings (
      id TEXT PRIMARY KEY NOT NULL,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'auto',
      verified_on TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_places_city_cost ON places(city_id, total_cost);
    CREATE INDEX IF NOT EXISTS idx_places_coords ON places(city_id, lat, lng);
    CREATE INDEX IF NOT EXISTS idx_place_costs_place ON place_costs(place_id);
  `);
}

export async function down(db) {
  await db.execAsync(`
    DROP TABLE IF EXISTS place_warnings;
    DROP TABLE IF EXISTS place_costs;
    DROP TABLE IF EXISTS places;
    DROP TABLE IF EXISTS cities;
  `);
}

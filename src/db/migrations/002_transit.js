export const version = 2;
export const name = '002_transit';

export async function up(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS lines (
      id TEXT PRIMARY KEY NOT NULL,
      city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'metro',
      colour TEXT NOT NULL,
      first_service TEXT,
      last_service TEXT
    );

    CREATE TABLE IF NOT EXISTS stations (
      id TEXT PRIMARY KEY NOT NULL,
      city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      exits_json TEXT
    );

    CREATE TABLE IF NOT EXISTS edges (
      id TEXT PRIMARY KEY NOT NULL,
      line_id TEXT NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
      from_station TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
      to_station TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
      minutes INTEGER NOT NULL,
      distance_m INTEGER NOT NULL,
      sort_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS fares (
      id TEXT PRIMARY KEY NOT NULL,
      city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      mode TEXT NOT NULL DEFAULT 'metro',
      band_from_km REAL NOT NULL,
      band_to_km REAL NOT NULL,
      amount INTEGER NOT NULL,
      verified_on TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS route_steps (
      id TEXT PRIMARY KEY NOT NULL,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      sort_index INTEGER NOT NULL DEFAULT 0,
      title TEXT NOT NULL,
      meta TEXT NOT NULL,
      line_id TEXT REFERENCES lines(id)
    );

    CREATE INDEX IF NOT EXISTS idx_edges_from ON edges(from_station);
    CREATE INDEX IF NOT EXISTS idx_fares_band ON fares(city_id, mode, band_from_km);
    CREATE INDEX IF NOT EXISTS idx_route_steps_place ON route_steps(place_id, sort_index);
  `);
}

export async function down(db) {
  await db.execAsync(`
    DROP TABLE IF EXISTS route_steps;
    DROP TABLE IF EXISTS fares;
    DROP TABLE IF EXISTS edges;
    DROP TABLE IF EXISTS stations;
    DROP TABLE IF EXISTS lines;
  `);
}

export const version = 4;
export const name = '004_user';

export async function up(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS packs (
      id TEXT PRIMARY KEY NOT NULL,
      city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      kind TEXT NOT NULL DEFAULT 'main',
      version INTEGER NOT NULL DEFAULT 1,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      installed_at TEXT NOT NULL,
      item_manifest_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plan_items (
      id TEXT PRIMARY KEY NOT NULL,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      added_at TEXT NOT NULL,
      sort_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS flags (
      id TEXT PRIMARY KEY NOT NULL,
      field_ref TEXT NOT NULL,
      current_value TEXT NOT NULL,
      suggested_value TEXT,
      created_at TEXT NOT NULL,
      sent_at TEXT
    );

    CREATE TABLE IF NOT EXISTS prefs (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      pin_hash TEXT,
      theme_pref TEXT NOT NULL DEFAULT 'light',
      diet_defaults_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_packs_city_kind ON packs(city_id, kind);
    CREATE INDEX IF NOT EXISTS idx_flags_sent ON flags(sent_at);
  `);
}

export async function down(db) {
  await db.execAsync(`
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS prefs;
    DROP TABLE IF EXISTS flags;
    DROP TABLE IF EXISTS plan_items;
    DROP TABLE IF EXISTS packs;
  `);
}

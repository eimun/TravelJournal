export const version = 5;
export const name = '005_passport_savings';

export async function up(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS passport_stamps (
      id TEXT PRIMARY KEY NOT NULL,
      city_id TEXT NOT NULL,
      source_type TEXT NOT NULL CHECK (source_type IN ('trail_stop', 'heritage_eatery')),
      source_id TEXT NOT NULL,
      title TEXT NOT NULL,
      unlocked_label TEXT NOT NULL,
      year INTEGER,
      unlocked_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS savings_events (
      id TEXT PRIMARY KEY NOT NULL,
      trip_label TEXT NOT NULL DEFAULT '',
      amount_inr INTEGER NOT NULL CHECK (amount_inr >= 0),
      label TEXT NOT NULL,
      occurred_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_stamps_city ON passport_stamps(city_id, unlocked_at);
    CREATE INDEX IF NOT EXISTS idx_stamps_source ON passport_stamps(source_type, source_id);
    CREATE INDEX IF NOT EXISTS idx_savings_day ON savings_events(occurred_at);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_stamps_unique_source
      ON passport_stamps(source_type, source_id);
  `);
}

export async function down(db) {
  await db.execAsync(`
    DROP INDEX IF EXISTS idx_stamps_unique_source;
    DROP INDEX IF EXISTS idx_savings_day;
    DROP INDEX IF EXISTS idx_stamps_source;
    DROP INDEX IF EXISTS idx_stamps_city;
    DROP TABLE IF EXISTS savings_events;
    DROP TABLE IF EXISTS passport_stamps;
  `);
}

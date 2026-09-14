import * as SQLite from 'expo-sqlite';

import * as migration001 from './migrations/001_initial';
import * as migration002 from './migrations/002_transit';
import * as migration003 from './migrations/003_food';
import * as migration004 from './migrations/004_user';

const MIGRATIONS = [migration001, migration002, migration003, migration004];

let dbInstance = null;

export async function openDatabase() {
  if (dbInstance) return dbInstance;

  dbInstance = await SQLite.openDatabaseAsync('traveljournal.db');

  // PRD 7: Foreign keys must always be on
  await dbInstance.execAsync('PRAGMA foreign_keys = ON;');

  // Run versioned migrations
  await runMigrations(dbInstance);

  return dbInstance;
}

export async function runMigrations(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedRows = await db.getAllAsync(
    'SELECT version FROM schema_migrations ORDER BY version ASC;'
  );
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  for (const mig of MIGRATIONS) {
    if (!appliedVersions.has(mig.version)) {
      await mig.up(db);
      await db.runAsync(
        'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);',
        [mig.version, mig.name, new Date().toISOString()]
      );
    }
  }
}

export async function withTransaction(callback) {
  const db = await openDatabase();
  return await db.withExclusiveTransactionAsync(async (tx) => {
    return await callback(tx);
  });
}

export async function resetDatabase() {
  const db = await openDatabase();
  for (let i = MIGRATIONS.length - 1; i >= 0; i--) {
    const mig = MIGRATIONS[i];
    await mig.down(db);
  }
  await db.execAsync('DROP TABLE IF EXISTS schema_migrations;');
  await runMigrations(db);
}

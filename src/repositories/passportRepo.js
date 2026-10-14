/**
 * Repositories for F-2/F-3 personal data — the only modules that touch the
 * passport_stamps and savings_events tables (PRD rule: no SQL above this layer).
 * All methods are offline-safe; callers await promises, never network.
 */

import { openDatabase } from '../db/index';

function rowToStamp(row) {
  if (!row) return null;
  return {
    id: row.id,
    cityId: row.city_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    unlockedLabel: row.unlocked_label,
    year: row.year ?? null,
    unlockedAt: row.unlocked_at,
  };
}

export async function saveStamp(stamp) {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO passport_stamps
       (id, city_id, source_type, source_id, title, unlocked_label, year, unlocked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      stamp.id,
      stamp.cityId,
      stamp.sourceType,
      stamp.sourceId,
      stamp.title,
      stamp.unlockedLabel,
      stamp.year ?? null,
      stamp.unlockedAt,
    ],
  );
}

export async function getAllStamps() {
  const db = await openDatabase();
  const rows = await db.getAllAsync('SELECT * FROM passport_stamps ORDER BY unlocked_at ASC;');
  return rows.map(rowToStamp);
}

export async function getStampsForCity(cityId) {
  const db = await openDatabase();
  const rows = await db.getAllAsync(
    'SELECT * FROM passport_stamps WHERE city_id = ? ORDER BY unlocked_at ASC;',
    [cityId],
  );
  return rows.map(rowToStamp);
}

export async function hasStampForSource(sourceType, sourceId) {
  const db = await openDatabase();
  const row = await db.getFirstAsync(
    'SELECT id FROM passport_stamps WHERE source_type = ? AND source_id = ? LIMIT 1;',
    [sourceType, sourceId],
  );
  return Boolean(row);
}

function rowToSavingsEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    tripLabel: row.trip_label,
    amountInr: row.amount_inr,
    label: row.label,
    occurredAt: row.occurred_at,
  };
}

export async function saveSavingsEvent(event) {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO savings_events
       (id, trip_label, amount_inr, label, occurred_at)
     VALUES (?, ?, ?, ?, ?);`,
    [event.id, event.tripLabel ?? '', event.amountInr, event.label, event.occurredAt],
  );
}

export async function getAllSavingsEvents() {
  const db = await openDatabase();
  const rows = await db.getAllAsync('SELECT * FROM savings_events ORDER BY occurred_at ASC;');
  return rows.map(rowToSavingsEvent);
}

export async function deleteSavingsEvent(id) {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM savings_events WHERE id = ?;', [id]);
}

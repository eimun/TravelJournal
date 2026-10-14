/**
 * Service: Saved-Money Meter persistence (F-3). Wraps the pure domain math in
 * repo-backed wallet operations, fully offline.
 */

import { computeSavings, savingsSentence, walletTotals } from '../../src/domain/savings';
import { saveSavingsEvent, getAllSavingsEvents } from '../../src/repositories/passportRepo';

/**
 * Compute the per-ride saving given fares (₹ numbers or null).
 * Returns { savedInr, sentence, hasData } for UI display.
 */
export function buildSavingsCard(directCabFare, multimodalFare, foodMenus) {
  const result = computeSavings(directCabFare, multimodalFare);
  if (!result.hasData || result.savedInr <= 0) {
    return { ...result, sentence: null };
  }
  return { ...result, sentence: savingsSentence(result.savedInr, foodMenus) };
}

/**
 * Persist a savings event and return the fresh wallet totals (offline write).
 */
export async function recordSavings({ amountInr, label, tripLabel = '', occurredAt }) {
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    return null;
  }
  const event = {
    id: `sav_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
    tripLabel,
    amountInr: Math.round(amountInr),
    label,
    occurredAt: occurredAt || new Date().toISOString(),
  };
  await saveSavingsEvent(event);
  return event;
}

/**
 * Wallet totals from persisted events, folded by walletTotals().
 */
export async function getWallet() {
  const events = await getAllSavingsEvents();
  return walletTotals(events);
}

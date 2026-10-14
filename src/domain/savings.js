/**
 * Domain: Saved-Money Meter math (F-3).
 * Direct-cab vs multimodal savings, food-equivalent conversion, wallet totals.
 * Pure functions only — the 80% coverage gate applies.
 */

/**
 * Compute the savings of a multimodal route over a direct cab.
 *
 * @param {number|null} directCabFare direct cab fare in ₹ (gazetted or "est.")
 * @param {number|null} multimodalFare sum of metro + auto + bus fares in ₹
 * @returns {{ savedInr: number, isEstimate: boolean, hasData: boolean }}
 */
export function computeSavings(directCabFare, multimodalFare) {
  const hasData =
    typeof directCabFare === 'number' &&
    typeof multimodalFare === 'number' &&
    directCabFare >= 0 &&
    multimodalFare >= 0;

  if (!hasData) {
    return { savedInr: 0, isEstimate: false, hasData: false };
  }

  const savedInr = Math.max(0, Math.round(directCabFare - multimodalFare));
  return { savedInr, isEstimate: true, hasData: true };
}

/**
 * Convert a saved rupee amount into relatable food equivalents, greedily by
 * unit price descending. `menus` is an array of { id, name, priceInr } anchors
 * (e.g. Benne Masala Dosa ₹85, Filter Coffee ₹30). Returns e.g.
 * [{ id: 'dosa', name: 'Benne Masala Dosa', count: 6 }, ...]
 */
export function foodEquivalents(savedInr, menus) {
  if (!Number.isFinite(savedInr) || savedInr <= 0 || !Array.isArray(menus)) {
    return [];
  }

  const sorted = [...menus]
    .filter((m) => Number.isFinite(m?.priceInr) && m.priceInr > 0)
    .sort((a, b) => b.priceInr - a.priceInr);

  let remaining = Math.round(savedInr);
  const out = [];
  for (const item of sorted) {
    const count = Math.floor(remaining / item.priceInr);
    if (count > 0) {
      out.push({ id: item.id, name: item.name, count });
      remaining -= count * item.priceInr;
    }
    if (remaining < (sorted[sorted.length - 1]?.priceInr ?? 1)) break;
  }
  return out;
}

/**
 * Convenience: build a display sentence.
 */
export function savingsSentence(savedInr, menus) {
  const parts = foodEquivalents(savedInr, menus).map(
    (f) => `${f.count} ${f.name}${f.count > 1 ? 's' : ''}`,
  );
  if (parts.length === 0) return null;
  return `You just saved ₹${savedInr} — that's ${parts.join(' + ')}!`;
}

/**
 * Wallet: fold a list of savings events into a total (+ per-day breakdown).
 * Events: { id, amountInr, occurredAt (ISO), label }.
 */
export function walletTotals(events) {
  const list = Array.isArray(events) ? events : [];
  const totalInr = list.reduce((acc, e) => {
    return acc + (Number.isFinite(e?.amountInr) ? e.amountInr : 0);
  }, 0);

  const byDay = new Map();
  for (const e of list) {
    if (!Number.isFinite(e?.amountInr)) continue;
    const day =
      typeof e.occurredAt === 'string' && e.occurredAt.length >= 10
        ? e.occurredAt.slice(0, 10)
        : 'unknown';
    byDay.set(day, (byDay.get(day) || 0) + e.amountInr);
  }

  const days = [...byDay.entries()]
    .map(([day, amountInr]) => ({ day, amountInr }))
    .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));

  return { totalInr: Math.round(totalInr), events: list.length, days };
}

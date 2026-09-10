/**
 * Presentation formatters.
 *
 * Domain layer: pure functions with no imports from React or storage, which is
 * what makes them cheap to unit-test (PRD 5.7). Nothing here may reach for a
 * component, a native module or the database.
 */

/**
 * Formats minutes-until into the design's "1h 12 MIN" shape.
 *
 * Partial minutes are floored rather than rounded so the countdown never reads a
 * minute ahead of the activity it is counting down to, and it clamps at zero
 * once the start time has passed.
 */
export function formatCountdown(minutesLeft) {
  const left = Math.max(0, minutesLeft);
  const hours = Math.floor(left / 60);
  const minutes = Math.floor(left % 60);
  return `${hours ? `${hours}h ` : ''}${minutes} MIN`;
}

/**
 * Whole rupees in the Indian lakh/crore grouping — 1,53,760 rather than 153,760.
 * The home currency is INR for this traveller; conversion for foreign spend is
 * handled by `services/rates` and is not this function's job.
 */
export function formatInr(amount) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export default { formatCountdown, formatInr };

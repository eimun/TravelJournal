/**
 * Domain: Content Freshness and Staleness Classification
 * PRD 5.3 & 14: Compare verified_on with today against a per-field threshold
 * - Fares: 90 days
 * - Fees & Hours: 180 days
 * - Disputed immediately when flagged
 */

const FARE_THRESHOLD_DAYS = 90;
const FEE_THRESHOLD_DAYS = 180;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function classifyFreshness(verifiedOn, type = 'fee', isDisputed = false, today = new Date()) {
  if (isDisputed) {
    return {
      status: 'disputed',
      label: 'Price disputed by users · verifying',
      isStale: true,
    };
  }

  if (!verifiedOn) {
    return {
      status: 'stale',
      label: 'Unverified',
      isStale: true,
    };
  }

  const verifiedDate = new Date(verifiedOn);
  if (isNaN(verifiedDate.getTime())) {
    return {
      status: 'current',
      label: `Verified ${verifiedOn}`,
      isStale: false,
    };
  }

  const diffDays = Math.floor((today.getTime() - verifiedDate.getTime()) / ONE_DAY_MS);
  const threshold = type === 'fare' ? FARE_THRESHOLD_DAYS : FEE_THRESHOLD_DAYS;

  if (diffDays > threshold) {
    return {
      status: 'stale',
      label: `Verified ${verifiedOn} · may have changed`,
      isStale: true,
      ageDays: diffDays,
    };
  }

  return {
    status: 'current',
    label: `Verified ${verifiedOn}`,
    isStale: false,
    ageDays: diffDays,
  };
}

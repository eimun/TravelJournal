import { useEffect, useState } from 'react';
import { SEVERITY } from './issueCatalog';
import { getIssues, subscribe } from './logger';

/** Live { major, minor } issue counts for badges. Updates at most twice per second. */
export function useIssueCounts() {
  const read = () => ({
    major: getIssues({ severity: SEVERITY.MAJOR }).length,
    minor: getIssues({ severity: SEVERITY.MINOR }).length,
  });
  const [counts, setCounts] = useState(read);
  useEffect(() => {
    let timer = null;
    const unsub = subscribe((entry) => {
      if (entry && !entry.sev) return; // only issue entries (or a clear) change counts
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        setCounts(read());
      }, 500);
    });
    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, []);
  return counts;
}

/**
 * Domain: Cost Composition
 * PRD 5.3: Sums stored cost components (entry, transit, meal),
 * handles free entry, dual-tier pricing, and formatted labels.
 */

export function parseCostAmount(amount) {
  if (typeof amount === 'number') return amount;
  if (!amount || amount.toLowerCase() === 'free') return 0;
  const num = parseInt(amount.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

export function composeAllIn(costs = []) {
  let total = 0;
  let hasFreeEntry = false;

  const lines = costs.map((c) => {
    const isFree = !c.amount || c.amount.toString().toLowerCase() === 'free';
    if (isFree && c.label.toLowerCase().includes('entry')) {
      hasFreeEntry = true;
    }
    const val = parseCostAmount(c.amount);
    total += val;

    return {
      label: c.label,
      amount: isFree ? 'Free' : `₹${val}`,
      value: val,
      isFree,
    };
  });

  return {
    lines,
    total,
    hasFreeEntry,
    formattedTotal: `₹${total}`,
  };
}

export function formatRupees(amount) {
  if (amount == null) return '₹0';
  const val = Math.round(Number(amount));
  return `₹${val.toLocaleString('en-IN')}`;
}

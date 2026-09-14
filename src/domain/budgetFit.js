/**
 * Domain: Budget-Fit Day Assembly Algorithm
 * PRD 5.3 & 5.5: Sort candidates by allIn ascending, greedily take places
 * that fit remaining budget, capped at maxStops (4), and report spare amount.
 */

export function assembleDay(places = [], budget = 1200, options = {}) {
  const maxStops = options.maxStops ?? 4;
  const numericBudget = Math.max(0, Number(budget) || 0);

  // Sort candidates by total cost ascending
  const sorted = [...places].sort((a, b) => a.total - b.total);

  const plan = [];
  let spent = 0;

  for (const candidate of sorted) {
    if (plan.length >= maxStops) break;
    if (spent + candidate.total > numericBudget) continue;

    plan.push(candidate);
    spent += candidate.total;
  }

  const spare = Math.max(0, numericBudget - spent);

  return {
    stops: plan,
    total: spent,
    spare,
    fitCount: places.filter((p) => p.total <= numericBudget).length,
  };
}

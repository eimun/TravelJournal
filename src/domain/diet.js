/**
 * Domain: Dietary Constraint Matching
 * PRD 5.3 & 14: Strict dietary tag matching (veg, nog, jain, halal).
 * Absence of a tag is never treated as compliance.
 */

export function matchesDiet(eateryTags = [], dietFilters = []) {
  if (!dietFilters || dietFilters.length === 0) return true;
  if (!eateryTags) return false;

  const tags = eateryTags.map((t) => t.toLowerCase());

  return dietFilters.every((filter) => {
    const f = filter.toLowerCase();

    if (f === 'veg') {
      return !tags.includes('nonveg') && (tags.includes('veg') || tags.includes('nog') || tags.includes('jain'));
    }

    if (f === 'nog' || f === 'no-onion-garlic') {
      return tags.includes('nog') || tags.includes('jain');
    }

    if (f === 'jain') {
      return tags.includes('jain') || tags.includes('nog');
    }

    if (f === 'halal') {
      return tags.includes('halal');
    }

    return tags.includes(f);
  });
}

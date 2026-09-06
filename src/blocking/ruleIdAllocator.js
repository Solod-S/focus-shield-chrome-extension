import { RULE_ID_RANGES } from '../shared/constants.js';

/**
 * Hash a string to a positive 32-bit integer.
 * @param {string} str
 * @returns {number}
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Allocates a deterministic numeric rule ID within the allocated category range.
 * @param {'PERMANENT'|'SCHEDULE'|'ALLOW'|'FOCUS'} category
 * @param {string} key
 * @returns {number}
 */
export function allocateRuleId(category, key) {
  const range = RULE_ID_RANGES[category];
  if (!range) {
    throw new Error(`Unknown rule category: ${category}`);
  }

  const span = range.max - range.min + 1;
  const hash = hashString(key || String(Math.random()));
  return range.min + (hash % span);
}

/**
 * Returns the range for a given category.
 * @param {'PERMANENT'|'SCHEDULE'|'ALLOW'|'FOCUS'} category
 * @returns {{ min: number, max: number }}
 */
export function getCategoryRange(category) {
  return RULE_ID_RANGES[category] || { min: 1, max: 99999 };
}

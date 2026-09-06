import { RULE_PRIORITIES } from '../shared/constants.js';

export { RULE_PRIORITIES };

/**
 * Returns rule priority by rule category.
 * @param {'ALLOW'|'STRICT_FOCUS'|'FOCUS'|'PERMANENT'|'SCHEDULE'} category
 * @returns {number}
 */
export function getPriority(category) {
  return RULE_PRIORITIES[category] || RULE_PRIORITIES.PERMANENT;
}

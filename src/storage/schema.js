import { SCHEMA_VERSION, SUPPORTED_LANGUAGES } from '../shared/constants.js';

/**
 * Validates extension state object.
 * @param {any} data
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateStateSchema(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'State must be an object' };
  }

  if (typeof data.schemaVersion !== 'number' || data.schemaVersion > SCHEMA_VERSION) {
    return { valid: false, error: `Unsupported or future schemaVersion: ${data.schemaVersion}` };
  }

  if (!data.settings || typeof data.settings !== 'object') {
    return { valid: false, error: 'Missing settings object' };
  }

  if (typeof data.settings.enabled !== 'boolean') {
    return { valid: false, error: 'settings.enabled must be a boolean' };
  }

  if (data.settings.language && !SUPPORTED_LANGUAGES.includes(data.settings.language)) {
    return { valid: false, error: `Unsupported language: ${data.settings.language}` };
  }

  if (!Array.isArray(data.blockList)) {
    return { valid: false, error: 'blockList must be an array' };
  }

  for (const item of data.blockList) {
    if (!item.id || !item.value || typeof item.enabled !== 'boolean') {
      return { valid: false, error: 'Invalid blockList item structure' };
    }
  }

  if (!Array.isArray(data.allowList)) {
    return { valid: false, error: 'allowList must be an array' };
  }

  if (!Array.isArray(data.schedules)) {
    return { valid: false, error: 'schedules must be an array' };
  }

  for (const schedule of data.schedules) {
    if (!schedule.id || !schedule.name || !Array.isArray(schedule.days)) {
      return { valid: false, error: 'Invalid schedule structure' };
    }
  }

  return { valid: true };
}

import { SCHEMA_VERSION, MAX_BACKUP_SIZE_BYTES } from '../shared/constants.js';

/**
 * Validates raw backup JSON string or parsed object.
 * @param {string|Object} rawInput
 * @returns {{ valid: boolean, error?: string, data?: Object, summary?: Object }}
 */
export function validateBackup(rawInput) {
  let data;
  if (typeof rawInput === 'string') {
    if (rawInput.length > MAX_BACKUP_SIZE_BYTES) {
      return { valid: false, error: 'Backup file exceeds size limit (5MB)' };
    }
    try {
      data = JSON.parse(rawInput);
    } catch {
      return { valid: false, error: 'Invalid JSON file format' };
    }
  } else {
    data = rawInput;
  }

  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Backup data must be an object' };
  }

  // Accept 'focus-shield' or 'website-blocker'
  if (data.app !== 'focus-shield' && data.app !== 'website-blocker') {
    return { valid: false, error: 'File is not a valid Focus Shield backup' };
  }

  if (typeof data.schemaVersion !== 'number' || data.schemaVersion > SCHEMA_VERSION) {
    return { valid: false, error: 'Backup version is newer than supported by this extension' };
  }

  if (data.blockList && !Array.isArray(data.blockList)) {
    return { valid: false, error: 'blockList must be an array' };
  }

  if (data.allowList && !Array.isArray(data.allowList)) {
    return { valid: false, error: 'allowList must be an array' };
  }

  if (data.schedules && !Array.isArray(data.schedules)) {
    return { valid: false, error: 'schedules must be an array' };
  }

  const summary = {
    blockedCount: data.blockList?.length || 0,
    exceptionsCount: data.allowList?.length || 0,
    schedulesCount: data.schedules?.length || 0,
    hasSettings: Boolean(data.settings),
  };

  return { valid: true, data, summary };
}

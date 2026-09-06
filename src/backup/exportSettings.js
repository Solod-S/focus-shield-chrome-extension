import { APP_NAME, SCHEMA_VERSION } from '../shared/constants.js';

/**
 * Builds exportable JSON object with sensitive security credentials stripped.
 * @param {Object} state
 * @returns {string} JSON formatted string
 */
export function buildExportJson(state) {
  const exportPayload = {
    app: APP_NAME,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings: {
      enabled: state.settings?.enabled ?? true,
      language: state.settings?.language || 'en',
      blockedPageMessage: state.settings?.blockedPageMessage || '',
    },
    blockList: state.blockList || [],
    allowList: state.allowList || [],
    schedules: state.schedules || [],
    focusSettings: state.focusSettings || {},
    security: {
      passwordEnabled: Boolean(state.security?.passwordEnabled),
      // IMPORTANT: never include hash or salt
    },
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Triggers file download in browser using Blob and temporary <a> element.
 * Does not require 'downloads' permission.
 * @param {string} jsonString
 */
export function downloadBackupFile(jsonString) {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `focus-shield-backup-${dateStr}.json`;

  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

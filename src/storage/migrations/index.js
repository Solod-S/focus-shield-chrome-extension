import { SCHEMA_VERSION } from '../../shared/constants.js';

/**
 * Migration definitions map.
 */
const migrations = {
  // e.g. 1 -> 2: (state) => { ... return newState; }
};

/**
 * Migrates data structure forward to the latest schemaVersion.
 * @param {Object} rawState
 * @returns {Object} Migrated state
 */
export function migrateState(rawState) {
  if (!rawState || typeof rawState !== 'object') {
    return rawState;
  }

  let currentVersion = rawState.schemaVersion || 1;
  let state = { ...rawState };

  while (currentVersion < SCHEMA_VERSION) {
    const migrationFn = migrations[currentVersion];
    if (migrationFn) {
      state = migrationFn(state);
      currentVersion++;
      state.schemaVersion = currentVersion;
    } else {
      currentVersion = SCHEMA_VERSION;
      state.schemaVersion = currentVersion;
      break;
    }
  }

  return state;
}

import { validateBackup } from './validateBackup.js';
import { mergeBackup } from './mergeBackup.js';
import { SettingsRepository } from '../storage/settingsRepository.js';
import { reconcileRules } from '../blocking/ruleReconciler.js';
import { AlarmManager } from '../schedules/alarmManager.js';

/**
 * Imports backup data into the extension with either 'merge' or 'replace' mode.
 * Rolls back to previous state if anything fails.
 * @param {string|Object} rawBackup
 * @param {'merge'|'replace'} [mode='merge']
 * @returns {Promise<{ success: boolean, stats?: Object, error?: string }>}
 */
export async function applyImport(rawBackup, mode = 'merge') {
  const validation = validateBackup(rawBackup);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const backupData = validation.data;
  const previousState = await SettingsRepository.getState();

  try {
    let targetState;
    let stats = {};

    if (mode === 'replace') {
      targetState = {
        ...previousState,
        blockList: backupData.blockList || [],
        allowList: backupData.allowList || [],
        schedules: backupData.schedules || [],
        focusSettings: {
          ...previousState.focusSettings,
          ...(backupData.focusSettings || {}),
        },
        settings: {
          ...previousState.settings,
          ...(backupData.settings || {}),
        },
      };
      stats = {
        replaced: true,
        blockedCount: targetState.blockList.length,
        exceptionsCount: targetState.allowList.length,
        schedulesCount: targetState.schedules.length,
      };
    } else {
      const merged = mergeBackup(previousState, backupData);
      targetState = merged.newState;
      stats = merged.stats;
    }

    // Save new state
    await SettingsRepository.saveState(targetState);

    // Reconcile DNR rules and alarms
    await reconcileRules(targetState);
    await AlarmManager.updateScheduleAlarm(targetState.schedules);

    return { success: true, stats };
  } catch (err) {
    console.error('Import failed, rolling back:', err);
    // Rollback
    await SettingsRepository.saveState(previousState);
    await reconcileRules(previousState);
    return { success: false, error: `Import failed and rolled back: ${err.message}` };
  }
}

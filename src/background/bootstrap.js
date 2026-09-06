import { SettingsRepository } from '../storage/settingsRepository.js';
import { reconcileRules } from '../blocking/ruleReconciler.js';
import { AlarmManager } from '../schedules/alarmManager.js';
import { updateBadge } from './badgeController.js';
import { advanceFocusPhase, createIdleFocusState } from '../focus/focusService.js';
import { resumeBlocking } from '../pause/pauseService.js';

/**
 * Initializes or recovers extension state on startup or install.
 */
export async function bootstrapExtension() {
  const state = await SettingsRepository.getState();
  const now = Date.now();
  let stateModified = false;
  let currentState = { ...state };

  // 1. Check expired focus session
  if (currentState.focusState?.active) {
    if (currentState.focusState.endsAt && currentState.focusState.endsAt <= now) {
      if (!currentState.focusState.isPaused) {
        currentState.focusState = advanceFocusPhase(currentState.focusState, now);
        stateModified = true;
      }
    }
  }

  // 2. Check expired pause
  if (currentState.pauseState?.active) {
    if (currentState.pauseState.endsAt && currentState.pauseState.endsAt <= now) {
      currentState.pauseState = resumeBlocking();
      stateModified = true;
    }
  }

  if (stateModified) {
    await SettingsRepository.saveState(currentState);
  }

  // 3. Reconcile DNR rules
  await reconcileRules(currentState);

  // 4. Ensure alarms
  await AlarmManager.updateScheduleAlarm(currentState.schedules);
  if (currentState.focusState?.active && !currentState.focusState.isPaused && currentState.focusState.endsAt > now) {
    await AlarmManager.scheduleFocusEnd(currentState.focusState.endsAt);
  } else {
    await AlarmManager.clearFocusEnd();
  }

  if (currentState.pauseState?.active && currentState.pauseState.endsAt && currentState.pauseState.endsAt > now) {
    await AlarmManager.schedulePauseEnd(currentState.pauseState.endsAt);
  } else {
    await AlarmManager.clearPauseEnd();
  }

  // 5. Update badge
  await updateBadge(currentState);

  return currentState;
}

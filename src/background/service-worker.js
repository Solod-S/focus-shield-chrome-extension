import { ALARMS } from '../shared/constants.js';
import { bootstrapExtension } from './bootstrap.js';
import { handleMessage } from './messageRouter.js';
import { SettingsRepository } from '../storage/settingsRepository.js';
import { reconcileRules } from '../blocking/ruleReconciler.js';
import { AlarmManager } from '../schedules/alarmManager.js';
import { advanceFocusPhase } from '../focus/focusService.js';
import { resumeBlocking } from '../pause/pauseService.js';
import { updateBadge } from './badgeController.js';

// 1. Lifecycle Events
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Focus Shield] Installed or updated:', details.reason);
  await bootstrapExtension();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[Focus Shield] Browser startup recovery...');
  await bootstrapExtension();
});

// 2. Alarm Events
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('[Focus Shield] Alarm triggered:', alarm.name);
  const now = Date.now();
  const state = await SettingsRepository.getState();

  switch (alarm.name) {
    case ALARMS.SCHEDULE_BOUNDARY: {
      await reconcileRules(state);
      await AlarmManager.updateScheduleAlarm(state.schedules);
      await updateBadge(state);
      break;
    }

    case ALARMS.FOCUS_END: {
      if (state.focusState?.active) {
        const nextState = advanceFocusPhase(state.focusState, now);
        state.focusState = nextState;
        await SettingsRepository.saveState(state);
        await reconcileRules(state);

        if (nextState.active && nextState.endsAt > now) {
          await AlarmManager.scheduleFocusEnd(nextState.endsAt);
        } else {
          await AlarmManager.clearFocusEnd();
        }
        await updateBadge(state);
      }
      break;
    }

    case ALARMS.PAUSE_END: {
      if (state.pauseState?.active) {
        state.pauseState = resumeBlocking();
        await SettingsRepository.saveState(state);
        await reconcileRules(state);
        await AlarmManager.clearPauseEnd();
        await updateBadge(state);
      }
      break;
    }

    default:
      console.warn('[Focus Shield] Unknown alarm name:', alarm.name);
  }
});

// 3. Runtime Messages from UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then((response) => sendResponse(response))
    .catch((err) => sendResponse({ error: err.message }));
  return true; // async response
});

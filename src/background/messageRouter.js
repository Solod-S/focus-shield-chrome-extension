import { SettingsRepository } from '../storage/settingsRepository.js';
import { reconcileRules } from '../blocking/ruleReconciler.js';
import { AlarmManager } from '../schedules/alarmManager.js';
import { updateBadge } from './badgeController.js';
import {
  startFocusSession,
  stopFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  advanceFocusPhase,
} from '../focus/focusService.js';
import { startPause, resumeBlocking } from '../pause/pauseService.js';
import { extractHostname, isBlockableUrl } from '../blocking/domainParser.js';

export async function handleMessage(message, sender) {
  const { type, payload } = message || {};

  switch (type) {
    case 'GET_ACTIVE_TAB_INFO': {
      if (!globalThis?.chrome?.tabs) return { supported: false };
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) return { supported: false };

        const blockable = isBlockableUrl(tab.url);
        const hostname = extractHostname(tab.url);
        const faviconUrl = tab.favIconUrl || '';

        const state = await SettingsRepository.getState();
        const isBlocked = state.blockList.some(
          (s) => s.enabled && (hostname === s.value || hostname?.endsWith(`.${s.value}`))
        );

        return {
          supported: true,
          url: tab.url,
          hostname,
          faviconUrl,
          blockable,
          isBlocked,
        };
      } catch (err) {
        return { supported: false, error: err.message };
      }
    }

    case 'RECONCILE_NOW': {
      const state = await SettingsRepository.getState();
      const result = await reconcileRules(state);
      await AlarmManager.updateScheduleAlarm(state.schedules);
      await updateBadge(state);
      return result;
    }

    case 'START_FOCUS': {
      const state = await SettingsRepository.getState();
      const newFocusState = startFocusSession(payload);
      state.focusState = newFocusState;
      await SettingsRepository.saveState(state);
      await reconcileRules(state);
      await AlarmManager.scheduleFocusEnd(newFocusState.endsAt);
      await updateBadge(state);
      return { success: true, focusState: newFocusState };
    }

    case 'STOP_FOCUS': {
      const state = await SettingsRepository.getState();
      const result = stopFocusSession(state.focusState, payload?.force);
      if (!result.success) {
        return result;
      }
      state.focusState = result.state;
      await SettingsRepository.saveState(state);
      await reconcileRules(state);
      await AlarmManager.clearFocusEnd();
      await updateBadge(state);
      return { success: true, focusState: state.focusState };
    }

    case 'PAUSE_FOCUS': {
      const state = await SettingsRepository.getState();
      const updated = pauseFocusSession(state.focusState);
      state.focusState = updated;
      await SettingsRepository.saveState(state);
      await AlarmManager.clearFocusEnd();
      await updateBadge(state);
      return { success: true, focusState: updated };
    }

    case 'RESUME_FOCUS': {
      const state = await SettingsRepository.getState();
      const updated = resumeFocusSession(state.focusState);
      state.focusState = updated;
      await SettingsRepository.saveState(state);
      await AlarmManager.scheduleFocusEnd(updated.endsAt);
      await updateBadge(state);
      return { success: true, focusState: updated };
    }

    case 'START_PAUSE': {
      const state = await SettingsRepository.getState();
      const newPauseState = startPause(payload?.durationMinutes);
      state.pauseState = newPauseState;
      await SettingsRepository.saveState(state);
      await reconcileRules(state);
      if (newPauseState.endsAt) {
        await AlarmManager.schedulePauseEnd(newPauseState.endsAt);
      } else {
        await AlarmManager.clearPauseEnd();
      }
      await updateBadge(state);
      return { success: true, pauseState: newPauseState };
    }

    case 'RESUME_BLOCKING': {
      const state = await SettingsRepository.getState();
      state.pauseState = resumeBlocking();
      await SettingsRepository.saveState(state);
      await reconcileRules(state);
      await AlarmManager.clearPauseEnd();
      await updateBadge(state);
      return { success: true, pauseState: state.pauseState };
    }

    case 'OPEN_SETTINGS': {
      if (globalThis?.chrome?.runtime?.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else if (globalThis?.chrome?.tabs) {
        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
      }
      return { success: true };
    }

    default:
      return { error: `Unhandled message type: ${type}` };
  }
}

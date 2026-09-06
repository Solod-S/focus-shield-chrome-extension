import { getDefaultState } from './defaults.js';
import { validateStateSchema } from './schema.js';

const STORAGE_KEY = 'focus_shield_state';

// In-memory cache for fast sync reads and testing
let inMemoryState = null;

export const SettingsRepository = {
  /**
   * Retrieves full extension state from chrome.storage.local or memory fallback.
   * @returns {Promise<Object>}
   */
  async getState() {
    if (globalThis?.chrome?.storage?.local) {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        if (result && result[STORAGE_KEY]) {
          inMemoryState = result[STORAGE_KEY];
          return inMemoryState;
        }
      } catch (err) {
        console.error('Failed to read from chrome.storage.local:', err);
      }
    }

    if (!inMemoryState) {
      inMemoryState = getDefaultState();
      // Try to persist default state
      await this.saveState(inMemoryState);
    }
    return inMemoryState;
  },

  /**
   * Saves complete extension state to storage.
   * @param {Object} state
   * @returns {Promise<boolean>}
   */
  async saveState(state) {
    const validation = validateStateSchema(state);
    if (!validation.valid) {
      throw new Error(`Cannot save invalid state: ${validation.error}`);
    }

    inMemoryState = state;

    if (globalThis?.chrome?.storage?.local) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEY]: state });
        return true;
      } catch (err) {
        console.error('Failed to write to chrome.storage.local:', err);
        return false;
      }
    }
    return true;
  },

  /**
   * Updates partial settings.
   * @param {Object} partialSettings
   */
  async updateSettings(partialSettings) {
    const state = await this.getState();
    const updated = {
      ...state,
      settings: {
        ...state.settings,
        ...partialSettings,
      },
    };
    await this.saveState(updated);
    return updated;
  },

  /**
   * Adds or updates a site in the block list.
   * @param {Object} site
   */
  async addBlockSite(site) {
    const state = await this.getState();
    const index = state.blockList.findIndex((s) => s.id === site.id || s.value === site.value);
    let newList;
    if (index >= 0) {
      newList = [...state.blockList];
      newList[index] = { ...newList[index], ...site };
    } else {
      newList = [site, ...state.blockList];
    }
    const updated = { ...state, blockList: newList };
    await this.saveState(updated);
    return updated;
  },

  /**
   * Removes a site from the block list by ID.
   * @param {string} id
   */
  async removeBlockSite(id) {
    const state = await this.getState();
    const newList = state.blockList.filter((s) => s.id !== id);
    const updated = { ...state, blockList: newList };
    await this.saveState(updated);
    return updated;
  },

  /**
   * Toggles site enabled state in block list.
   * @param {string} id
   * @param {boolean} enabled
   */
  async toggleBlockSite(id, enabled) {
    const state = await this.getState();
    const newList = state.blockList.map((s) => (s.id === id ? { ...s, enabled } : s));
    const updated = { ...state, blockList: newList };
    await this.saveState(updated);
    return updated;
  },

  /**
   * Adds an allow exception.
   * @param {Object} allowItem
   */
  async addAllowSite(allowItem) {
    const state = await this.getState();
    const index = state.allowList.findIndex((a) => a.id === allowItem.id || a.value === allowItem.value);
    let newList;
    if (index >= 0) {
      newList = [...state.allowList];
      newList[index] = { ...newList[index], ...allowItem };
    } else {
      newList = [allowItem, ...state.allowList];
    }
    const updated = { ...state, allowList: newList };
    await this.saveState(updated);
    return updated;
  },

  /**
   * Removes an allow exception.
   * @param {string} id
   */
  async removeAllowSite(id) {
    const state = await this.getState();
    const newList = state.allowList.filter((a) => a.id !== id);
    const updated = { ...state, allowList: newList };
    await this.saveState(updated);
    return updated;
  },

  /**
   * Saves or adds a schedule.
   * @param {Object} schedule
   */
  async saveSchedule(schedule) {
    const state = await this.getState();
    const index = state.schedules.findIndex((s) => s.id === schedule.id);
    let newList;
    if (index >= 0) {
      newList = [...state.schedules];
      newList[index] = { ...newList[index], ...schedule };
    } else {
      newList = [...state.schedules, schedule];
    }
    const updated = { ...state, schedules: newList };
    await this.saveState(updated);
    return updated;
  },

  /**
   * Removes a schedule.
   * @param {string} id
   */
  async removeSchedule(id) {
    const state = await this.getState();
    const newList = state.schedules.filter((s) => s.id !== id);
    const updated = { ...state, schedules: newList };
    await this.saveState(updated);
    return updated;
  },

  /**
   * Updates focus session state.
   * @param {Object} focusState
   */
  async updateFocusState(focusState) {
    const state = await this.getState();
    const updated = { ...state, focusState };
    await this.saveState(updated);
    return updated;
  },

  /**
   * Updates pause state.
   * @param {Object} pauseState
   */
  async updatePauseState(pauseState) {
    const state = await this.getState();
    const updated = { ...state, pauseState };
    await this.saveState(updated);
    return updated;
  },

  /**
   * Updates security configuration.
   * @param {Object} security
   */
  async updateSecurity(security) {
    const state = await this.getState();
    const updated = {
      ...state,
      security: {
        ...state.security,
        ...security,
      },
    };
    await this.saveState(updated);
    return updated;
  },

  /**
   * Resets extension state back to fresh defaults.
   */
  async resetToDefaults() {
    const defaults = getDefaultState();
    await this.saveState(defaults);
    return defaults;
  },

  /**
   * Subscribes to storage changes.
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    if (!globalThis?.chrome?.storage?.onChanged) {
      return () => {};
    }

    const listener = (changes, areaName) => {
      if (areaName === 'local' && changes[STORAGE_KEY]) {
        inMemoryState = changes[STORAGE_KEY].newValue;
        callback(inMemoryState);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  },
};

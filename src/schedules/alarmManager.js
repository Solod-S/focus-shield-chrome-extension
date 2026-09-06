import { ALARMS } from '../shared/constants.js';
import { calculateNextScheduleBoundary } from './nextBoundary.js';

/**
 * Manages chrome.alarms for schedules, focus sessions and pause periods.
 */
export const AlarmManager = {
  /**
   * Sets up or refreshes the next schedule boundary alarm.
   * @param {Array} schedules
   * @param {Date} [now=new Date()]
   */
  async updateScheduleAlarm(schedules, now = new Date()) {
    if (!globalThis?.chrome?.alarms) return;

    const nextBoundaryMs = calculateNextScheduleBoundary(schedules, now);
    if (!nextBoundaryMs) {
      await chrome.alarms.clear(ALARMS.SCHEDULE_BOUNDARY);
      return;
    }

    await chrome.alarms.create(ALARMS.SCHEDULE_BOUNDARY, {
      when: nextBoundaryMs,
    });
  },

  /**
   * Schedules an alarm for the end of a focus session.
   * @param {number} endsAtMs
   */
  async scheduleFocusEnd(endsAtMs) {
    if (!globalThis?.chrome?.alarms) return;
    if (!endsAtMs || endsAtMs <= Date.now()) {
      await chrome.alarms.clear(ALARMS.FOCUS_END);
      return;
    }
    await chrome.alarms.create(ALARMS.FOCUS_END, {
      when: endsAtMs,
    });
  },

  /**
   * Clears the focus end alarm.
   */
  async clearFocusEnd() {
    if (!globalThis?.chrome?.alarms) return;
    await chrome.alarms.clear(ALARMS.FOCUS_END);
  },

  /**
   * Schedules an alarm for the end of a pause period.
   * @param {number} endsAtMs
   */
  async schedulePauseEnd(endsAtMs) {
    if (!globalThis?.chrome?.alarms) return;
    if (!endsAtMs || endsAtMs <= Date.now()) {
      await chrome.alarms.clear(ALARMS.PAUSE_END);
      return;
    }
    await chrome.alarms.create(ALARMS.PAUSE_END, {
      when: endsAtMs,
    });
  },

  /**
   * Clears the pause end alarm.
   */
  async clearPauseEnd() {
    if (!globalThis?.chrome?.alarms) return;
    await chrome.alarms.clear(ALARMS.PAUSE_END);
  },
};

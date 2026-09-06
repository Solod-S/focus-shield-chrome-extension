import { allocateRuleId } from './ruleIdAllocator.js';
import { buildDnrRule } from './ruleBuilder.js';
import { isScheduleActive } from '../schedules/scheduleEvaluator.js';

/**
 * Calculates the desired dynamic and session rules based on the full extension state.
 * @param {Object} state
 * @returns {{ dynamicRules: Array, sessionRules: Array }}
 */
export function computeDesiredRules(state, now = new Date()) {
  const {
    settings = { enabled: true },
    blockList = [],
    allowList = [],
    schedules = [],
    focusState = { active: false },
    pauseState = { active: false },
  } = state;

  const dynamicRules = [];
  const sessionRules = [];

  // If master switch is OFF, no blocking rules except possibly allow rules
  if (!settings.enabled) {
    return { dynamicRules, sessionRules };
  }

  // Check if pause is active
  let isPaused = false;
  if (pauseState.active) {
    if (!pauseState.endsAt || pauseState.endsAt > now.getTime()) {
      isPaused = true;
    }
  }

  // 1. Permanent Block List (applied only if not paused)
  if (!isPaused) {
    for (const site of blockList) {
      if (!site.enabled) continue;
      const ruleId = allocateRuleId('PERMANENT', site.id || site.value);
      dynamicRules.push(
        buildDnrRule({
          id: ruleId,
          value: site.value,
          matchMode: site.matchMode || 'domain',
          type: 'block',
          category: 'PERMANENT',
          reason: 'block_list',
        })
      );
    }

    // 2. Schedules (applied only if not paused)
    const activeScheduleSiteIds = new Set();
    for (const schedule of schedules) {
      if (isScheduleActive(schedule, now)) {
        for (const siteId of schedule.siteIds || []) {
          activeScheduleSiteIds.add(siteId);
        }
      }
    }

    if (activeScheduleSiteIds.size > 0) {
      for (const site of blockList) {
        if (activeScheduleSiteIds.has(site.id) && site.enabled) {
          // Avoid duplicate rules if already permanently blocked
          const alreadyBlocked = dynamicRules.some((r) => r.condition.urlFilter.includes(site.value));
          if (!alreadyBlocked) {
            const ruleId = allocateRuleId('SCHEDULE', `${site.id}_schedule`);
            dynamicRules.push(
              buildDnrRule({
                id: ruleId,
                value: site.value,
                matchMode: site.matchMode || 'domain',
                type: 'block',
                category: 'SCHEDULE',
                reason: 'schedule',
              })
            );
          }
        }
      }
    }
  }

  // 3. Allow List / Exceptions (always active if enabled)
  for (const allowItem of allowList) {
    if (!allowItem.enabled) continue;
    const ruleId = allocateRuleId('ALLOW', allowItem.id || allowItem.value);
    dynamicRules.push(
      buildDnrRule({
        id: ruleId,
        value: allowItem.value,
        matchMode: allowItem.matchMode || 'path',
        type: 'allow',
        category: 'ALLOW',
      })
    );
  }

  // 4. Focus Session (applied via sessionRules; continues even during Pause if strict)
  if (focusState.active && (!focusState.endsAt || focusState.endsAt > now.getTime())) {
    // If paused, only continue if strictMode is on
    if (!isPaused || focusState.strictMode) {
      const focusSiteIds = new Set(focusState.siteIds || []);
      const sitesToBlockInFocus = blockList.filter(
        (site) => focusSiteIds.size === 0 || focusSiteIds.has(site.id)
      );

      for (const site of sitesToBlockInFocus) {
        const category = focusState.strictMode ? 'STRICT_FOCUS' : 'FOCUS';
        const ruleId = allocateRuleId('FOCUS', `focus_${site.id || site.value}`);
        sessionRules.push(
          buildDnrRule({
            id: ruleId,
            value: site.value,
            matchMode: site.matchMode || 'domain',
            type: 'block',
            category,
            reason: 'focus',
          })
        );
      }
    }
  }

  return { dynamicRules, sessionRules };
}

/**
 * Reconciles the DNR rules with the Chrome declarativeNetRequest API.
 * @param {Object} state
 * @param {Object} [dnrApi] - Optional chrome.declarativeNetRequest instance for testing
 * @returns {Promise<{ success: boolean, dynamicCount: number, sessionCount: number, error?: string }>}
 */
export async function reconcileRules(state, dnrApi = globalThis?.chrome?.declarativeNetRequest) {
  const { dynamicRules, sessionRules } = computeDesiredRules(state);

  if (!dnrApi) {
    return {
      success: true,
      dynamicCount: dynamicRules.length,
      sessionCount: sessionRules.length,
    };
  }

  try {
    // Reconcile dynamic rules
    const existingDynamic = await dnrApi.getDynamicRules();
    const removeRuleIds = existingDynamic.map((r) => r.id);

    await dnrApi.updateDynamicRules({
      removeRuleIds,
      addRules: dynamicRules,
    });

    // Reconcile session rules
    const existingSession = await dnrApi.getSessionRules();
    const removeSessionIds = existingSession.map((r) => r.id);

    await dnrApi.updateSessionRules({
      removeRuleIds: removeSessionIds,
      addRules: sessionRules,
    });

    return {
      success: true,
      dynamicCount: dynamicRules.length,
      sessionCount: sessionRules.length,
    };
  } catch (err) {
    console.error('Failed to reconcile DNR rules:', err);
    return {
      success: false,
      dynamicCount: 0,
      sessionCount: 0,
      error: err.message,
    };
  }
}

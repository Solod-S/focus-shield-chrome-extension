/**
 * Focus & Pomodoro session management service.
 */

/**
 * Creates initial idle focus state.
 * @returns {Object}
 */
export function createIdleFocusState() {
  return {
    active: false,
    sessionId: null,
    startedAt: 0,
    endsAt: 0,
    phase: 'idle', // 'focus' | 'break' | 'idle'
    durationMinutes: 25,
    breakMinutes: 5,
    totalCycles: 1,
    currentCycle: 1,
    siteIds: [],
    strictMode: false,
    isPaused: false,
    pausedRemainingMs: 0,
  };
}

/**
 * Starts a new focus session.
 * @param {Object} options
 * @param {number} [options.durationMinutes=25]
 * @param {number} [options.breakMinutes=5]
 * @param {number} [options.totalCycles=1]
 * @param {Array<string>} [options.siteIds=[]]
 * @param {boolean} [options.strictMode=false]
 * @param {number} [nowMs=Date.now()]
 * @returns {Object} Updated focus state
 */
export function startFocusSession(
  {
    durationMinutes = 25,
    breakMinutes = 5,
    totalCycles = 1,
    siteIds = [],
    strictMode = false,
  } = {},
  nowMs = Date.now()
) {
  const durationMs = Math.max(1, durationMinutes) * 60 * 1000;
  return {
    active: true,
    sessionId: `focus_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    startedAt: nowMs,
    endsAt: nowMs + durationMs,
    phase: 'focus',
    durationMinutes: Math.max(1, durationMinutes),
    breakMinutes: Math.max(0, breakMinutes),
    totalCycles: Math.max(1, totalCycles),
    currentCycle: 1,
    siteIds,
    strictMode: Boolean(strictMode),
    isPaused: false,
    pausedRemainingMs: 0,
  };
}

/**
 * Advances to next phase (focus -> break or break -> next cycle) or finishes.
 * @param {Object} state
 * @param {number} [nowMs=Date.now()]
 * @returns {Object} Updated focus state
 */
export function advanceFocusPhase(state, nowMs = Date.now()) {
  if (!state || !state.active) return createIdleFocusState();

  if (state.phase === 'focus') {
    // If break time is configured, transition to break
    if (state.breakMinutes > 0) {
      const breakMs = state.breakMinutes * 60 * 1000;
      return {
        ...state,
        phase: 'break',
        startedAt: nowMs,
        endsAt: nowMs + breakMs,
        isPaused: false,
        pausedRemainingMs: 0,
      };
    }
  }

  // Phase was 'break' or focus without break. Check if more cycles remain.
  if (state.currentCycle < state.totalCycles) {
    const durationMs = state.durationMinutes * 60 * 1000;
    return {
      ...state,
      phase: 'focus',
      currentCycle: state.currentCycle + 1,
      startedAt: nowMs,
      endsAt: nowMs + durationMs,
      isPaused: false,
      pausedRemainingMs: 0,
    };
  }

  // All cycles completed
  return createIdleFocusState();
}

/**
 * Pauses an active focus session timer.
 * @param {Object} state
 * @param {number} [nowMs=Date.now()]
 * @returns {Object}
 */
export function pauseFocusSession(state, nowMs = Date.now()) {
  if (!state || !state.active || state.isPaused) return state;
  const remaining = Math.max(0, state.endsAt - nowMs);
  return {
    ...state,
    isPaused: true,
    pausedRemainingMs: remaining,
  };
}

/**
 * Resumes a paused focus session timer.
 * @param {Object} state
 * @param {number} [nowMs=Date.now()]
 * @returns {Object}
 */
export function resumeFocusSession(state, nowMs = Date.now()) {
  if (!state || !state.active || !state.isPaused) return state;
  const remaining = Math.max(1000, state.pausedRemainingMs || 1000);
  return {
    ...state,
    isPaused: false,
    pausedRemainingMs: 0,
    endsAt: nowMs + remaining,
  };
}

/**
 * Stops an active session. If strictMode is on, stop is rejected unless forced.
 * @param {Object} state
 * @param {boolean} [force=false]
 * @returns {{ success: boolean, state: Object, error?: string }}
 */
export function stopFocusSession(state, force = false) {
  if (!state || !state.active) {
    return { success: true, state: createIdleFocusState() };
  }

  if (state.strictMode && !force) {
    return {
      success: false,
      state,
      error: 'Strict Focus Mode is active. Stopping is disabled until session completes.',
    };
  }

  return {
    success: true,
    state: createIdleFocusState(),
  };
}

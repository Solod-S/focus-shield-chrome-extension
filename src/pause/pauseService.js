/**
 * Pause blocking service.
 */

export function createIdlePauseState() {
  return {
    active: false,
    startedAt: 0,
    endsAt: null,
  };
}

/**
 * Starts a pause period for regular blocking rules.
 * @param {number|null} durationMinutes - null means 'Until I resume'
 * @param {number} [nowMs=Date.now()]
 * @returns {Object} Updated pause state
 */
export function startPause(durationMinutes, nowMs = Date.now()) {
  const endsAt = durationMinutes ? nowMs + durationMinutes * 60 * 1000 : null;
  return {
    active: true,
    startedAt: nowMs,
    endsAt,
  };
}

/**
 * Checks if pause is currently active.
 * @param {Object} pauseState
 * @param {number} [nowMs=Date.now()]
 * @returns {boolean}
 */
export function isPauseActive(pauseState, nowMs = Date.now()) {
  if (!pauseState || !pauseState.active) return false;
  if (pauseState.endsAt === null) return true;
  return pauseState.endsAt > nowMs;
}

/**
 * Resumes normal blocking (ends pause).
 * @returns {Object}
 */
export function resumeBlocking() {
  return createIdlePauseState();
}

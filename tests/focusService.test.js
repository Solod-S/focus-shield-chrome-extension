import { describe, it, expect } from 'vitest';
import {
  startFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  advanceFocusPhase,
  stopFocusSession,
} from '../src/focus/focusService.js';

describe('focusService', () => {
  it('starts a new focus session', () => {
    const now = 1000000;
    const session = startFocusSession(
      { durationMinutes: 25, breakMinutes: 5, totalCycles: 2 },
      now
    );

    expect(session.active).toBe(true);
    expect(session.phase).toBe('focus');
    expect(session.currentCycle).toBe(1);
    expect(session.endsAt).toBe(now + 25 * 60 * 1000);
  });

  it('pauses and resumes focus session timer', () => {
    const now = 1000000;
    const session = startFocusSession({ durationMinutes: 25 }, now);

    // 10 minutes pass
    const pauseNow = now + 10 * 60 * 1000;
    const paused = pauseFocusSession(session, pauseNow);
    expect(paused.isPaused).toBe(true);
    expect(paused.pausedRemainingMs).toBe(15 * 60 * 1000);

    // 5 minutes later resume
    const resumeNow = pauseNow + 5 * 60 * 1000;
    const resumed = resumeFocusSession(paused, resumeNow);
    expect(resumed.isPaused).toBe(false);
    expect(resumed.endsAt).toBe(resumeNow + 15 * 60 * 1000);
  });

  it('transitions between Pomodoro focus and break phases', () => {
    const now = 1000000;
    const session = startFocusSession(
      { durationMinutes: 25, breakMinutes: 5, totalCycles: 2 },
      now
    );

    // Focus 1 finishes -> advances to break
    const breakPhase = advanceFocusPhase(session, session.endsAt);
    expect(breakPhase.phase).toBe('break');
    expect(breakPhase.currentCycle).toBe(1);

    // Break 1 finishes -> advances to Focus 2
    const focus2Phase = advanceFocusPhase(breakPhase, breakPhase.endsAt);
    expect(focus2Phase.phase).toBe('focus');
    expect(focus2Phase.currentCycle).toBe(2);

    // Break 2 finishes -> session completes (all cycles done)
    const break2Phase = advanceFocusPhase(focus2Phase, focus2Phase.endsAt);
    const finished = advanceFocusPhase(break2Phase, break2Phase.endsAt);
    expect(finished.active).toBe(false);
  });

  it('enforces strict mode on stop', () => {
    const session = startFocusSession({ durationMinutes: 25, strictMode: true });
    const attempt = stopFocusSession(session, false);
    expect(attempt.success).toBe(false);
    expect(attempt.error).toContain('Strict Focus Mode');

    // Force stop succeeds
    const forceStop = stopFocusSession(session, true);
    expect(forceStop.success).toBe(true);
    expect(forceStop.state.active).toBe(false);
  });
});

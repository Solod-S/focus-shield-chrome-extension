import { describe, it, expect } from 'vitest';
import { startPause, isPauseActive, resumeBlocking } from '../src/pause/pauseService.js';

describe('pauseService', () => {
  it('starts timed pause and verifies active status', () => {
    const now = 1000000;
    const pause = startPause(15, now);
    expect(pause.active).toBe(true);
    expect(pause.endsAt).toBe(now + 15 * 60 * 1000);

    expect(isPauseActive(pause, now + 5 * 60 * 1000)).toBe(true);
    expect(isPauseActive(pause, now + 16 * 60 * 1000)).toBe(false);
  });

  it('supports indefinite pause (Until I resume)', () => {
    const now = 1000000;
    const pause = startPause(null, now);
    expect(pause.active).toBe(true);
    expect(pause.endsAt).toBe(null);

    expect(isPauseActive(pause, now + 10000000)).toBe(true);
  });

  it('resumes blocking', () => {
    const resumed = resumeBlocking();
    expect(resumed.active).toBe(false);
  });
});

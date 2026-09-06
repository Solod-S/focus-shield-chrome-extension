import { describe, it, expect } from 'vitest';
import { computeDesiredRules } from '../src/blocking/ruleReconciler.js';

describe('ruleReconciler', () => {
  const baseState = {
    settings: { enabled: true },
    blockList: [
      { id: '1', value: 'youtube.com', enabled: true, matchMode: 'domain' },
      { id: '2', value: 'facebook.com', enabled: false, matchMode: 'domain' }, // disabled
    ],
    allowList: [
      { id: 'a1', value: 'youtube.com/learn', enabled: true, matchMode: 'path' },
    ],
    schedules: [],
    focusState: { active: false },
    pauseState: { active: false },
  };

  it('computes rules when master blocking is ON', () => {
    const { dynamicRules, sessionRules } = computeDesiredRules(baseState);
    // 1 permanent block + 1 allow rule = 2 dynamic rules
    expect(dynamicRules.length).toBe(2);
    expect(sessionRules.length).toBe(0);

    const blockRule = dynamicRules.find((r) => r.action.type === 'redirect');
    expect(blockRule.condition.urlFilter).toBe('||youtube.com^');

    const allowRule = dynamicRules.find((r) => r.action.type === 'allow');
    expect(allowRule.condition.urlFilter).toBe('||youtube.com/learn*');
  });

  it('clears all blocking rules when master switch is OFF', () => {
    const offState = { ...baseState, settings: { enabled: false } };
    const { dynamicRules, sessionRules } = computeDesiredRules(offState);
    expect(dynamicRules.length).toBe(0);
    expect(sessionRules.length).toBe(0);
  });

  it('suspends permanent rules during Pause', () => {
    const pauseState = {
      ...baseState,
      pauseState: { active: true, endsAt: Date.now() + 100000 },
    };
    const { dynamicRules } = computeDesiredRules(pauseState);
    // Allow rules remain, but permanent blocks are paused
    const redirectRules = dynamicRules.filter((r) => r.action.type === 'redirect');
    expect(redirectRules.length).toBe(0);
  });

  it('creates session rules when Focus is active', () => {
    const focusState = {
      ...baseState,
      focusState: {
        active: true,
        endsAt: Date.now() + 100000,
        siteIds: ['1'],
        strictMode: false,
      },
    };
    const { sessionRules } = computeDesiredRules(focusState);
    expect(sessionRules.length).toBe(1);
    expect(sessionRules[0].condition.urlFilter).toBe('||youtube.com^');
    expect(sessionRules[0].action.type).toBe('redirect');
  });
});

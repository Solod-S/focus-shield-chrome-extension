import { describe, it, expect } from 'vitest';
import { buildDnrRule } from '../src/blocking/ruleBuilder.js';
import { RULE_PRIORITIES } from '../src/shared/constants.js';

describe('ruleBuilder', () => {
  it('builds domain redirect rule', () => {
    const rule = buildDnrRule({
      id: 100001,
      value: 'youtube.com',
      matchMode: 'domain',
      type: 'block',
      category: 'PERMANENT',
    });

    expect(rule.id).toBe(100001);
    expect(rule.priority).toBe(RULE_PRIORITIES.PERMANENT);
    expect(rule.condition.urlFilter).toBe('||youtube.com^');
    expect(rule.action.type).toBe('redirect');
    expect(rule.action.redirect.extensionPath).toContain('blocked.html?url=youtube.com');
  });

  it('builds path redirect rule', () => {
    const rule = buildDnrRule({
      id: 100002,
      value: 'reddit.com/r/gaming',
      matchMode: 'path',
      type: 'block',
    });

    expect(rule.condition.urlFilter).toBe('||reddit.com/r/gaming*');
  });

  it('builds keyword redirect rule', () => {
    const rule = buildDnrRule({
      id: 100003,
      value: 'poker',
      matchMode: 'keyword',
      type: 'block',
    });

    expect(rule.condition.urlFilter).toBe('*poker*');
  });

  it('builds allow exception rule with higher priority', () => {
    const rule = buildDnrRule({
      id: 300001,
      value: 'youtube.com/watch?v=education',
      matchMode: 'path',
      type: 'allow',
      category: 'ALLOW',
    });

    expect(rule.priority).toBe(RULE_PRIORITIES.ALLOW);
    expect(rule.action.type).toBe('allow');
    expect(rule.action.redirect).toBeUndefined();
  });
});

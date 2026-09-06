import { describe, it, expect } from 'vitest';
import {
  isProtectedUrl,
  isBlockableUrl,
  extractHostname,
  normalizeDomain,
  parseRuleInput,
} from '../src/blocking/domainParser.js';

describe('domainParser', () => {
  it('identifies protected browser urls', () => {
    expect(isProtectedUrl('chrome://settings')).toBe(true);
    expect(isProtectedUrl('chrome-extension://xyz/popup.html')).toBe(true);
    expect(isProtectedUrl('edge://flags')).toBe(true);
    expect(isProtectedUrl('about:blank')).toBe(true);
    expect(isProtectedUrl('https://youtube.com')).toBe(false);
  });

  it('checks blockable urls', () => {
    expect(isBlockableUrl('https://youtube.com')).toBe(true);
    expect(isBlockableUrl('http://localhost:3000')).toBe(true);
    expect(isBlockableUrl('chrome://extensions')).toBe(false);
    expect(isBlockableUrl('invalid-url-here@@@')).toBe(false);
  });

  it('extracts and cleans hostname', () => {
    expect(extractHostname('https://www.youtube.com/watch?v=123')).toBe('youtube.com');
    expect(extractHostname('http://reddit.com/r/all')).toBe('reddit.com');
    expect(extractHostname('chrome://settings')).toBe(null);
  });

  it('normalizes domains', () => {
    expect(normalizeDomain('https://www.YOUTUBE.com/')).toBe('youtube.com');
    expect(normalizeDomain('www.instagram.com/path?query=1')).toBe('instagram.com');
    expect(normalizeDomain('localhost:8080')).toBe('localhost');
  });

  it('parses rule inputs by matchMode', () => {
    // domain
    const d = parseRuleInput('https://www.twitter.com/home', 'domain');
    expect(d.valid).toBe(true);
    expect(d.normalized).toBe('twitter.com');

    // path
    const p = parseRuleInput('youtube.com/shorts', 'path');
    expect(p.valid).toBe(true);
    expect(p.normalized).toBe('youtube.com/shorts');

    // keyword
    const k = parseRuleInput('casino', 'keyword');
    expect(k.valid).toBe(true);
    expect(k.normalized).toBe('casino');

    // protected
    const sys = parseRuleInput('chrome://settings', 'domain');
    expect(sys.valid).toBe(false);
  });
});

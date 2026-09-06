import { describe, it, expect } from 'vitest';
import en from '../src/i18n/en.json';
import ru from '../src/i18n/ru.json';
import uk from '../src/i18n/uk.json';

describe('i18n completeness and parity', () => {
  it('ensures RU dictionary has all keys present in EN', () => {
    const enKeys = Object.keys(en);
    const missingInRu = enKeys.filter((k) => !(k in ru));
    expect(missingInRu).toEqual([]);
  });

  it('ensures UK dictionary has all keys present in EN', () => {
    const enKeys = Object.keys(en);
    const missingInUk = enKeys.filter((k) => !(k in uk));
    expect(missingInUk).toEqual([]);
  });

  it('ensures all translation values are non-empty strings', () => {
    for (const [key, val] of Object.entries(en)) {
      expect(typeof val).toBe('string');
      expect(val.trim().length).toBeGreaterThan(0);
    }
    for (const [key, val] of Object.entries(ru)) {
      expect(typeof val).toBe('string');
      expect(val.trim().length).toBeGreaterThan(0);
    }
    for (const [key, val] of Object.entries(uk)) {
      expect(typeof val).toBe('string');
      expect(val.trim().length).toBeGreaterThan(0);
    }
  });
});

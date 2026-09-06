import { describe, it, expect } from 'vitest';
import { buildExportJson } from '../src/backup/exportSettings.js';
import { validateBackup } from '../src/backup/validateBackup.js';
import { mergeBackup } from '../src/backup/mergeBackup.js';

describe('backup & restore', () => {
  const sampleState = {
    settings: { enabled: true, language: 'en', blockedPageMessage: 'Hi' },
    blockList: [
      { id: '1', value: 'youtube.com', enabled: true, matchMode: 'domain' },
      { id: '2', value: 'reddit.com', enabled: true, matchMode: 'domain' },
    ],
    allowList: [{ id: 'a1', value: 'youtube.com/watch', enabled: true }],
    schedules: [{ id: 's1', name: 'Work', enabled: true, days: [1, 2] }],
    security: {
      passwordEnabled: true,
      passwordCredential: { salt: 'secret_salt', hash: 'secret_hash' },
    },
  };

  it('exports valid JSON and excludes password credentials', () => {
    const exportedStr = buildExportJson(sampleState);
    const parsed = JSON.parse(exportedStr);

    expect(parsed.app).toBe('focus-shield');
    expect(parsed.blockList.length).toBe(2);
    expect(parsed.security.passwordEnabled).toBe(true);
    expect(parsed.security.passwordCredential).toBeUndefined();
    expect(exportedStr).not.toContain('secret_salt');
    expect(exportedStr).not.toContain('secret_hash');
  });

  it('validates backup file correctly', () => {
    const validJson = buildExportJson(sampleState);
    const validRes = validateBackup(validJson);
    expect(validRes.valid).toBe(true);
    expect(validRes.summary.blockedCount).toBe(2);

    // Invalid JSON string
    expect(validateBackup('{ bad json').valid).toBe(false);

    // Wrong app
    expect(validateBackup({ app: 'other-app', schemaVersion: 1 }).valid).toBe(false);

    // Future schema version
    expect(validateBackup({ app: 'focus-shield', schemaVersion: 999 }).valid).toBe(false);
  });

  it('merges backup without duplicates', () => {
    const backupData = {
      blockList: [
        { id: 'b1', value: 'youtube.com', enabled: true, matchMode: 'domain' }, // duplicate
        { id: 'b2', value: 'twitter.com', enabled: true, matchMode: 'domain' }, // new
      ],
      allowList: [],
      schedules: [],
    };

    const { newState, stats } = mergeBackup(sampleState, backupData);
    expect(newState.blockList.length).toBe(3); // youtube.com, reddit.com, twitter.com
    expect(stats.importedBlocked).toBe(1);
    expect(stats.skippedBlockedDuplicates).toBe(1);
  });
});

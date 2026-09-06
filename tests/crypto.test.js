import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../src/security/crypto.js';

describe('crypto password security', () => {
  it('hashes password with salt and verifies correctly', async () => {
    const pwd = 'CorrectPassword123!';
    const credential = await hashPassword(pwd);

    expect(credential.salt).toBeDefined();
    expect(credential.hash).toBeDefined();
    expect(credential.iterations).toBe(100000);
    expect(credential.salt.length).toBe(32); // 16 bytes hex

    // Verify correct password
    const valid = await verifyPassword(pwd, credential);
    expect(valid).toBe(true);

    // Verify wrong password
    const invalid = await verifyPassword('WrongPassword999', credential);
    expect(invalid).toBe(false);
  });

  it('generates unique salts for identical passwords', async () => {
    const pwd = 'IdenticalPassword888';
    const cred1 = await hashPassword(pwd);
    const cred2 = await hashPassword(pwd);

    expect(cred1.salt).not.toBe(cred2.salt);
    expect(cred1.hash).not.toBe(cred2.hash);
  });

  it('rejects passwords under 8 characters', async () => {
    await expect(hashPassword('short')).rejects.toThrow();
  });
});

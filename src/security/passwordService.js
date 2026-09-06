import { hashPassword, verifyPassword } from './crypto.js';
import { isSessionUnlocked, grantSessionUnlock, clearSessionUnlock } from './unlockSession.js';

export const PasswordService = {
  /**
   * Sets up new password.
   * @param {string} password
   */
  async setPassword(password) {
    const credential = await hashPassword(password);
    await grantSessionUnlock();
    return credential;
  },

  /**
   * Checks if operation requires password authentication.
   * Returns true if password is enabled AND session is NOT currently unlocked.
   * @param {Object} securityState
   * @returns {Promise<boolean>}
   */
  async requiresAuth(securityState) {
    if (!securityState?.passwordEnabled) return false;
    const unlocked = await isSessionUnlocked();
    return !unlocked;
  },

  /**
   * Attempts authentication with input password.
   * If correct, grants 5-minute unlock.
   * @param {string} password
   * @param {Object} securityState
   * @returns {Promise<boolean>}
   */
  async authenticate(password, securityState) {
    if (!securityState?.passwordCredential) return true;
    const isValid = await verifyPassword(password, securityState.passwordCredential);
    if (isValid) {
      await grantSessionUnlock();
    }
    return isValid;
  },

  /**
   * Clears session unlock immediately.
   */
  async lockNow() {
    await clearSessionUnlock();
  },
};

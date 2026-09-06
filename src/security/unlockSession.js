/**
 * Manages 5-minute temporary unlock session in chrome.storage.session (or memory fallback).
 */

const UNLOCK_DURATION_MS = 5 * 60 * 1000;
let memoryUnlockedUntil = 0;

export async function isSessionUnlocked() {
  const now = Date.now();

  if (globalThis?.chrome?.storage?.session) {
    try {
      const data = await chrome.storage.session.get('unlockedUntil');
      if (data.unlockedUntil && data.unlockedUntil > now) {
        return true;
      }
    } catch {
      // fallback to memory
    }
  }

  return memoryUnlockedUntil > now;
}

export async function grantSessionUnlock() {
  const expiry = Date.now() + UNLOCK_DURATION_MS;
  memoryUnlockedUntil = expiry;

  if (globalThis?.chrome?.storage?.session) {
    try {
      await chrome.storage.session.set({ unlockedUntil: expiry });
    } catch {
      // memory fallback already set
    }
  }
}

export async function clearSessionUnlock() {
  memoryUnlockedUntil = 0;
  if (globalThis?.chrome?.storage?.session) {
    try {
      await chrome.storage.session.remove('unlockedUntil');
    } catch {
      // ignore
    }
  }
}

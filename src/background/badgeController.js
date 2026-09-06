/**
 * Updates extension action badge and title based on current state.
 * @param {Object} state
 */
export async function updateBadge(state) {
  if (!globalThis?.chrome?.action) return;

  const { settings, focusState, pauseState } = state;

  if (!settings?.enabled) {
    await chrome.action.setBadgeText({ text: 'OFF' });
    await chrome.action.setBadgeBackgroundColor({ color: '#6B7280' });
    await chrome.action.setTitle({ title: 'Focus Shield: Blocking is OFF' });
    return;
  }

  if (focusState?.active) {
    const now = Date.now();
    const remainingMs = Math.max(0, (focusState.endsAt || now) - now);
    const remainingMin = Math.ceil(remainingMs / (60 * 1000));
    const phaseName = focusState.phase === 'break' ? 'Break' : 'Focus';

    await chrome.action.setBadgeText({ text: 'F' });
    await chrome.action.setBadgeBackgroundColor({ color: '#4F46E5' });
    await chrome.action.setTitle({
      title: `Focus Shield: ${phaseName} ends in ${remainingMin}m`,
    });
    return;
  }

  if (pauseState?.active) {
    await chrome.action.setBadgeText({ text: 'P' });
    await chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
    await chrome.action.setTitle({ title: 'Focus Shield: Blocking Paused' });
    return;
  }

  // Normal active state
  await chrome.action.setBadgeText({ text: '' });
  await chrome.action.setTitle({ title: 'Focus Shield' });
}

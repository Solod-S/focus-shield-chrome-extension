import { normalizeDomain } from '../blocking/domainParser.js';

/**
 * Merges imported backup data with current extension state.
 * Deduplicates blocked sites and exceptions.
 * @param {Object} currentState
 * @param {Object} backupData
 * @returns {{ newState: Object, stats: Object }}
 */
export function mergeBackup(currentState, backupData) {
  const existingDomainKeys = new Set(
    currentState.blockList.map((s) => (s.matchMode === 'keyword' ? `kw:${s.value}` : normalizeDomain(s.value)))
  );

  let importedBlocked = 0;
  let skippedBlockedDuplicates = 0;
  const mergedBlockList = [...currentState.blockList];

  for (const item of backupData.blockList || []) {
    if (!item.value) continue;
    const key = item.matchMode === 'keyword' ? `kw:${item.value}` : normalizeDomain(item.value);
    if (existingDomainKeys.has(key)) {
      skippedBlockedDuplicates++;
    } else {
      existingDomainKeys.add(key);
      mergedBlockList.push({
        ...item,
        id: item.id || `site_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      });
      importedBlocked++;
    }
  }

  const existingAllowKeys = new Set(currentState.allowList.map((a) => a.value.trim().toLowerCase()));
  let importedAllow = 0;
  const mergedAllowList = [...currentState.allowList];

  for (const item of backupData.allowList || []) {
    if (!item.value) continue;
    const key = item.value.trim().toLowerCase();
    if (!existingAllowKeys.has(key)) {
      existingAllowKeys.add(key);
      mergedAllowList.push({
        ...item,
        id: item.id || `allow_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      });
      importedAllow++;
    }
  }

  const existingScheduleIds = new Set(currentState.schedules.map((s) => s.id));
  let importedSchedules = 0;
  const mergedSchedules = [...currentState.schedules];

  for (const schedule of backupData.schedules || []) {
    let finalId = schedule.id;
    if (existingScheduleIds.has(finalId)) {
      finalId = `schedule_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    }
    existingScheduleIds.add(finalId);
    mergedSchedules.push({ ...schedule, id: finalId });
    importedSchedules++;
  }

  const newState = {
    ...currentState,
    blockList: mergedBlockList,
    allowList: mergedAllowList,
    schedules: mergedSchedules,
  };

  return {
    newState,
    stats: {
      importedBlocked,
      skippedBlockedDuplicates,
      importedAllow,
      importedSchedules,
    },
  };
}

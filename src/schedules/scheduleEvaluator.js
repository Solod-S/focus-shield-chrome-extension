/**
 * Parses "HH:MM" string to minutes from start of the day (0..1439).
 * @param {string} timeStr
 * @returns {number}
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Checks if a specific schedule is currently active at a given date/time.
 * Supports overnight schedules spanning past midnight (e.g. 22:00 to 07:00).
 *
 * Days notation: 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
 *
 * @param {Object} schedule
 * @param {Date} [now=new Date()]
 * @returns {boolean}
 */
export function isScheduleActive(schedule, now = new Date()) {
  if (!schedule || !schedule.enabled) return false;
  if (!Array.isArray(schedule.days) || schedule.days.length === 0) return false;

  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = timeToMinutes(schedule.startTime);
  const endMinutes = timeToMinutes(schedule.endTime);

  // Case 1: Standard daytime interval, e.g. 09:00 - 18:00
  if (startMinutes <= endMinutes) {
    const isDaySelected = schedule.days.includes(currentDay);
    if (!isDaySelected) return false;
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  // Case 2: Overnight interval, e.g. 22:00 - 07:00 (crosses midnight)
  // Interval consists of two parts:
  // Part A: from startMinutes up to midnight (active if TODAY is in schedule.days)
  if (currentMinutes >= startMinutes) {
    return schedule.days.includes(currentDay);
  }

  // Part B: from midnight up to endMinutes (active if YESTERDAY was in schedule.days)
  if (currentMinutes < endMinutes) {
    const yesterday = (currentDay + 6) % 7;
    return schedule.days.includes(yesterday);
  }

  return false;
}

/**
 * Checks if any schedule in the array is currently active.
 * @param {Array} schedules
 * @param {Date} [now=new Date()]
 * @returns {boolean}
 */
export function hasActiveSchedule(schedules, now = new Date()) {
  if (!Array.isArray(schedules)) return false;
  return schedules.some((s) => isScheduleActive(s, now));
}

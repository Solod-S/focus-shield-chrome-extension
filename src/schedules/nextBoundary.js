import { timeToMinutes } from './scheduleEvaluator.js';

/**
 * Calculates the next point in time (timestamp in ms) when any enabled schedule will switch on or off.
 * Looks ahead up to 8 days.
 * @param {Array} schedules
 * @param {Date} [now=new Date()]
 * @returns {number|null} Timestamp in ms, or null if no schedules exist
 */
export function calculateNextScheduleBoundary(schedules, now = new Date()) {
  if (!Array.isArray(schedules) || schedules.length === 0) return null;

  const enabledSchedules = schedules.filter((s) => s.enabled && s.days?.length > 0);
  if (enabledSchedules.length === 0) return null;

  const nowMs = now.getTime();
  let nearestBoundaryMs = Infinity;

  // Look ahead 8 days from today
  for (let dayOffset = 0; dayOffset <= 8; dayOffset++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + dayOffset);
    checkDate.setSeconds(0, 0);

    const dayOfWeek = checkDate.getDay();

    for (const schedule of enabledSchedules) {
      const startMin = timeToMinutes(schedule.startTime);
      const endMin = timeToMinutes(schedule.endTime);

      // Start boundary for today if dayOfWeek in schedule.days
      if (schedule.days.includes(dayOfWeek)) {
        const startDate = new Date(checkDate);
        startDate.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
        const startMs = startDate.getTime();
        if (startMs > nowMs && startMs < nearestBoundaryMs) {
          nearestBoundaryMs = startMs;
        }

        // Standard end boundary on same day
        if (startMin <= endMin) {
          const endDate = new Date(checkDate);
          endDate.setHours(Math.floor(endMin / 60), endMin % 60, 0, 0);
          const endMs = endDate.getTime();
          if (endMs > nowMs && endMs < nearestBoundaryMs) {
            nearestBoundaryMs = endMs;
          }
        } else {
          // Overnight: end boundary is on the NEXT day
          const nextDayDate = new Date(checkDate);
          nextDayDate.setDate(checkDate.getDate() + 1);
          nextDayDate.setHours(Math.floor(endMin / 60), endMin % 60, 0, 0);
          const endMs = nextDayDate.getTime();
          if (endMs > nowMs && endMs < nearestBoundaryMs) {
            nearestBoundaryMs = endMs;
          }
        }
      }
    }
  }

  return Number.isFinite(nearestBoundaryMs) ? nearestBoundaryMs : null;
}

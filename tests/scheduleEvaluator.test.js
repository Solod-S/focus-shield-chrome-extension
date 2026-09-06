import { describe, it, expect } from 'vitest';
import { isScheduleActive, hasActiveSchedule } from '../src/schedules/scheduleEvaluator.js';

describe('scheduleEvaluator', () => {
  const daytimeSchedule = {
    id: 's1',
    enabled: true,
    days: [1, 2, 3, 4, 5], // Mon-Fri
    startTime: '09:00',
    endTime: '18:00',
    siteIds: ['site_yt'],
  };

  it('evaluates standard daytime schedule', () => {
    // Monday at 10:30 (Day 1)
    const monMorning = new Date('2026-09-07T10:30:00'); // Mon
    expect(isScheduleActive(daytimeSchedule, monMorning)).toBe(true);

    // Monday at 19:30 (after end)
    const monEvening = new Date('2026-09-07T19:30:00');
    expect(isScheduleActive(daytimeSchedule, monEvening)).toBe(false);

    // Saturday at 12:00 (weekend, not in days)
    const satNoon = new Date('2026-09-12T12:00:00');
    expect(isScheduleActive(daytimeSchedule, satNoon)).toBe(false);
  });

  it('handles overnight schedules crossing midnight', () => {
    const overnightSchedule = {
      id: 's2',
      enabled: true,
      days: [1], // Monday night 22:00 -> Tuesday morning 07:00
      startTime: '22:00',
      endTime: '07:00',
      siteIds: ['site_yt'],
    };

    // Monday at 23:30 -> active
    const monLate = new Date('2026-09-07T23:30:00');
    expect(isScheduleActive(overnightSchedule, monLate)).toBe(true);

    // Tuesday at 03:00 -> active because Monday night was selected
    const tueEarly = new Date('2026-09-08T03:00:00');
    expect(isScheduleActive(overnightSchedule, tueEarly)).toBe(true);

    // Tuesday at 08:00 -> inactive (after 07:00)
    const tueMorning = new Date('2026-09-08T08:00:00');
    expect(isScheduleActive(overnightSchedule, tueMorning)).toBe(false);
  });

  it('checks disabled schedule returns false', () => {
    const disabled = { ...daytimeSchedule, enabled: false };
    const monMorning = new Date('2026-09-07T10:30:00');
    expect(isScheduleActive(disabled, monMorning)).toBe(false);
  });
});

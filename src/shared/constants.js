export const APP_NAME = 'focus-shield';
export const SCHEMA_VERSION = 1;

export const RULE_PRIORITIES = {
  ALLOW: 100,
  STRICT_FOCUS: 90,
  FOCUS: 80,
  PERMANENT: 60,
  SCHEDULE: 50,
};

export const RULE_ID_RANGES = {
  PERMANENT: { min: 100000, max: 199999 },
  SCHEDULE: { min: 200000, max: 299999 },
  ALLOW: { min: 300000, max: 399999 },
  FOCUS: { min: 400000, max: 499999 },
};

export const ALARMS = {
  SCHEDULE_BOUNDARY: 'schedule:next-boundary',
  FOCUS_END: 'focus:end',
  PAUSE_END: 'pause:end',
};

export const PAUSE_DURATIONS = [
  { minutes: 5, label: '5 min' },
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '1 hour' },
  { minutes: null, label: 'Until I resume' },
];

export const FOCUS_PRESETS = [
  { minutes: 25, label: '25 min' },
  { minutes: 50, label: '50 min' },
  { minutes: 90, label: '90 min' },
];

export const MAX_BACKUP_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_BLOCKED_MESSAGE_LENGTH = 120;

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'uk'];
export const DEFAULT_LANGUAGE = 'en';

export const PROTECTED_PROTOCOLS = [
  'chrome:',
  'chrome-extension:',
  'edge:',
  'about:',
  'devtools:',
  'view-source:',
];

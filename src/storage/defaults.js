import { SCHEMA_VERSION, DEFAULT_LANGUAGE } from '../shared/constants.js';
import { createIdleFocusState } from '../focus/focusService.js';
import { createIdlePauseState } from '../pause/pauseService.js';

export function getDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      enabled: true,
      language: DEFAULT_LANGUAGE,
      blockedPageMessage: 'Stay focused on your goals!',
    },
    blockList: [
      {
        id: 'site_youtube',
        type: 'domain',
        value: 'youtube.com',
        enabled: true,
        includeSubdomains: true,
        matchMode: 'domain',
        createdAt: new Date().toISOString(),
        note: 'Video streaming',
      },
      {
        id: 'site_reddit',
        type: 'domain',
        value: 'reddit.com',
        enabled: true,
        includeSubdomains: true,
        matchMode: 'domain',
        createdAt: new Date().toISOString(),
        note: 'Social news',
      },
      {
        id: 'site_instagram',
        type: 'domain',
        value: 'instagram.com',
        enabled: true,
        includeSubdomains: true,
        matchMode: 'domain',
        createdAt: new Date().toISOString(),
        note: 'Social media',
      },
    ],
    allowList: [],
    schedules: [],
    focusSettings: {
      defaultMinutes: 25,
      defaultBreakMinutes: 5,
      defaultCycles: 2,
      siteIds: [],
      strictModeDefault: false,
    },
    focusState: createIdleFocusState(),
    pauseState: createIdlePauseState(),
    security: {
      passwordEnabled: false,
      passwordCredential: null,
    },
  };
}

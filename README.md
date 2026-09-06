# Focus Shield 🛡️

Focus Shield is a production-ready, local-first Google Chrome Extension (Manifest V3) for website blocking, Pomodoro focus sessions, and schedule management.

Designed with a modern light-theme aesthetic inspired by leading productivity tools, Focus Shield gives you full control over online distractions while strictly protecting your privacy.

---

## Features

- **Domain, Path & Keyword Blocking**: Block entire websites (`youtube.com`), specific sub-paths (`reddit.com/r/all`), or keywords in URLs (`casino`).
- **Exceptions (Allow List)**: Whitelist specific educational or work pages even when their main domain is blocked.
- **Focus Sessions (Pomodoro)**: Set work duration, break time, and cycle counts. Displays an animated circular countdown timer with real-time feedback.
- **Strict Focus Mode**: Prevent early stopping or modifying lists until the session finishes.
- **Schedules with Overnight Support**: Automate blocking during work or night hours (supports past-midnight ranges like `22:00` to `07:00`).
- **Temporary Pause**: Quickly pause blocking for 5m, 15m, 30m, 1h, or until manually resumed.
- **Master Password Protection**: Protect rules, schedules, and settings using Web Crypto API (PBKDF2 SHA-256 with random salt and 100,000 iterations). Unlocks temporarily for 5 minutes.
- **Local Backup & Restore**: Export settings to JSON (`focus-shield-backup-YYYY-MM-DD.json`) and import via Merge (deduplicated) or Replace modes.
- **Three Languages (i18n)**: English, Russian, and Ukrainian with instant runtime switching.
- **Custom Blocked Page**: Displays the blocked domain, reason, focus countdown, custom motivational message, and a return button.

---

## Architecture

- **Manifest V3**: Built using modern Chrome Extension architecture without background persistent pages.
- **Declarative Net Request (DNR)**:
  - Permanent blocks and active schedules: `chrome.declarativeNetRequest.updateDynamicRules()`
  - Temporary focus session rules: `chrome.declarativeNetRequest.updateSessionRules()`
  - Rule Priority Hierarchy: Allow (100) > Strict Focus (90) > Focus (80) > Permanent (60) > Schedule (50).
- **Service Worker & Alarms**:
  - `chrome.alarms` triggers boundary updates, focus completions, and pause expirations.
  - Startup recovery handles browser restarts and sleep/wake cycles reliably.
- **Local Storage Architecture**:
  - `chrome.storage.local`: Persistent configuration.
  - `chrome.storage.session`: In-memory temporary 5-minute authentication state.
  - **No `chrome.storage.sync`**: Settings never leave the user's machine.
  - **Zero Telemetry / No Backend**: 100% private.

---

## Permissions

Focus Shield uses only the minimal required permissions:
- `declarativeNetRequest`: To apply redirect rules to `blocked.html`.
- `storage`: To save rules and preferences locally.
- `alarms`: To trigger schedules and timer transitions.
- `activeTab`: To detect the current domain for quick blocking in the popup.

---

## Development & Build

### Prerequisites
- Node.js 18+ (tested on Node.js 22)
- npm 9+

### Install Dependencies
```bash
npm install
```

### Run Unit Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```
Build output is generated in `dist/`.

### Package Release ZIP
```bash
npm run package
```
Generates zip archives in `release/focus-shield-v1.0.0.zip`.

---

## How to Install in Chrome (Load Unpacked)

1. Run `npm run build`.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the `dist/` directory located inside this project folder.
6. Click the extension icon in your toolbar to pin and use Focus Shield.

---

## Roadmap

- **P1**: Site groups/categories (Social, Video, Gaming), sound notifications on focus session complete.
- **P2**: Optional local statistics charts (aggregated offline counts only).

---

## License

MIT License. See [LICENSE](LICENSE) for details.

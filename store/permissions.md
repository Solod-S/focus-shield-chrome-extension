# Focus Shield — Permissions Justification

This document outlines the minimal set of Chrome permissions required by Focus Shield and the exact reason for each.

### `declarativeNetRequest`
- **Purpose**: Applies locally defined website blocking and exception redirect rules using Chrome's secure Declarative Net Request engine.
- **Note**: Does not allow reading private request headers, cookies, or body data.

### `storage`
- **Purpose**: Saves the user's Block List, Allow List exceptions, schedules, focus preferences, and security settings locally on the machine (`chrome.storage.local` and `chrome.storage.session`).
- **Note**: Cloud sync (`chrome.storage.sync`) is strictly disabled.

### `alarms`
- **Purpose**: Schedules timely activation and deactivation of schedule intervals, automatic completion of focus sessions, and auto-resumption after temporary pauses.

### `activeTab`
- **Purpose**: Enables the extension popup to detect the current tab's domain when the user clicks the extension icon, powering the "Block this site" button.

### `web_accessible_resources`
- **Purpose**: Grants Chrome access to redirect blocked requests to the extension's local `blocked.html` informational page.

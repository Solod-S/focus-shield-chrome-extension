# Focus Shield — Privacy Policy

Last updated: September 2026

Focus Shield was built with a fundamental commitment to user privacy.

### 1. Data Collection
Focus Shield does **not** collect, store, transmit, or share any personal data, browsing history, visited URLs, IP addresses, or unique hardware identifiers.

### 2. Local Storage Only
All configuration data (including your Block List, Allow List, schedules, focus session settings, and language preference) is stored exclusively on your device using Chrome's local extension storage (`chrome.storage.local`).
- Focus Shield **never** uses `chrome.storage.sync` or cloud synchronization.
- Focus Shield operates with **zero external backend servers**.

### 3. Password Security
When password protection is enabled:
- Passwords are never saved in plain text.
- Passwords are encrypted locally using the Web Crypto API (PBKDF2 with SHA-256 and a random 16-byte cryptographic salt over 100,000 iterations).
- Backup export files strictly exclude password hashes and salts.

### 4. Third-Party Services & Telemetry
Focus Shield contains **no** third-party analytics, tracking libraries, ads, AI remote integrations, or external telemetry scripts.

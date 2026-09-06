# Website Blocker — техническое задание для AI Coding Agent

## 0. Роль AI-агента

Ты — senior frontend / Chrome Extension engineer.

Нужно реализовать production-ready Chrome Extension для локальной блокировки сайтов и управления фокусом.

Рабочее название проекта:

```text
Website Blocker
```

Название можно будет изменить позже без изменения архитектуры.

Расширение должно по функциональному направлению напоминать BlockSite, но иметь собственные:

- исходный код;
- архитектуру;
- UI;
- тексты;
- icons/assets;
- branding.

Не копировать чужой source code, CSS, UI, screenshots, логотипы или тексты 1:1.

Главная продуктовая идея:

> Пользователь локально задает сайты и правила, которые Chrome должен блокировать постоянно, по расписанию или во время Focus Session.

Ключевые требования:

```text
Light theme only

Languages:
English
Русский
Українська

No account
No backend
No synchronization
No cloud storage
No analytics
No telemetry
No AI

Import settings from JSON
Export settings to JSON
```

Все настройки должны храниться только локально в браузере пользователя.

---

# 1. Основные сценарии

## Заблокировать текущий сайт

```text
User opens youtube.com
↓
Clicks extension icon
↓
Clicks "Block this site"
↓
youtube.com added to Block List
↓
Next visit is blocked
↓
Custom Blocked Page is shown
```

## Добавить сайт вручную

```text
Settings
→ Block List
→ Add site
→ reddit.com
→ Save
```

## Блокировка по расписанию

```text
Instagram blocked:
Mon–Fri
09:00–18:00
```

## Focus Session

```text
Start Focus
25 minutes
↓
Selected distracting sites blocked temporarily
↓
Session ends
↓
Temporary blocking removed
```

## Временно приостановить блокировку

```text
Pause:
5 min
15 min
30 min
1 hour
Until I resume
```

## Защита настроек паролем

```text
Settings protected
↓
User tries to remove blocked site
↓
Password requested
```

## Backup / Restore

```text
Export JSON
→ website-blocker-backup.json
```

Позже:

```text
Import JSON
→ Validate
→ Preview
→ Merge / Replace
```

---

# 2. Целевая аудитория

```text
students
developers
remote workers
freelancers
office workers
people using Pomodoro
people who want fewer distractions
```

---

# 3. Целевая платформа

```text
Google Chrome Desktop
Manifest V3
```

Дополнительно:

```text
Chromium-based browsers
```

Firefox/Safari не входят в v1.

---

# 4. Технологический стек

Использовать:

```text
Manifest V3
React 19
Vite 8
JavaScript ES2022+
```

Без TypeScript.

UI:

```text
React
CSS Modules / modular CSS
lucide-react
```

Tests:

```text
Vitest
React Testing Library
```

Опционально:

```text
Playwright
```

---

# 5. Тема

Только:

```text
Light
```

Не делать:

```text
Dark
System
Theme switcher
```

---

# 6. Локализация

Обязательные языки:

```text
English — en
Русский — ru
Українська — uk
```

Default:

```text
en
```

Manifest localization:

```text
/_locales/en/messages.json
/_locales/ru/messages.json
/_locales/uk/messages.json
```

В manifest:

```json
{
  "default_locale": "en",
  "name": "__MSG_extensionName__",
  "description": "__MSG_extensionDescription__"
}
```

Для UI нужен ручной runtime switch языка:

```text
English
Русский
Українська
```

Для этого использовать локальные dictionaries:

```text
src/i18n/en.json
src/i18n/ru.json
src/i18n/uk.json
```

Не загружать переводы из сети.

---

# 7. Архитектура блокировки

Основной механизм:

```text
chrome.declarativeNetRequest
```

Не использовать blocking webRequest.

Manifest V3 blocking должен быть реализован через declarative rules.

---

# 8. Dynamic и Session Rules

Permanent Block List:

```text
chrome.declarativeNetRequest.updateDynamicRules()
```

Temporary Focus rules:

```text
chrome.declarativeNetRequest.updateSessionRules()
```

Рекомендуемая схема:

```text
Permanent / schedule active blocks → dynamic rules
Focus temporary rules → session rules
```

Допустима единая reconciliation architecture, но temporary и persistent state должны оставаться логически разделены.

---

# 9. Blocked Page

Вместо стандартного:

```text
ERR_BLOCKED_BY_CLIENT
```

показывать:

```text
blocked.html
```

Использовать DNR redirect на extension resource.

`blocked.html` должен быть объявлен через:

```text
web_accessible_resources
```

---

# 10. Blocked Page UI

Пример:

```text
Website Blocker

This site is blocked.

youtube.com

Reason
Focus Session

Session ends in
18:42

[Go Back]
```

Для schedule:

```text
Blocked by schedule
Available after 18:00
```

Для permanent:

```text
Blocked by your Block List
```

Не использовать guilt/shaming UX.

---

# 11. Block List model

```js
{
  id: "site_xxx",
  type: "domain",
  value: "youtube.com",
  enabled: true,
  includeSubdomains: true,
  matchMode: "domain",
  createdAt: "...",
  note: ""
}
```

---

# 12. Типы rules

P0:

```text
Domain
Specific URL/path
Keyword in URL
```

Примеры:

```text
youtube.com
youtube.com/shorts
keyword: casino
```

UI должен скрывать технический DNR syntax.

---

# 13. Domain blocking

Input:

```text
youtube.com
```

Default:

```text
include www
include subdomains
http + https
```

То есть блокировать:

```text
youtube.com/*
www.youtube.com/*
m.youtube.com/*
```

---

# 14. URL normalization

Input:

```text
https://www.youtube.com/watch?v=123
```

Mode:

```text
Whole site
```

→

```text
youtube.com
```

Mode:

```text
This page/path
```

→ сохранить path rule.

---

# 15. Add Current Site

Popup:

```text
Block this site
```

Определить hostname текущего tab.

Не разрешать блокировать:

```text
chrome://
chrome-extension://
edge://
about:
```

Также не блокировать собственные extension pages.

---

# 16. Unblock Current Site

Если site уже в Block List:

```text
Blocked
[Unblock site]
```

Если security enabled — password prompt.

---

# 17. Allow List / Exceptions

Обязательная функция.

Пример:

```text
Block:
youtube.com

Allow:
youtube.com/watch?v=training123
```

Allow rule имеет более высокий priority.

Model:

```js
{
  id,
  value,
  type: "allow",
  enabled: true
}
```

---

# 18. Rule priorities

Вынести в constants.

Пример:

```text
Allow exception: 100
Strict Focus: 90
Focus: 80
Permanent: 60
Schedule: 50
```

---

# 19. Rule ID strategy

Пример ranges:

```text
100000–199999 Permanent
200000–299999 Schedule
300000–399999 Allow
400000–499999 Focus
```

Создать:

```text
ruleIdAllocator.js
```

---

# 20. DNR Reconciliation Engine

Создать:

```text
ruleReconciler.js
```

Он получает:

```text
block list
allow list
schedules
focus state
pause state
master enabled
```

и вычисляет desired rules.

UI не должен напрямую вызывать DNR update methods.

---

# 21. Block List UI

Settings section:

```text
Blocked Sites
```

Пример строки:

```text
youtube.com

Always blocked

[Enabled]
[Edit]
[Delete]
```

Search:

```text
Search blocked sites…
```

---

# 22. Schedules

Пользователь может создать schedule:

```text
Work hours

Mon–Fri
09:00–18:00

Sites:
YouTube
Reddit
X
```

---

# 23. Schedule model

```js
{
  id: "schedule_xxx",
  name: "Work hours",
  enabled: true,
  days: [1,2,3,4,5],
  startTime: "09:00",
  endTime: "18:00",
  siteIds: []
}
```

---

# 24. Overnight schedules

Обязательно:

```text
22:00 → 07:00
```

Написать unit tests.

---

# 25. Multiple intervals

P1.

В P0:

```text
one interval per schedule
multiple schedules allowed
```

---

# 26. Time zone

Использовать локальное системное/browser time.

Не хранить fixed UTC offset.

---

# 27. chrome.alarms

Для schedule transitions использовать:

```text
chrome.alarms
```

Не использовать `setInterval` как основной scheduler.

Pipeline:

```text
calculate next boundary
→ create alarm
→ on alarm reconcile
→ calculate next boundary again
```

---

# 28. Recovery

После:

```text
browser restart
extension reload/update
service worker restart
sleep/wake
```

выполнить:

```text
recalculate schedules
check focus expiry
check pause expiry
reconcile DNR
recreate alarms
```

---

# 29. Focus Mode

Popup:

```text
Focus Mode
```

Presets:

```text
25 min
50 min
90 min
Custom
```

---

# 30. Focus model

```js
{
  active: true,
  sessionId: "...",
  startedAt: 0,
  endsAt: 0,
  durationMinutes: 25,
  siteIds: [],
  strictMode: false
}
```

---

# 31. Default Focus Block List

Settings:

```text
Default Focus Sites
```

Пользователь отмечает сайты.

При Start Focus создаются temporary rules.

---

# 32. Focus timer

Source of truth:

```text
endsAt
```

UI:

```js
remaining = endsAt - Date.now()
```

Service worker завершает focus через alarm.

---

# 33. Pomodoro

P1:

```text
25 focus
5 break
4 cycles
```

P0:

```text
single Focus Session
```

---

# 34. Strict Focus Mode

Opt-in feature.

Когда включена:

```text
cannot stop Focus Session early through normal extension UI
cannot edit Focus Block List during session
```

Важно:

- показать явное предупреждение до Start;
- не препятствовать удалению extension через Chrome;
- не пытаться обходить browser controls.

---

# 35. Pause Blocking

Popup:

```text
Pause Blocking

5 min
15 min
30 min
1 hour
Until I resume
```

---

# 36. Pause model

```js
{
  active: true,
  startedAt,
  endsAt: number | null
}
```

Pause снимает обычные permanent/scheduled blocks.

Strict Focus остается активным.

---

# 37. Password Protection

Settings:

```text
Protect settings with password
```

Защищать:

```text
delete blocked site
disable blocking
modify schedules
import settings
replace settings
remove password
stop protected focus if configured
```

---

# 38. Password security

Не хранить plaintext.

Использовать Web Crypto:

```text
PBKDF2
SHA-256
random salt
high iteration count
```

Хранить:

```js
{
  salt,
  hash,
  iterations,
  algorithmVersion
}
```

---

# 39. Password recovery

Backend отсутствует, поэтому:

```text
no email recovery
```

Добавить:

```text
Reset Extension
```

Reset удаляет local config после нескольких подтверждений.

Не делать hidden backdoor.

---

# 40. Temporary unlock

После правильного пароля:

```text
unlock for 5 minutes
```

Хранить в:

```text
chrome.storage.session
```

---

# 41. Custom Blocked Message

Settings:

```text
Blocked Page Message
```

Лимит:

```text
120 chars
```

Выводить escaped text.

---

# 42. Quick Popup

Пример:

```text
Website Blocker

Blocking: ON

Current site
youtube.com
[Block this site]

Focus
[25 min] [50 min] [Custom]

Pause
[15 min]

Blocked sites: 8

[Open Settings]
```

---

# 43. Toolbar badge

P0:

```text
Focus active → F
Pause active → P
```

Action title:

```text
Focus ends in 18 min
```

---

# 44. Settings navigation

Sections:

```text
Dashboard
Blocked Sites
Exceptions
Schedules
Focus
Blocked Page
Security
Import / Export
Language
About
```

---

# 45. Dashboard

Показывать:

```text
Blocking status
Blocked sites count
Active schedules
Focus status
Pause status
```

---

# 46. Statistics

P1.

Если добавлять:

```text
aggregate local counters only
```

Не detailed browsing history.

---

# 47. Import / Export — обязательная функция

Раздел:

```text
Backup & Restore
```

Buttons:

```text
Export JSON
Import JSON
```

---

# 48. Export JSON

Имя:

```text
website-blocker-backup-YYYY-MM-DD.json
```

Формат:

```json
{
  "app": "website-blocker",
  "schemaVersion": 1,
  "exportedAt": "2026-09-05T10:00:00.000Z",

  "settings": {
    "language": "uk",
    "blockedPageMessage": "Stay focused"
  },

  "blockList": [],
  "allowList": [],
  "schedules": [],
  "focusSettings": {}
}
```

---

# 49. Что не экспортировать

Не экспортировать:

```text
password hash
password salt
temporary unlock
active Focus Session
Pause state
chrome.storage.session data
```

Разрешено informational:

```text
security.passwordEnabled: true
```

без credentials.

---

# 50. Import pipeline

```text
Select JSON
↓
Parse
↓
Validate schema
↓
Check schemaVersion
↓
Normalize
↓
Preview
↓
Merge / Replace
↓
Apply
↓
Reconcile DNR
↓
Recreate alarms
```

---

# 51. Merge

```text
keep existing
add unique rules
merge schedules
skip duplicates
```

Same normalized domain/path не должен дублироваться.

---

# 52. Replace

Перед Replace:

```text
This will replace your current Block List, Exceptions, Schedules and Focus settings.
```

Если password enabled — запросить password.

---

# 53. JSON validation

Проверять:

```text
max size
valid JSON
app field
schemaVersion
arrays
string lengths
domains/URLs
time format
days
booleans
unknown fields
```

Максимум:

```text
5 MB
```

Unknown fields безопасно игнорировать.

---

# 54. Import rollback

Перед import сохранить current state in memory.

Если storage/DNR apply fails:

```text
restore previous state
```

Не оставлять partial import.

---

# 55. Import summary

Показать:

```text
Imported
12 blocked sites
2 exceptions
3 schedules

Skipped
2 duplicates
1 invalid entry
```

---

# 56. Export implementation

Использовать:

```text
Blob
URL.createObjectURL
temporary <a download>
```

Не добавлять downloads permission только ради этого.

---

# 57. Language selector

Settings:

```text
Language

English
Русский
Українська
```

Priority:

```text
saved choice
→ browser UI language if en/ru/uk
→ English
```

---

# 58. Переводы

Не оставлять user-visible hard-coded strings в React.

Все ключи должны быть в EN.

Tests проверяют parity EN/RU/UK.

---

# 59. Storage

Persistent:

```text
chrome.storage.local
```

Для:

```text
settings
blockList
allowList
schedules
focus preferences
security credentials
```

Temporary:

```text
chrome.storage.session
```

Для:

```text
unlock state
short-lived service state
```

Строго запрещено:

```text
chrome.storage.sync
```

---

# 60. No Sync

Это отдельное требование:

> Extension must never use `chrome.storage.sync`.

Никакой Chrome account synchronization.

Backup only:

```text
Export JSON / Import JSON
```

---

# 61. Persistent state example

```js
{
  schemaVersion: 1,

  settings: {
    enabled: true,
    language: "en",
    blockedPageMessage: ""
  },

  blockList: [],
  allowList: [],
  schedules: [],

  focusSettings: {
    defaultMinutes: 25,
    siteIds: [],
    strictModeDefault: false
  },

  focusState: {
    active: false,
    endsAt: null
  },

  pauseState: {
    active: false,
    endsAt: null
  },

  security: {
    passwordEnabled: false,
    passwordCredential: null
  }
}
```

---

# 62. Repository layer

Создать:

```text
settingsRepository.js
```

Не размазывать direct storage calls по UI.

---

# 63. Domain parser

Создать:

```text
domainParser.js
```

Поддержать:

```text
youtube.com
www.youtube.com
https://youtube.com
https://youtube.com/path
localhost
127.0.0.1
```

P0:

```text
localhost/IP blocking allowed
```

---

# 64. Keyword Blocking

P0:

```text
Block when URL contains keyword
```

Не сканировать page content.

UI прямо пишет:

```text
This rule checks the URL only.
```

---

# 65. Adult content

Не делать автоматическую adult-content database в P0.

Без backend это требует большого bundled list и регулярных extension updates.

P2 optional:

```text
static bundled categories
```

---

# 66. Groups

P1:

```text
Social
Video
News
Games
```

В P0 schedule напрямую содержит siteIds.

---

# 67. Service Worker responsibilities

```text
initialize
migrate state
reconcile DNR
manage alarms
start/end focus
start/end pause
evaluate schedules
handle messages
update badge
```

---

# 68. Service Worker startup

Pipeline:

```text
load config
validate/migrate
check focus expiry
check pause expiry
evaluate schedules
reconcile DNR
ensure alarms
update badge
```

---

# 69. Migration system

State:

```text
schemaVersion
```

Создать:

```text
migrations/
```

Import тоже проходит через migration pipeline.

---

# 70. Alarms

Имена:

```text
schedule:next-boundary
focus:end
pause:end
```

Создать:

```text
alarmManager.js
```

---

# 71. Master toggle

Popup/Settings:

```text
Blocking ON/OFF
```

Если password enabled — OFF требует password.

Если Strict Focus active — OFF недоступен до конца session.

---

# 72. Error messages

```text
Invalid website or domain.
This site cannot be blocked.
A matching rule already exists.
Invalid schedule.
Backup file is invalid.
Backup version is newer than supported.
Could not update Chrome blocking rules.
```

---

# 73. DNR errors

Все:

```text
updateDynamicRules()
updateSessionRules()
```

через try/catch.

Не показывать false success.

---

# 74. Rule limits

Не обещать unlimited.

При limit error:

```text
Too many blocking rules.
```

---

# 75. Validation

Можно использовать:

```text
Zod
```

или собственный schema layer.

Если library используется — bundle locally.

---

# 76. Рекомендуемая структура проекта

```text
website-blocker/
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── _locales/
│       ├── en/messages.json
│       ├── ru/messages.json
│       └── uk/messages.json
│
├── src/
│   ├── background/
│   │   ├── service-worker.js
│   │   ├── bootstrap.js
│   │   ├── messageRouter.js
│   │   └── badgeController.js
│   │
│   ├── blocking/
│   │   ├── ruleReconciler.js
│   │   ├── ruleBuilder.js
│   │   ├── ruleIdAllocator.js
│   │   ├── domainParser.js
│   │   └── rulePriorities.js
│   │
│   ├── schedules/
│   │   ├── scheduleEvaluator.js
│   │   ├── nextBoundary.js
│   │   └── alarmManager.js
│   │
│   ├── focus/
│   │   └── focusService.js
│   │
│   ├── pause/
│   │   └── pauseService.js
│   │
│   ├── security/
│   │   ├── passwordService.js
│   │   ├── crypto.js
│   │   └── unlockSession.js
│   │
│   ├── storage/
│   │   ├── settingsRepository.js
│   │   ├── defaults.js
│   │   ├── schema.js
│   │   └── migrations/
│   │
│   ├── backup/
│   │   ├── exportSettings.js
│   │   ├── importSettings.js
│   │   ├── validateBackup.js
│   │   └── mergeBackup.js
│   │
│   ├── i18n/
│   │   ├── index.js
│   │   ├── en.json
│   │   ├── ru.json
│   │   └── uk.json
│   │
│   ├── popup/
│   │   ├── main.jsx
│   │   └── App.jsx
│   │
│   ├── settings/
│   │   ├── main.jsx
│   │   ├── SettingsApp.jsx
│   │   └── sections/
│   │
│   ├── blocked/
│   │   ├── main.jsx
│   │   └── BlockedApp.jsx
│   │
│   └── shared/
│       ├── constants.js
│       └── typedefs.js
│
├── tests/
├── store/
│   ├── description-en.md
│   ├── description-ru.md
│   ├── description-uk.md
│   ├── privacy.md
│   └── permissions.md
│
├── popup.html
├── settings.html
├── blocked.html
├── vite.config.js
├── package.json
├── README.md
└── LICENSE
```

---

# 77. Popup UI

Пример:

```text
Website Blocker

Blocking                         ON

Current site
youtube.com
[Block this site]

Focus
[25 min] [50 min] [Custom]

Pause
[15 min]

8 blocked sites
2 active schedules

[Open Settings]
```

---

# 78. Settings style

Light theme:

```text
white
light gray
blue/indigo accent
red destructive
green active
subtle borders
small shadows
clean tables/cards
```

---

# 79. Accessibility

Использовать:

```text
semantic buttons
labels
keyboard navigation
visible focus
aria-label
dialogs
```

---

# 80. Confirmations

Обязательно для:

```text
Clear all blocked sites
Replace import
Reset extension
Enable Strict Focus
Remove password
```

---

# 81. Unit Tests — Domain Parser

```text
domain
www
http
https
path
uppercase
IDN
localhost
IP
invalid
```

---

# 82. Unit Tests — Rule Builder

```text
domain
subdomains
path
keyword
allow exception
priority
blocked page redirect
```

---

# 83. Unit Tests — Reconciler

```text
add
remove
disable
master OFF
master ON
pause
focus
schedule
allow exception
```

---

# 84. Unit Tests — Schedules

```text
weekday
weekend
before
inside
after
22:00→07:00
midnight
disabled
multiple schedules
```

---

# 85. Unit Tests — Focus

```text
25 min
endsAt
restart recovery
alarm
manual stop
strict stop denied
```

---

# 86. Unit Tests — Pause

```text
5 min
until resume
expiry
restore blocking
strict focus remains
```

---

# 87. Unit Tests — Password

```text
hash
verify correct
verify incorrect
random salt
no plaintext
session unlock
unlock expiry
```

---

# 88. Unit Tests — Import

```text
valid
invalid JSON
wrong app
future schema
invalid domain
duplicate
invalid schedule
Merge
Replace
rollback
unknown fields
size limit
```

---

# 89. Unit Tests — i18n

```text
EN all keys
RU keys
UK keys
fallback
manual switch
```

---

# 90. Manual QA

```text
[ ] Load unpacked
[ ] Popup
[ ] Settings
[ ] Blocked Page

[ ] English
[ ] Русский
[ ] Українська
[ ] runtime switch

[ ] Block current site
[ ] manual block
[ ] subdomain
[ ] path
[ ] keyword
[ ] unblock
[ ] allow exception

[ ] master toggle

[ ] schedule
[ ] weekdays
[ ] boundary
[ ] overnight

[ ] Focus 25
[ ] Focus 50
[ ] custom
[ ] restart recovery
[ ] auto end
[ ] Strict Focus

[ ] Pause 5
[ ] Pause 15
[ ] Until Resume
[ ] auto resume

[ ] password setup
[ ] wrong password
[ ] correct password
[ ] no plaintext
[ ] unlock expiry

[ ] Export JSON
[ ] password data excluded
[ ] Import JSON
[ ] preview
[ ] Merge
[ ] Replace
[ ] invalid backup
[ ] duplicate handling
[ ] DNR updated after import

[ ] browser restart recovery
[ ] alarms recreated

[ ] no chrome.storage.sync
[ ] no backend
[ ] no analytics

[ ] npm test
[ ] npm run build
[ ] npm run package
```

---

# 91. Privacy

Создать:

```text
store/privacy.md
```

Смысл:

```text
All Block List, schedules, Focus settings and preferences are stored locally in Chrome.

The extension does not use accounts, cloud sync, analytics or developer-owned backend servers.

Browsing history is not collected.

Visited URLs, lists and settings are not uploaded.

JSON import/export is performed locally using files selected by the user.
```

---

# 92. Permissions explanation

Создать:

```text
store/permissions.md
```

### declarativeNetRequest

```text
Used to apply locally created website blocking and exception rules.
```

### storage

```text
Used to store Block List, schedules, Focus settings, language and security settings locally.
```

### alarms

```text
Used to activate/deactivate schedules, end Focus Sessions and resume blocking after Pause.
```

### activeTab

```text
Used after user interaction to identify the current website for "Block this site".
```

---

# 93. Recommended permissions

Ориентировочно:

```json
{
  "permissions": [
    "declarativeNetRequest",
    "storage",
    "alarms",
    "activeTab"
  ]
}
```

Добавить `web_accessible_resources` для `blocked.html`.

Не добавлять:

```text
history
cookies
webRequest
webRequestBlocking
storage.sync
```

---

# 94. Store descriptions

Создать:

```text
store/description-en.md
store/description-ru.md
store/description-uk.md
```

EN:

```text
Block distracting websites, create schedules and Focus Sessions, and keep your settings locally in Chrome.
```

RU:

```text
Блокируйте отвлекающие сайты, создавайте расписания и фокус-сессии. Все настройки хранятся локально.
```

UK:

```text
Блокуйте сайти, що відволікають, створюйте розклади та фокус-сесії. Усі налаштування зберігаються локально.
```

---

# 95. README

README на английском:

```text
Website Blocker
Features
Block List
Exceptions
Schedules
Focus Mode
Pause
Password Protection
Import / Export
Languages
Architecture
Declarative Net Request
Permissions
Privacy
Development
Build
Load unpacked
Tests
Known limitations
Roadmap
```

---

# 96. Build scripts

```json
{
  "scripts": {
    "dev": "...",
    "build": "...",
    "test": "...",
    "test:watch": "...",
    "lint": "...",
    "package": "..."
  }
}
```

---

# 97. Build output

```bash
npm run build
```

→

```text
dist/
```

Готово для:

```text
chrome://extensions
→ Developer mode
→ Load unpacked
→ dist/
```

---

# 98. Release ZIP

```bash
npm run package
```

→

```text
release/website-blocker-v1.0.0.zip
```

---

# 99. P0 — обязательный MVP

```text
Manifest V3
React 19
Vite 8
JavaScript
Light theme

English
Russian
Ukrainian
runtime language switch
manifest localization

Declarative Net Request
dynamic rules
session rules

Block List
Block current site
manual add
domain normalization
subdomains
specific path
URL keyword

Allow List / Exceptions

Custom Blocked Page
reason
Go Back

Master Blocking toggle

Schedules
days
start/end
overnight
chrome.alarms
recovery

Focus Session
25
50
Custom
Focus list
endsAt timer
end alarm

Strict Focus opt-in

Pause
5
15
30
60
Until Resume
pause alarm

Password
PBKDF2/Web Crypto
no plaintext
session unlock

Popup
Settings

JSON Export
JSON Import
schemaVersion
validation
preview
Merge
Replace
dedupe
rollback
exclude password credentials

chrome.storage.local
chrome.storage.session
NO chrome.storage.sync

Tests
Build
ZIP
README
EN/RU/UK store descriptions
Privacy
Permissions
```

---

# 100. P1

```text
Pomodoro cycles
Break mode
Site groups
Multiple schedule intervals
Temporary access from Blocked Page
Aggregate local statistics
Context menu
Keyboard shortcuts
Custom redirect destination
Bulk actions
Favorites/groups
```

---

# 101. P2

```text
Cloud sync
Accounts
Mobile app
Admin dashboard
Remote management
Team policies
AI suggestions
Automatic adult-content DB
Cloud stats
Social login
Subscriptions
```

---

# 102. Что запрещено

Не добавлять:

```text
backend
Firebase
Supabase
server database
accounts
analytics
telemetry
tracking
AI
remote code
chrome.storage.sync
```

Не собирать browsing history.

Не хранить plaintext password.

Не копировать BlockSite UI/branding/source.

Не использовать MV2 blocking webRequest.

---

# 103. Definition of Done

Готово только если:

1. Extension устанавливается.
2. Popup работает.
3. Settings работает.
4. Blocked Page работает.
5. EN работает.
6. RU работает.
7. UK работает.
8. Runtime language switch работает.
9. Current site блокируется.
10. Manual add работает.
11. Domain/subdomain работает.
12. Path работает.
13. Keyword URL rule работает.
14. Exception работает.
15. DNR rules реально создаются.
16. Blocked request ведет на blocked.html.
17. Master toggle работает.
18. Schedule работает.
19. Overnight работает.
20. Restart recovery работает.
21. Focus работает.
22. Focus авто-завершается.
23. Strict Focus работает.
24. Pause работает.
25. Pause авто-завершается.
26. Password hash используется.
27. Plaintext password отсутствует.
28. Export работает.
29. Import работает.
30. Merge работает.
31. Replace работает.
32. Invalid JSON отклоняется.
33. Password credentials не экспортируются.
34. Import обновляет DNR.
35. chrome.storage.sync не используется.
36. Backend отсутствует.
37. Analytics отсутствует.
38. Tests проходят.
39. Build проходит.
40. ZIP создается.
41. README готов.
42. Store files готовы.

---

# 104. План реализации AI Coding Agent

## Этап 1 — Scaffold

Создать:

```text
Manifest V3
React
Vite
popup
settings
blocked page
service worker
_locales
icons
```

## Этап 2 — State Schema

```text
defaults
schemas
repository
schemaVersion
migrations
```

## Этап 3 — i18n

Сразу:

```text
EN
RU
UK
runtime switch
manifest localization
fallback
```

## Этап 4 — Domain Parser

Normalization + tests.

## Этап 5 — DNR Rule Builder

```text
domain
path
keyword
allow
blocked page redirect
```

## Этап 6 — Reconciler

Проверить:

```text
add
remove
disable
allow
master OFF
```

## Этап 7 — Popup

```text
current host
Block this site
status
Open Settings
```

## Этап 8 — Blocked Page

```text
host
reason
Go Back
```

## Этап 9 — Block List / Exceptions

Settings UI.

## Этап 10 — Schedules

```text
model
evaluator
overnight
alarms
recovery
```

## Этап 11 — Focus

```text
25 / 50 / Custom
endsAt
rules
alarm
timer
```

## Этап 12 — Strict Focus

Opt-in protection.

## Этап 13 — Pause

Temporary pause + alarm.

## Этап 14 — Password

Web Crypto PBKDF2.

## Этап 15 — Import / Export

```text
export
download
file picker
validation
preview
Merge
Replace
rollback
```

## Этап 16 — Recovery

Проверить:

```text
browser restart
service worker restart
extension reload
sleep/wake
expired focus
expired pause
schedule
```

## Этап 17 — UI polish

После корректной blocking logic.

## Этап 18 — Automated Tests

Покрыть core business logic.

## Этап 19 — Manual QA

Пройти checklist.

## Этап 20 — Build

```bash
npm run lint
npm test
npm run build
npm run package
```

## Этап 21 — Store preparation

Подготовить:

```text
README
description EN
description RU
description UK
privacy
permissions
release ZIP
```

---

# 105. Приоритеты

```text
1. Correct blocking behavior
2. User control / reversibility
3. Privacy
4. Schedule/Focus reliability
5. Storage integrity
6. Import/export safety
7. Localization correctness
8. UX
9. Visual polish
```

---

# 106. Итоговый ожидаемый результат

AI Agent должен предоставить:

```text
1. Полный исходный код
2. Рабочий Chrome Extension
3. dist/
4. release/website-blocker-v1.0.0.zip
5. README.md
6. Automated tests
7. EN/RU/UK localization
8. JSON import/export
9. store/description-en.md
10. store/description-ru.md
11. store/description-uk.md
12. store/privacy.md
13. store/permissions.md
14. Краткий отчет:
    - blocking architecture;
    - DNR rules;
    - schedules;
    - Focus;
    - password protection;
    - import/export;
    - permissions;
    - limitations;
    - P1/P2 roadmap.
```

---

# 107. Финальная продуктовая формулировка

Website Blocker — локальное Chrome Extension для блокировки отвлекающих сайтов.

Основные функции:

```text
Block List
Exceptions
Schedules
Focus Sessions
Strict Focus
Temporary Pause
Password Protection
Custom Blocked Page
JSON Backup / Restore
English / Russian / Ukrainian
```

Архитектура:

```text
Manifest V3
Declarative Net Request
Dynamic/Session Rules
chrome.alarms
chrome.storage.local
chrome.storage.session
```

Ключевой принцип:

> Все пользовательские настройки остаются локально в Chrome.

No Sync:

> Extension must never use `chrome.storage.sync`.

Backup:

> Settings can be exported to a local JSON file and later imported with validation, preview and Merge/Replace modes.

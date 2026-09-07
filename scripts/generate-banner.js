import fs from 'node:fs';
import path from 'node:path';

const svgBanner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 440" width="1280" height="440">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a1a" />
      <stop offset="50%" stop-color="#0e1329" />
      <stop offset="100%" stop-color="#080714" />
    </linearGradient>

    <!-- Glow Orbs -->
    <radialGradient id="nebulaPurple" cx="30%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#4f46e5" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="nebulaBlue" cx="70%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#06b6d4" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Shield Gradient -->
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#4338ca" />
    </linearGradient>

    <linearGradient id="badgeBorder" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.25)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.05)" />
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="glowShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="#6366f1" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1280" height="440" fill="url(#bgGrad)" />

  <!-- Ambient Nebulae -->
  <rect width="1280" height="440" fill="url(#nebulaPurple)" />
  <rect width="1280" height="440" fill="url(#nebulaBlue)" />

  <!-- Grid overlay -->
  <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
    <line x1="0" y1="80" x2="1280" y2="80" />
    <line x1="0" y1="160" x2="1280" y2="160" />
    <line x1="0" y1="240" x2="1280" y2="240" />
    <line x1="0" y1="320" x2="1280" y2="320" />
    <line x1="0" y1="400" x2="1280" y2="400" />
    <line x1="160" y1="0" x2="160" y2="440" />
    <line x1="320" y1="0" x2="320" y2="440" />
    <line x1="480" y1="0" x2="480" y2="440" />
    <line x1="640" y1="0" x2="640" y2="440" />
    <line x1="800" y1="0" x2="800" y2="440" />
    <line x1="960" y1="0" x2="960" y2="440" />
    <line x1="1120" y1="0" x2="1120" y2="440" />
  </g>

  <!-- Central Shield Logo -->
  <g transform="translate(640, 110)" filter="url(#glowShadow)">
    <!-- Outer Shield -->
    <path d="M 0 -55 Q 48 -55 52 -10 Q 52 40 0 65 Q -52 40 -52 -10 Q -48 -55 0 -55 Z" fill="url(#shieldGrad)" />
    <!-- Inner Highlight -->
    <path d="M 0 -47 Q 40 -47 44 -8 Q 44 32 0 54 Q -44 32 -44 -8 Q -40 -47 0 -47 Z" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
    <!-- Center Target Ring & Dot -->
    <circle cx="0" cy="0" r="16" fill="none" stroke="#ffffff" stroke-width="4" />
    <circle cx="0" cy="0" r="5" fill="#ffffff" />
  </g>

  <!-- Typography -->
  <g text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif">
    <!-- Title -->
    <text x="640" y="235" font-size="44" font-weight="800" fill="#ffffff" letter-spacing="-1">Focus Shield</text>

    <!-- Subtitle -->
    <text x="640" y="275" font-size="20" font-weight="400" fill="#94a3b8" letter-spacing="0">
      Focus on Important &amp; Forget About Distractions
    </text>
  </g>

  <!-- Feature Badges -->
  <g transform="translate(640, 340)" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">
    <!-- Badge 1: Site Blocker -->
    <g transform="translate(-390, 0)">
      <rect x="-85" y="-18" width="170" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="url(#badgeBorder)" stroke-width="1" />
      <text x="0" y="5" fill="#e2e8f0">🛡️ Website Blocker</text>
    </g>

    <!-- Badge 2: Pomodoro Focus -->
    <g transform="translate(-195, 0)">
      <rect x="-85" y="-18" width="170" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="url(#badgeBorder)" stroke-width="1" />
      <text x="0" y="5" fill="#e2e8f0">⏱️ Pomodoro Cycles</text>
    </g>

    <!-- Badge 3: Overnight Schedules -->
    <g transform="translate(0, 0)">
      <rect x="-85" y="-18" width="170" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="url(#badgeBorder)" stroke-width="1" />
      <text x="0" y="5" fill="#e2e8f0">🌙 Night Schedules</text>
    </g>

    <!-- Badge 4: Password Security -->
    <g transform="translate(195, 0)">
      <rect x="-85" y="-18" width="170" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="url(#badgeBorder)" stroke-width="1" />
      <text x="0" y="5" fill="#e2e8f0">🔒 Password Guard</text>
    </g>

    <!-- Badge 5: 100% Local Privacy -->
    <g transform="translate(390, 0)">
      <rect x="-85" y="-18" width="170" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="url(#badgeBorder)" stroke-width="1" />
      <text x="0" y="5" fill="#e2e8f0">⚡ 100% Local &amp; Private</text>
    </g>
  </g>
</svg>`;

const outPath = path.resolve('assets/banner.svg');
fs.writeFileSync(outPath, svgBanner, 'utf-8');
console.log('Successfully generated assets/banner.svg');

import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const requiredFiles = [
  'manifest.json',
  'service-worker.js',
  'popup.html',
  'settings.html',
  'blocked.html',
  'icons/icon-16.png',
  'icons/icon-128.png',
  '_locales/en/messages.json',
  '_locales/ru/messages.json',
  '_locales/uk/messages.json'
];

console.log('Validating build output in dist/...');
let missing = 0;
for (const file of requiredFiles) {
  const fullPath = path.join(distDir, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`[Missing in dist]: ${file}`);
    missing++;
  }
}

if (missing > 0) {
  console.error(`Postbuild failed: ${missing} required files missing!`);
  process.exit(1);
} else {
  console.log('Postbuild verification passed! Extension ready to load unpacked.');
}

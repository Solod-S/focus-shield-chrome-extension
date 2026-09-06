import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';

const releaseDir = path.resolve('release');
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const distDir = path.resolve('dist');
if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist. Run npm run build first.');
  process.exit(1);
}

const zipFiles = [
  path.join(releaseDir, 'focus-shield-v1.0.0.zip'),
  path.join(releaseDir, 'website-blocker-v1.0.0.zip')
];

for (const zipPath of zipFiles) {
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`Created package: ${path.basename(zipPath)} (${archive.pointer()} bytes)`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(distDir, false);
  archive.finalize();
}

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPng(width, height, renderPixel) {
  // RGBA raw scanlines: each scanline starts with filter byte 0
  const rowBytes = width * 4;
  const rawData = Buffer.alloc((rowBytes + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = renderPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  function makeChunk(type, data) {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const full = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(full), 0);
    return Buffer.concat([lenBuf, full, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function renderShield(x, y, w, h) {
  // Normalize coordinates to -1 .. 1
  const nx = (x / (w - 1)) * 2 - 1;
  const ny = (y / (h - 1)) * 2 - 1;

  // Outer circle/shield boundary
  // Shape of shield: top curved, sides straight down to y=0.1, then tapers to a point at bottom
  let inShield = false;
  let inInner = false;

  const absX = Math.abs(nx);
  if (ny >= -0.85 && ny <= 0.9) {
    if (ny < 0.1) {
      if (absX <= 0.85) inShield = true;
    } else {
      // tapering
      const progress = (ny - 0.1) / 0.8;
      if (absX <= 0.85 * (1 - progress * 0.85)) inShield = true;
    }
  }

  // Inner cutout for emblem
  if (ny >= -0.65 && ny <= 0.7) {
    if (ny < 0.1) {
      if (absX <= 0.65) inInner = true;
    } else {
      const progress = (ny - 0.1) / 0.6;
      if (absX <= 0.65 * (1 - progress * 0.85)) inInner = true;
    }
  }

  if (!inShield) {
    return [0, 0, 0, 0];
  }

  // Indigo gradient
  // Top: #6366f1 (99, 102, 241), Bottom: #4338ca (67, 56, 202)
  const gradT = (ny + 1) / 2;
  const rShield = Math.round(99 * (1 - gradT) + 67 * gradT);
  const gShield = Math.round(102 * (1 - gradT) + 56 * gradT);
  const bShield = Math.round(241 * (1 - gradT) + 202 * gradT);

  // Draw central checkmark / target circle in white
  // Small circular dot in center or checkmark
  const dist = Math.sqrt(nx * nx + (ny + 0.1) * (ny + 0.1));
  if (dist < 0.28 && dist > 0.14) {
    return [255, 255, 255, 255];
  }
  if (dist <= 0.08) {
    return [255, 255, 255, 255];
  }

  return [rShield, gShield, bShield, 255];
}

const sizes = [16, 32, 48, 128];
const outDir = path.resolve('public/icons');
fs.mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  const buf = createPng(size, size, renderShield);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), buf);
  console.log(`Generated icon-${size}.png (${size}x${size})`);
}

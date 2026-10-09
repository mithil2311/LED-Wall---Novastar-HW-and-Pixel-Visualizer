const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPng(width, height, isMaskable = false) {
  // CRC32 implementation
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
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

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const full = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(full), 0);
    return Buffer.concat([len, full, crcBuf]);
  }

  // PNG Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw Image Data (with filter byte 0 at start of each scanline)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const safeRadius = isMaskable ? width * 0.38 : width * 0.46;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Dark futuristic slate background with subtle diagonal gradient
      const grad = (x / width + y / height) * 0.5;
      let r = Math.floor(2 + grad * 14);
      let g = Math.floor(6 + grad * 20);
      let b = Math.floor(24 + grad * 45);
      let a = 255;

      // Rounded squircle border
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check inner LED matrix canvas area
      const matrixW = width * (isMaskable ? 0.65 : 0.76);
      const matrixH = height * (isMaskable ? 0.42 : 0.48);
      const matrixY1 = cy - height * (isMaskable ? 0.28 : 0.32);
      const matrixY2 = matrixY1 + matrixH;
      const matrixX1 = cx - matrixW / 2;
      const matrixX2 = cx + matrixW / 2;

      if (x >= matrixX1 && x <= matrixX2 && y >= matrixY1 && y <= matrixY2) {
        // Inside LED Cabinet Matrix
        r = 15; g = 23; b = 42;

        // Border outline
        if (x <= matrixX1 + 2 || x >= matrixX2 - 2 || y <= matrixY1 + 2 || y >= matrixY2 - 2) {
          r = 56; g = 189; b = 248; // Cyan highlight
        } else {
          // Discrete LED RGB Diodes
          const gridPitch = Math.max(8, Math.floor(width / 22));
          const relX = (x - matrixX1) % gridPitch;
          const relY = (y - matrixY1) % gridPitch;
          const centerD = Math.sqrt((relX - gridPitch / 2) ** 2 + (relY - gridPitch / 2) ** 2);
          const diodeR = gridPitch * 0.32;

          if (centerD <= diodeR) {
            const diodeIndex = Math.floor((x - matrixX1) / gridPitch) % 3;
            if (diodeIndex === 0) { r = 239; g = 68; b = 68; } // Red diode
            else if (diodeIndex === 1) { r = 34; g = 197; b = 94; } // Green diode
            else { r = 59; g = 130; b = 246; } // Blue diode
          }
        }
      }

      // NovaStar Processor chip badge in bottom section
      const chipW = width * (isMaskable ? 0.52 : 0.60);
      const chipH = height * (isMaskable ? 0.22 : 0.24);
      const chipY1 = cy + height * (isMaskable ? 0.12 : 0.14);
      const chipY2 = chipY1 + chipH;
      const chipX1 = cx - chipW / 2;
      const chipX2 = cx + chipW / 2;

      if (x >= chipX1 && x <= chipX2 && y >= chipY1 && y <= chipY2) {
        r = 30; g = 41; b = 59; // Slate 800
        if (x <= chipX1 + 3 || x >= chipX2 - 3 || y <= chipY1 + 3 || y >= chipY2 - 3) {
          r = 96; g = 165; b = 250; // Blue 400
        } else {
          // Inner glowing tech core
          const cDist = Math.sqrt((x - cx) ** 2 + (y - (chipY1 + chipH / 2)) ** 2);
          if (cDist < width * 0.04) {
            r = 56; g = 189; b = 248;
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const pubDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(pubDir, 'favicon.ico'), createPng(64, 64, false));

console.log('Successfully generated all PWA PNG icons!');

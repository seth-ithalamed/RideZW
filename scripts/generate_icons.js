import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, drawFn) {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel + 1; // +1 filter byte (0)
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // Deflate compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // No interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(4 + 4 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 table & function
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

function drawRideZwIcon(x, y, w, h) {
  // Normalize 0..1
  const nx = x / w;
  const ny = y / h;

  // Background: Deep Navy Blue (#082f49 -> #0369a1)
  const bgR = Math.round(8 + nx * 5 + ny * 10);
  const bgG = Math.round(47 + nx * 30 + ny * 60);
  const bgB = Math.round(73 + nx * 70 + ny * 90);

  // Center car/taxi badge
  const cx = 0.5;
  const cy = 0.44;
  const dx = nx - cx;
  const dy = ny - cy;

  // Car Body silhouette
  const isCarRoof = Math.abs(dx) <= 0.22 && dy >= -0.22 && dy <= -0.06;
  const isCarBase = Math.abs(dx) <= 0.36 && dy >= -0.06 && dy <= 0.14;
  const isCarWheelL = Math.hypot(nx - 0.32, ny - 0.58) <= 0.085;
  const isCarWheelR = Math.hypot(nx - 0.68, ny - 0.58) <= 0.085;

  if (isCarWheelL || isCarWheelR) {
    const wheelDist = Math.min(
      Math.hypot(nx - 0.32, ny - 0.58),
      Math.hypot(nx - 0.68, ny - 0.58)
    );
    if (wheelDist < 0.04) {
      return [255, 255, 255, 255]; // White rim
    }
    return [15, 23, 42, 255]; // Dark slate tire
  }

  // Window inside car roof
  const isWindow = Math.abs(dx) <= 0.17 && dy >= -0.20 && dy <= -0.07;
  if (isWindow) {
    return [12, 74, 110, 255]; // Deep Sky glass
  }

  if (isCarRoof || isCarBase) {
    // Gold / Amber (#f59e0b)
    const isHighlight = dy < -0.15;
    if (isHighlight) {
      return [251, 191, 36, 255]; // Amber 400
    }
    return [245, 158, 11, 255]; // Amber 500
  }

  // Headlights
  if (Math.abs(dx) >= 0.30 && Math.abs(dx) <= 0.35 && dy >= 0.02 && dy <= 0.08) {
    return [255, 255, 255, 255];
  }

  // Text "RIDEZW" band across bottom
  if (ny >= 0.74 && ny <= 0.86 && Math.abs(dx) <= 0.38) {
    // Contrast banner badge
    if (ny >= 0.76 && ny <= 0.84 && Math.abs(dx) <= 0.35) {
      // Golden text area
      if (dx > 0.05) {
        return [245, 158, 11, 255]; // ZW in gold
      }
      return [255, 255, 255, 255]; // RIDE in white
    }
  }

  return [bgR, bgG, bgB, 255];
}

// Generate icons
const icon192 = createPng(192, 192, drawRideZwIcon);
fs.writeFileSync('./public/icon-192.png', icon192);

const icon512 = createPng(512, 512, drawRideZwIcon);
fs.writeFileSync('./public/icon-512.png', icon512);

const appleTouch = createPng(180, 180, drawRideZwIcon);
fs.writeFileSync('./public/apple-touch-icon.png', appleTouch);

console.log('Successfully generated icon-192.png, icon-512.png, and apple-touch-icon.png');

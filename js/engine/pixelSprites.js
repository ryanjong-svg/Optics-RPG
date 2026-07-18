import { SHAPES, PALETTES } from '../data/pixelArt.js';

const rowCache = new Map();

function fullRows(shapeKey) {
  if (rowCache.has(shapeKey)) return rowCache.get(shapeKey);
  const half = SHAPES[shapeKey];
  const rows = half.map(row => {
    const mirrored = row.split('').reverse().join('');
    return row + mirrored;
  });
  rowCache.set(shapeKey, rows);
  return rows;
}

// Draws a shape+palette centered at (cx, cy) in canvas pixels. `px` is the size
// of one sprite-pixel in real canvas pixels — bump it up for a "portrait" close-up.
export function drawSprite(ctx, shapeKey, paletteKey, cx, cy, px) {
  const rows = fullRows(shapeKey);
  const palette = PALETTES[paletteKey];
  if (!rows || !palette) return;
  const w = rows[0].length;
  const h = rows.length;
  const originX = cx - (w * px) / 2;
  const originY = cy - (h * px) / 2;
  for (let r = 0; r < h; r++) {
    const row = rows[r];
    for (let c = 0; c < w; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(originX + c * px), Math.round(originY + r * px), px, px);
    }
  }
}

export function spriteSize(shapeKey, px) {
  const rows = SHAPES[shapeKey];
  return { w: rows[0].length * 2 * px, h: rows.length * px };
}

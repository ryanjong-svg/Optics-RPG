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

// Thematic canvas-drawn backdrop behind battle portraits, one per zone (and
// a darker/denser variant for each "_deep" zone), instead of a flat dark
// fill. Each pattern is a loose visual nod to the zone's real optics concept
// (grating -> diffraction fringes, hologram -> interference rings, etc.).
const SPECTRUM_COLORS = ['#ff5050', '#ffb04d', '#ffe14d', '#7dff7d', '#4dc8ff', '#b06dff'];
export const BACKDROP_THEMES = {
  village: { base: ['#141008', '#241c0e'], accent: '#e0b060', pattern: 'none' },
  mirrors: { base: ['#0d1420', '#1c2c3f'], accent: '#8fd8ff', pattern: 'bands' },
  mirrors_deep: { base: ['#060a12', '#0d1826'], accent: '#5fb8e0', pattern: 'bands' },
  prism: { base: ['#150c1c', '#241830'], accent: null, pattern: 'spectrum' },
  prism_deep: { base: ['#0c0714', '#170c22'], accent: null, pattern: 'spectrum' },
  fiber: { base: ['#050d12', '#0a1a20'], accent: '#4de0c0', pattern: 'streaks' },
  fiber_deep: { base: ['#030809', '#061014'], accent: '#2fa088', pattern: 'streaks' },
  grating: { base: ['#0c1018', '#161c28'], accent: null, pattern: 'grating' },
  grating_deep: { base: ['#07090e', '#0e1219'], accent: null, pattern: 'grating' },
  hologram: { base: ['#140b1e', '#241436'], accent: '#d88fff', pattern: 'fringes' },
  hologram_deep: { base: ['#0b0714', '#170a24'], accent: '#a860d0', pattern: 'fringes' },
  lab: { base: ['#0a140c', '#132218'], accent: '#8fff9a', pattern: 'grid' },
  lab_deep: { base: ['#080f09', '#0e1a10'], accent: '#ffb84d', pattern: 'grid' }
};

export function drawZoneBackdrop(ctx, w, h, zone) {
  const theme = BACKDROP_THEMES[zone] || BACKDROP_THEMES.village;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, theme.base[0]);
  grad.addColorStop(1, theme.base[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  switch (theme.pattern) {
    case 'bands':
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.15;
      for (let y = 8; y < h; y += 14) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(-10, h * 0.2); ctx.lineTo(w * 0.6, h + 10); ctx.stroke();
      break;
    case 'spectrum':
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 4;
      SPECTRUM_COLORS.forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.moveTo(-20 + i * 18, h + 10);
        ctx.lineTo(w * 0.7 + i * 18, -10);
        ctx.stroke();
      });
      break;
    case 'grating':
      ctx.globalAlpha = 0.14;
      ctx.lineWidth = 2;
      for (let x = 4; x < w; x += 6) {
        ctx.strokeStyle = SPECTRUM_COLORS[Math.floor(x / 6) % SPECTRUM_COLORS.length];
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      break;
    case 'streaks':
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const y = 10 + i * 22;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + 4); ctx.stroke();
      }
      break;
    case 'fringes':
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.18;
      for (let r = 10; r < w + h; r += 12) {
        ctx.beginPath(); ctx.arc(w / 2, h * 0.3, r, 0, Math.PI * 2); ctx.stroke();
      }
      break;
    case 'grid':
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.16;
      for (let x = 0; x <= w; x += 10) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y <= h; y += 10) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = theme.accent;
      [[10, 10], [w - 10, 20], [20, h - 10], [w - 20, h - 20]].forEach(([x, y]) => {
        ctx.fillRect(x - 1, y - 1, 2, 2);
      });
      break;
    default:
      break;
  }
  ctx.restore();
}

export function spriteSize(shapeKey, px) {
  const rows = SHAPES[shapeKey];
  return { w: rows[0].length * 2 * px, h: rows.length * px };
}

// A soft ground-contact shadow, drawn at a fixed ground point (it does not
// bob with the sprite above it) — keeps standing sprites from looking like
// they're floating.
export function drawGroundShadow(ctx, sx, sy, radiusX = 14, radiusY = 5) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(sx, sy + 3, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Small deterministic-but-time-varying vertical offset so idle sprites feel
// alive instead of static. `seed` just staggers phase between sprites.
export function idleBob(seed = 0, amplitude = 1.6, periodMs = 400) {
  return Math.sin(Date.now() / periodMs + seed) * amplitude;
}

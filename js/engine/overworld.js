import { MAPS, mapWidth, mapHeight } from '../data/maps.js';
import { MATERIALS } from '../data/materials.js';
import { ENEMIES } from '../data/enemies.js';
import { CHARACTER_SPRITES, itemSprite } from '../data/pixelArt.js';
import { drawSprite, spriteSize, drawGroundShadow, idleBob, drawZoneAmbience, playerPaletteFor } from './pixelSprites.js';
import { startBattle, eliteChanceForCycle } from './battle.js';
import { openCraft } from './craft.js';
import { showMessages, startNpcInteraction } from './dialogueUI.js';
import { BOSS_LOCKED_MESSAGE } from '../data/dialogue.js';
import { saveGame } from './save.js';
import { unlockCodex } from './state.js';
import { checkNewAchievements, formatAchievementLines } from '../data/achievements.js';
import { showToast } from './toastUI.js';
import * as audio from './audio.js';

// Toasts (not the modal showMessages queue used for pickup/secret/arrival
// text) so a milestone achievement never blocks or gets tangled up with
// whatever informational message is already about to be shown.
function announceNewAchievements(game, state) {
  const newlyUnlocked = checkNewAchievements(state);
  if (!newlyUnlocked.length) return;
  audio.playAchievement();
  formatAchievementLines(newlyUnlocked).forEach(m => showToast(game, m));
}

const SPRITE_PX = 2; // one sprite-pixel = 2 real canvas pixels

// Isometric projection constants (2:1 diamond tiles, XCOM/tactical-grid style).
const ISO_W = 48;
const ISO_H = 24;
const WALL_ELEVATION = 22;
const ORIGIN_X = 290;
const ORIGIN_Y = 70;

function toScreen(x, y) {
  return {
    sx: ORIGIN_X + (x - y) * (ISO_W / 2),
    sy: ORIGIN_Y + (x + y) * (ISO_H / 2)
  };
}

export const ZONE_ENCOUNTERS = {
  village: ['wisp', 'puddle_imp', 'glint_moth'],
  mirrors: ['mirror_golem', 'fractured_pane'],
  prism: ['prism_sprite', 'spectral_moth'],
  fiber: ['signal_wisp', 'drift_echo'],
  grating: ['slit_wisp', 'grating_wraith'],
  hologram: ['standing_wave', 'fringe_phantom'],
  lab: [],
  mirrors_deep: ['split_ray_wisp', 'twin_flicker'],
  prism_deep: ['fire_moth', 'ember_shard'],
  fiber_deep: ['mode_flicker', 'core_leech'],
  grating_deep: ['lattice_wisp', 'forbidden_mote'],
  hologram_deep: ['phase_echo', 'fringe_ghost'],
  lab_deep: ['dark_current_wisp', 'gain_specter']
};

// The 6 depth zones occasionally throw 2 regular enemies at once instead of
// 1 — "later zones" get real multi-enemy tactical texture (every attack
// ability cleaves to all living targets in a pack) without touching the
// original 7 outer zones' pacing at all.
const PACK_ELIGIBLE_ZONES = new Set(['mirrors_deep', 'prism_deep', 'fiber_deep', 'grating_deep', 'hologram_deep', 'lab_deep']);

// Each zone gets a distinct raised-block palette (top/left/right face shading)
// so a glance at the walls alone tells you which area you're in.
export const ZONE_WALL_COLORS = {
  village: { top: '#6b4530', left: '#4a2f22', right: '#34201a' },
  mirrors: { top: '#7c8790', left: '#5c6570', right: '#3f4750' },
  prism: { top: '#7a5296', left: '#5a3a6e', right: '#432a54' },
  fiber: { top: '#3f7d7d', left: '#2f5c5c', right: '#234545' },
  grating: { top: '#8a7a3a', left: '#6b5c2a', right: '#4a3f1c' },
  hologram: { top: '#6b3a7a', left: '#4a2a5c', right: '#2f1a3f' },
  lab: { top: '#3c4f7d', left: '#2a3a5c', right: '#1f2c45' },
  mirrors_deep: { top: '#4a5580', left: '#333c5c', right: '#232a42' },
  prism_deep: { top: '#8a3a2a', left: '#6b2a1e', right: '#4a1c14' },
  fiber_deep: { top: '#2a6b6b', left: '#1e4a4a', right: '#143434' },
  grating_deep: { top: '#5c4a8a', left: '#3f3266', right: '#2a2248' },
  hologram_deep: { top: '#8a2a60', left: '#6b1e4a', right: '#4a1434' },
  lab_deep: { top: '#8a7a2a', left: '#6b5c1e', right: '#4a3f14' }
};

function tileAt(map, x, y) {
  if (y < 0 || y >= map.rows.length) return '#';
  const row = map.rows[y];
  if (x < 0 || x >= row.length) return '#';
  return row[x];
}

// The tile the player lands on when crossing an exit into `target` from
// `fromMapId` - the target's own exit back to where they came from, if it
// has one, rather than always its fixed spawn point. Otherwise stepping back
// out of a depth zone (or any zone back to the village) would teleport the
// player to that map's default entrance instead of where the passage
// actually is. Exported as its own pure function for direct testing.
export function exitLandingPos(target, fromMapId) {
  const returnExit = (target.exits || []).find(e => e.to === fromMapId);
  return returnExit ? { x: returnExit.x, y: returnExit.y } : { ...target.spawn };
}

function isItemTaken(state, mapId, x, y) {
  const key = `${mapId}:${x}:${y}`;
  return !!(state.flags.takenItems[key]);
}

function itemAt(map, x, y) {
  return (map.items || []).find(it => it.x === x && it.y === y);
}

function npcAt(map, x, y) {
  return (map.npcs || []).find(n => n.x === x && n.y === y);
}

// Deterministic pseudo-randomness for texture speckling — same tile always looks the same.
function hashPixel(x, y, salt) {
  const v = Math.sin(x * 12.9898 + y * 78.233 + salt * 37.719) * 43758.5453;
  return v - Math.floor(v);
}

function diamondPath(ctx2d, sx, sy) {
  ctx2d.beginPath();
  ctx2d.moveTo(sx, sy - ISO_H / 2);
  ctx2d.lineTo(sx + ISO_W / 2, sy);
  ctx2d.lineTo(sx, sy + ISO_H / 2);
  ctx2d.lineTo(sx - ISO_W / 2, sy);
  ctx2d.closePath();
}

function drawFloorTile(ctx2d, sx, sy, x, y) {
  diamondPath(ctx2d, sx, sy);
  ctx2d.fillStyle = '#9a9aab';
  ctx2d.fill();
  ctx2d.strokeStyle = '#7c7c8c';
  ctx2d.lineWidth = 1;
  ctx2d.stroke();
  ctx2d.fillStyle = '#848494';
  for (let i = 0; i < 2; i++) {
    const ox = (hashPixel(x, y, i) - 0.5) * (ISO_W * 0.4);
    const oy = (hashPixel(x, y, i + 10) - 0.5) * (ISO_H * 0.4);
    ctx2d.fillRect(sx + ox, sy + oy, 2, 2);
  }
}

function drawGrassTile(ctx2d, sx, sy, x, y) {
  diamondPath(ctx2d, sx, sy);
  ctx2d.fillStyle = '#3a7d44';
  ctx2d.fill();
  ctx2d.strokeStyle = '#2c5e33';
  ctx2d.lineWidth = 1;
  ctx2d.stroke();
  ctx2d.fillStyle = '#2c5e33';
  for (let i = 0; i < 3; i++) {
    const ox = (hashPixel(x, y, i) - 0.5) * (ISO_W * 0.5);
    const oy = (hashPixel(x, y, i + 20) - 0.5) * (ISO_H * 0.5);
    ctx2d.fillRect(sx + ox, sy + oy, 2, 3);
  }
  ctx2d.fillStyle = '#4d9a57';
  for (let i = 0; i < 2; i++) {
    const ox = (hashPixel(x, y, i + 40) - 0.5) * (ISO_W * 0.5);
    const oy = (hashPixel(x, y, i + 50) - 0.5) * (ISO_H * 0.5);
    ctx2d.fillRect(sx + ox, sy + oy, 2, 2);
  }
}

// Elevated 3-face block, like XCOM's raised cover/terrain tiles.
function drawWallBlock(ctx2d, sx, sy, zone) {
  const c = ZONE_WALL_COLORS[zone] || ZONE_WALL_COLORS.village;
  const hw = ISO_W / 2, hh = ISO_H / 2;
  const topY = sy - WALL_ELEVATION;

  ctx2d.beginPath();
  ctx2d.moveTo(sx, topY - hh);
  ctx2d.lineTo(sx + hw, topY);
  ctx2d.lineTo(sx, topY + hh);
  ctx2d.lineTo(sx - hw, topY);
  ctx2d.closePath();
  ctx2d.fillStyle = c.top;
  ctx2d.fill();
  ctx2d.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx2d.lineWidth = 1;
  ctx2d.stroke();

  ctx2d.beginPath();
  ctx2d.moveTo(sx - hw, topY);
  ctx2d.lineTo(sx, topY + hh);
  ctx2d.lineTo(sx, sy + hh);
  ctx2d.lineTo(sx - hw, sy);
  ctx2d.closePath();
  ctx2d.fillStyle = c.left;
  ctx2d.fill();
  ctx2d.stroke();

  ctx2d.beginPath();
  ctx2d.moveTo(sx + hw, topY);
  ctx2d.lineTo(sx, topY + hh);
  ctx2d.lineTo(sx, sy + hh);
  ctx2d.lineTo(sx + hw, sy);
  ctx2d.closePath();
  ctx2d.fillStyle = c.right;
  ctx2d.fill();
  ctx2d.stroke();
}

// Pulsing tactical-cursor diamond under the player's tile — the classic
// XCOM "this is your active unit" selection indicator.
function drawSelectionCursor(ctx2d, sx, sy) {
  const pulse = (Math.sin(Date.now() / 260) + 1) / 2; // 0..1
  const inset = 3 + pulse * 2;
  const alpha = 0.5 + pulse * 0.4;
  ctx2d.strokeStyle = `rgba(79,216,255,${alpha.toFixed(2)})`;
  ctx2d.lineWidth = 2;
  ctx2d.beginPath();
  ctx2d.moveTo(sx, sy - ISO_H / 2 + inset);
  ctx2d.lineTo(sx + ISO_W / 2 - inset, sy);
  ctx2d.lineTo(sx, sy + ISO_H / 2 - inset);
  ctx2d.lineTo(sx - ISO_W / 2 + inset, sy);
  ctx2d.closePath();
  ctx2d.stroke();
}

// Draws a sprite standing on the tile (feet anchored at the ground point) and
// returns the sprite's top-edge y, so callers can float a label above it.
// `animate` gives "living" sprites (player/npcs/enemies) a subtle idle bob;
// the ground shadow stays fixed at the true ground point either way.
function drawIsoSprite(ctx2d, shape, palette, sx, sy, scale = 1, animate = true) {
  drawGroundShadow(ctx2d, sx, sy);
  const bobbedSy = animate ? sy + idleBob(sx * 0.3) : sy;
  const px = SPRITE_PX * scale;
  const { h } = spriteSize(shape, px);
  const cy = bobbedSy - h / 2 + 2;
  drawSprite(ctx2d, shape, palette, sx, cy, px);
  return cy - h / 2;
}

// Small readable tag floating above a sprite — answers "where does this lead /
// what is this" before the player commits to a step.
function drawLabel(ctx2d, text, sx, topY, color = '#ffd166') {
  const bottomY = topY - 4;
  ctx2d.font = 'bold 9px "Segoe UI", sans-serif';
  ctx2d.textAlign = 'center';
  ctx2d.textBaseline = 'bottom';
  const padX = 4;
  const w = ctx2d.measureText(text).width + padX * 2;
  const h = 12;
  ctx2d.fillStyle = 'rgba(8,5,16,0.85)';
  ctx2d.fillRect(sx - w / 2, bottomY - h, w, h);
  ctx2d.strokeStyle = '#000';
  ctx2d.lineWidth = 1;
  ctx2d.strokeRect(sx - w / 2 + 0.5, bottomY - h + 0.5, w - 1, h - 1);
  ctx2d.fillStyle = color;
  ctx2d.fillText(text, sx, bottomY - 2);
}

export function renderOverworld(game) {
  const { ctx2d, canvas } = game.dom;
  const map = MAPS[game.state.currentMap];
  const state = game.state;

  ctx2d.clearRect(0, 0, canvas.width, canvas.height);

  const entities = new Map();
  const labelQueue = [];
  const putEntity = (x, y, drawFn) => entities.set(`${x},${y}`, drawFn);

  (map.exits || []).forEach(exit => {
    putEntity(exit.x, exit.y, (sx, sy) => {
      const topY = drawIsoSprite(ctx2d, 'signpost', 'signpost', sx, sy, 1, false);
      labelQueue.push(() => drawLabel(ctx2d, `→ ${exit.label}`, sx, topY));
    });
  });

  (map.items || []).forEach(it => {
    if (isItemTaken(state, map.id, it.x, it.y)) return;
    const sprite = itemSprite(it.material);
    putEntity(it.x, it.y, (sx, sy) => drawIsoSprite(ctx2d, sprite.shape, sprite.palette, sx, sy, 1, false));
  });

  if (map.workbench) {
    putEntity(map.workbench.x, map.workbench.y, (sx, sy) => {
      const topY = drawIsoSprite(ctx2d, 'toolbox', 'toolbox', sx, sy, 1, false);
      labelQueue.push(() => drawLabel(ctx2d, 'Workbench', sx, topY, '#7dffb0'));
    });
  }

  (map.npcs || []).forEach(n => {
    const sprite = CHARACTER_SPRITES[n.id];
    if (sprite) putEntity(n.x, n.y, (sx, sy) => drawIsoSprite(ctx2d, sprite.shape, sprite.palette, sx, sy));
  });

  if (map.guardian && !state.flags.guardianDefeated[map.id]) {
    const sprite = CHARACTER_SPRITES[map.guardian.enemyId];
    putEntity(map.guardian.x, map.guardian.y, (sx, sy) => {
      const topY = drawIsoSprite(ctx2d, sprite.shape, sprite.palette, sx, sy);
      labelQueue.push(() => drawLabel(ctx2d, `⚠ ${ENEMIES[map.guardian.enemyId].name}`, sx, topY, '#ff8b8b'));
    });
  }

  if (map.wanderer) {
    const sprite = CHARACTER_SPRITES[map.wanderer.enemyId];
    putEntity(map.wanderer.x, map.wanderer.y, (sx, sy) => {
      const topY = drawIsoSprite(ctx2d, sprite.shape, sprite.palette, sx, sy);
      labelQueue.push(() => drawLabel(ctx2d, `${ENEMIES[map.wanderer.enemyId].name}`, sx, topY, '#8bd9ff'));
    });
  }

  if (map.boss && !state.flags.bossDefeated) {
    const sprite = CHARACTER_SPRITES[map.boss.enemyId];
    const locked = map.boss.requiresGuardian && !state.flags.guardianDefeated[map.id];
    putEntity(map.boss.x, map.boss.y, (sx, sy) => {
      const topY = drawIsoSprite(ctx2d, sprite.shape, sprite.palette, sx, sy, 2.4);
      labelQueue.push(() => drawLabel(ctx2d, locked ? '??? (locked)' : `⚠ ${ENEMIES[map.boss.enemyId].name}`, sx, topY, '#ff8b8b'));
    });
  }

  putEntity(state.pos.x, state.pos.y, (sx, sy) => {
    drawSelectionCursor(ctx2d, sx, sy);
    drawIsoSprite(ctx2d, 'humanoid', playerPaletteFor(state.flags.ngPlusCycle), sx, sy);
  });

  const maxDepth = (mapWidth() - 1) + (mapHeight() - 1);
  for (let d = 0; d <= maxDepth; d++) {
    for (let y = 0; y < mapHeight(); y++) {
      const x = d - y;
      if (x < 0 || x >= mapWidth()) continue;
      if (y >= map.rows.length || x >= map.rows[y].length) continue;
      const tile = map.rows[y][x];
      const { sx, sy } = toScreen(x, y);
      if (tile === '#') drawWallBlock(ctx2d, sx, sy, map.zone);
      else if (tile === ',') drawGrassTile(ctx2d, sx, sy, x, y);
      else drawFloorTile(ctx2d, sx, sy, x, y);
      const entityFn = entities.get(`${x},${y}`);
      if (entityFn) entityFn(sx, sy);
    }
  }

  labelQueue.forEach(fn => fn());

  drawZoneAmbience(ctx2d, canvas.width, canvas.height, map.zone);

  game.dom.mapLabel.textContent = map.name;
  renderExitsHint(game, map);
}

function renderExitsHint(game, map) {
  const exits = map.exits || [];
  if (!exits.length) {
    game.dom.mapExits.textContent = '';
    return;
  }
  const label = exits.length === 1 ? 'Exit' : 'Exits';
  game.dom.mapExits.textContent = `${label}: ${exits.map(e => e.label).join('  •  ')}`;
}

export function handleMove(game, dx, dy) {
  if (game.state.mode !== 'overworld') return;
  const state = game.state;
  const map = MAPS[state.currentMap];
  const nx = state.pos.x + dx;
  const ny = state.pos.y + dy;

  const npc = npcAt(map, nx, ny);
  if (npc) { startNpcInteraction(game, npc.id); return; }

  if (map.workbench && map.workbench.x === nx && map.workbench.y === ny) {
    openCraft(game);
    return;
  }

  if (map.guardian && map.guardian.x === nx && map.guardian.y === ny && !state.flags.guardianDefeated[map.id]) {
    startBattle(game, map.guardian.enemyId, { guardianMap: map.id });
    return;
  }

  if (map.wanderer && map.wanderer.x === nx && map.wanderer.y === ny) {
    startBattle(game, map.wanderer.enemyId, { scaleToLevel: state.player.level, surpriseBonus: true });
    return;
  }

  if (map.boss && map.boss.x === nx && map.boss.y === ny && !state.flags.bossDefeated) {
    if (map.boss.requiresGuardian && !state.flags.guardianDefeated[map.id]) {
      showMessages(game, [BOSS_LOCKED_MESSAGE]);
      return;
    }
    startBattle(game, map.boss.enemyId, {});
    return;
  }

  const tile = tileAt(map, nx, ny);
  if (tile === '#') return;

  state.pos = { x: nx, y: ny };

  const item = itemAt(map, nx, ny);
  if (item && !isItemTaken(state, map.id, nx, ny)) {
    state.flags.takenItems[`${map.id}:${nx}:${ny}`] = true;
    state.player.materials[item.material] = (state.player.materials[item.material] || 0) + 1;
    const mat = MATERIALS[item.material];
    audio.playPickup();
    showMessages(game, [`Picked up ${mat.name}! ${mat.fact}`]);
    announceNewAchievements(game, state);
    game.renderHud();
    saveGame(state);
    return;
  }

  const secret = map.secret;
  if (secret && secret.x === nx && secret.y === ny && !state.flags.secretsFound[map.id]) {
    state.flags.secretsFound[map.id] = true;
    state.player.materials[secret.material] = (state.player.materials[secret.material] || 0) + 1;
    const mat = MATERIALS[secret.material];
    audio.playQuestComplete();
    showMessages(game, [`A hidden cache! ${secret.findText} (+1 ${mat.name})`]);
    announceNewAchievements(game, state);
    game.renderHud();
    saveGame(state);
    return;
  }

  const exit = (map.exits || []).find(e => e.x === nx && e.y === ny);
  if (exit) {
    const target = MAPS[exit.to];
    const firstVisit = !state.flags.visitedMaps[target.id];
    const landingPos = exitLandingPos(target, state.currentMap);
    state.currentMap = target.id;
    state.pos = landingPos;
    state.flags.visitedMaps[target.id] = true;
    audio.playZoneAmbience(target.zone);
    if (firstVisit && target.codexConcept) {
      unlockCodex(state, target.codexConcept, null);
    }
    saveGame(state);
    renderOverworld(game);
    if (firstVisit && target.arrival) showMessages(game, [target.arrival]);
    announceNewAchievements(game, state);
    return;
  }

  if (tile === ',') {
    const pool = ZONE_ENCOUNTERS[map.zone] || [];
    if (pool.length && Math.random() < 0.16) {
      const enemyId = pool[Math.floor(Math.random() * pool.length)];
      const opts = { scaleToLevel: state.player.level };
      if (PACK_ELIGIBLE_ZONES.has(map.zone) && Math.random() < 0.3) {
        opts.packIds = [pool[Math.floor(Math.random() * pool.length)]];
      } else if (Math.random() < eliteChanceForCycle(state.flags.ngPlusCycle)) {
        opts.elite = true;
      }
      startBattle(game, enemyId, opts);
      return;
    }
  }

  renderOverworld(game);
}

import { MAPS } from '../data/maps.js';
import { MATERIALS } from '../data/materials.js';
import { CHARACTER_SPRITES, itemSprite } from '../data/pixelArt.js';
import { drawSprite } from './pixelSprites.js';
import { startBattle } from './battle.js';
import { openCraft } from './craft.js';
import { showMessages, startQuiz } from './dialogueUI.js';
import { BOSS_LOCKED_MESSAGE } from '../data/dialogue.js';
import { saveGame } from './save.js';

const TILE = 32;
const SPRITE_PX = 2; // one sprite-pixel = 2 real canvas pixels on the overworld

const ZONE_ENCOUNTERS = {
  village: ['wisp', 'puddle_imp'],
  mirrors: ['mirror_golem'],
  prism: ['prism_sprite'],
  fiber: ['signal_wisp'],
  lab: []
};

function tileAt(map, x, y) {
  if (y < 0 || y >= map.rows.length) return '#';
  const row = map.rows[y];
  if (x < 0 || x >= row.length) return '#';
  return row[x];
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

function drawWallTile(ctx2d, px, py) {
  ctx2d.fillStyle = '#4a2f26';
  ctx2d.fillRect(px, py, TILE, TILE);
  ctx2d.fillStyle = '#3a231b';
  const brickH = TILE / 4;
  for (let row = 0; row < 4; row++) {
    const offset = row % 2 === 0 ? 0 : TILE / 2;
    ctx2d.fillRect(px, py + row * brickH, TILE, 2);
    ctx2d.fillRect(px + offset, py + row * brickH, 2, brickH);
  }
  ctx2d.strokeStyle = '#1f120d';
  ctx2d.lineWidth = 2;
  ctx2d.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
}

function drawFloorTile(ctx2d, px, py, x, y) {
  ctx2d.fillStyle = '#9a9aab';
  ctx2d.fillRect(px, py, TILE, TILE);
  ctx2d.strokeStyle = '#7c7c8c';
  ctx2d.lineWidth = 1;
  ctx2d.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
  ctx2d.fillStyle = '#848494';
  for (let i = 0; i < 3; i++) {
    const rx = px + 3 + Math.floor(hashPixel(x, y, i) * (TILE - 8));
    const ry = py + 3 + Math.floor(hashPixel(x, y, i + 10) * (TILE - 8));
    ctx2d.fillRect(rx, ry, 2, 2);
  }
}

function drawGrassTile(ctx2d, px, py, x, y) {
  ctx2d.fillStyle = '#3a7d44';
  ctx2d.fillRect(px, py, TILE, TILE);
  ctx2d.fillStyle = '#2c5e33';
  for (let i = 0; i < 6; i++) {
    const bx = px + 2 + Math.floor(hashPixel(x, y, i) * (TILE - 6));
    const by = py + 2 + Math.floor(hashPixel(x, y, i + 20) * (TILE - 6));
    ctx2d.fillRect(bx, by, 2, 4);
  }
  ctx2d.fillStyle = '#4d9a57';
  for (let i = 0; i < 3; i++) {
    const bx = px + 2 + Math.floor(hashPixel(x, y, i + 40) * (TILE - 6));
    const by = py + 2 + Math.floor(hashPixel(x, y, i + 50) * (TILE - 6));
    ctx2d.fillRect(bx, by, 2, 3);
  }
}

function drawTile(ctx2d, type, x, y) {
  const px = x * TILE, py = y * TILE;
  if (type === '#') drawWallTile(ctx2d, px, py);
  else if (type === ',') drawGrassTile(ctx2d, px, py, x, y);
  else drawFloorTile(ctx2d, px, py, x, y);
}

export function renderOverworld(game) {
  const { ctx2d, canvas } = game.dom;
  const map = MAPS[game.state.currentMap];
  const state = game.state;

  ctx2d.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < map.rows.length; y++) {
    for (let x = 0; x < map.rows[y].length; x++) {
      drawTile(ctx2d, map.rows[y][x], x, y);
    }
  }

  (map.items || []).forEach(it => {
    if (isItemTaken(state, map.id, it.x, it.y)) return;
    const sprite = itemSprite(it.material);
    drawTileSprite(ctx2d, sprite.shape, sprite.palette, it.x, it.y);
  });

  if (map.workbench) drawTileSprite(ctx2d, 'toolbox', 'toolbox', map.workbench.x, map.workbench.y);

  (map.npcs || []).forEach(n => {
    const sprite = CHARACTER_SPRITES[n.id];
    if (sprite) drawTileSprite(ctx2d, sprite.shape, sprite.palette, n.x, n.y);
  });

  if (map.guardian && !state.flags.guardianDefeated[map.id]) {
    const sprite = CHARACTER_SPRITES[map.guardian.enemyId];
    drawTileSprite(ctx2d, sprite.shape, sprite.palette, map.guardian.x, map.guardian.y);
  }

  if (map.boss && !state.flags.bossDefeated) {
    const sprite = CHARACTER_SPRITES[map.boss.enemyId];
    drawTileSprite(ctx2d, sprite.shape, sprite.palette, map.boss.x, map.boss.y, 2.4);
  }

  drawTileSprite(ctx2d, 'humanoid', 'player', state.pos.x, state.pos.y);

  game.dom.mapLabel.textContent = map.name;
}

function drawTileSprite(ctx2d, shape, palette, x, y, scale = 1) {
  const cx = x * TILE + TILE / 2;
  const cy = y * TILE + TILE / 2 + 2;
  drawSprite(ctx2d, shape, palette, cx, cy, SPRITE_PX * scale);
}

export function handleMove(game, dx, dy) {
  if (game.state.mode !== 'overworld') return;
  const state = game.state;
  const map = MAPS[state.currentMap];
  const nx = state.pos.x + dx;
  const ny = state.pos.y + dy;

  const npc = npcAt(map, nx, ny);
  if (npc) { startQuiz(game, npc.id); return; }

  if (map.workbench && map.workbench.x === nx && map.workbench.y === ny) {
    openCraft(game);
    return;
  }

  if (map.guardian && map.guardian.x === nx && map.guardian.y === ny && !state.flags.guardianDefeated[map.id]) {
    startBattle(game, map.guardian.enemyId, { guardianMap: map.id });
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
    showMessages(game, [`Picked up ${mat.name}! ${mat.fact}`]);
    game.renderHud();
    saveGame(state);
    return;
  }

  const exit = (map.exits || []).find(e => e.x === nx && e.y === ny);
  if (exit) {
    const target = MAPS[exit.to];
    state.currentMap = target.id;
    state.pos = { ...target.spawn };
    saveGame(state);
    renderOverworld(game);
    return;
  }

  if (tile === ',') {
    const pool = ZONE_ENCOUNTERS[map.zone] || [];
    if (pool.length && Math.random() < 0.16) {
      const enemyId = pool[Math.floor(Math.random() * pool.length)];
      startBattle(game, enemyId, {});
      return;
    }
  }

  renderOverworld(game);
}

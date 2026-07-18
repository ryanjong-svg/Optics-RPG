import { MAPS } from '../data/maps.js';
import { MATERIALS } from '../data/materials.js';
import { ENEMIES } from '../data/enemies.js';
import { startBattle } from './battle.js';
import { openCraft } from './craft.js';
import { showMessages, startQuiz } from './dialogueUI.js';
import { BOSS_LOCKED_MESSAGE } from '../data/dialogue.js';
import { saveGame } from './save.js';

const TILE = 32;

const ZONE_ENCOUNTERS = {
  village: ['wisp', 'puddle_imp'],
  mirrors: ['mirror_golem'],
  prism: ['prism_sprite'],
  fiber: ['signal_wisp'],
  lab: []
};

const TILE_COLORS = { '#': '#1b1330', '.': '#2a2050', ',': '#25733f' };

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

export function renderOverworld(game) {
  const { ctx2d, canvas } = game.dom;
  const map = MAPS[game.state.currentMap];
  const state = game.state;

  ctx2d.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < map.rows.length; y++) {
    for (let x = 0; x < map.rows[y].length; x++) {
      const t = map.rows[y][x];
      ctx2d.fillStyle = TILE_COLORS[t] || '#2a2050';
      ctx2d.fillRect(x * TILE, y * TILE, TILE, TILE);
      ctx2d.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx2d.strokeRect(x * TILE, y * TILE, TILE, TILE);
    }
  }

  ctx2d.font = '22px "Segoe UI Emoji", sans-serif';
  ctx2d.textAlign = 'center';
  ctx2d.textBaseline = 'middle';

  (map.items || []).forEach(it => {
    if (isItemTaken(state, map.id, it.x, it.y)) return;
    const mat = MATERIALS[it.material];
    drawGlyph(ctx2d, mat.glyph, it.x, it.y);
  });

  if (map.workbench) drawGlyph(ctx2d, '\u{1F6E0}\u{FE0F}', map.workbench.x, map.workbench.y);

  (map.npcs || []).forEach(n => drawGlyph(ctx2d, n.glyph, n.x, n.y));

  if (map.guardian && !state.flags.guardianDefeated[map.id]) {
    drawGlyph(ctx2d, ENEMIES[map.guardian.enemyId].glyph, map.guardian.x, map.guardian.y);
  }

  if (map.boss && !state.flags.bossDefeated) {
    drawGlyph(ctx2d, ENEMIES[map.boss.enemyId].glyph, map.boss.x, map.boss.y);
  }

  drawGlyph(ctx2d, '\u{1F9D9}', state.pos.x, state.pos.y);

  game.dom.mapLabel.textContent = map.name;
}

function drawGlyph(ctx2d, glyph, x, y) {
  ctx2d.fillText(glyph, x * TILE + TILE / 2, y * TILE + TILE / 2 + 1);
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

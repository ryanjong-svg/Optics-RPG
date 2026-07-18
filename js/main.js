import { newGameState } from './engine/state.js';
import { loadGame, saveGame } from './engine/save.js';
import { renderOverworld, handleMove } from './engine/overworld.js';
import { closeCraft } from './engine/craft.js';
import { openCodex, closeCodex } from './engine/codexUI.js';
import { showMessages, advanceDialogue } from './engine/dialogueUI.js';
import { INTRO_LINES } from './data/dialogue.js';

function q(id) { return document.getElementById(id); }

const dom = {
  canvas: q('overworld-canvas'),
  ctx2d: q('overworld-canvas').getContext('2d'),
  mapLabel: q('map-label'),

  hudLevel: q('hud-level'),
  hudHpBar: q('hud-hp-bar'),
  hudHpText: q('hud-hp-text'),
  hudXpBar: q('hud-xp-bar'),
  hudXpText: q('hud-xp-text'),
  btnCodex: q('btn-codex'),

  dialoguePanel: q('dialogue-panel'),
  dialogueText: q('dialogue-text'),
  dialogueChoices: q('dialogue-choices'),
  dialogueNext: q('dialogue-next'),

  battlePanel: q('battle-panel'),
  battleEnemyCanvas: q('battle-enemy-canvas'),
  battleEnemyCtx: q('battle-enemy-canvas').getContext('2d'),
  battlePlayerCanvas: q('battle-player-canvas'),
  battlePlayerCtx: q('battle-player-canvas').getContext('2d'),
  battleEnemyName: q('battle-enemy-name'),
  battleEnemyHpBar: q('battle-enemy-hp-bar'),
  battleEnemyHpText: q('battle-enemy-hp-text'),
  battlePlayerHpBar: q('battle-player-hp-bar'),
  battlePlayerHpText: q('battle-player-hp-text'),
  battlePlayerLevel: q('battle-player-level'),
  battleLog: q('battle-log'),
  battleActions: q('battle-actions'),

  craftPanel: q('craft-panel'),
  craftMaterials: q('craft-materials'),
  craftEquipped: q('craft-equipped'),
  craftRecipes: q('craft-recipes'),
  craftClose: q('craft-close'),

  codexPanel: q('codex-panel'),
  codexProgress: q('codex-progress'),
  codexList: q('codex-list'),
  codexClose: q('codex-close'),

  victoryPanel: q('victory-panel'),
  victoryStats: q('victory-stats'),
  victoryContinue: q('victory-continue')
};

const PANELS = ['battle-panel', 'craft-panel', 'codex-panel', 'victory-panel', 'dialogue-panel'];

const game = {
  state: loadGame() || newGameState(),
  dom,
  battle: null,
  dialogue: null,

  showPanel(name) {
    PANELS.forEach(id => document.getElementById(id).classList.add('hidden'));
    if (name === 'overworld') return;
    const map = { battle: 'battle-panel', craft: 'craft-panel', codex: 'codex-panel', victory: 'victory-panel', dialogue: 'dialogue-panel' };
    const el = document.getElementById(map[name]);
    if (el) el.classList.remove('hidden');
  },

  renderOverworld() { renderOverworld(game); },
  renderHud() { renderHud(); },
  save() { saveGame(game.state); }
};

function renderHud() {
  const p = game.state.player;
  dom.hudLevel.textContent = `Lv.${p.level}`;
  dom.hudHpBar.style.width = Math.max(0, Math.round((p.hp / p.maxHp) * 100)) + '%';
  dom.hudHpText.textContent = `${p.hp}/${p.maxHp}`;
  dom.hudXpBar.style.width = Math.max(0, Math.round((p.xp / p.xpToNext) * 100)) + '%';
  dom.hudXpText.textContent = `${p.xp}/${p.xpToNext} XP`;
}
game.renderHud = renderHud;

document.addEventListener('keydown', (e) => {
  const keyMap = {
    ArrowUp: [0, -1], KeyW: [0, -1],
    ArrowDown: [0, 1], KeyS: [0, 1],
    ArrowLeft: [-1, 0], KeyA: [-1, 0],
    ArrowRight: [1, 0], KeyD: [1, 0]
  };
  if (game.state.mode === 'overworld' && keyMap[e.code]) {
    e.preventDefault();
    handleMove(game, ...keyMap[e.code]);
    renderHud();
  } else if (game.state.mode === 'dialogue' && (e.code === 'Enter' || e.code === 'Space')) {
    e.preventDefault();
    advanceDialogue(game);
  }
});

dom.btnCodex.addEventListener('click', () => openCodex(game));
dom.craftClose.addEventListener('click', () => closeCraft(game));
dom.codexClose.addEventListener('click', () => closeCodex(game));
dom.dialogueNext.addEventListener('click', () => advanceDialogue(game));
dom.victoryContinue.addEventListener('click', () => {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
  renderOverworld(game);
});

function boot() {
  game.showPanel('overworld');
  renderOverworld(game);
  renderHud();
  if (!game.state.flags.seenIntro) {
    game.state.flags.seenIntro = true;
    showMessages(game, INTRO_LINES, () => {
      renderOverworld(game);
      saveGame(game.state);
    });
  }
}

boot();
window.__opticsGame = game; // handy for debugging in devtools

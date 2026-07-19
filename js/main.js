import { newGameState } from './engine/state.js';
import { loadGame, saveGame } from './engine/save.js';
import { renderOverworld, handleMove } from './engine/overworld.js';
import { closeCraft } from './engine/craft.js';
import { openCodex, closeCodex } from './engine/codexUI.js';
import { openChronicle, closeChronicle } from './engine/chronicleUI.js';
import { openCompletion, closeCompletion } from './engine/completionUI.js';
import { openMap, closeMap } from './engine/mapUI.js';
import { showMessages, advanceDialogue } from './engine/dialogueUI.js';
import { INTRO_LINES } from './data/dialogue.js';
import * as audio from './engine/audio.js';

function q(id) { return document.getElementById(id); }

const dom = {
  canvas: q('overworld-canvas'),
  ctx2d: q('overworld-canvas').getContext('2d'),
  mapLabel: q('map-label'),
  mapExits: q('map-exits'),

  hudLevel: q('hud-level'),
  hudHpBar: q('hud-hp-bar'),
  hudHpText: q('hud-hp-text'),
  hudXpBar: q('hud-xp-bar'),
  hudXpText: q('hud-xp-text'),
  btnCodex: q('btn-codex'),
  btnChronicle: q('btn-chronicle'),
  btnCompletion: q('btn-completion'),
  btnMap: q('btn-map'),
  btnMute: q('btn-mute'),

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

  chroniclePanel: q('chronicle-panel'),
  chronicleList: q('chronicle-list'),
  chronicleClose: q('chronicle-close'),

  completionPanel: q('completion-panel'),
  completionOverall: q('completion-overall'),
  completionList: q('completion-list'),
  completionClose: q('completion-close'),

  mapPanel: q('map-panel'),
  mapDiagram: q('map-diagram'),
  mapClose: q('map-close'),

  dpadUp: q('dpad-up'),
  dpadDown: q('dpad-down'),
  dpadLeft: q('dpad-left'),
  dpadRight: q('dpad-right'),

  victoryPanel: q('victory-panel'),
  victoryStats: q('victory-stats'),
  victoryContinue: q('victory-continue')
};

const PANELS = ['battle-panel', 'craft-panel', 'codex-panel', 'chronicle-panel', 'completion-panel', 'map-panel', 'victory-panel', 'dialogue-panel'];

const game = {
  state: loadGame() || newGameState(),
  dom,
  battle: null,
  dialogue: null,

  showPanel(name) {
    PANELS.forEach(id => document.getElementById(id).classList.add('hidden'));
    if (name === 'overworld') return;
    const map = {
      battle: 'battle-panel', craft: 'craft-panel', codex: 'codex-panel', chronicle: 'chronicle-panel',
      completion: 'completion-panel', map: 'map-panel', victory: 'victory-panel', dialogue: 'dialogue-panel'
    };
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
  dom.hudHpBar.classList.toggle('critical', p.hp / p.maxHp < 0.25);
  dom.hudXpBar.style.width = Math.max(0, Math.round((p.xp / p.xpToNext) * 100)) + '%';
  dom.hudXpText.textContent = `${p.xp}/${p.xpToNext} XP`;
}
game.renderHud = renderHud;

function unlockAndStartMusic() {
  audio.unlockAudio();
  if (game.state.mode === 'overworld') audio.playOverworldMusic();
}
document.addEventListener('keydown', unlockAndStartMusic, { once: true });
document.addEventListener('pointerdown', unlockAndStartMusic, { once: true });

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
dom.btnChronicle.addEventListener('click', () => openChronicle(game));
dom.chronicleClose.addEventListener('click', () => closeChronicle(game));
dom.btnCompletion.addEventListener('click', () => openCompletion(game));
dom.completionClose.addEventListener('click', () => closeCompletion(game));
dom.btnMap.addEventListener('click', () => openMap(game));
dom.mapClose.addEventListener('click', () => closeMap(game));
dom.btnMute.addEventListener('click', () => {
  const muted = audio.toggleMuted();
  dom.btnMute.innerHTML = muted ? '&#128263;' : '&#128266;';
});
dom.craftClose.addEventListener('click', () => closeCraft(game));

function tapMove(dx, dy) {
  if (game.state.mode !== 'overworld') return;
  handleMove(game, dx, dy);
  renderHud();
}
dom.dpadUp.addEventListener('click', () => tapMove(0, -1));
dom.dpadDown.addEventListener('click', () => tapMove(0, 1));
dom.dpadLeft.addEventListener('click', () => tapMove(-1, 0));
dom.dpadRight.addEventListener('click', () => tapMove(1, 0));
dom.codexClose.addEventListener('click', () => closeCodex(game));
dom.dialogueNext.addEventListener('click', () => advanceDialogue(game));
dom.victoryContinue.addEventListener('click', () => {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
  renderOverworld(game);
  audio.playOverworldMusic();
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

// Continuous idle-bob animation loop — only does work while the overworld is
// actually visible, so it's free while battling, crafting, reading, etc.
function animLoop() {
  if (game.state.mode === 'overworld') renderOverworld(game);
  requestAnimationFrame(animLoop);
}
requestAnimationFrame(animLoop);

window.__opticsGame = game; // handy for debugging in devtools

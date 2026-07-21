import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState } from '../js/engine/core/state.js';
import { migrateState } from '../js/engine/core/save.js';
import { bestiaryCaughtCount } from '../js/engine/panels/bestiaryUI.js';
import { codexUnlockedCount } from '../js/engine/panels/codexUI.js';
import { chronicleUnlockedCount } from '../js/engine/panels/chronicleUI.js';
import { hasReadyQuest } from '../js/engine/panels/questLogUI.js';
import { ENEMIES } from '../js/data/content/enemies.js';
import { CODEX } from '../js/data/narrative/codex.js';
import { QUESTS } from '../js/data/narrative/quests.js';

test('bestiaryCaughtCount: 0 on a fresh state, rises as enemies are cataloged', () => {
  const state = newGameState();
  assert.equal(bestiaryCaughtCount(state), 0);
  const firstId = Object.keys(ENEMIES)[0];
  state.flags.enemiesDefeated[firstId] = true;
  assert.equal(bestiaryCaughtCount(state), 1);
});

test('codexUnlockedCount: 0 on a fresh state, rises as concepts unlock', () => {
  const state = newGameState();
  assert.equal(codexUnlockedCount(state), 0);
  const firstId = Object.keys(CODEX)[0];
  state.codexUnlocked[firstId] = true;
  assert.equal(codexUnlockedCount(state), 1);
});

test('chronicleUnlockedCount: rises once meeting an NPC unlocks a new lore entry', () => {
  const state = newGameState();
  const before = chronicleUnlockedCount(state);
  state.flags.metNpc.prof_lumen = true;
  assert.ok(chronicleUnlockedCount(state) > before);
});

test('hasReadyQuest: false on a fresh state (no active quests yet)', () => {
  const state = newGameState();
  assert.equal(hasReadyQuest(state), false);
});

test('hasReadyQuest: true once an active quest\'s objective is met', () => {
  const state = newGameState();
  const [questId, quest] = Object.entries(QUESTS).find(([, q]) => q.objective.type === 'collect');
  state.flags.quests[questId] = 'active';
  state.player.materials[quest.objective.material] = quest.objective.count;
  assert.equal(hasReadyQuest(state), true);
});

test('hasReadyQuest: false for an active quest whose objective is not yet met', () => {
  const state = newGameState();
  const [questId, quest] = Object.entries(QUESTS).find(([, q]) => q.objective.type === 'collect');
  state.flags.quests[questId] = 'active';
  state.player.materials[quest.objective.material] = 0;
  assert.equal(hasReadyQuest(state), false);
});

test('migrateState: backfills badgeSeen for a save from before it existed', () => {
  const bareState = { currentMap: 'village', player: { materials: {} }, flags: {} };
  const migrated = migrateState(bareState);
  assert.deepEqual(migrated.flags.badgeSeen, { bestiary: 0, codex: 0, chronicle: 0 });
});

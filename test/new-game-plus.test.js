import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState, startNewGamePlus } from '../js/engine/state.js';
import { applyNgPlusScaling } from '../js/engine/battle.js';
import { ACHIEVEMENTS, unlockedAchievements } from '../js/data/achievements.js';

test('startNewGamePlus: increments the cycle counter each time it is called', () => {
  const state = newGameState();
  startNewGamePlus(state);
  assert.equal(state.flags.ngPlusCycle, 1);
  startNewGamePlus(state);
  assert.equal(state.flags.ngPlusCycle, 2);
});

test('startNewGamePlus: resets exploration progress back to a fresh start', () => {
  const state = newGameState();
  state.flags.guardianDefeated = { mirrors: true, lab: true };
  state.flags.secretsFound = { mirrors: true };
  state.flags.bossDefeated = true;
  state.flags.takenItems = { 'village:13:1': true };
  state.flags.visitedMaps = { village: true, mirrors: true, prism: true };
  state.flags.metNpc = { prof_lumen: true };
  state.flags.quizAsked = { prof_lumen: [0, 1] };
  state.flags.quests = { lumen_opal: 'completed' };
  state.flags.achievements = { overqualified: true };
  state.currentMap = 'mirrors';
  state.pos = { x: 5, y: 5 };
  state.mode = 'victory';

  startNewGamePlus(state);

  assert.deepEqual(state.flags.guardianDefeated, {});
  assert.deepEqual(state.flags.secretsFound, {});
  assert.equal(state.flags.bossDefeated, false);
  assert.deepEqual(state.flags.takenItems, {});
  assert.deepEqual(state.flags.visitedMaps, { village: true });
  assert.deepEqual(state.flags.metNpc, {});
  assert.deepEqual(state.flags.quizAsked, {});
  assert.deepEqual(state.flags.quests, {});
  assert.deepEqual(state.flags.achievements, {});
  assert.equal(state.currentMap, 'village');
  assert.deepEqual(state.pos, { x: 7, y: 8 });
  assert.equal(state.mode, 'overworld');
});

test('startNewGamePlus: carries over level, gear, materials, and Codex/Chronicle knowledge unchanged', () => {
  const state = newGameState();
  state.player.level = 6;
  state.player.ownedGear.silver_mirror = true;
  state.player.materials.silver = 4;
  state.codexUnlocked.reflection = true;

  startNewGamePlus(state);

  assert.equal(state.player.level, 6);
  assert.equal(state.player.ownedGear.silver_mirror, true);
  assert.equal(state.player.materials.silver, 4);
  assert.equal(state.codexUnlocked.reflection, true);
});

test('applyNgPlusScaling: does nothing on cycle 0 (a fresh, non-NG+ game)', () => {
  const enemy = { hp: 40, curHp: 40, atk: 8, def: 5 };
  applyNgPlusScaling(enemy, 0);
  assert.deepEqual(enemy, { hp: 40, curHp: 40, atk: 8, def: 5 });
});

test('applyNgPlusScaling: toughens hp/atk/def proportionally to the cycle number', () => {
  const enemy = { hp: 40, curHp: 40, atk: 8, def: 5 };
  applyNgPlusScaling(enemy, 1); // 1 + 1*0.25 = 1.25x
  assert.equal(enemy.hp, 50);
  assert.equal(enemy.curHp, 50);
  assert.equal(enemy.atk, 10);
  assert.equal(enemy.def, 6);
});

test('cycle_walker achievement unlocks once New Game+ has been started', () => {
  const state = newGameState();
  assert.ok(!unlockedAchievements(state).some(([id]) => id === 'cycle_walker'));
  startNewGamePlus(state);
  assert.ok(unlockedAchievements(state).some(([id]) => id === 'cycle_walker'));
});

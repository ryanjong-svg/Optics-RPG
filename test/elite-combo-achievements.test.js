import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ACHIEVEMENTS } from '../js/data/meta/achievements.js';
import { newGameState } from '../js/engine/core/state.js';

test('elite_hunter: locked below 10 elites defeated, unlocked at 10', () => {
  const state = newGameState();
  assert.equal(ACHIEVEMENTS.elite_hunter.check(state), false);
  state.flags.elitesDefeated = 9;
  assert.equal(ACHIEVEMENTS.elite_hunter.check(state), false);
  state.flags.elitesDefeated = 10;
  assert.equal(ACHIEVEMENTS.elite_hunter.check(state), true);
});

test('combo_master: locked below 15 combos landed, unlocked at 15', () => {
  const state = newGameState();
  assert.equal(ACHIEVEMENTS.combo_master.check(state), false);
  state.flags.combosLanded = 14;
  assert.equal(ACHIEVEMENTS.combo_master.check(state), false);
  state.flags.combosLanded = 15;
  assert.equal(ACHIEVEMENTS.combo_master.check(state), true);
});

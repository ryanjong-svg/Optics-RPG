import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState } from '../js/engine/core/state.js';
import { ACHIEVEMENTS, unlockedAchievements } from '../js/data/achievements.js';

test('perfect_refraction: locked below 10 puzzle hits, unlocks at 10', () => {
  const state = newGameState();
  state.flags.snellHits = 9;
  assert.equal(ACHIEVEMENTS.perfect_refraction.check(state), false);
  state.flags.snellHits = 10;
  assert.equal(ACHIEVEMENTS.perfect_refraction.check(state), true);
});

test('dual_nature: locked until both specializations have been tried', () => {
  const state = newGameState();
  assert.equal(ACHIEVEMENTS.dual_nature.check(state), false);
  state.flags.specializationsTried.photon_focus = true;
  assert.equal(ACHIEVEMENTS.dual_nature.check(state), false, 'only one path tried should not unlock it');
  state.flags.specializationsTried.wave_mechanics = true;
  assert.equal(ACHIEVEMENTS.dual_nature.check(state), true);
});

test('both new achievements appear in unlockedAchievements once their conditions are met', () => {
  const state = newGameState();
  state.flags.snellHits = 10;
  state.flags.specializationsTried = { photon_focus: true, wave_mechanics: true };
  const ids = unlockedAchievements(state).map(([id]) => id);
  assert.ok(ids.includes('perfect_refraction'));
  assert.ok(ids.includes('dual_nature'));
});

test('chain_reaction: locked below 3 combo chains landed, unlocks at 3', () => {
  const state = newGameState();
  state.flags.combosChained = 2;
  assert.equal(ACHIEVEMENTS.chain_reaction.check(state), false);
  state.flags.combosChained = 3;
  assert.equal(ACHIEVEMENTS.chain_reaction.check(state), true);
});

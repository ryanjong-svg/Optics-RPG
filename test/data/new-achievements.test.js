import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState } from '../../js/engine/core/state.js';
import { ACHIEVEMENTS, unlockedAchievements, ELITE_HUNTABLE_ZONES } from '../../js/data/meta/achievements.js';
import { ZONE_ENCOUNTERS } from '../../js/engine/world/overworld.js';

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

test('ELITE_HUNTABLE_ZONES: matches every zone that actually has random encounters', () => {
  const realZones = Object.keys(ZONE_ENCOUNTERS).filter(z => ZONE_ENCOUNTERS[z].length > 0);
  assert.deepEqual([...ELITE_HUNTABLE_ZONES].sort(), realZones.sort(),
    'ELITE_HUNTABLE_ZONES is a duplicated literal (to avoid a circular import) - update it if ZONE_ENCOUNTERS changes');
});

test('zone_conqueror: locked until every huntable zone has at least one Elite kill', () => {
  const state = newGameState();
  assert.equal(ACHIEVEMENTS.zone_conqueror.check(state), false);
  state.flags.eliteKillsByZone = Object.fromEntries(ELITE_HUNTABLE_ZONES.map(z => [z, 1]));
  assert.equal(ACHIEVEMENTS.zone_conqueror.check(state), true);
  delete state.flags.eliteKillsByZone[ELITE_HUNTABLE_ZONES[0]];
  assert.equal(ACHIEVEMENTS.zone_conqueror.check(state), false, 'missing even one zone should keep it locked');
});

test('blind_marksman: locked below 5 hardcore puzzle hits, unlocks at 5', () => {
  const state = newGameState();
  state.flags.hardcorePuzzleHits = 4;
  assert.equal(ACHIEVEMENTS.blind_marksman.check(state), false);
  state.flags.hardcorePuzzleHits = 5;
  assert.equal(ACHIEVEMENTS.blind_marksman.check(state), true);
});

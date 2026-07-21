import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState } from '../../js/engine/core/state.js';
import { migrateState } from '../../js/engine/core/save.js';
import { applySetSpecialization } from '../../js/engine/panels/craft.js';
import { adaptiveResistMultiplier } from '../../js/engine/battle/battle.js';
import { specializationDamageMult, effectiveChargeCost } from '../../js/engine/battle/battleFormulas.js';
import { findAbility } from '../../js/data/content/abilities.js';
import { SPECIALIZATIONS } from '../../js/data/content/specializations.js';

test('applySetSpecialization: refused below the level requirement', () => {
  const state = newGameState();
  state.player.level = 4;
  assert.equal(applySetSpecialization(state, 'photon_focus'), false);
  assert.equal(state.player.specialization, null);
});

test('applySetSpecialization: succeeds at the level requirement, and can be switched freely', () => {
  const state = newGameState();
  state.player.level = 5;
  assert.equal(applySetSpecialization(state, 'photon_focus'), true);
  assert.equal(state.player.specialization, 'photon_focus');
  assert.equal(applySetSpecialization(state, 'wave_mechanics'), true);
  assert.equal(state.player.specialization, 'wave_mechanics');
  assert.equal(applySetSpecialization(state, null), true, 'clearing back to no specialization should be allowed');
  assert.equal(state.player.specialization, null);
});

test('applySetSpecialization: refuses an unknown specialization id', () => {
  const state = newGameState();
  state.player.level = 10;
  assert.equal(applySetSpecialization(state, 'not_a_real_spec'), false);
});

test('applySetSpecialization: records every specialization ever tried, for the "tried both paths" achievement', () => {
  const state = newGameState();
  state.player.level = 5;
  applySetSpecialization(state, 'photon_focus');
  assert.deepEqual(state.flags.specializationsTried, { photon_focus: true });
  applySetSpecialization(state, 'wave_mechanics');
  assert.deepEqual(state.flags.specializationsTried, { photon_focus: true, wave_mechanics: true });
  applySetSpecialization(state, null);
  assert.deepEqual(state.flags.specializationsTried, { photon_focus: true, wave_mechanics: true }, 'clearing back to null should not erase the lifetime record');
});

test('specializationDamageMult: 1x with no specialization, boosted only for that path\'s abilities', () => {
  const laserFocus = findAbility('laser_focus');
  const diffractionWave = findAbility('diffraction_wave');
  const noSpecPlayer = { specialization: null };
  assert.equal(specializationDamageMult(noSpecPlayer, laserFocus), 1);

  const photonPlayer = { specialization: 'photon_focus' };
  assert.equal(specializationDamageMult(photonPlayer, laserFocus), SPECIALIZATIONS.photon_focus.damageMult);
  assert.equal(specializationDamageMult(photonPlayer, diffractionWave), 1, 'photon_focus should not boost a wave-path ability');

  const wavePlayer = { specialization: 'wave_mechanics' };
  assert.equal(specializationDamageMult(wavePlayer, diffractionWave), SPECIALIZATIONS.wave_mechanics.damageMult);
});

test('effectiveChargeCost: reduced by 1 (floor 1) for photon_focus on its covered abilities, unaffected otherwise', () => {
  const laserFocus = findAbility('laser_focus'); // chargeCost: 2
  const reflectStrike = findAbility('reflect_strike'); // chargeCost: 1, not a photon_focus concept
  const photonPlayer = { specialization: 'photon_focus' };
  assert.equal(effectiveChargeCost(photonPlayer, laserFocus), laserFocus.chargeCost - 1);
  assert.equal(effectiveChargeCost(photonPlayer, reflectStrike), reflectStrike.chargeCost);

  const noSpecPlayer = { specialization: null };
  assert.equal(effectiveChargeCost(noSpecPlayer, laserFocus), laserFocus.chargeCost);
});

test('effectiveChargeCost: never reduces below 1 even if chargeCost is already 1', () => {
  const reflectStrike = findAbility('reflect_strike');
  // Simulate a hypothetical spec covering this ability's concept, to test the floor directly.
  const player = { specialization: 'photon_focus' };
  const fakeAbility = { ...reflectStrike, concept: 'coherence', chargeCost: 1 };
  assert.equal(effectiveChargeCost(player, fakeAbility), 1);
});

test('adaptiveResistMultiplier: 1x on NG+ cycle 0 (first playthrough) regardless of use count', () => {
  const ability = findAbility('reflect_strike');
  const game = {
    state: { flags: { ngPlusCycle: 0 } },
    battle: { opts: { guardianMap: 'mirrors' }, enemy: { isBoss: false, name: 'Test Guardian' }, abilityUseCounts: { reflect_strike: 10 }, log: [] }
  };
  assert.equal(adaptiveResistMultiplier(game, ability), 1);
});

test('adaptiveResistMultiplier: 1x for ordinary (non-guardian/boss) encounters even in NG+', () => {
  const ability = findAbility('reflect_strike');
  const game = {
    state: { flags: { ngPlusCycle: 2 } },
    battle: { opts: {}, enemy: { isBoss: false, name: 'Wisp' }, abilityUseCounts: { reflect_strike: 10 }, log: [] }
  };
  assert.equal(adaptiveResistMultiplier(game, ability), 1);
});

test('adaptiveResistMultiplier: halves damage once the cycle-scaled threshold is crossed in a guardian fight', () => {
  const ability = findAbility('reflect_strike');
  const game = {
    state: { flags: { ngPlusCycle: 1 } }, // threshold = max(2, 4-1) = 3
    battle: { opts: { guardianMap: 'mirrors' }, enemy: { isBoss: false, name: 'Test Guardian' }, abilityUseCounts: { reflect_strike: 3 }, log: [] }
  };
  assert.equal(adaptiveResistMultiplier(game, ability), 1, 'use count at the threshold should still be normal');
  game.battle.abilityUseCounts.reflect_strike = 4;
  assert.equal(adaptiveResistMultiplier(game, ability), 0.5, 'use count past the threshold should be resisted');
});

test('adaptiveResistMultiplier: a higher NG+ cycle lowers the threshold (adapts sooner)', () => {
  const ability = findAbility('reflect_strike');
  const makeGame = (cycle, count) => ({
    state: { flags: { ngPlusCycle: cycle } },
    battle: { opts: { guardianMap: 'mirrors' }, enemy: { isBoss: false, name: 'Test Guardian' }, abilityUseCounts: { reflect_strike: count }, log: [] }
  });
  // cycle 3+: threshold floors at 2
  assert.equal(adaptiveResistMultiplier(makeGame(3, 2), ability), 1);
  assert.equal(adaptiveResistMultiplier(makeGame(3, 3), ability), 0.5);
});

test('migrateState: backfills player.specialization to null for a save from before it existed', () => {
  const state = newGameState();
  delete state.player.specialization;
  const migrated = migrateState(state);
  assert.equal(migrated.player.specialization, null);
});

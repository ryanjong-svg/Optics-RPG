import { test } from 'node:test';
import assert from 'node:assert/strict';

import { computeLifetimeStats, computeComboProgress } from '../js/engine/panels/completionUI.js';
import { newGameState } from '../js/engine/core/state.js';
import { COMBOS } from '../js/engine/battle/battle.js';

const TOTAL_COMBOS = Object.values(COMBOS).reduce((sum, payoffs) => sum + payoffs.length, 0);

test('computeLifetimeStats: all zero/null on a fresh game', () => {
  const stats = computeLifetimeStats(newGameState());
  assert.equal(stats.totalDamageDealt, 0);
  assert.equal(stats.totalVictories, 0);
  assert.equal(stats.fastestBossKillTurns, null);
  assert.equal(stats.mostUsedAbilityName, null);
  assert.equal(stats.mostUsedAbilityCount, 0);
  assert.equal(stats.elitesDefeated, 0);
  assert.deepEqual(stats.eliteZoneBreakdown, []);
  assert.equal(stats.comboDoneCount, 0);
  assert.equal(stats.comboTotal, TOTAL_COMBOS);
  assert.deepEqual(stats.comboDoneLabels, []);
  assert.equal(stats.combosChained, 0);
});

test('computeLifetimeStats: reflects combosChained', () => {
  const state = newGameState();
  state.flags.combosChained = 4;
  assert.equal(computeLifetimeStats(state).combosChained, 4);
});

test('computeLifetimeStats: elite zone breakdown only lists zones with at least one kill', () => {
  const state = newGameState();
  state.flags.elitesDefeated = 5;
  state.flags.eliteKillsByZone = { village: 3, mirrors: 0, prism: 2 };
  const stats = computeLifetimeStats(state);
  assert.equal(stats.elitesDefeated, 5);
  assert.deepEqual(stats.eliteZoneBreakdown.sort(), ['Lumen Village 3', 'Prism Peak 2'].sort());
});

test('computeComboProgress: counts and names only the combo pairs actually triggered', () => {
  const state = newGameState();
  assert.deepEqual(computeComboProgress(state), { doneCount: 0, total: TOTAL_COMBOS, doneLabels: [] });

  state.flags.combosTriggered = { 'tir_shield>reflect_strike': true };
  const progress = computeComboProgress(state);
  assert.equal(progress.doneCount, 1);
  assert.equal(progress.total, TOTAL_COMBOS);
  assert.deepEqual(progress.doneLabels, ['TIR Shield→Reflect Strike']);
});

test('computeLifetimeStats: reflects accumulated flags', () => {
  const state = newGameState();
  state.flags.totalDamageDealt = 342;
  state.flags.totalVictories = 5;
  state.flags.fastestBossKillTurns = 7;
  const stats = computeLifetimeStats(state);
  assert.equal(stats.totalDamageDealt, 342);
  assert.equal(stats.totalVictories, 5);
  assert.equal(stats.fastestBossKillTurns, 7);
});

test('computeLifetimeStats: picks the ability with the highest lifetime use count', () => {
  const state = newGameState();
  state.flags.abilityUseCountsLifetime = { reflect_strike: 3, refraction_bend: 9, laser_focus: 5 };
  const stats = computeLifetimeStats(state);
  assert.equal(stats.mostUsedAbilityName, 'Refraction Bend');
  assert.equal(stats.mostUsedAbilityCount, 9);
});

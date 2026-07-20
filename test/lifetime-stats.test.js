import { test } from 'node:test';
import assert from 'node:assert/strict';

import { computeLifetimeStats } from '../js/engine/completionUI.js';
import { newGameState } from '../js/engine/state.js';

test('computeLifetimeStats: all zero/null on a fresh game', () => {
  const stats = computeLifetimeStats(newGameState());
  assert.equal(stats.totalDamageDealt, 0);
  assert.equal(stats.totalVictories, 0);
  assert.equal(stats.fastestBossKillTurns, null);
  assert.equal(stats.mostUsedAbilityName, null);
  assert.equal(stats.mostUsedAbilityCount, 0);
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

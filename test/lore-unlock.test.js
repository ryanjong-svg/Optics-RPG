import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LORE, isLoreUnlocked } from '../js/data/lore.js';
import { ACHIEVEMENTS, checkNewAchievements } from '../js/data/achievements.js';
import { newGameState } from '../js/engine/state.js';

test('isLoreUnlocked: "always" entries are unlocked from a fresh game', () => {
  assert.equal(isLoreUnlocked(newGameState(), { unlock: { type: 'always' } }), true);
});

test('isLoreUnlocked: "map" entries require the map to have been visited', () => {
  const state = newGameState();
  const entry = { unlock: { type: 'map', map: 'mirrors' } };
  assert.equal(isLoreUnlocked(state, entry), false);
  state.flags.visitedMaps.mirrors = true;
  assert.equal(isLoreUnlocked(state, entry), true);
});

test('isLoreUnlocked: "npc" entries require the professor to have been met', () => {
  const state = newGameState();
  const entry = { unlock: { type: 'npc', npc: 'prof_lumen' } };
  assert.equal(isLoreUnlocked(state, entry), false);
  state.flags.metNpc.prof_lumen = true;
  assert.equal(isLoreUnlocked(state, entry), true);
});

test('isLoreUnlocked: "allAchievements" reads the state flag directly, with no fallback', () => {
  const state = newGameState();
  const entry = { unlock: { type: 'allAchievements' } };
  assert.equal(isLoreUnlocked(state, entry), false);
  state.flags.allAchievementsEarned = true;
  assert.equal(isLoreUnlocked(state, entry), true);
});

test('the completionist epilogue exists and is wired to the allAchievements unlock type', () => {
  assert.ok(LORE.full_circle, 'expected a full_circle Chronicle entry');
  assert.equal(LORE.full_circle.unlock.type, 'allAchievements');
});

test('checkNewAchievements: sets allAchievementsEarned once every achievement check() passes', () => {
  const state = newGameState();
  checkNewAchievements(state);
  assert.equal(state.flags.allAchievementsEarned, false, 'a fresh game should not have every achievement yet');

  // ACHIEVEMENTS is a shared module singleton - stub every check() and
  // restore the originals afterward so this doesn't leak into other test
  // files that import achievements.js in the same process.
  const originalChecks = Object.fromEntries(Object.entries(ACHIEVEMENTS).map(([id, a]) => [id, a.check]));
  try {
    for (const a of Object.values(ACHIEVEMENTS)) a.check = () => true;
    checkNewAchievements(state);
    assert.equal(state.flags.allAchievementsEarned, true);
  } finally {
    for (const [id, check] of Object.entries(originalChecks)) ACHIEVEMENTS[id].check = check;
  }
});

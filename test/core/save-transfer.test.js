// exportSaveString/importSaveString/saveGame/loadGame themselves touch
// localStorage, which the Node test runner doesn't provide - so these tests
// exercise the pure pieces (migrateState, looksLikeSave) directly instead.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState } from '../../js/engine/core/state.js';
import { migrateState, looksLikeSave } from '../../js/engine/core/save.js';

test('looksLikeSave: accepts a real game state shape', () => {
  const state = newGameState();
  assert.equal(looksLikeSave(state), true);
});

test('looksLikeSave: rejects garbage/unrelated JSON', () => {
  assert.equal(looksLikeSave(null), false);
  assert.equal(looksLikeSave(42), false);
  assert.equal(looksLikeSave({}), false);
  assert.equal(looksLikeSave({ hello: 'world' }), false);
  assert.equal(looksLikeSave({ player: {} }), false, 'missing flags and materials');
});

test('migrateState: backfills every field added after older saves were written', () => {
  const bareState = {
    currentMap: 'village',
    player: { materials: {} },
    flags: {}
  };
  const migrated = migrateState(bareState);
  assert.deepEqual(migrated.player.consumables, {});
  assert.deepEqual(migrated.flags.visitedMaps, { village: true });
  assert.deepEqual(migrated.flags.metNpc, {});
  assert.deepEqual(migrated.flags.quizAsked, {});
  assert.deepEqual(migrated.flags.quests, {});
  assert.deepEqual(migrated.flags.secretsFound, {});
  assert.deepEqual(migrated.flags.achievements, {});
  assert.equal(migrated.flags.ngPlusCycle, 0);
  assert.equal(migrated.flags.totalDamageDealt, 0);
  assert.deepEqual(migrated.flags.abilityUseCountsLifetime, {});
  assert.equal(migrated.flags.fastestBossKillTurns, null);
  assert.equal(migrated.flags.totalVictories, 0);
  assert.equal(migrated.flags.allAchievementsEarned, false);
  assert.equal(migrated.flags.lastSeenVersion, '1.0.0');
  assert.equal(migrated.flags.elitesDefeated, 0);
  assert.deepEqual(migrated.flags.eliteKillsByZone, {});
  assert.equal(migrated.flags.combosLanded, 0);
  assert.deepEqual(migrated.flags.combosTriggered, {});
  assert.equal(migrated.flags.combosChained, 0);
  assert.deepEqual(migrated.flags.enemyKillCounts, {});
  assert.deepEqual(migrated.flags.bounties, []);
  assert.equal(migrated.flags.bountiesClaimed, 0);
  assert.equal(migrated.flags.bountyStreak, 0);
  assert.equal(migrated.flags.bestBountyStreak, 0);
  assert.deepEqual(migrated.flags.bestiaryFavorites, {});
  assert.equal(migrated.flags.hardcorePuzzleHits, 0);
  assert.deepEqual(migrated.flags.npcReputation, {});
  assert.equal(migrated.flags.glareEvent, null);
  assert.deepEqual(migrated.settings, { difficulty: 'normal', muted: false, musicVolume: 1, sfxVolume: 1, reducedMotion: false, puzzleHints: true });
});

test('migrateState: leaves already-present fields untouched', () => {
  const state = newGameState();
  state.player.consumables.photon_salve = 3;
  state.flags.ngPlusCycle = 2;
  state.settings.difficulty = 'hard';
  state.settings.muted = true;
  const migrated = migrateState(state);
  assert.equal(migrated.player.consumables.photon_salve, 3);
  assert.equal(migrated.flags.ngPlusCycle, 2);
  assert.equal(migrated.settings.difficulty, 'hard');
  assert.equal(migrated.settings.muted, true);
});

test('migrateState: backfills a partially-present settings object (e.g. an older exported save)', () => {
  const state = newGameState();
  delete state.settings.difficulty;
  const migrated = migrateState(state);
  assert.equal(migrated.settings.difficulty, 'normal');
  assert.equal(migrated.settings.muted, false);
});

test('migrateState: backfills musicVolume/sfxVolume to full (1) for a save from before they existed', () => {
  const state = newGameState();
  delete state.settings.musicVolume;
  delete state.settings.sfxVolume;
  const migrated = migrateState(state);
  assert.equal(migrated.settings.musicVolume, 1);
  assert.equal(migrated.settings.sfxVolume, 1);
});

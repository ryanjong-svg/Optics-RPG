// exportSaveString/importSaveString/saveGame/loadGame themselves touch
// localStorage, which the Node test runner doesn't provide - so these tests
// exercise the pure pieces (migrateState, looksLikeSave) directly instead.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState } from '../js/engine/state.js';
import { migrateState, looksLikeSave } from '../js/engine/save.js';

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
});

test('migrateState: leaves already-present fields untouched', () => {
  const state = newGameState();
  state.player.consumables.photon_salve = 3;
  state.flags.ngPlusCycle = 2;
  const migrated = migrateState(state);
  assert.equal(migrated.player.consumables.photon_salve, 3);
  assert.equal(migrated.flags.ngPlusCycle, 2);
});

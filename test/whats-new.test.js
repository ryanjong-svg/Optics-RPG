import { test } from 'node:test';
import assert from 'node:assert/strict';

import { hasUnseenChangelog } from '../js/engine/whatsNewUI.js';
import { GAME_VERSION, CHANGELOG } from '../js/data/changelog.js';
import { newGameState } from '../js/engine/state.js';
import { migrateState } from '../js/engine/save.js';

test('a brand new game starts fully caught up on the changelog', () => {
  const state = newGameState();
  assert.equal(state.flags.lastSeenVersion, GAME_VERSION);
  assert.equal(hasUnseenChangelog(state), false);
});

test('hasUnseenChangelog: true whenever lastSeenVersion differs from the current version', () => {
  const state = newGameState();
  state.flags.lastSeenVersion = '0.9.0';
  assert.equal(hasUnseenChangelog(state), true);
});

test('migrateState: a pre-changelog save is backfilled to 1.0.0, not the current version', () => {
  const bareState = { currentMap: 'village', player: { materials: {} }, flags: {} };
  const migrated = migrateState(bareState);
  assert.equal(migrated.flags.lastSeenVersion, '1.0.0');
  assert.notEqual(migrated.flags.lastSeenVersion, GAME_VERSION, 'a migrated legacy save should see unread entries, not start caught up');
});

test('CHANGELOG: the newest entry matches GAME_VERSION, and every entry has at least one highlight', () => {
  assert.equal(CHANGELOG[0].version, GAME_VERSION);
  for (const entry of CHANGELOG) {
    assert.ok(Array.isArray(entry.highlights) && entry.highlights.length > 0, `${entry.version} should list at least one highlight`);
  }
});

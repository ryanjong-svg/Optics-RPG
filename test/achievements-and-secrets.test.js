import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MAPS } from '../js/data/maps.js';
import { MATERIALS } from '../js/data/materials.js';
import { ACHIEVEMENTS, unlockedAchievements } from '../js/data/achievements.js';
import { newGameState } from '../js/engine/state.js';

test('every zone secret references a real material and sits on a walkable floor tile', () => {
  for (const map of Object.values(MAPS)) {
    if (!map.secret) continue;
    const { x, y, material } = map.secret;
    assert.ok(MATERIALS[material], `${map.id} secret references unknown material "${material}"`);
    assert.ok(map.rows[y], `${map.id} secret y=${y} is out of bounds`);
    assert.equal(map.rows[y][x], '.', `${map.id} secret at (${x},${y}) is not a plain floor tile`);
  }
});

test('every map row is exactly 16 characters wide', () => {
  for (const map of Object.values(MAPS)) {
    for (const row of map.rows) {
      assert.equal(row.length, 16, `${map.id} has a row with length ${row.length}, expected 16`);
    }
  }
});

test('no achievement check function throws against a fresh game state', () => {
  const state = newGameState();
  for (const [id, a] of Object.entries(ACHIEVEMENTS)) {
    assert.doesNotThrow(() => a.check(state), `achievement "${id}" check threw on a fresh state`);
  }
});

test('a fresh game state has zero achievements unlocked', () => {
  const state = newGameState();
  assert.deepEqual(unlockedAchievements(state), []);
});

test('every achievement has a non-empty title and description', () => {
  for (const [id, a] of Object.entries(ACHIEVEMENTS)) {
    assert.ok(a.title && a.title.length > 0, `achievement "${id}" missing a title`);
    assert.ok(a.desc && a.desc.length > 0, `achievement "${id}" missing a description`);
  }
});

test('milestone achievements unlock once their underlying condition is met', () => {
  const state = newGameState();
  state.player.level = 5;
  const unlocked = new Set(unlockedAchievements(state).map(([id]) => id));
  assert.ok(unlocked.has('apprentice_no_more'));
});

test('event-flagged achievements only unlock once state.flags.achievements records them', () => {
  const state = newGameState();
  assert.ok(!unlockedAchievements(state).some(([id]) => id === 'overqualified'));
  state.flags.achievements.overqualified = true;
  assert.ok(unlockedAchievements(state).some(([id]) => id === 'overqualified'));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGameState, grantXp, unlockCodex } from '../../js/engine/core/state.js';
import { buildGear } from '../../js/engine/core/gear.js';

test('grantXp: accumulates XP without leveling up when below the threshold', () => {
  const state = newGameState();
  const logs = [];
  grantXp(state, 5, m => logs.push(m));
  assert.equal(state.player.xp, 5);
  assert.equal(state.player.level, 1);
  assert.equal(logs.length, 1);
});

test('grantXp: levels up, restores HP, and raises maxHp/focus/xpToNext when crossing the threshold', () => {
  const state = newGameState();
  const startingXpToNext = state.player.xpToNext;
  state.player.hp = 1; // simulate near-death
  const logs = [];
  grantXp(state, startingXpToNext, m => logs.push(m));
  assert.equal(state.player.level, 2);
  assert.equal(state.player.maxHp, 48); // 40 + 8
  assert.equal(state.player.focus, 8); // 6 + 2
  assert.equal(state.player.hp, state.player.maxHp, 'HP should be fully restored on level up');
  assert.ok(logs.some(m => m.startsWith('Level up!')));
});

test('grantXp: a single large grant can trigger multiple level-ups', () => {
  const state = newGameState();
  grantXp(state, 200, () => {});
  assert.ok(state.player.level > 2, `expected multiple level-ups from a 200 XP grant, got level ${state.player.level}`);
});

test('unlockCodex: sets the flag once and only logs on the first unlock', () => {
  const state = newGameState();
  const logs = [];
  unlockCodex(state, 'reflection', m => logs.push(m));
  unlockCodex(state, 'reflection', m => logs.push(m));
  assert.equal(state.codexUnlocked.reflection, true);
  assert.equal(logs.length, 1, 'should not log again once already unlocked');
});

test('unlockCodex: does nothing for a null/undefined concept id', () => {
  const state = newGameState();
  unlockCodex(state, null, () => assert.fail('should not log for a null concept'));
  assert.deepEqual(state.codexUnlocked, {});
});

test('buildGear: returns null for every slot when nothing is equipped', () => {
  const state = newGameState();
  const gear = buildGear(state.player);
  assert.deepEqual(gear, { lens: null, mirror: null, prism: null, filter: null });
});

test('buildGear: resolves an equipped recipe id into its real built stats', () => {
  const state = newGameState();
  state.player.equipped.mirror = 'silver_mirror';
  const gear = buildGear(state.player);
  assert.ok(gear.mirror);
  assert.equal(gear.mirror.reflectivity, 0.95);
});

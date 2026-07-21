import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState, claimHint } from '../js/engine/core/state.js';
import { shouldTriggerBossEnrage, applyBossEnrage } from '../js/engine/battle/battleFormulas.js';
import { SHAPES } from '../js/data/world/pixelArt.js';

test('claimHint: returns true and marks the hint shown the first time, false ever after', () => {
  const state = newGameState();
  assert.equal(claimHint(state, 'firstQuest'), true);
  assert.equal(state.flags.hintsShown.firstQuest, true);
  assert.equal(claimHint(state, 'firstQuest'), false, 'should not fire twice');
});

test('claimHint: different hint ids are independent', () => {
  const state = newGameState();
  claimHint(state, 'firstQuest');
  assert.equal(claimHint(state, 'criticalHp'), true, 'a different hint id should still be unclaimed');
});

test('shouldTriggerBossEnrage: only fires for the boss at or below a quarter HP, and only once', () => {
  const bossBattle = { enemy: { isBoss: true, hp: 100, curHp: 25 }, bossEnrageTriggered: false };
  assert.equal(shouldTriggerBossEnrage(bossBattle), true, 'exactly a quarter HP should trigger');

  const aboveThreshold = { enemy: { isBoss: true, hp: 100, curHp: 26 }, bossEnrageTriggered: false };
  assert.equal(shouldTriggerBossEnrage(aboveThreshold), false);

  const alreadyTriggered = { enemy: { isBoss: true, hp: 100, curHp: 10 }, bossEnrageTriggered: true };
  assert.equal(shouldTriggerBossEnrage(alreadyTriggered), false);

  const notTheBoss = { enemy: { isBoss: false, hp: 100, curHp: 10 }, bossEnrageTriggered: false };
  assert.equal(shouldTriggerBossEnrage(notTheBoss), false);

  const dead = { enemy: { isBoss: true, hp: 100, curHp: 0 }, bossEnrageTriggered: false };
  assert.equal(shouldTriggerBossEnrage(dead), false, 'a defeated boss should not trigger enrage');
});

test('applyBossEnrage: boosts attack by 30%', () => {
  const enemy = { atk: 10 };
  applyBossEnrage(enemy);
  assert.equal(enemy.atk, 13); // round(10*1.3) = 13
});

test('new shapes (colossus, twin_wraith) exist with consistent row widths', () => {
  for (const key of ['colossus', 'twin_wraith']) {
    const rows = SHAPES[key];
    assert.ok(Array.isArray(rows) && rows.length > 0, `${key} should be a non-empty array of rows`);
    const width = rows[0].length;
    for (const row of rows) {
      assert.equal(row.length, width, `${key} has a row with inconsistent width`);
    }
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { DIFFICULTIES, findDifficulty } from '../js/data/difficulty.js';
import { applyDifficultyScaling, shouldTriggerGuardianPhase2, applyGuardianPhase2 } from '../js/engine/battle.js';

test('every difficulty has a positive enemyMult/xpMult and non-empty label/desc', () => {
  for (const [id, d] of Object.entries(DIFFICULTIES)) {
    assert.ok(d.enemyMult > 0, `${id} enemyMult should be positive`);
    assert.ok(d.xpMult > 0, `${id} xpMult should be positive`);
    assert.ok(d.label && d.label.length > 0, `${id} missing a label`);
    assert.ok(d.desc && d.desc.length > 0, `${id} missing a description`);
  }
});

test('findDifficulty: falls back to normal for an unknown or missing id', () => {
  assert.equal(findDifficulty('nonsense'), DIFFICULTIES.normal);
  assert.equal(findDifficulty(undefined), DIFFICULTIES.normal);
});

test('applyDifficultyScaling: normal difficulty leaves enemy stats untouched', () => {
  const enemy = { hp: 40, curHp: 30, atk: 8, def: 5 };
  applyDifficultyScaling(enemy, 'normal');
  assert.deepEqual(enemy, { hp: 40, curHp: 30, atk: 8, def: 5 });
});

test('applyDifficultyScaling: easy weakens, hard toughens hp/atk/def and resets curHp to the new max', () => {
  const easyEnemy = { hp: 40, curHp: 20, atk: 8, def: 4 };
  applyDifficultyScaling(easyEnemy, 'easy');
  assert.equal(easyEnemy.hp, 30); // 40 * 0.75
  assert.equal(easyEnemy.curHp, 30);
  assert.equal(easyEnemy.atk, 6); // 8 * 0.75
  assert.equal(easyEnemy.def, 3); // 4 * 0.75 = 3

  const hardEnemy = { hp: 40, curHp: 20, atk: 8, def: 4 };
  applyDifficultyScaling(hardEnemy, 'hard');
  assert.equal(hardEnemy.hp, 54); // 40 * 1.35
  assert.equal(hardEnemy.atk, 11); // round(8*1.35)=11
});

test('shouldTriggerGuardianPhase2: only fires for guardian fights at or below half HP, and only once', () => {
  const guardianBattle = { opts: { guardianMap: 'mirrors' }, phase2Triggered: false, enemy: { hp: 40, curHp: 20 } };
  assert.equal(shouldTriggerGuardianPhase2(guardianBattle), true, 'exactly half HP should trigger');

  const aboveHalf = { opts: { guardianMap: 'mirrors' }, phase2Triggered: false, enemy: { hp: 40, curHp: 21 } };
  assert.equal(shouldTriggerGuardianPhase2(aboveHalf), false);

  const alreadyTriggered = { opts: { guardianMap: 'mirrors' }, phase2Triggered: true, enemy: { hp: 40, curHp: 10 } };
  assert.equal(shouldTriggerGuardianPhase2(alreadyTriggered), false);

  const notAGuardianFight = { opts: {}, phase2Triggered: false, enemy: { hp: 40, curHp: 10 } };
  assert.equal(shouldTriggerGuardianPhase2(notAGuardianFight), false);

  const dead = { opts: { guardianMap: 'mirrors' }, phase2Triggered: false, enemy: { hp: 40, curHp: 0 } };
  assert.equal(shouldTriggerGuardianPhase2(dead), false, 'a defeated enemy should not trigger phase 2');
});

test('applyGuardianPhase2: boosts attack by 25%', () => {
  const enemy = { atk: 10 };
  applyGuardianPhase2(enemy);
  assert.equal(enemy.atk, 13); // round(10*1.25) = 12.5 -> 13
});

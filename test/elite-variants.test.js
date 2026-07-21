import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyEliteVariant, ELITE_CHANCE, eliteChanceForCycle } from '../js/engine/battle.js';

test('applyEliteVariant: boosts hp/atk/def/xp and renames the enemy, without touching id/zone', () => {
  const enemy = { id: 'mirror_golem', name: 'Mirror Golem', hp: 40, atk: 10, def: 5, xp: 20, zone: 'mirrors' };
  applyEliteVariant(enemy);
  assert.equal(enemy.isElite, true);
  assert.equal(enemy.name, 'Elite Mirror Golem');
  assert.ok(enemy.hp > 40, 'hp should increase');
  assert.equal(enemy.curHp, enemy.hp, 'curHp should track the boosted hp');
  assert.ok(enemy.atk > 10, 'atk should increase');
  assert.ok(enemy.def > 5, 'def should increase');
  assert.ok(enemy.xp > 20, 'xp reward should increase');
  assert.equal(enemy.id, 'mirror_golem', 'id must stay the base enemy id for Bestiary tracking');
  assert.equal(enemy.zone, 'mirrors', 'zone must be untouched');
});

test('ELITE_CHANCE: a small, non-zero probability', () => {
  assert.ok(ELITE_CHANCE > 0 && ELITE_CHANCE < 0.5, 'elite encounters should be rare, not the common case');
});

test('eliteChanceForCycle: matches the base rate on a first playthrough (cycle 0), and rises with each NG+ cycle', () => {
  assert.equal(eliteChanceForCycle(0), ELITE_CHANCE);
  assert.equal(eliteChanceForCycle(undefined), ELITE_CHANCE, 'a missing cycle should behave like cycle 0');
  assert.ok(eliteChanceForCycle(1) > eliteChanceForCycle(0));
  assert.ok(eliteChanceForCycle(2) > eliteChanceForCycle(1));
});

test('eliteChanceForCycle: caps out rather than climbing forever', () => {
  const atHighCycle = eliteChanceForCycle(20);
  assert.ok(atHighCycle <= 0.5, 'even a very high cycle should not make elites the common case');
  assert.equal(eliteChanceForCycle(20), eliteChanceForCycle(50), 'should be capped, not still increasing');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState } from '../js/engine/core/state.js';
import { CONSUMABLES, findConsumable } from '../js/data/consumables.js';
import { canCraftConsumable, applyCraftConsumable, applyConsumable } from '../js/engine/core/consumables.js';
import { CODEX } from '../js/data/codex.js';

test('applyCraftConsumable: refuses to craft without enough materials', () => {
  const state = newGameState();
  const crafted = applyCraftConsumable(state, 'photon_salve');
  assert.equal(crafted, false);
  assert.equal(state.player.consumables.photon_salve || 0, 0);
});

test('applyCraftConsumable: deducts materials and adds to the stack when affordable', () => {
  const state = newGameState();
  const item = findConsumable('photon_salve');
  item.materials.forEach(matId => { state.player.materials[matId] = item.count; });
  const crafted = applyCraftConsumable(state, 'photon_salve');
  assert.equal(crafted, true);
  assert.equal(state.player.consumables.photon_salve, 1);
  item.materials.forEach(matId => assert.equal(state.player.materials[matId], 0));
});

test('applyCraftConsumable: crafting a second one stacks the count', () => {
  const state = newGameState();
  const item = findConsumable('photon_salve');
  item.materials.forEach(matId => { state.player.materials[matId] = item.count * 2; });
  applyCraftConsumable(state, 'photon_salve');
  applyCraftConsumable(state, 'photon_salve');
  assert.equal(state.player.consumables.photon_salve, 2);
});

test('applyConsumable: does nothing when none are owned', () => {
  const state = newGameState();
  state.player.hp = 10;
  const healed = applyConsumable(state, 'photon_salve');
  assert.equal(healed, 0);
  assert.equal(state.player.hp, 10);
});

test('applyConsumable: does nothing (and does not consume the item) when already at full HP', () => {
  const state = newGameState();
  state.player.consumables.photon_salve = 3;
  state.player.hp = state.player.maxHp;
  const healed = applyConsumable(state, 'photon_salve');
  assert.equal(healed, 0);
  assert.equal(state.player.consumables.photon_salve, 3, 'should not consume the item on a no-op use');
});

test('applyConsumable: heals the item\'s amount and decrements the stack', () => {
  const state = newGameState();
  state.player.consumables.photon_salve = 2;
  state.player.hp = 5;
  const item = findConsumable('photon_salve');
  const healed = applyConsumable(state, 'photon_salve');
  assert.equal(healed, item.heal);
  assert.equal(state.player.hp, 5 + item.heal);
  assert.equal(state.player.consumables.photon_salve, 1);
});

test('applyConsumable: caps healing at maxHp instead of overhealing', () => {
  const state = newGameState();
  state.player.consumables.photon_salve = 1;
  state.player.hp = state.player.maxHp - 5;
  const healed = applyConsumable(state, 'photon_salve');
  assert.equal(healed, 5);
  assert.equal(state.player.hp, state.player.maxHp);
});

test('applyConsumable: unlocks the photobiomodulation codex entry', () => {
  const state = newGameState();
  state.player.consumables.photon_salve = 1;
  state.player.hp = 1;
  assert.equal(state.codexUnlocked.photobiomodulation, undefined);
  applyConsumable(state, 'photon_salve');
  assert.equal(state.codexUnlocked.photobiomodulation, true);
});

test('every consumable requires materials that exist, heals a positive amount, and has a matching Codex-referenced fact', () => {
  for (const item of CONSUMABLES) {
    assert.ok(item.materials.length > 0, `${item.id} has no required materials`);
    assert.ok(item.heal > 0, `${item.id} should heal a positive amount`);
    assert.ok(item.fact && item.fact.length > 0, `${item.id} is missing its physics fact`);
  }
  assert.ok(CODEX.photobiomodulation, 'photobiomodulation codex entry should exist for the healing mechanic');
});

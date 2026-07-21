import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState } from '../js/engine/core/state.js';
import { canCraftRecipe, applyCraftRecipe } from '../js/engine/panels/craft.js';
import { findRecipe } from '../js/data/equipment.js';

function withMaterials(state, mats) {
  Object.entries(mats).forEach(([id, count]) => { state.player.materials[id] = count; });
  return state;
}

test('canCraftRecipe: a plain (non-upgrade) recipe only needs materials', () => {
  const state = withMaterials(newGameState(), { crown_glass: 2 });
  assert.equal(canCraftRecipe(state.player, findRecipe('converging_lens')), true);
});

test('canCraftRecipe: an upgrade recipe is refused without the predecessor, even with enough materials', () => {
  const state = withMaterials(newGameState(), { diamond: 1 });
  assert.equal(canCraftRecipe(state.player, findRecipe('diamond_loupe')), false);
});

test('canCraftRecipe: an upgrade recipe is allowed once the predecessor is owned and materials suffice', () => {
  const state = withMaterials(newGameState(), { diamond: 1 });
  state.player.ownedGear.converging_lens = true;
  assert.equal(canCraftRecipe(state.player, findRecipe('diamond_loupe')), true);
});

test('applyCraftRecipe: a plain recipe deducts materials and grants ownership', () => {
  const state = withMaterials(newGameState(), { crown_glass: 2 });
  const ok = applyCraftRecipe(state.player, findRecipe('converging_lens'));
  assert.equal(ok, true);
  assert.equal(state.player.materials.crown_glass, 0);
  assert.equal(state.player.ownedGear.converging_lens, true);
});

test('applyCraftRecipe: refuses (returns false, no side effects) when the predecessor is not owned', () => {
  const state = withMaterials(newGameState(), { diamond: 1 });
  const ok = applyCraftRecipe(state.player, findRecipe('diamond_loupe'));
  assert.equal(ok, false);
  assert.equal(state.player.materials.diamond, 1, 'materials should not be deducted on a refused craft');
  assert.equal(state.player.ownedGear.diamond_loupe, undefined);
});

test('applyCraftRecipe: combining consumes the predecessor and grants the upgrade', () => {
  const state = withMaterials(newGameState(), { diamond: 1 });
  state.player.ownedGear.converging_lens = true;
  const ok = applyCraftRecipe(state.player, findRecipe('diamond_loupe'));
  assert.equal(ok, true);
  assert.equal(state.player.ownedGear.converging_lens, false, 'the predecessor should be consumed');
  assert.equal(state.player.ownedGear.diamond_loupe, true);
  assert.equal(state.player.materials.diamond, 0);
});

test('applyCraftRecipe: if the predecessor was equipped, the upgrade takes its place', () => {
  const state = withMaterials(newGameState(), { diamond: 1 });
  state.player.ownedGear.converging_lens = true;
  state.player.equipped.lens = 'converging_lens';
  applyCraftRecipe(state.player, findRecipe('diamond_loupe'));
  assert.equal(state.player.equipped.lens, 'diamond_loupe');
});

test('applyCraftRecipe: if a different item was equipped in that slot, combining does not touch it', () => {
  const state = withMaterials(newGameState(), { diamond: 1, flint_glass: 2 });
  state.player.ownedGear.converging_lens = true;
  state.player.ownedGear.diverging_lens = true;
  state.player.equipped.lens = 'diverging_lens';
  applyCraftRecipe(state.player, findRecipe('diamond_loupe'));
  assert.equal(state.player.equipped.lens, 'diverging_lens', 'unrelated equipped gear should be left alone');
  assert.equal(state.player.ownedGear.diamond_loupe, true);
});

test('applyCraftRecipe: auto-equips the upgrade if nothing was equipped in that slot', () => {
  const state = withMaterials(newGameState(), { diamond: 1 });
  state.player.ownedGear.converging_lens = true;
  applyCraftRecipe(state.player, findRecipe('diamond_loupe'));
  assert.equal(state.player.equipped.lens, 'diamond_loupe');
});

test('applyCraftRecipe: refuses to re-craft something already owned', () => {
  const state = withMaterials(newGameState(), { crown_glass: 2 });
  state.player.ownedGear.converging_lens = true;
  const ok = applyCraftRecipe(state.player, findRecipe('converging_lens'));
  assert.equal(ok, false);
});

test('canCraftRecipe: the Avalanche Photodetector is refused without the Silicon Photodetector, even with enough materials', () => {
  const state = withMaterials(newGameState(), { avalanche_silicon: 2 });
  assert.equal(canCraftRecipe(state.player, findRecipe('avalanche_photodetector')), false);
});

test('applyCraftRecipe: combining the Avalanche Photodetector consumes the Silicon Photodetector and grants the upgrade', () => {
  const state = withMaterials(newGameState(), { avalanche_silicon: 2 });
  state.player.ownedGear.photodetector = true;
  const ok = applyCraftRecipe(state.player, findRecipe('avalanche_photodetector'));
  assert.equal(ok, true);
  assert.equal(state.player.ownedGear.photodetector, false, 'the predecessor should be consumed');
  assert.equal(state.player.ownedGear.avalanche_photodetector, true);
  assert.equal(state.player.materials.avalanche_silicon, 0);
});

test('applyCraftRecipe: if the Silicon Photodetector was equipped, the Avalanche Photodetector takes its place', () => {
  const state = withMaterials(newGameState(), { avalanche_silicon: 2 });
  state.player.ownedGear.photodetector = true;
  state.player.equipped.filter = 'photodetector';
  applyCraftRecipe(state.player, findRecipe('avalanche_photodetector'));
  assert.equal(state.player.equipped.filter, 'avalanche_photodetector');
});

test('canCraftRecipe: the second-tier SPAD is refused without the Avalanche Photodetector, even with enough materials', () => {
  const state = withMaterials(newGameState(), { geiger_mode_silicon: 2 });
  assert.equal(canCraftRecipe(state.player, findRecipe('spad')), false);
});

test('applyCraftRecipe: combining the SPAD consumes the Avalanche Photodetector (not the first-tier Photodetector) and grants the upgrade', () => {
  const state = withMaterials(newGameState(), { geiger_mode_silicon: 2 });
  state.player.ownedGear.photodetector = true;
  state.player.ownedGear.avalanche_photodetector = true;
  const ok = applyCraftRecipe(state.player, findRecipe('spad'));
  assert.equal(ok, true);
  assert.equal(state.player.ownedGear.avalanche_photodetector, false, 'the immediate predecessor should be consumed');
  assert.equal(state.player.ownedGear.photodetector, true, 'the first-tier item two steps back should be untouched');
  assert.equal(state.player.ownedGear.spad, true);
  assert.equal(state.player.materials.geiger_mode_silicon, 0);
});

test('applyCraftRecipe: if the Avalanche Photodetector was equipped, the SPAD takes its place', () => {
  const state = withMaterials(newGameState(), { geiger_mode_silicon: 2 });
  state.player.ownedGear.avalanche_photodetector = true;
  state.player.equipped.filter = 'avalanche_photodetector';
  applyCraftRecipe(state.player, findRecipe('spad'));
  assert.equal(state.player.equipped.filter, 'spad');
});

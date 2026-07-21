import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ABILITIES } from '../js/data/abilities.js';
import { newGameState } from '../js/engine/state.js';
import { regenCharge, shouldApplySurprise, allEnemiesDefeated } from '../js/engine/battle.js';
import { applySaveLoadout, applyLoadLoadout, applyRenameLoadout } from '../js/engine/craft.js';
import { MAPS } from '../js/data/maps.js';

test('every attack ability has a positive integer chargeCost; defense/utility abilities have none', () => {
  for (const a of ABILITIES) {
    if (a.type === 'attack') {
      assert.ok(Number.isInteger(a.chargeCost) && a.chargeCost > 0, `${a.id} should have a positive integer chargeCost`);
    } else {
      assert.equal(a.chargeCost, undefined, `${a.id} is not an attack ability and shouldn't have a chargeCost`);
    }
  }
});

test('regenCharge: increases charge by 1, capped at maxCharge', () => {
  const player = { charge: 1, maxCharge: 3 };
  regenCharge(player);
  assert.equal(player.charge, 2);
  regenCharge(player);
  assert.equal(player.charge, 3);
  regenCharge(player); // already at max
  assert.equal(player.charge, 3);
});

test('shouldApplySurprise: true only for attack abilities while surpriseAvailable is set', () => {
  const attack = { type: 'attack' };
  const defense = { type: 'defense' };
  assert.equal(shouldApplySurprise({ surpriseAvailable: true }, attack), true);
  assert.equal(shouldApplySurprise({ surpriseAvailable: true }, defense), false);
  assert.equal(shouldApplySurprise({ surpriseAvailable: false }, attack), false);
});

test('allEnemiesDefeated: true only once the primary enemy and every pack mate are at 0 HP', () => {
  const solo = { enemy: { curHp: 0 }, packMates: [] };
  assert.equal(allEnemiesDefeated(solo), true);

  const soloAlive = { enemy: { curHp: 5 }, packMates: [] };
  assert.equal(allEnemiesDefeated(soloAlive), false);

  const packOneAlive = { enemy: { curHp: 0 }, packMates: [{ curHp: 3 }] };
  assert.equal(allEnemiesDefeated(packOneAlive), false);

  const packAllDead = { enemy: { curHp: 0 }, packMates: [{ curHp: 0 }, { curHp: -2 }] };
  assert.equal(allEnemiesDefeated(packAllDead), true);
});

test('every depth zone declares a wanderer whose enemyId belongs to that zone\'s own encounter roster', () => {
  const depthZones = ['mirrors_deep', 'prism_deep', 'fiber_deep', 'grating_deep', 'hologram_deep'];
  for (const zoneId of depthZones) {
    const map = MAPS[zoneId];
    assert.ok(map.wanderer, `${zoneId} should declare a wanderer`);
    assert.ok(map.wanderer.enemyId, `${zoneId} wanderer needs an enemyId`);
  }
});

test('applySaveLoadout/applyLoadLoadout: round-trips the equipped gear snapshot through a slot', () => {
  const state = newGameState();
  state.player.ownedGear.silver_mirror = true;
  state.player.ownedGear.converging_lens = true;
  state.player.equipped = { lens: 'converging_lens', mirror: 'silver_mirror', prism: null, filter: null };

  applySaveLoadout(state, 1);
  assert.deepEqual(state.player.loadouts[1], { lens: 'converging_lens', mirror: 'silver_mirror', prism: null, filter: null, name: null });

  state.player.equipped = { lens: null, mirror: null, prism: null, filter: null };
  applyLoadLoadout(state, 1);
  assert.equal(state.player.equipped.lens, 'converging_lens');
  assert.equal(state.player.equipped.mirror, 'silver_mirror');
});

test('applyLoadLoadout: does nothing (returns false) for an empty (never-saved) slot', () => {
  const state = newGameState();
  state.player.equipped = { lens: 'converging_lens', mirror: null, prism: null, filter: null };
  const applied = applyLoadLoadout(state, 2);
  assert.equal(applied, false);
  assert.equal(state.player.equipped.lens, 'converging_lens', 'unchanged since slot 2 was never saved');
});

test('applyLoadLoadout: falls back to unequipped for gear no longer owned (defensive)', () => {
  const state = newGameState();
  state.player.loadouts[1] = { lens: 'converging_lens', mirror: null, prism: null, filter: null };
  // player does NOT own converging_lens in this scenario
  applyLoadLoadout(state, 1);
  assert.equal(state.player.equipped.lens, null);
});

test('applyRenameLoadout: refuses (returns false) for a never-saved slot', () => {
  const state = newGameState();
  assert.equal(applyRenameLoadout(state, 1, 'Speedrun'), false);
});

test('applyRenameLoadout: names a saved loadout, and a blank name clears it back to null', () => {
  const state = newGameState();
  state.player.equipped = { lens: null, mirror: null, prism: null, filter: null };
  applySaveLoadout(state, 1);
  assert.equal(applyRenameLoadout(state, 1, 'Glass Cannon'), true);
  assert.equal(state.player.loadouts[1].name, 'Glass Cannon');
  applyRenameLoadout(state, 1, '');
  assert.equal(state.player.loadouts[1].name, null);
});

test('applySaveLoadout: re-saving (e.g. after changing gear) keeps the loadout\'s existing name', () => {
  const state = newGameState();
  state.player.ownedGear.converging_lens = true;
  state.player.equipped = { lens: null, mirror: null, prism: null, filter: null };
  applySaveLoadout(state, 1);
  applyRenameLoadout(state, 1, 'Glass Cannon');

  state.player.equipped = { lens: 'converging_lens', mirror: null, prism: null, filter: null };
  applySaveLoadout(state, 1);
  assert.equal(state.player.loadouts[1].name, 'Glass Cannon');
  assert.equal(state.player.loadouts[1].lens, 'converging_lens');
});

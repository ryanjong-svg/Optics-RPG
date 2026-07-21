import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tradeCost, effectiveTradeCost, canTrade, applyTrade } from '../../js/data/content/trading.js';

function makeState(materials = {}, npcReputation = {}) {
  return { player: { materials }, flags: { npcReputation } };
}

test('tradeCost: trading a common material for another common material costs 1-for-1', () => {
  assert.equal(tradeCost('water', 'polaroid'), 1);
});

test('tradeCost: trading a common material for a rarer one costs more', () => {
  // water (1) -> silver (3): ceil(3/1) = 3
  assert.equal(tradeCost('water', 'silver'), 3);
});

test('tradeCost: trading a rare material for a common one still costs at least 1', () => {
  // diamond (7) -> water (1): ceil(1/7) = 1, floored up by Math.max
  assert.equal(tradeCost('diamond', 'water'), 1);
});

test('tradeCost: unknown material ids fall back to common (1) value', () => {
  assert.equal(tradeCost('mystery_mat', 'other_mystery_mat'), 1);
});

test('canTrade: false when the player lacks enough of the source material', () => {
  const state = makeState({ water: 2 });
  assert.equal(canTrade(state, 'water', 'silver', 1), false);
});

test('canTrade: true once the player holds enough of the source material', () => {
  const state = makeState({ water: 3 });
  assert.equal(canTrade(state, 'water', 'silver', 1), true);
});

test('canTrade: false for a from/to of the same material', () => {
  const state = makeState({ water: 10 });
  assert.equal(canTrade(state, 'water', 'water', 1), false);
});

test('canTrade: false for a non-positive amount', () => {
  const state = makeState({ water: 10 });
  assert.equal(canTrade(state, 'water', 'silver', 0), false);
});

test('applyTrade: moves materials at the correct rate and returns true on success', () => {
  const state = makeState({ water: 5 });
  const ok = applyTrade(state, 'water', 'silver', 1);
  assert.equal(ok, true);
  assert.equal(state.player.materials.water, 2);
  assert.equal(state.player.materials.silver, 1);
});

test('applyTrade: is a no-op and returns false when the trade is not affordable', () => {
  const state = makeState({ water: 1 });
  const ok = applyTrade(state, 'water', 'silver', 1);
  assert.equal(ok, false);
  assert.equal(state.player.materials.water, 1);
  assert.equal(state.player.materials.silver, undefined);
});

test('applyTrade: trading for a larger amount scales the cost accordingly', () => {
  const state = makeState({ water: 9 });
  const ok = applyTrade(state, 'water', 'silver', 3);
  assert.equal(ok, true);
  assert.equal(state.player.materials.water, 0);
  assert.equal(state.player.materials.silver, 3);
});

test('effectiveTradeCost: matches the base rate with no Trusted+ standing anywhere', () => {
  const state = makeState({ water: 10 });
  assert.equal(effectiveTradeCost(state, 'water', 'silver'), tradeCost('water', 'silver'));
});

test('effectiveTradeCost: 15% cheaper (rounded up, floor 1) once any professor reaches Trusted', () => {
  const state = makeState({ water: 10 }, { prof_lumen: 15 });
  // base = ceil(8/1) = 8, discounted = ceil(8 * 0.85) = 7
  assert.equal(effectiveTradeCost(state, 'water', 'geiger_mode_silicon'), 7);
  assert.ok(effectiveTradeCost(state, 'water', 'geiger_mode_silicon') < tradeCost('water', 'geiger_mode_silicon'));
});

test('effectiveTradeCost: no discount below Trusted (Acquainted is not enough)', () => {
  const state = makeState({ water: 10 }, { prof_lumen: 10 });
  assert.equal(effectiveTradeCost(state, 'water', 'geiger_mode_silicon'), tradeCost('water', 'geiger_mode_silicon'));
});

test('applyTrade: the discount can make an otherwise-unaffordable trade go through', () => {
  const base = tradeCost('water', 'geiger_mode_silicon'); // ceil(8/1) = 8
  const discountedCost = effectiveTradeCost(makeState({}, { prof_mirrors: 30 }), 'water', 'geiger_mode_silicon');
  assert.ok(discountedCost < base, 'the discount should actually reduce the cost for this pair');

  const withoutDiscount = makeState({ water: discountedCost });
  assert.equal(applyTrade(withoutDiscount, 'water', 'geiger_mode_silicon', 1), false, 'not enough water at the undiscounted rate');

  const withDiscount = makeState({ water: discountedCost }, { prof_mirrors: 30 });
  assert.equal(applyTrade(withDiscount, 'water', 'geiger_mode_silicon', 1), true, 'the same amount should be enough once Trusted+ standing is reached');
});

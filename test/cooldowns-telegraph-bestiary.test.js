import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ABILITIES } from '../js/data/abilities.js';
import { decrementCooldowns, isTelegraphEligible, bestiaryHintText } from '../js/engine/battle/battle.js';

test('exactly the three strongest attack abilities have a positive integer cooldown', () => {
  const withCooldown = ABILITIES.filter(a => a.cooldown).map(a => a.id).sort();
  assert.deepEqual(withCooldown, ['dispersion_burst', 'laser_focus', 'photoelectric_shock']);
  for (const a of ABILITIES) {
    if (a.cooldown !== undefined) {
      assert.ok(Number.isInteger(a.cooldown) && a.cooldown > 0, `${a.id} cooldown should be a positive integer`);
    }
  }
});

test('decrementCooldowns: reduces every positive cooldown by 1 and leaves zero/absent ones alone', () => {
  const battle = { cooldowns: { laser_focus: 2, photoelectric_shock: 1, dispersion_burst: 0 } };
  decrementCooldowns(battle);
  assert.deepEqual(battle.cooldowns, { laser_focus: 1, photoelectric_shock: 0, dispersion_burst: 0 });
});

test('decrementCooldowns: a cooldown of 2 blocks reuse for exactly 2 completed turns', () => {
  // Simulates: use ability (cooldown set to 2) -> 2 completed rounds -> free again.
  const battle = { cooldowns: {} };
  battle.cooldowns.laser_focus = 2;
  assert.ok(battle.cooldowns.laser_focus > 0, 'blocked immediately after use');
  decrementCooldowns(battle); // end of round 1
  assert.ok(battle.cooldowns.laser_focus > 0, 'still blocked after 1 round');
  decrementCooldowns(battle); // end of round 2
  assert.equal(battle.cooldowns.laser_focus, 0, 'free again after 2 rounds');
});

test('isTelegraphEligible: true for guardian fights and the boss, false for ordinary encounters', () => {
  assert.equal(isTelegraphEligible({ opts: { guardianMap: 'mirrors' }, enemy: { isBoss: false } }), true);
  assert.equal(isTelegraphEligible({ opts: {}, enemy: { isBoss: true } }), true);
  assert.equal(isTelegraphEligible({ opts: {}, enemy: { isBoss: false } }), false);
});

test('bestiaryHintText: lists known weaknesses and resistances by ability name', () => {
  const enemy = { weakTo: ['refraction_bend'], resists: ['reflect_strike'] };
  const text = bestiaryHintText(enemy);
  assert.ok(text.includes('Weak to: Refraction Bend.'));
  assert.ok(text.includes('Resists: Reflect Strike.'));
  assert.ok(text.startsWith("📖 Bestiary: You've fought this before."));
});

test('bestiaryHintText: returns null for an enemy with no known weakness or resistance', () => {
  assert.equal(bestiaryHintText({ weakTo: [], resists: [] }), null);
  assert.equal(bestiaryHintText({}), null);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isComboFollowUp, COMBO_MULT } from '../js/engine/battle.js';

test('isComboFollowUp: recognizes every documented setup/payoff pair', () => {
  assert.equal(isComboFollowUp('tir_shield', 'reflect_strike'), true);
  assert.equal(isComboFollowUp('interference_cancel', 'diffraction_wave'), true);
  assert.equal(isComboFollowUp('polarize_filter', 'photoelectric_shock'), true);
  assert.equal(isComboFollowUp('refraction_bend', 'laser_focus'), true);
});

test('isComboFollowUp: false for unrelated pairs, a null/undefined last ability, or the reverse order', () => {
  assert.equal(isComboFollowUp('reflect_strike', 'tir_shield'), false, 'combos are directional');
  assert.equal(isComboFollowUp('reflect_strike', 'laser_focus'), false);
  assert.equal(isComboFollowUp(null, 'reflect_strike'), false);
  assert.equal(isComboFollowUp(undefined, 'reflect_strike'), false);
});

test('COMBO_MULT: a modest bonus, not a trivial or game-breaking one', () => {
  assert.ok(COMBO_MULT > 1 && COMBO_MULT < 2);
});

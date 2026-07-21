import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ngPlusBonusPhaseAbility } from '../../js/engine/battle/battleFormulas.js';
import { ACHIEVEMENTS } from '../../js/data/meta/achievements.js';
import { newGameState } from '../../js/engine/core/state.js';
import { findAbility } from '../../js/data/content/abilities.js';

test('ngPlusBonusPhaseAbility: null below cycle 2, a real attack ability from cycle 2 on', () => {
  assert.equal(ngPlusBonusPhaseAbility(0), null);
  assert.equal(ngPlusBonusPhaseAbility(1), null);
  const ability = ngPlusBonusPhaseAbility(2);
  assert.ok(ability, 'cycle 2 should unlock a bonus phase ability');
  assert.ok(findAbility(ability), 'the bonus phase ability id should resolve to a real ability');
  assert.equal(findAbility(ability).type, 'attack', 'the boss can only phase-gate on an attack ability');
  assert.equal(ngPlusBonusPhaseAbility(3), ability, 'later cycles keep the same bonus ability');
});

test('fifth_property achievement: locked until the special flag is set', () => {
  const state = newGameState();
  assert.equal(ACHIEVEMENTS.fifth_property.check(state), false);
  state.flags.achievements.fifth_property = true;
  assert.equal(ACHIEVEMENTS.fifth_property.check(state), true);
});

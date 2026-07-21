import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState, claimHint } from '../js/engine/core/state.js';
import { applyMeditate } from '../js/engine/panels/craft.js';
import { telegraphDamageBase, applyGuardianPhase2, applyBossEnrage } from '../js/engine/battle/battle.js';

test('applyMeditate: restores charge to max and reports success', () => {
  const player = { charge: 1, maxCharge: 4 };
  const didSomething = applyMeditate(player);
  assert.equal(didSomething, true);
  assert.equal(player.charge, 4);
});

test('applyMeditate: no-ops (returns false) when charge is already full', () => {
  const player = { charge: 3, maxCharge: 3 };
  const didSomething = applyMeditate(player);
  assert.equal(didSomething, false);
  assert.equal(player.charge, 3);
});

test('the new onboarding hints (cooldown/charge/pack/wanderer) each claim independently and only once', () => {
  const state = newGameState();
  for (const id of ['abilityCooldown', 'chargeEmpty', 'firstPack', 'firstWanderer']) {
    assert.equal(claimHint(state, id), true, `${id} should claim on first call`);
    assert.equal(claimHint(state, id), false, `${id} should not claim twice`);
  }
});

test('telegraphDamageBase: uses the enemy\'s pre-escalation baseAtk for a telegraphed hit, current atk otherwise', () => {
  const enemy = { atk: 20, baseAtk: 10 }; // atk already boosted by phase2/enrage; baseAtk is the pre-boost snapshot
  assert.equal(telegraphDamageBase(enemy, true), 10, 'a telegraphed hit should use the pre-escalation baseline');
  assert.equal(telegraphDamageBase(enemy, false), 20, 'a normal hit should use current (possibly escalated) atk');
});

test('telegraphDamageBase: falls back to atk if baseAtk was never captured (defensive)', () => {
  const enemy = { atk: 15 };
  assert.equal(telegraphDamageBase(enemy, true), 15);
});

test('balance: a telegraphed hit after both guardian phase2 and boss enrage does not compound all three multipliers', () => {
  // Simulates the worst-case stacking scenario this fix targets: an enemy
  // that has already been boosted by phase2 AND enrage, then telegraphs a
  // hit. Without the baseAtk decoupling, the telegraphed hit would be
  // baseAtk * 1.25 (phase2) * 1.3 (enrage) * 1.8 (telegraph) = ~2.925x.
  // With it, the telegraphed hit is just baseAtk * 1.8 = 1.8x, independent
  // of whichever escalation mechanic already fired.
  const enemy = { atk: 10, baseAtk: 10 };
  applyGuardianPhase2(enemy); // enemy.atk: 10 -> 13 (round(10*1.25))
  applyBossEnrage(enemy);     // enemy.atk: 13 -> 17 (round(13*1.3)) - contrived combo, but worth capping regardless
  const base = telegraphDamageBase(enemy, true);
  assert.equal(base, 10, 'telegraph should ignore the phase2/enrage escalation stacked onto atk');
  const worstCaseIfNotDecoupled = enemy.atk * 1.8;
  assert.ok(base * 1.8 < worstCaseIfNotDecoupled, 'the decoupled telegraph damage should be strictly less than the compounded version');
});

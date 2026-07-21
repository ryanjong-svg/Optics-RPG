import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildBattleReport } from '../../js/engine/battle/battle.js';

test('buildBattleReport: reports turns and hit ratio even with no damage tracked yet', () => {
  const report = buildBattleReport({ turnCount: 3, hitsLanded: 2, hitsMissed: 1 });
  assert.match(report, /3 turns/);
  assert.match(report, /2\/3 attacks landed/);
});

test('buildBattleReport: singular "turn" for exactly one turn', () => {
  const report = buildBattleReport({ turnCount: 1, hitsLanded: 1, hitsMissed: 0 });
  assert.match(report, /1 turn,/);
  assert.doesNotMatch(report, /1 turns/);
});

test('buildBattleReport: lists abilities by damage dealt, highest first, and omits zero-damage ones', () => {
  const battle = {
    turnCount: 4, hitsLanded: 3, hitsMissed: 1,
    damagePerAbility: { reflect_strike: 18, refraction_bend: 42, tir_shield: 0 }
  };
  const report = buildBattleReport(battle);
  const refractionIdx = report.indexOf('Refraction Bend');
  const reflectIdx = report.indexOf('Reflect Strike');
  assert.ok(refractionIdx !== -1 && reflectIdx !== -1, 'both attacking abilities should be listed');
  assert.ok(refractionIdx < reflectIdx, 'higher total damage should be listed first');
  assert.doesNotMatch(report, /TIR Shield/, 'a zero-damage entry (e.g. a defense ability) should be omitted');
});

test('buildBattleReport: handles a battle with no attacks at all (e.g. an instant flee) without throwing', () => {
  const report = buildBattleReport({});
  assert.match(report, /0 turns, 0\/0 attacks landed/);
});

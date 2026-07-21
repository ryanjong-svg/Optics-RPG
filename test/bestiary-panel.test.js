import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ENEMIES, weaknessResistanceText } from '../js/data/enemies.js';
import { bestiaryHintText } from '../js/engine/battle/battle.js';
import { ACHIEVEMENTS, unlockedAchievements } from '../js/data/achievements.js';
import { newGameState } from '../js/engine/core/state.js';

test('weaknessResistanceText: describes both weakness and resistance when present', () => {
  const enemy = ENEMIES.wisp;
  const text = weaknessResistanceText(enemy);
  assert.match(text, /Weak to: Laser Focus/);
  assert.match(text, /Resists: Reflect Strike/);
});

test('weaknessResistanceText: returns an empty string for an enemy with neither (the boss)', () => {
  const enemy = ENEMIES.null_medium;
  assert.equal(weaknessResistanceText(enemy), '');
});

test('bestiaryHintText wraps weaknessResistanceText with the battle-log framing, or returns null if empty', () => {
  const withMatchup = bestiaryHintText(ENEMIES.wisp);
  assert.match(withMatchup, /^📖 Bestiary: You've fought this before\./);
  assert.equal(bestiaryHintText(ENEMIES.null_medium), null);
});

test('every ENEMIES entry has a non-empty flavor line for the Bestiary panel', () => {
  for (const [id, enemy] of Object.entries(ENEMIES)) {
    assert.ok(enemy.flavor && enemy.flavor.length > 0, `enemy "${id}" is missing flavor text`);
  }
});

test('bestiary_completionist: locked on a fresh state, unlocks once every enemy has been defeated', () => {
  const state = newGameState();
  assert.ok(!unlockedAchievements(state).some(([id]) => id === 'bestiary_completionist'));

  for (const id of Object.keys(ENEMIES)) {
    state.flags.enemiesDefeated[id] = true;
  }
  assert.ok(unlockedAchievements(state).some(([id]) => id === 'bestiary_completionist'));
});

test('bestiary_completionist: does not unlock if even one enemy type is missing', () => {
  const state = newGameState();
  const ids = Object.keys(ENEMIES);
  for (const id of ids.slice(0, -1)) {
    state.flags.enemiesDefeated[id] = true;
  }
  assert.ok(!ACHIEVEMENTS.bestiary_completionist.check(state));
});

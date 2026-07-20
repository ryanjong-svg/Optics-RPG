import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState, startNewGamePlus } from '../js/engine/state.js';
import { checkNewAchievements, unlockedAchievements } from '../js/data/achievements.js';

test('checkNewAchievements: returns nothing on a fresh state (nothing unlocked yet)', () => {
  const state = newGameState();
  assert.deepEqual(checkNewAchievements(state), []);
});

test('checkNewAchievements: returns a newly-crossed milestone achievement exactly once', () => {
  const state = newGameState();
  state.player.level = 5;
  const first = checkNewAchievements(state);
  assert.equal(first.length, 1);
  assert.equal(first[0].title, 'Apprentice No More');

  const second = checkNewAchievements(state);
  assert.deepEqual(second, [], 'the same achievement should not be reported twice');
});

test('checkNewAchievements: marks achievements seen in state.flags.achievementsSeen', () => {
  const state = newGameState();
  state.player.level = 5;
  checkNewAchievements(state);
  assert.ok(state.flags.achievementsSeen.apprentice_no_more);
});

test('checkNewAchievements: reports multiple simultaneous unlocks in one call', () => {
  const state = newGameState();
  state.player.level = 5;
  state.flags.ngPlusCycle = 1;
  const newly = checkNewAchievements(state);
  const titles = newly.map(a => a.title).sort();
  assert.deepEqual(titles, ['Apprentice No More', 'Cycle Walker'].sort());
});

test('startNewGamePlus resets achievementsSeen so re-earned achievements announce again next cycle', () => {
  const state = newGameState();
  state.player.level = 5;
  checkNewAchievements(state);
  assert.ok(state.flags.achievementsSeen.apprentice_no_more);

  startNewGamePlus(state);
  assert.deepEqual(state.flags.achievementsSeen, {});
  // apprentice_no_more is still unlocked (level carries over across NG+), so
  // it should be reported again as "new" now that achievementsSeen was reset.
  const newly = checkNewAchievements(state);
  assert.ok(newly.some(a => a.title === 'Apprentice No More'));
});

test('checkNewAchievements does not re-report an achievement already marked seen elsewhere (e.g. by unlockAchievement in battle.js)', () => {
  const state = newGameState();
  state.flags.achievements.overqualified = true; // as battle.js's unlockAchievement would set
  state.flags.achievementsSeen.overqualified = true; // ...and also mark seen, per the same function
  const unlockedIds = new Set(unlockedAchievements(state).map(([id]) => id));
  assert.ok(unlockedIds.has('overqualified'), 'sanity check: it really is unlocked');
  assert.ok(!checkNewAchievements(state).some(a => a.title === 'Overqualified'));
});

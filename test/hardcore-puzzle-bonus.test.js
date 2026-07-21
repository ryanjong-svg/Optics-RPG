import { test } from 'node:test';
import assert from 'node:assert/strict';

import { shouldGrantHardcorePuzzleBonus } from '../js/engine/battle/battleFormulas.js';

test('shouldGrantHardcorePuzzleBonus: only on a hit, outside practice, with Puzzle Hints explicitly off', () => {
  assert.equal(shouldGrantHardcorePuzzleBonus(true, false, false), true);
  assert.equal(shouldGrantHardcorePuzzleBonus(false, false, false), false, 'a miss never grants the bonus');
  assert.equal(shouldGrantHardcorePuzzleBonus(true, true, false), false, 'a practice fight never grants the bonus');
  assert.equal(shouldGrantHardcorePuzzleBonus(true, false, true), false, 'hints on means no hardcore bonus');
  assert.equal(shouldGrantHardcorePuzzleBonus(true, false, undefined), false, 'an undefined/legacy puzzleHints setting defaults to hints-on behavior');
});

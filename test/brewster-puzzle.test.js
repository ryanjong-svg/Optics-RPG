import { test } from 'node:test';
import assert from 'node:assert/strict';

import { computeBrewsterAngleDeg, makeBrewsterPuzzle, resolveBrewsterShot } from '../js/engine/puzzles/brewsterPuzzle.js';

test('computeBrewsterAngleDeg: matches tan(theta_B) = n for a known case (n=1, 45deg)', () => {
  assert.ok(Math.abs(computeBrewsterAngleDeg(1) - 45) < 0.01);
});

test('computeBrewsterAngleDeg: a higher index gives a larger Brewster angle', () => {
  assert.ok(computeBrewsterAngleDeg(2.4) > computeBrewsterAngleDeg(1.3));
});

test('makeBrewsterPuzzle: is deterministic for the same enemy id', () => {
  const a = makeBrewsterPuzzle('glare_wraith');
  const b = makeBrewsterPuzzle('glare_wraith');
  assert.deepEqual(a, b);
});

test('makeBrewsterPuzzle: n stays within 1.3-2.4 and targetDeg is a valid angle in that range', () => {
  const ids = ['wisp', 'rutile_wyrm', 'null_medium', 'lattice_warden'];
  for (const id of ids) {
    const puzzle = makeBrewsterPuzzle(id);
    assert.ok(puzzle.n >= 1.3 && puzzle.n <= 2.4, `n out of range for ${id}`);
    assert.ok(puzzle.targetDeg >= 40 && puzzle.targetDeg <= 80, `targetDeg out of range for ${id}`);
  }
});

test('resolveBrewsterShot: hits within tolerance of the target angle', () => {
  const puzzle = { n: 1.5, targetDeg: 56, tolerance: 3 };
  const { hit, angleDeg } = resolveBrewsterShot(puzzle, 57);
  assert.equal(hit, true);
  assert.equal(angleDeg, 57);
});

test('resolveBrewsterShot: misses outside tolerance', () => {
  const puzzle = { n: 1.5, targetDeg: 56, tolerance: 3 };
  const { hit } = resolveBrewsterShot(puzzle, 40);
  assert.equal(hit, false);
});

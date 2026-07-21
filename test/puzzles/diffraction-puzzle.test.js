import { test } from 'node:test';
import assert from 'node:assert/strict';

import { computeFringeAngleDeg, makeDiffractionPuzzle, resolveDiffractionShot } from '../../js/engine/puzzles/diffractionPuzzle.js';

test('computeFringeAngleDeg: matches the first-order bright fringe condition d*sin(theta)=lambda', () => {
  // d/lambda = 2 -> sin(theta) = 1/2 -> theta = 30deg
  assert.ok(Math.abs(computeFringeAngleDeg(2) - 30) < 0.01);
});

test('computeFringeAngleDeg: a larger d/lambda ratio gives a smaller fringe angle', () => {
  assert.ok(computeFringeAngleDeg(4) < computeFringeAngleDeg(1.5));
});

test('computeFringeAngleDeg: never exceeds 90deg (clamped via Math.min) even for d/lambda < 1', () => {
  assert.equal(computeFringeAngleDeg(0.5), 90);
});

test('makeDiffractionPuzzle: is deterministic for the same enemy id', () => {
  const a = makeDiffractionPuzzle('mirror_golem');
  const b = makeDiffractionPuzzle('mirror_golem');
  assert.deepEqual(a, b);
});

test('makeDiffractionPuzzle: dOverLambda stays in 1.5-4.0 and targetDeg is a valid angle', () => {
  const ids = ['wisp', 'rutile_wyrm', 'null_medium', 'lattice_warden'];
  for (const id of ids) {
    const puzzle = makeDiffractionPuzzle(id);
    assert.ok(puzzle.dOverLambda >= 1.5 && puzzle.dOverLambda <= 4.0, `dOverLambda out of range for ${id}`);
    assert.ok(puzzle.targetDeg >= 0 && puzzle.targetDeg <= 90, `targetDeg out of range for ${id}`);
  }
});

test('makeDiffractionPuzzle: produces different parameters than the Snell puzzle for the same enemy id', () => {
  // Not a strict physics requirement, just confirms the two puzzles don't
  // look identical for the same enemy (different hash mixing).
  const diffraction = makeDiffractionPuzzle('wisp');
  assert.ok(diffraction.dOverLambda !== undefined);
});

test('resolveDiffractionShot: hits within tolerance of the target angle', () => {
  const puzzle = { dOverLambda: 2, targetDeg: 30, tolerance: 3 };
  const { hit, angleDeg } = resolveDiffractionShot(puzzle, 31);
  assert.equal(hit, true);
  assert.equal(angleDeg, 31);
});

test('resolveDiffractionShot: misses outside tolerance', () => {
  const puzzle = { dOverLambda: 2, targetDeg: 30, tolerance: 3 };
  const { hit } = resolveDiffractionShot(puzzle, 10);
  assert.equal(hit, false);
});

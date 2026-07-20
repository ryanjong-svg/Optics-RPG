import { test } from 'node:test';
import assert from 'node:assert/strict';

import { computeRefractedDeg, makeSnellPuzzle, resolveSnellShot } from '../js/engine/snellPuzzle.js';

test('computeRefractedDeg: matches real Snell\'s law (n1=1) for a known case', () => {
  // n2 = 1.5, incident 30deg: sin(theta2) = sin(30)/1.5 = 0.3333... -> ~19.47deg
  const refracted = computeRefractedDeg(1.5, 30);
  assert.ok(Math.abs(refracted - 19.47) < 0.1);
});

test('computeRefractedDeg: normal incidence (0deg) refracts straight through (0deg)', () => {
  assert.equal(computeRefractedDeg(1.8, 0), 0);
});

test('computeRefractedDeg: a denser medium bends the ray closer to the normal (smaller angle)', () => {
  const shallow = computeRefractedDeg(1.3, 60);
  const deep = computeRefractedDeg(2.4, 60);
  assert.ok(deep < shallow, 'a higher index should refract closer to the normal');
});

test('computeRefractedDeg: never exceeds the incident angle when going from air into a denser medium', () => {
  for (let inc = 1; inc < 89; inc += 10) {
    for (const n2 of [1.3, 1.8, 2.4]) {
      assert.ok(computeRefractedDeg(n2, inc) < inc, `refracted angle should be smaller than incident at n2=${n2}, inc=${inc}`);
    }
  }
});

test('makeSnellPuzzle: is deterministic for the same enemy id', () => {
  const a = makeSnellPuzzle('rutile_wyrm');
  const b = makeSnellPuzzle('rutile_wyrm');
  assert.deepEqual(a, b);
});

test('makeSnellPuzzle: n2 stays within the intended 1.3-2.4 range and targetDeg within 15-45', () => {
  const ids = ['wisp', 'rutile_wyrm', 'null_medium', 'photon_sentinel', 'twinned_specter'];
  for (const id of ids) {
    const puzzle = makeSnellPuzzle(id);
    assert.ok(puzzle.n2 >= 1.3 && puzzle.n2 <= 2.4, `n2 out of range for ${id}: ${puzzle.n2}`);
    assert.ok(puzzle.targetDeg >= 15 && puzzle.targetDeg <= 45, `targetDeg out of range for ${id}: ${puzzle.targetDeg}`);
  }
});

test('resolveSnellShot: hits when the refracted angle lands within tolerance of the target', () => {
  const puzzle = { n2: 1.5, targetDeg: 20, tolerance: 3 };
  // find an incident angle that refracts to ~20deg: sin(20)=0.342, *1.5=0.513 -> asin ~30.9deg
  const { hit, refractedDeg } = resolveSnellShot(puzzle, 31);
  assert.ok(Math.abs(refractedDeg - 20) <= 3);
  assert.equal(hit, true);
});

test('resolveSnellShot: misses when the refracted angle falls outside tolerance', () => {
  const puzzle = { n2: 1.5, targetDeg: 20, tolerance: 3 };
  const { hit } = resolveSnellShot(puzzle, 5); // refracts to a much smaller angle
  assert.equal(hit, false);
});

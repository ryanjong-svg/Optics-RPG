import { test } from 'node:test';
import assert from 'node:assert/strict';

import { eliteAuraColor, drawEliteAura, BACKDROP_THEMES } from '../js/engine/pixelSprites.js';

// A minimal fake 2D context capturing just enough for drawEliteAura's calls
// to succeed and its final lineWidth/globalAlpha to be inspected - no real
// canvas needed under the Node test runner.
function fakeCtx() {
  return {
    save() {}, restore() {}, beginPath() {}, arc() {}, stroke() {},
    lineWidth: null, globalAlpha: null, strokeStyle: null
  };
}

test('eliteAuraColor: matches that zone\'s own battle-backdrop accent color', () => {
  assert.equal(eliteAuraColor('mirrors'), BACKDROP_THEMES.mirrors.accent);
  assert.equal(eliteAuraColor('lab_deep'), BACKDROP_THEMES.lab_deep.accent);
});

test('eliteAuraColor: falls back to amber for the spectrum-pattern themes that have no single accent', () => {
  assert.equal(BACKDROP_THEMES.prism.accent, null, 'prism should have no single accent (sanity check on the theme itself)');
  assert.equal(eliteAuraColor('prism'), '#ffc83c');
  assert.equal(eliteAuraColor('grating'), '#ffc83c');
});

test('eliteAuraColor: falls back to amber for an unrecognized zone', () => {
  assert.equal(eliteAuraColor('not_a_real_zone'), '#ffc83c');
  assert.equal(eliteAuraColor(undefined), '#ffc83c');
});

test('drawEliteAura: reducedMotion pins the pulse to a fixed value instead of animating with Date.now()', async () => {
  const ctxA = fakeCtx();
  drawEliteAura(ctxA, 50, 60, 26, 'mirrors', true);
  await new Promise(r => setTimeout(r, 50));
  const ctxB = fakeCtx();
  drawEliteAura(ctxB, 50, 60, 26, 'mirrors', true);
  assert.equal(ctxA.lineWidth, ctxB.lineWidth, 'lineWidth should not drift between two calls with reducedMotion on');
  assert.equal(ctxA.globalAlpha, ctxB.globalAlpha, 'globalAlpha should not drift between two calls with reducedMotion on');
  assert.equal(ctxA.strokeStyle, BACKDROP_THEMES.mirrors.accent);
});

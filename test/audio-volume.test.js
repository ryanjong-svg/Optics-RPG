import { test } from 'node:test';
import assert from 'node:assert/strict';

import * as audio from '../js/engine/audio.js';

test('music and SFX volume default to full (1)', () => {
  assert.equal(audio.getMusicVolume(), 1);
  assert.equal(audio.getSfxVolume(), 1);
});

test('setMusicVolume/setSfxVolume store the given value', () => {
  audio.setMusicVolume(0.4);
  audio.setSfxVolume(0.7);
  assert.equal(audio.getMusicVolume(), 0.4);
  assert.equal(audio.getSfxVolume(), 0.7);
  audio.setMusicVolume(1);
  audio.setSfxVolume(1);
});

test('setMusicVolume/setSfxVolume clamp out-of-range values to [0, 1]', () => {
  audio.setMusicVolume(-0.5);
  assert.equal(audio.getMusicVolume(), 0);
  audio.setMusicVolume(5);
  assert.equal(audio.getMusicVolume(), 1);

  audio.setSfxVolume(-1);
  assert.equal(audio.getSfxVolume(), 0);
  audio.setSfxVolume(2);
  assert.equal(audio.getSfxVolume(), 1);
});

test('setMuted/isMuted round-trip without needing a real AudioContext', () => {
  audio.setMuted(true);
  assert.equal(audio.isMuted(), true);
  audio.setMuted(false);
  assert.equal(audio.isMuted(), false);
});

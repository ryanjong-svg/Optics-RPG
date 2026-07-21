import { test } from 'node:test';
import assert from 'node:assert/strict';

import { playerPaletteFor } from '../../js/engine/world/pixelSprites.js';
import { PALETTES } from '../../js/data/world/pixelArt.js';
import { ACHIEVEMENTS } from '../../js/data/meta/achievements.js';
import { newGameState } from '../../js/engine/core/state.js';

test('playerPaletteFor: the default palette below cycle 3, the ascended palette from cycle 3 on', () => {
  assert.equal(playerPaletteFor(0), 'player');
  assert.equal(playerPaletteFor(2), 'player');
  assert.equal(playerPaletteFor(3), 'player_ascended');
  assert.equal(playerPaletteFor(4), 'player_ascended');
});

test('playerPaletteFor: both palette ids resolve to real entries in PALETTES', () => {
  assert.ok(PALETTES[playerPaletteFor(0)]);
  assert.ok(PALETTES[playerPaletteFor(3)]);
});

test('ascendant achievement: locked below cycle 3, unlocked at cycle 3 or later', () => {
  const state = newGameState();
  assert.equal(ACHIEVEMENTS.ascendant.check(state), false);
  state.flags.ngPlusCycle = 2;
  assert.equal(ACHIEVEMENTS.ascendant.check(state), false);
  state.flags.ngPlusCycle = 3;
  assert.equal(ACHIEVEMENTS.ascendant.check(state), true);
});

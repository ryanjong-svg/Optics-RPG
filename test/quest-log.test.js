import { test } from 'node:test';
import assert from 'node:assert/strict';

import { newGameState } from '../js/engine/core/state.js';
import { QUESTS } from '../js/data/narrative/quests.js';
import { MATERIALS } from '../js/data/content/materials.js';
import { MAPS } from '../js/data/world/maps.js';
import { progressText, npcName } from '../js/engine/panels/questLogUI.js';

test('progressText: a collect quest shows current/needed material count, capped at the requirement', () => {
  const state = newGameState();
  const quest = QUESTS.lumen_opal; // collect 2 opal
  state.player.materials.opal = 1;
  assert.equal(progressText(state, quest), `Collect ${MATERIALS.opal.name} (1/2)`);
  state.player.materials.opal = 5; // more than needed - should still cap at the requirement
  assert.equal(progressText(state, quest), `Collect ${MATERIALS.opal.name} (2/2)`);
});

test('progressText: a defeat_guardian quest names the target zone', () => {
  const state = newGameState();
  const quest = QUESTS.lumen_mirror; // defeat guardian of mirrors
  assert.equal(progressText(state, quest), `Defeat the guardian of ${MAPS.mirrors.name}`);
});

test('npcName: resolves all three professor ids to their display names', () => {
  assert.equal(npcName('prof_lumen'), 'Professor Lumen');
  assert.equal(npcName('prof_mirrors'), 'Professor Silvers');
  assert.equal(npcName('prof_labs'), 'Professor Gapp');
});

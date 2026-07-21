import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isObjectiveMet, pickQuestToPresent } from '../../js/data/narrative/quests.js';

function makeState(overrides = {}) {
  return {
    player: { materials: {} },
    flags: { quests: {}, guardianDefeated: {} },
    ...overrides
  };
}

test('isObjectiveMet: collect objective is met once the player holds enough of the material', () => {
  const quest = { objective: { type: 'collect', material: 'opal', count: 2 } };
  const state = makeState({ player: { materials: { opal: 1 } } });
  assert.equal(isObjectiveMet(state, quest), false);
  state.player.materials.opal = 2;
  assert.equal(isObjectiveMet(state, quest), true);
});

test('isObjectiveMet: defeat_guardian objective is met once that map\'s guardian flag is set', () => {
  const quest = { objective: { type: 'defeat_guardian', map: 'grating' } };
  const state = makeState();
  assert.equal(isObjectiveMet(state, quest), false);
  state.flags.guardianDefeated.grating = true;
  assert.equal(isObjectiveMet(state, quest), true);
});

test('pickQuestToPresent: offers an unstarted quest before anything else', () => {
  const found = pickQuestToPresent(makeState(), 'prof_lumen');
  assert.ok(found, 'expected a quest to be offered to a fresh player');
  assert.equal(found.quest.npc, 'prof_lumen');
});

test('pickQuestToPresent: prioritizes a completable active quest over offering a new one', () => {
  // Complete the conditions for lumen_opal (collect 2 opal) while it's active,
  // and leave lumen_mirror unstarted - the completable one should win.
  const state = makeState({
    player: { materials: { opal: 2 } },
    flags: { quests: { lumen_opal: 'active' }, guardianDefeated: {} }
  });
  const found = pickQuestToPresent(state, 'prof_lumen');
  assert.equal(found.id, 'lumen_opal');
});

test('pickQuestToPresent: falls back to reminding about an active, not-yet-complete quest', () => {
  const state = makeState({
    player: { materials: { opal: 0 } },
    flags: { quests: { lumen_opal: 'active', lumen_mirror: 'completed' }, guardianDefeated: {} }
  });
  const found = pickQuestToPresent(state, 'prof_lumen');
  assert.equal(found.id, 'lumen_opal');
});

test('pickQuestToPresent: returns null once every quest for that npc is completed', () => {
  const state = makeState({
    flags: { quests: { lumen_opal: 'completed', lumen_mirror: 'completed' }, guardianDefeated: {} }
  });
  assert.equal(pickQuestToPresent(state, 'prof_lumen'), null);
});

test('pickQuestToPresent: returns null for an npc with no quests at all', () => {
  assert.equal(pickQuestToPresent(makeState(), 'someone_with_no_quests'), null);
});

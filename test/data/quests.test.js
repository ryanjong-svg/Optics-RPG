import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isObjectiveMet, pickQuestToPresent, reputationTier, applyReputationChange, hasTrustedStanding, reputationProgress } from '../../js/data/narrative/quests.js';

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

test('reputationTier: maps a raw reputation number to the right named tier', () => {
  assert.equal(reputationTier(0), 'Stranger');
  assert.equal(reputationTier(4), 'Stranger');
  assert.equal(reputationTier(5), 'Acquainted');
  assert.equal(reputationTier(14), 'Acquainted');
  assert.equal(reputationTier(15), 'Trusted');
  assert.equal(reputationTier(29), 'Trusted');
  assert.equal(reputationTier(30), 'Cherished');
  assert.equal(reputationTier(999), 'Cherished');
  assert.equal(reputationTier(undefined), 'Stranger', 'a missing/undefined reputation should behave like zero');
});

test('applyReputationChange: accumulates per-NPC and returns the newly-reached tier only when one is crossed', () => {
  const state = makeState({ flags: { quests: {}, guardianDefeated: {}, npcReputation: {} } });

  // 4 single-point bumps stay within Stranger - no tier change yet.
  let lastResult;
  for (let i = 0; i < 4; i++) lastResult = applyReputationChange(state, 'prof_lumen', 1);
  assert.equal(state.flags.npcReputation.prof_lumen, 4);
  assert.equal(lastResult, null);

  // The 5th point crosses into Acquainted.
  assert.equal(applyReputationChange(state, 'prof_lumen', 1), 'Acquainted');
  assert.equal(state.flags.npcReputation.prof_lumen, 5);

  // Immediately re-checking (no further change) should not re-announce.
  assert.equal(applyReputationChange(state, 'prof_lumen', 0), null);
});

test('applyReputationChange: tracks each NPC independently', () => {
  const state = makeState({ flags: { quests: {}, guardianDefeated: {}, npcReputation: {} } });
  applyReputationChange(state, 'prof_lumen', 10);
  applyReputationChange(state, 'prof_mirrors', 1);
  assert.equal(state.flags.npcReputation.prof_lumen, 10);
  assert.equal(state.flags.npcReputation.prof_mirrors, 1);
  assert.equal(reputationTier(state.flags.npcReputation.prof_lumen), 'Acquainted');
  assert.equal(reputationTier(state.flags.npcReputation.prof_mirrors), 'Stranger');
});

test('applyReputationChange: lazily creates state.flags.npcReputation if missing', () => {
  const state = makeState({ flags: { quests: {}, guardianDefeated: {} } });
  applyReputationChange(state, 'prof_labs', 1);
  assert.equal(state.flags.npcReputation.prof_labs, 1);
});

test('hasTrustedStanding: false with no reputation at all', () => {
  const state = makeState();
  assert.equal(hasTrustedStanding(state), false);
});

test('hasTrustedStanding: false below Trusted, even for multiple professors', () => {
  const state = makeState({ flags: { quests: {}, guardianDefeated: {}, npcReputation: { prof_lumen: 10, prof_mirrors: 14 } } });
  assert.equal(hasTrustedStanding(state), false);
});

test('hasTrustedStanding: true once any single professor reaches Trusted', () => {
  const state = makeState({ flags: { quests: {}, guardianDefeated: {}, npcReputation: { prof_lumen: 4, prof_mirrors: 15 } } });
  assert.equal(hasTrustedStanding(state), true);
});

test('reputationProgress: 0% right at the start of a tier, scaling up toward the next one', () => {
  const atStart = reputationProgress(5); // Acquainted starts at 5, Trusted at 15
  assert.equal(atStart.tierLabel, 'Acquainted');
  assert.equal(atStart.nextLabel, 'Trusted');
  assert.ok(Math.abs(atStart.pct - 0) < 1e-9);

  const midway = reputationProgress(10); // halfway from 5 to 15
  assert.ok(Math.abs(midway.pct - 0.5) < 1e-9);

  const almostThere = reputationProgress(14);
  assert.ok(almostThere.pct > midway.pct && almostThere.pct < 1);
});

test('reputationProgress: reaching the top tier (Cherished) reports 100% with no next tier', () => {
  const progress = reputationProgress(30);
  assert.equal(progress.tierLabel, 'Cherished');
  assert.equal(progress.nextLabel, null);
  assert.equal(progress.pct, 1);

  const wellPast = reputationProgress(999);
  assert.equal(wellPast.pct, 1);
});

test('reputationProgress: a missing/undefined reputation behaves like zero', () => {
  const progress = reputationProgress(undefined);
  assert.equal(progress.tierLabel, 'Stranger');
  assert.equal(progress.nextLabel, 'Acquainted');
  assert.equal(progress.pct, 0);
});

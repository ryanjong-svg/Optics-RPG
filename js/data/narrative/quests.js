// Lightweight side quests from the three professors. Deliberately simple —
// no separate quest log UI; the NPC just tells you what's still needed each
// time you talk to them, which doubles as the "log." Each professor has
// exactly one collect quest and one defeat quest, for a symmetric structure.
export const QUESTS = {
  lumen_opal: {
    npc: 'prof_lumen',
    title: 'Grating Gardens Sample',
    offer: 'Professor Lumen taps her chin. "I\'ve heard the Grating Gardens can rule light into sharper lines than any lens I\'ve ground by hand. Bring me 2 Opal from there and I\'ll make it worth your trip."',
    objective: { type: 'collect', material: 'opal', count: 2 },
    reward: { xp: 20, material: { id: 'sapphire', count: 1 } },
    reminder: 'Professor Lumen: "Still no Opal from the Grating Gardens? Two pieces, whenever you find them."',
    complete: 'Professor Lumen turns the two Opals over in the light. "Beautiful ruling. Here — a Sapphire for your trouble, and my thanks."'
  },
  lumen_mirror: {
    npc: 'prof_lumen',
    title: 'Confirm the Hall Is Quiet',
    offer: 'Professor Lumen’s expression tightens. "Decades ago I surveyed the Hall of Mirrors myself and marked it \'gone wild.\' I\'d sleep better knowing its Wraith is finally dealt with. Bring me proof."',
    objective: { type: 'defeat_guardian', map: 'mirrors' },
    reward: { xp: 25, material: { id: 'aluminum', count: 2 } },
    reminder: 'Professor Lumen: "The Infinite Reflection Wraith — still haunting the Hall, I take it?"',
    complete: 'Professor Lumen exhales, something old finally settling. "Good. One less \'gone wild\' surface on my old survey maps. Take these — you\'ve earned them."'
  },
  silvers_film: {
    npc: 'prof_mirrors',
    title: 'Hologram Archive Sample',
    offer: 'Professor Silvers lowers her voice. "The Hologram Archive still has Silver Halide Film in it, if the recordings haven\'t reclaimed it all. Bring me 2 and I\'ll trade you something useful."',
    objective: { type: 'collect', material: 'silver_halide', count: 2 },
    reward: { xp: 20, material: { id: 'diamond', count: 1 } },
    reminder: 'Professor Silvers: "Two pieces of Silver Halide Film from the Archive — still waiting."',
    complete: 'Professor Silvers pockets the film carefully. "This confirms what I feared about that place — and I keep my promises. Here."'
  },
  silvers_fiber: {
    npc: 'prof_mirrors',
    title: 'Tunnels I Used to Run',
    offer: 'Professor Silvers goes quiet for a moment. "I ran signal through those Fiber Tunnels myself, once. Something\'s been draining the core dry for years — an Attenuation Slug, if the reports are right. Deal with it for me?"',
    objective: { type: 'defeat_guardian', map: 'fiber' },
    reward: { xp: 24, material: { id: 'polaroid', count: 2 } },
    reminder: 'Professor Silvers: "That Attenuation Slug still draining my old tunnels?"',
    complete: 'Professor Silvers exhales slowly. "Good. Some of what I built down there can finally rest. Thank you — here."'
  },
  gapp_sentinel: {
    npc: 'prof_labs',
    title: 'Resolve the Sentinel',
    offer: 'Professor Gapp grins. "Word is the Grating Gardens has a guardian that can\'t be hit without real precision. Prove the Rayleigh criterion right — defeat the Aperture Sentinel — and I\'ll owe you one."',
    objective: { type: 'defeat_guardian', map: 'grating' },
    reward: { xp: 30, material: { id: 'silicon', count: 1 } },
    reminder: 'Professor Gapp: "That Aperture Sentinel still standing? Resolution takes precision, not brightness."',
    complete: 'Professor Gapp pumps a fist. "Knew you had the resolving power. Here\'s a little something from my own bench."'
  },
  gapp_prism: {
    npc: 'prof_labs',
    title: 'Glass From an Old Argument',
    offer: 'Professor Gapp smirks. "Prism Peak\'s been arguing with itself about ray-versus-wave since before the Vanguard existed — and it\'s made excellent glass out of the argument. Bring me 2 Flint Glass from up there and I\'ll call it a fair trade."',
    objective: { type: 'collect', material: 'flint_glass', count: 2 },
    reward: { xp: 20, material: { id: 'crown_glass', count: 2 } },
    reminder: 'Professor Gapp: "That flint glass from Prism Peak — still need 2 pieces."',
    complete: 'Professor Gapp holds the glass up to the light. "Good stuff. Old argument, good glass. Thanks!"'
  }
};

export function isObjectiveMet(state, quest) {
  const obj = quest.objective;
  if (obj.type === 'collect') return (state.player.materials[obj.material] || 0) >= obj.count;
  if (obj.type === 'defeat_guardian') return !!(state.flags.guardianDefeated && state.flags.guardianDefeated[obj.map]);
  return false;
}

// A lightweight standing tracker per professor — a running total bumped by
// answering their quizzes correctly and turning in their quests, mapped to
// a small set of named tiers rather than shown as a raw number.
export const REPUTATION_TIERS = [
  { min: 0, label: 'Stranger' },
  { min: 5, label: 'Acquainted' },
  { min: 15, label: 'Trusted' },
  { min: 30, label: 'Cherished' }
];

function reputationTierIndex(rep) {
  let idx = 0;
  for (let i = 0; i < REPUTATION_TIERS.length; i++) {
    if (rep >= REPUTATION_TIERS[i].min) idx = i;
  }
  return idx;
}

export function reputationTier(rep) {
  return REPUTATION_TIERS[reputationTierIndex(rep || 0)].label;
}

// How far into the current tier a raw reputation number sits, for a Quest
// Log progress bar. `nextLabel` is null once the top tier (Cherished) is
// reached, since there's nothing further to progress toward.
export function reputationProgress(rep) {
  const value = rep || 0;
  const idx = reputationTierIndex(value);
  const current = REPUTATION_TIERS[idx];
  const next = REPUTATION_TIERS[idx + 1];
  if (!next) return { pct: 1, tierLabel: current.label, nextLabel: null };
  const span = next.min - current.min;
  const progressed = value - current.min;
  return { pct: Math.min(1, Math.max(0, progressed / span)), tierLabel: current.label, nextLabel: next.label };
}

// Pure state mutation - returns the newly-reached tier label if this change
// crossed into a higher one, or null if it didn't (so callers can decide
// whether a "your standing improved" announcement is warranted).
export function applyReputationChange(state, npcId, amount) {
  if (!state.flags.npcReputation) state.flags.npcReputation = {};
  const before = state.flags.npcReputation[npcId] || 0;
  const after = before + amount;
  state.flags.npcReputation[npcId] = after;
  const tierBefore = reputationTierIndex(before);
  const tierAfter = reputationTierIndex(after);
  return tierAfter > tierBefore ? REPUTATION_TIERS[tierAfter].label : null;
}

// Whether the player has earned Trusted (or higher) standing with at least
// one professor - the threshold for the Trading Post's loyalty discount.
export function hasTrustedStanding(state) {
  const trustedMin = REPUTATION_TIERS.find(t => t.label === 'Trusted').min;
  const rep = state.flags.npcReputation || {};
  return Object.values(rep).some(v => v >= trustedMin);
}

export function findQuestsForNpc(npcId) {
  return Object.entries(QUESTS)
    .filter(([, q]) => q.npc === npcId)
    .map(([id, quest]) => ({ id, quest }));
}

// Picks the single most relevant quest to surface on this conversation:
// finish anything ready to turn in, then offer anything unstarted, then
// remind about anything still active, otherwise there's nothing to say.
export function pickQuestToPresent(state, npcId) {
  const all = findQuestsForNpc(npcId);
  if (!all.length) return null;
  const completable = all.find(({ id, quest }) => state.flags.quests[id] === 'active' && isObjectiveMet(state, quest));
  if (completable) return completable;
  const offerable = all.find(({ id }) => !state.flags.quests[id]);
  if (offerable) return offerable;
  const active = all.find(({ id }) => state.flags.quests[id] === 'active');
  if (active) return active;
  return null;
}

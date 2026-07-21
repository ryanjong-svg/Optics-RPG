// A lightweight standing tracker per professor — a running total bumped by
// answering their quizzes correctly and turning in their quests, mapped to
// a small set of named tiers rather than shown as a raw number.
//
// Lives in data/meta/ (alongside achievements.js/changelog.js) rather than
// data/narrative/quests.js, which is where it was first written - reputation
// is a cross-cutting progression system, not quest data, and other content
// domains (e.g. trading.js's loyalty discount) need to read it without
// creating a content -> narrative dependency for something that isn't
// really about quests.
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

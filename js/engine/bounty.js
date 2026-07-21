// A repeatable side-goal system for once the professor-assigned quests run
// out: 3 rotating bounties, each asking for N more kills of one enemy type,
// for a material + XP reward. Backed by a lifetime per-enemy kill counter
// (state.flags.enemyKillCounts) that battle.js increments on every victory,
// completely separate from state.flags.enemiesDefeated (a one-time "have you
// ever beaten this?" flag, not a running count).
import { ZONE_ENCOUNTERS } from './overworld.js';
import { ENEMIES } from '../data/enemies.js';
import { grantXp } from './state.js';

export const BOUNTY_SLOT_COUNT = 3;
const MIN_TARGET = 3;
const MAX_TARGET = 6;
export const MAX_REROLLS_PER_BOUNTY = 1;

function allBountyCandidates() {
  const ids = new Set();
  Object.values(ZONE_ENCOUNTERS).forEach(pool => pool.forEach(id => ids.add(id)));
  return [...ids];
}

// Exported for direct testing - picks a random candidate (avoiding ids
// already on the board when possible, so the 3 slots don't repeat the same
// enemy), a random target count, and a reward derived from that enemy's own
// material drop.
export function generateBounty(state, excludeIds = []) {
  const all = allBountyCandidates();
  const candidates = all.filter(id => !excludeIds.includes(id));
  const pool = candidates.length ? candidates : all;
  const enemyId = pool[Math.floor(Math.random() * pool.length)];
  const enemy = ENEMIES[enemyId];
  const targetCount = MIN_TARGET + Math.floor(Math.random() * (MAX_TARGET - MIN_TARGET + 1));
  const rewardMaterialId = (enemy.mats && enemy.mats[0]) || null;
  const baseline = (state.flags.enemyKillCounts && state.flags.enemyKillCounts[enemyId]) || 0;
  return {
    enemyId, targetCount, baseline, rerollsUsed: 0,
    rewardMaterialId, rewardAmount: Math.max(1, Math.round(targetCount / 2)),
    rewardXp: targetCount * 8
  };
}

// Lazily fills the board to BOUNTY_SLOT_COUNT the first time it's checked -
// so an existing save (with an empty/missing bounties array) picks up the
// feature without needing a special migration step.
export function ensureBounties(state) {
  if (!state.flags.bounties) state.flags.bounties = [];
  while (state.flags.bounties.length < BOUNTY_SLOT_COUNT) {
    const usedIds = state.flags.bounties.map(b => b.enemyId);
    state.flags.bounties.push(generateBounty(state, usedIds));
  }
  return state.flags.bounties;
}

export function bountyProgress(state, bounty) {
  const current = (state.flags.enemyKillCounts && state.flags.enemyKillCounts[bounty.enemyId]) || 0;
  return Math.min(bounty.targetCount, Math.max(0, current - bounty.baseline));
}

export function canClaimBounty(state, bounty) {
  return bountyProgress(state, bounty) >= bounty.targetCount;
}

export function canRerollBounty(bounty) {
  return (bounty.rerollsUsed || 0) < MAX_REROLLS_PER_BOUNTY;
}

// A modest escape hatch for an inconvenient target - each slot gets exactly
// one reroll before it must be claimed (the allowance resets once a new
// bounty rolls into that slot), so it's a real choice, not an infinite skip.
export function applyRerollBounty(state, slotIndex) {
  const bounty = state.flags.bounties && state.flags.bounties[slotIndex];
  if (!bounty || !canRerollBounty(bounty)) return false;
  const usedIds = state.flags.bounties.map(b => b.enemyId);
  const fresh = generateBounty(state, usedIds);
  fresh.rerollsUsed = (bounty.rerollsUsed || 0) + 1;
  state.flags.bounties[slotIndex] = fresh;
  return true;
}

// Pure state mutation (no dom/save/audio side effects) so it stays
// unit-testable; claimBounty() below is the UI-wired version callers use.
export function applyClaimBounty(state, slotIndex, log) {
  const bounty = state.flags.bounties && state.flags.bounties[slotIndex];
  if (!bounty || !canClaimBounty(state, bounty)) return false;
  if (bounty.rewardMaterialId) {
    state.player.materials[bounty.rewardMaterialId] = (state.player.materials[bounty.rewardMaterialId] || 0) + bounty.rewardAmount;
  }
  grantXp(state, bounty.rewardXp, log || (() => {}));
  state.flags.bountiesClaimed = (state.flags.bountiesClaimed || 0) + 1;
  state.flags.bounties[slotIndex] = generateBounty(state, state.flags.bounties.map(b => b.enemyId));
  return true;
}

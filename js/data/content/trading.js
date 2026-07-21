import { hasTrustedStanding } from '../narrative/quests.js';

// A barter system, not a currency - the Workbench already tracks every
// material the player holds, so exchanging one for another needs no new
// resource, just a fixed ratio between them.
//
// TRADE_VALUE is a rough rarity/design-balance number (1 = common outer-zone
// drop, 8 = rarest depth-zone drop), not a physical constant like everything
// in materials.js, which is why it lives in its own small table here instead
// of being bolted onto MATERIALS.
export const TRADE_VALUE = {
  water: 1, polaroid: 1,
  crown_glass: 2, flint_glass: 2, quartz: 2, aluminum: 2,
  silver: 3, opal: 3, calcite: 3,
  silicon: 4, ge_doped_silica: 4,
  sapphire: 5, silver_halide: 5, lithium_niobate: 5,
  photonic_crystal: 6, rutile: 6,
  avalanche_silicon: 7, diamond: 7,
  geiger_mode_silicon: 8
};

// How many units of `fromId` it costs to get 1 unit of `toId` - always at
// least 1, and grows with how much rarer the target is than what's being
// traded away.
export function tradeCost(fromId, toId) {
  const fromValue = TRADE_VALUE[fromId] || 1;
  const toValue = TRADE_VALUE[toId] || 1;
  return Math.max(1, Math.ceil(toValue / fromValue));
}

const TRUSTED_DISCOUNT = 0.85; // 15% cheaper once any professor reaches Trusted+

// The actual cost the player pays right now, folding in the Trading Post's
// loyalty discount - tradeCost() alone stays the undiscounted base rate so
// the rarity table itself doesn't need to know about reputation.
export function effectiveTradeCost(state, fromId, toId) {
  const base = tradeCost(fromId, toId);
  return hasTrustedStanding(state) ? Math.max(1, Math.ceil(base * TRUSTED_DISCOUNT)) : base;
}

export function canTrade(state, fromId, toId, toAmount = 1) {
  if (!fromId || !toId || fromId === toId || toAmount <= 0) return false;
  const cost = effectiveTradeCost(state, fromId, toId) * toAmount;
  return (state.player.materials[fromId] || 0) >= cost;
}

// Pure state mutation (no dom/save/audio side effects) so it stays
// unit-testable; tradeMaterials() in tradingUI.js is the UI-wired version.
export function applyTrade(state, fromId, toId, toAmount = 1) {
  if (!canTrade(state, fromId, toId, toAmount)) return false;
  const cost = effectiveTradeCost(state, fromId, toId) * toAmount;
  state.player.materials[fromId] -= cost;
  state.player.materials[toId] = (state.player.materials[toId] || 0) + toAmount;
  return true;
}

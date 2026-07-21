import { findRecipe } from '../../data/equipment.js';

// Resolves a player's equipped recipe ids into their built stat objects for battle math.
export function buildGear(player) {
  const gear = {};
  for (const slot of ['lens', 'mirror', 'prism', 'filter']) {
    const recipeId = player.equipped[slot];
    if (!recipeId) { gear[slot] = null; continue; }
    const recipe = findRecipe(recipeId);
    gear[slot] = recipe ? { ...recipe.build(), recipeName: recipe.name } : null;
  }
  return gear;
}

// Loadouts are just a saved snapshot of `equipped` - no new gear is created,
// so switching builds mid-adventure (including mid-battle) doesn't need a
// trip through every dropdown. Pure state mutations (no dom/save side
// effects) so they stay unit-testable; the UI-wired versions callers use
// live in panels/craft.js (Craft panel) and battle/battle.js (mid-fight
// quick-swap) - kept here rather than in craft.js so battle.js can use them
// too without a circular import (craft.js already imports battle.js).
export function applySaveLoadout(state, slot) {
  // A re-save overwrites the equipped snapshot but keeps whatever name was
  // already set - naming a loadout shouldn't need to be redone every time
  // its gear changes.
  const existing = state.player.loadouts[slot];
  const name = existing ? existing.name : null;
  state.player.loadouts[slot] = { ...state.player.equipped, name: name || null };
}

export function applyLoadLoadout(state, slot) {
  const player = state.player;
  const loadout = player.loadouts[slot];
  if (!loadout) return false;
  ['lens', 'mirror', 'prism', 'filter'].forEach(s => {
    const recipeId = loadout[s];
    player.equipped[s] = (recipeId && player.ownedGear[recipeId]) ? recipeId : null;
  });
  return true;
}

export function applyRenameLoadout(state, slot, name) {
  const loadout = state.player.loadouts[slot];
  if (!loadout) return false;
  loadout.name = name || null;
  return true;
}

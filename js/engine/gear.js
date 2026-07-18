import { findRecipe } from '../data/equipment.js';

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

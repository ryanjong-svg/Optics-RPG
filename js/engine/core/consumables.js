import { findConsumable } from '../../data/content/consumables.js';
import { unlockCodex } from './state.js';
import { saveGame } from './save.js';
import * as audio from '../audio.js';

export function canCraftConsumable(player, item) {
  return item.materials.every(matId => (player.materials[matId] || 0) >= item.count);
}

// Pure state mutation (no audio/save side effects) so it stays unit-testable
// without a browser AudioContext — craftConsumable() below is the version
// UI callers should actually use.
export function applyCraftConsumable(state, itemId) {
  const item = findConsumable(itemId);
  const player = state.player;
  if (!item || !canCraftConsumable(player, item)) return false;
  item.materials.forEach(matId => { player.materials[matId] -= item.count; });
  player.consumables[itemId] = (player.consumables[itemId] || 0) + 1;
  return true;
}

export function craftConsumable(game, itemId) {
  const crafted = applyCraftConsumable(game.state, itemId);
  if (crafted) {
    audio.playCraftSuccess();
    saveGame(game.state);
  }
  return crafted;
}

// Pure state mutation shared by both the Workbench (out of battle, free
// action) and mid-battle item use (costs the player's turn) — heals up to
// the item's amount, capped at maxHp, and returns how much was actually
// healed so callers can decide whether anything meaningful happened.
export function applyConsumable(state, itemId) {
  const item = findConsumable(itemId);
  if (!item) return 0;
  const owned = state.player.consumables[itemId] || 0;
  if (owned <= 0) return 0;
  if (state.player.hp >= state.player.maxHp) return 0;
  state.player.consumables[itemId] -= 1;
  const healed = Math.min(item.heal, state.player.maxHp - state.player.hp);
  state.player.hp += healed;
  unlockCodex(state, 'photobiomodulation', null);
  return healed;
}

export function useConsumableOutOfBattle(game, itemId) {
  const healed = applyConsumable(game.state, itemId);
  if (healed > 0) {
    audio.playHeal();
    saveGame(game.state);
  }
  return healed;
}

import { MATERIAL_LIST, MATERIALS } from '../../data/content/materials.js';
import { tradeCost, effectiveTradeCost, canTrade, applyTrade } from '../../data/content/trading.js';
import { saveGame } from '../core/save.js';
import * as audio from '../audio.js';

function updateTradingRate(game) {
  const d = game.dom;
  const fromId = d.tradingFrom.value;
  const toId = d.tradingTo.value;
  if (!fromId) {
    d.tradingRate.textContent = 'Nothing to trade away yet.';
    d.tradingTrade.disabled = true;
    return;
  }
  if (fromId === toId) {
    d.tradingRate.textContent = 'Pick two different materials.';
    d.tradingTrade.disabled = true;
    return;
  }
  const baseCost = tradeCost(fromId, toId);
  const cost = effectiveTradeCost(game.state, fromId, toId);
  const have = game.state.player.materials[fromId] || 0;
  d.tradingRate.textContent = cost < baseCost
    ? `${cost} for 1 (Trusted discount from ${baseCost}) — you have ${have}.`
    : `${cost} for 1 (you have ${have}).`;
  d.tradingTrade.disabled = !canTrade(game.state, fromId, toId, 1);
}

// Rebuilds both dropdowns from the player's current holdings, keeping
// whatever was already selected where possible - a full re-render (e.g.
// right after a trade) shouldn't reset the player back to the top of the list.
export function renderTrading(game) {
  const d = game.dom;
  if (!d.tradingFrom) return;
  const player = game.state.player;

  const prevFrom = d.tradingFrom.value;
  const prevTo = d.tradingTo.value;

  const owned = MATERIAL_LIST.filter(m => (player.materials[m.id] || 0) > 0);
  d.tradingFrom.innerHTML = owned.length
    ? owned.map(m => `<option value="${m.id}">${m.name} (have ${player.materials[m.id]})</option>`).join('')
    : '<option value="">(nothing to trade away)</option>';
  d.tradingTo.innerHTML = MATERIAL_LIST.map(m => `<option value="${m.id}">${m.name}</option>`).join('');

  if (owned.some(m => m.id === prevFrom)) d.tradingFrom.value = prevFrom;
  if (prevTo) d.tradingTo.value = prevTo;

  updateTradingRate(game);
}

export function tradeMaterials(game) {
  const d = game.dom;
  const fromId = d.tradingFrom.value;
  const toId = d.tradingTo.value;
  const cost = effectiveTradeCost(game.state, fromId, toId);
  const ok = applyTrade(game.state, fromId, toId, 1);
  if (!ok) return;
  audio.playCraftSuccess();
  if (d.tradingLast) {
    d.tradingLast.textContent = `Last trade: ${cost} ${MATERIALS[fromId].name} → 1 ${MATERIALS[toId].name}.`;
  }
  saveGame(game.state);
  renderTrading(game);
}

export function wireTrading(game) {
  const d = game.dom;
  if (!d.tradingFrom) return;
  d.tradingFrom.addEventListener('change', () => updateTradingRate(game));
  d.tradingTo.addEventListener('change', () => updateTradingRate(game));
  d.tradingTrade.addEventListener('click', () => tradeMaterials(game));
}

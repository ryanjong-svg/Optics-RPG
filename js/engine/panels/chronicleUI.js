import { LORE, isLoreUnlocked } from '../../data/narrative/lore.js';

export function chronicleUnlockedCount(state) {
  return Object.values(LORE).filter(entry => isLoreUnlocked(state, entry)).length;
}

export function openChronicle(game) {
  game.state.mode = 'chronicle';
  game.showPanel('chronicle');
  renderChronicle(game);
  const state = game.state;
  if (!state.flags.badgeSeen) state.flags.badgeSeen = {};
  state.flags.badgeSeen.chronicle = chronicleUnlockedCount(state);
  if (game.updateBadges) game.updateBadges();
}

export function closeChronicle(game) {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
}

export function renderChronicle(game) {
  const state = game.state;
  const ids = Object.keys(LORE);
  game.dom.chronicleList.innerHTML = ids.map(id => {
    const entry = LORE[id];
    if (!isLoreUnlocked(state, entry)) {
      const hint = entry.unlock.type === 'map'
        ? 'Explore further to reveal this entry.'
        : 'Speak with the right teacher to reveal this entry.';
      return `<div class="codex-entry locked"><h3>??? (unexplored)</h3><p>${hint}</p></div>`;
    }
    return `<div class="codex-entry"><h3>${entry.title}</h3><p>${entry.body}</p></div>`;
  }).join('');
}

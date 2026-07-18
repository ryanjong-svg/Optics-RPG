import { CODEX } from '../data/codex.js';

export function openCodex(game) {
  game.state.mode = 'codex';
  game.showPanel('codex');
  renderCodex(game);
}

export function closeCodex(game) {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
}

export function renderCodex(game) {
  const unlocked = game.state.codexUnlocked;
  const ids = Object.keys(CODEX);
  const unlockedCount = ids.filter(id => unlocked[id]).length;
  game.dom.codexProgress.textContent = `${unlockedCount} / ${ids.length} concepts discovered`;
  game.dom.codexList.innerHTML = ids.map(id => {
    const entry = CODEX[id];
    if (!unlocked[id]) {
      return `<div class="codex-entry locked"><h3>??? (locked)</h3><p>Use the matching ability or material in battle to reveal this entry.</p></div>`;
    }
    return `<div class="codex-entry"><h3>${entry.title}</h3><p>${entry.body}</p></div>`;
  }).join('');
}

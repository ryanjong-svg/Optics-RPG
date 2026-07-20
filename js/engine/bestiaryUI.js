import { ENEMIES, weaknessResistanceText } from '../data/enemies.js';

export function openBestiary(game) {
  game.state.mode = 'bestiary';
  game.showPanel('bestiary');
  renderBestiary(game);
}

export function closeBestiary(game) {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
}

export function renderBestiary(game) {
  const defeated = game.state.flags.enemiesDefeated;
  const ids = Object.keys(ENEMIES);
  const defeatedCount = ids.filter(id => defeated[id]).length;
  game.dom.bestiaryProgress.textContent = `${defeatedCount} / ${ids.length} enemies cataloged`;
  game.dom.bestiaryList.innerHTML = ids.map(id => {
    const enemy = ENEMIES[id];
    if (!defeated[id]) {
      return `<div class="codex-entry locked"><h3>??? (undiscovered)</h3><p>Defeat this enemy once to add it to your Bestiary.</p></div>`;
    }
    const matchup = weaknessResistanceText(enemy);
    return `
      <div class="codex-entry">
        <h3>${enemy.name}</h3>
        <p>${enemy.flavor || ''}</p>
        ${matchup ? `<p>${matchup}</p>` : ''}
      </div>
    `;
  }).join('');
}

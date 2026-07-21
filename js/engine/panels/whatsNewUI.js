import { CHANGELOG, GAME_VERSION } from '../../data/changelog.js';
import { saveGame } from '../core/save.js';

export function hasUnseenChangelog(state) {
  return state.flags.lastSeenVersion !== GAME_VERSION;
}

export function renderWhatsNew(game) {
  game.dom.whatsnewList.innerHTML = CHANGELOG.map(entry => `
    <div class="codex-entry">
      <h3>v${entry.version}</h3>
      <ul class="whatsnew-list">${entry.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
    </div>
  `).join('');
}

export function openWhatsNew(game) {
  game.state.mode = 'whatsnew';
  game.showPanel('whatsnew');
  renderWhatsNew(game);
  game.state.flags.lastSeenVersion = GAME_VERSION;
  saveGame(game.state);
  game.updateBadges();
}

export function closeWhatsNew(game) {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
}

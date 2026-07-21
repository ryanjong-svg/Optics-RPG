import { HELP_TOPICS } from '../../data/narrative/helpTopics.js';

export function openHelp(game) {
  game.state.mode = 'help';
  game.showPanel('help');
  renderHelp(game);
}

export function closeHelp(game) {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
}

export function renderHelp(game) {
  game.dom.helpList.innerHTML = HELP_TOPICS.map(t => `
    <div class="codex-entry">
      <h3>${t.title}</h3>
      <p>${t.body}</p>
    </div>
  `).join('');
}

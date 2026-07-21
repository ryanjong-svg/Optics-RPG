import { ENEMIES, weaknessResistanceText } from '../data/enemies.js';
import { MAPS } from '../data/maps.js';

const ZONE_NAMES = Object.fromEntries(Object.values(MAPS).map(m => [m.zone, m.name]));
const ZONE_ORDER = [...new Set(Object.values(MAPS).map(m => m.zone))];
const BOSS_ZONE = '__boss'; // null_medium has no zone of its own; grouped into its own section

export function bestiaryCaughtCount(state) {
  return Object.keys(ENEMIES).filter(id => state.flags.enemiesDefeated[id]).length;
}

export function openBestiary(game) {
  game.state.mode = 'bestiary';
  game.showPanel('bestiary');
  renderBestiary(game);
  const state = game.state;
  if (!state.flags.badgeSeen) state.flags.badgeSeen = {};
  state.flags.badgeSeen.bestiary = bestiaryCaughtCount(state);
  if (game.updateBadges) game.updateBadges();
}

export function closeBestiary(game) {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
}

function entryHtml(enemy, isDefeated) {
  if (!isDefeated) {
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
}

export function renderBestiary(game) {
  const state = game.state;
  const defeated = state.flags.enemiesDefeated;
  const ids = Object.keys(ENEMIES);
  const defeatedCount = ids.filter(id => defeated[id]).length;
  game.dom.bestiaryProgress.textContent = `${defeatedCount} / ${ids.length} enemies cataloged`;

  // Filtering only ever matches a real (cataloged) enemy name - an
  // undiscovered "???" entry has no name to search for, so it's simply
  // excluded from filtered results rather than shown as a false match.
  const query = (game.dom.bestiarySearch ? game.dom.bestiarySearch.value : '').trim().toLowerCase();

  const byZone = new Map();
  for (const id of ids) {
    const zone = ENEMIES[id].zone || BOSS_ZONE;
    if (!byZone.has(zone)) byZone.set(zone, []);
    byZone.get(zone).push(id);
  }

  const zoneOrder = ZONE_ORDER.filter(z => byZone.has(z));
  if (byZone.has(BOSS_ZONE)) zoneOrder.push(BOSS_ZONE);

  const sections = zoneOrder.map(zone => {
    const label = zone === BOSS_ZONE ? 'The Null Medium' : ZONE_NAMES[zone];
    const zoneIds = byZone.get(zone);
    const zoneCaught = zoneIds.filter(id => defeated[id]).length;
    const visibleIds = query
      ? zoneIds.filter(id => defeated[id] && ENEMIES[id].name.toLowerCase().includes(query))
      : zoneIds;
    if (query && !visibleIds.length) return '';
    const entries = visibleIds.map(id => entryHtml(ENEMIES[id], !!defeated[id])).join('');
    return `<h3 class="completion-subhead">${label} — ${zoneCaught} / ${zoneIds.length}</h3>${entries}`;
  }).join('');

  game.dom.bestiaryList.innerHTML = sections || `<p class="ngplus-hint">No cataloged enemies match "${query}".</p>`;
}

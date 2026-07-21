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

// Exported for direct testing. Discovered (named) entries always sort ahead
// of undiscovered "???" ones in every mode except plain zone order, so a
// sort position can never leak which undiscovered enemy is which - ties
// among undiscovered entries keep their original (zone) order rather than
// being reordered by anything tied to their real, still-hidden name.
export function sortBestiaryIds(ids, defeated, mode) {
  if (mode !== 'alpha' && mode !== 'uncaught') return ids;
  const arr = [...ids];
  if (mode === 'alpha') {
    arr.sort((a, b) => {
      const da = !!defeated[a], db = !!defeated[b];
      if (da && db) return ENEMIES[a].name.localeCompare(ENEMIES[b].name);
      if (da !== db) return da ? -1 : 1;
      return 0;
    });
  } else {
    arr.sort((a, b) => {
      const da = !!defeated[a], db = !!defeated[b];
      if (da !== db) return da ? 1 : -1;
      return 0;
    });
  }
  return arr;
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
  const sortMode = game.dom.bestiarySort ? game.dom.bestiarySort.value : 'zone';

  if (sortMode !== 'zone') {
    const visibleIds = query
      ? ids.filter(id => defeated[id] && ENEMIES[id].name.toLowerCase().includes(query))
      : ids;
    if (query && !visibleIds.length) {
      game.dom.bestiaryList.innerHTML = `<p class="ngplus-hint">No cataloged enemies match "${query}".</p>`;
      return;
    }
    const sorted = sortBestiaryIds(visibleIds, defeated, sortMode);
    game.dom.bestiaryList.innerHTML = sorted.map(id => entryHtml(ENEMIES[id], !!defeated[id])).join('');
    return;
  }

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

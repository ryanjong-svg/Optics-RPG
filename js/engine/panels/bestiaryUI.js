import { ENEMIES, weaknessResistanceText } from '../../data/content/enemies.js';
import { MAPS } from '../../data/world/maps.js';

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

function entryHtml(enemy, id, isDefeated, isFavorite) {
  if (!isDefeated) {
    return `<div class="codex-entry locked"><h3>??? (undiscovered)</h3><p>Defeat this enemy once to add it to your Bestiary.</p></div>`;
  }
  const matchup = weaknessResistanceText(enemy);
  return `
    <div class="codex-entry">
      <h3>${enemy.name} <button class="action-btn ghost bestiary-fav-toggle" data-id="${id}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">${isFavorite ? '★' : '☆'}</button></h3>
      <p>${enemy.flavor || ''}</p>
      ${matchup ? `<p>${matchup}</p>` : ''}
    </div>
  `;
}

// Pure and exported for direct testing.
export function toggleBestiaryFavorite(state, id) {
  if (!state.flags.bestiaryFavorites) state.flags.bestiaryFavorites = {};
  if (state.flags.bestiaryFavorites[id]) delete state.flags.bestiaryFavorites[id];
  else state.flags.bestiaryFavorites[id] = true;
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
  const favorites = state.flags.bestiaryFavorites || {};
  const ids = Object.keys(ENEMIES);
  const defeatedCount = ids.filter(id => defeated[id]).length;
  game.dom.bestiaryProgress.textContent = `${defeatedCount} / ${ids.length} enemies cataloged`;

  // Filtering only ever matches a real (cataloged) enemy name - an
  // undiscovered "???" entry has no name to search for, so it's simply
  // excluded from filtered results rather than shown as a false match.
  const query = (game.dom.bestiarySearch ? game.dom.bestiarySearch.value : '').trim().toLowerCase();
  const sortMode = game.dom.bestiarySort ? game.dom.bestiarySort.value : 'zone';
  const matchesQuery = id => !query || (defeated[id] && ENEMIES[id].name.toLowerCase().includes(query));

  // Favorites float to the top of every view, regardless of sort mode or an
  // active search - pulled into their own section and excluded from
  // whatever's rendered below so each entry only ever appears once.
  const favoriteIds = ids.filter(id => defeated[id] && favorites[id] && matchesQuery(id));
  const favoritesHtml = favoriteIds.length
    ? `<h3 class="completion-subhead">★ Favorites</h3>${favoriteIds.map(id => entryHtml(ENEMIES[id], id, true, true)).join('')}`
    : '';

  let bodyHtml;
  if (sortMode !== 'zone') {
    const visibleIds = ids.filter(id => !favorites[id] && matchesQuery(id));
    if (query && !favoriteIds.length && !visibleIds.length) {
      bodyHtml = `<p class="ngplus-hint">No cataloged enemies match "${query}".</p>`;
    } else {
      const sorted = sortBestiaryIds(visibleIds, defeated, sortMode);
      bodyHtml = sorted.map(id => entryHtml(ENEMIES[id], id, !!defeated[id], false)).join('');
    }
  } else {
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
      const visibleIds = zoneIds.filter(id => !favorites[id] && matchesQuery(id));
      if (query && !visibleIds.length) return '';
      const entries = visibleIds.map(id => entryHtml(ENEMIES[id], id, !!defeated[id], false)).join('');
      return `<h3 class="completion-subhead">${label} — ${zoneCaught} / ${zoneIds.length}</h3>${entries}`;
    }).join('');
    bodyHtml = sections || (query ? `<p class="ngplus-hint">No cataloged enemies match "${query}".</p>` : '');
  }

  game.dom.bestiaryList.innerHTML = favoritesHtml + bodyHtml;
  game.dom.bestiaryList.querySelectorAll('.bestiary-fav-toggle').forEach(btn => {
    btn.onclick = () => {
      toggleBestiaryFavorite(state, btn.dataset.id);
      renderBestiary(game);
    };
  });
}

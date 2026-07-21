import { test } from 'node:test';
import assert from 'node:assert/strict';

import { renderBestiary, sortBestiaryIds, toggleBestiaryFavorite } from '../../js/engine/panels/bestiaryUI.js';
import { ENEMIES } from '../../js/data/content/enemies.js';
import { newGameState } from '../../js/engine/core/state.js';

// renderBestiary only ever assigns .textContent/.innerHTML, calls
// .querySelectorAll(...).forEach(...) to wire up favorite-toggle buttons,
// and reads bestiarySearch.value/bestiarySort.value - plain objects stand
// in fine for real DOM elements (querySelectorAll returns an empty array,
// since no test here needs to simulate an actual button click).
function fakeGame(state, searchValue = '', sortValue = 'zone') {
  return {
    state,
    dom: {
      bestiarySearch: { value: searchValue },
      bestiarySort: { value: sortValue },
      bestiaryProgress: { textContent: '' },
      bestiaryList: { innerHTML: '', querySelectorAll: () => [] }
    }
  };
}

test('renderBestiary: with no search text, every cataloged enemy appears, real or "???"', () => {
  const state = newGameState();
  const wisp = 'wisp';
  state.flags.enemiesDefeated[wisp] = true;
  const game = fakeGame(state);
  renderBestiary(game);
  assert.ok(game.dom.bestiaryList.innerHTML.includes(ENEMIES[wisp].name));
  assert.ok(game.dom.bestiaryList.innerHTML.includes('??? (undiscovered)'));
});

test('renderBestiary: filters to only cataloged enemies whose name matches, case-insensitively', () => {
  const state = newGameState();
  state.flags.enemiesDefeated.wisp = true;
  state.flags.enemiesDefeated.mirror_golem = true;
  const game = fakeGame(state, 'WISP');
  renderBestiary(game);
  assert.ok(game.dom.bestiaryList.innerHTML.includes(ENEMIES.wisp.name));
  assert.ok(!game.dom.bestiaryList.innerHTML.includes(ENEMIES.mirror_golem.name));
});

test('renderBestiary: an undiscovered enemy never matches a filter, even if the query happens to match its real name', () => {
  const state = newGameState();
  // mirror_golem is NOT defeated - searching its real name should still exclude it.
  const game = fakeGame(state, ENEMIES.mirror_golem.name);
  renderBestiary(game);
  assert.ok(!game.dom.bestiaryList.innerHTML.includes(ENEMIES.mirror_golem.name));
});

test('renderBestiary: shows a "no matches" message when the filter matches nothing', () => {
  const state = newGameState();
  const game = fakeGame(state, 'zzz_no_such_enemy');
  renderBestiary(game);
  assert.match(game.dom.bestiaryList.innerHTML, /No cataloged enemies match/);
});

test('renderBestiary: zone header counts reflect the full zone, not just the filtered-visible entries', () => {
  const state = newGameState();
  state.flags.enemiesDefeated.wisp = true;
  const game = fakeGame(state, 'wisp');
  renderBestiary(game);
  // village has 3 enemies total (wisp, puddle_imp, glint_moth); only wisp matches "wisp".
  assert.match(game.dom.bestiaryList.innerHTML, /1 \/ 3/);
});

test('sortBestiaryIds: "zone" mode is a no-op, returning the ids unchanged', () => {
  const ids = ['wisp', 'mirror_golem', 'puddle_imp'];
  assert.deepEqual(sortBestiaryIds(ids, {}, 'zone'), ids);
});

test('sortBestiaryIds: "alpha" mode sorts discovered entries by real name, ahead of every undiscovered one', () => {
  const defeated = { wisp: true, mirror_golem: true };
  const sorted = sortBestiaryIds(['mirror_golem', 'wisp', 'puddle_imp'], defeated, 'alpha');
  // Discovered: Mirror Golem, Wisp (alphabetical); undiscovered puddle_imp trails, keeping its input position.
  assert.deepEqual(sorted, ['mirror_golem', 'wisp', 'puddle_imp']);
});

test('sortBestiaryIds: "uncaught" mode puts every undiscovered entry ahead of discovered ones', () => {
  const defeated = { wisp: true };
  const sorted = sortBestiaryIds(['wisp', 'mirror_golem', 'puddle_imp'], defeated, 'uncaught');
  assert.deepEqual(sorted.slice(0, 2).sort(), ['mirror_golem', 'puddle_imp'].sort());
  assert.equal(sorted[2], 'wisp');
});

test('renderBestiary: "alpha" sort mode flattens the list (no zone headers) and orders by name', () => {
  const state = newGameState();
  state.flags.enemiesDefeated.wisp = true;
  state.flags.enemiesDefeated.mirror_golem = true;
  const game = fakeGame(state, '', 'alpha');
  renderBestiary(game);
  const html = game.dom.bestiaryList.innerHTML;
  assert.ok(!html.includes('completion-subhead'), 'flattened modes should not render zone header rows');
  assert.ok(html.indexOf(ENEMIES.mirror_golem.name) < html.indexOf(ENEMIES.wisp.name), 'Mirror Golem should sort before Wisp');
});

test('toggleBestiaryFavorite: toggles on then off', () => {
  const state = newGameState();
  toggleBestiaryFavorite(state, 'wisp');
  assert.equal(state.flags.bestiaryFavorites.wisp, true);
  toggleBestiaryFavorite(state, 'wisp');
  assert.equal(state.flags.bestiaryFavorites.wisp, undefined);
});

test('renderBestiary: a favorited enemy floats into its own section at the top, in every sort mode', () => {
  const state = newGameState();
  state.flags.enemiesDefeated.wisp = true;
  state.flags.enemiesDefeated.mirror_golem = true;
  state.flags.enemiesDefeated.puddle_imp = true;
  toggleBestiaryFavorite(state, 'mirror_golem');

  for (const sortValue of ['zone', 'alpha', 'uncaught']) {
    const game = fakeGame(state, '', sortValue);
    renderBestiary(game);
    const html = game.dom.bestiaryList.innerHTML;
    assert.ok(html.includes('★ Favorites'), `expected a Favorites section in ${sortValue} mode`);
    const favIdx = html.indexOf('★ Favorites');
    const golemIdx = html.indexOf(ENEMIES.mirror_golem.name);
    assert.ok(golemIdx > favIdx && golemIdx < favIdx + 500, `expected Mirror Golem right under the Favorites header in ${sortValue} mode`);
    // Zone counts (e.g. village's) must still count the favorited entry once, not omit or double it.
    const golemMatches = html.split(ENEMIES.mirror_golem.name).length - 1;
    assert.equal(golemMatches, 1, `Mirror Golem should appear exactly once in ${sortValue} mode, not duplicated or dropped`);
  }
});

test('renderBestiary: an undiscovered enemy is never shown as a favorite, even if flagged as one', () => {
  const state = newGameState();
  // mirror_golem is NOT defeated, but somehow flagged favorite (e.g. stale data).
  toggleBestiaryFavorite(state, 'mirror_golem');
  const game = fakeGame(state);
  renderBestiary(game);
  assert.ok(!game.dom.bestiaryList.innerHTML.includes('★ Favorites'));
});

test('renderBestiary: a search query still excludes a favorited entry that doesn\'t match', () => {
  const state = newGameState();
  state.flags.enemiesDefeated.wisp = true;
  state.flags.enemiesDefeated.mirror_golem = true;
  toggleBestiaryFavorite(state, 'mirror_golem');
  const game = fakeGame(state, 'wisp');
  renderBestiary(game);
  assert.ok(!game.dom.bestiaryList.innerHTML.includes('★ Favorites'), 'the favorited enemy does not match the query, so no Favorites section');
  assert.ok(game.dom.bestiaryList.innerHTML.includes(ENEMIES.wisp.name));
});

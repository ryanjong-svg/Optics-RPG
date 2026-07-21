import { test } from 'node:test';
import assert from 'node:assert/strict';

import { renderBestiary } from '../js/engine/bestiaryUI.js';
import { ENEMIES } from '../js/data/enemies.js';
import { newGameState } from '../js/engine/state.js';

// renderBestiary only ever assigns .textContent/.innerHTML and reads
// bestiarySearch.value - plain objects stand in fine for real DOM elements.
function fakeGame(state, searchValue = '') {
  return {
    state,
    dom: {
      bestiarySearch: { value: searchValue },
      bestiaryProgress: { textContent: '' },
      bestiaryList: { innerHTML: '' }
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

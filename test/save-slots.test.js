import { test } from 'node:test';
import assert from 'node:assert/strict';

// save.js's slot functions all go through localStorage, which Node's test
// runner doesn't provide - a tiny in-memory Map-backed stub is enough since
// the module only ever calls getItem/setItem/removeItem on it.
class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}
global.localStorage = new MemoryStorage();

import {
  SLOT_COUNT, getCurrentSlot, setCurrentSlot, saveGameToSlot, loadGameFromSlot,
  clearSlot, slotSummary, allSlotSummaries
} from '../js/engine/save.js';
import { newGameState } from '../js/engine/state.js';

test('getCurrentSlot: defaults to 1 when nothing has been set', () => {
  global.localStorage = new MemoryStorage();
  assert.equal(getCurrentSlot(), 1);
});

test('setCurrentSlot/getCurrentSlot: round-trips, and clamps out-of-range values back to 1', () => {
  global.localStorage = new MemoryStorage();
  setCurrentSlot(2);
  assert.equal(getCurrentSlot(), 2);
  global.localStorage.setItem('optics-rpg-current-slot', '99');
  assert.equal(getCurrentSlot(), 1);
});

test('saveGameToSlot/loadGameFromSlot: slots are independent of each other', () => {
  global.localStorage = new MemoryStorage();
  const a = newGameState();
  a.player.name = 'Slot A Hero';
  const b = newGameState();
  b.player.name = 'Slot B Hero';
  saveGameToSlot(a, 1);
  saveGameToSlot(b, 2);
  assert.equal(loadGameFromSlot(1).player.name, 'Slot A Hero');
  assert.equal(loadGameFromSlot(2).player.name, 'Slot B Hero');
  assert.equal(loadGameFromSlot(3), null);
});

test('loadGameFromSlot: slot 1 falls back to the pre-slots legacy key when its own key is empty', () => {
  global.localStorage = new MemoryStorage();
  const legacyState = newGameState();
  legacyState.player.name = 'Legacy Hero';
  global.localStorage.setItem('optics-rpg-save-v1', JSON.stringify(legacyState));
  assert.equal(loadGameFromSlot(1).player.name, 'Legacy Hero');
  // once something is written to the real slot-1 key, the legacy key stops mattering
  const fresh = newGameState();
  fresh.player.name = 'Fresh Hero';
  saveGameToSlot(fresh, 1);
  assert.equal(loadGameFromSlot(1).player.name, 'Fresh Hero');
});

test('loadGameFromSlot: slot 2/3 never fall back to the legacy key', () => {
  global.localStorage = new MemoryStorage();
  global.localStorage.setItem('optics-rpg-save-v1', JSON.stringify(newGameState()));
  assert.equal(loadGameFromSlot(2), null);
});

test('clearSlot: removes only that slot, and also clears the legacy key when clearing slot 1', () => {
  global.localStorage = new MemoryStorage();
  saveGameToSlot(newGameState(), 1);
  saveGameToSlot(newGameState(), 2);
  global.localStorage.setItem('optics-rpg-save-v1', 'leftover-legacy-data');
  clearSlot(1);
  assert.equal(loadGameFromSlot(1), null);
  assert.equal(global.localStorage.getItem('optics-rpg-save-v1'), null);
  assert.ok(loadGameFromSlot(2), 'slot 2 should be untouched');
});

test('slotSummary: null for an empty slot, real fields for an occupied one', () => {
  global.localStorage = new MemoryStorage();
  assert.equal(slotSummary(1), null);
  const state = newGameState();
  state.player.level = 7;
  state.flags.ngPlusCycle = 2;
  saveGameToSlot(state, 1);
  const summary = slotSummary(1);
  assert.equal(summary.slot, 1);
  assert.equal(summary.level, 7);
  assert.equal(summary.ngPlusCycle, 2);
  assert.equal(summary.currentMap, 'village');
});

test('allSlotSummaries: returns exactly SLOT_COUNT entries, in slot order', () => {
  global.localStorage = new MemoryStorage();
  saveGameToSlot(newGameState(), 2);
  const summaries = allSlotSummaries();
  assert.equal(summaries.length, SLOT_COUNT);
  assert.equal(summaries[0], null);
  assert.ok(summaries[1]);
  assert.equal(summaries[1].slot, 2);
  assert.equal(summaries[2], null);
});

const KEY = 'optics-rpg-save-v1';

// Backfills fields added after a given save was written, so older saves
// (including imported ones from an earlier version of the game) don't crash.
// Exported (alongside looksLikeSave below) so both are unit-testable without
// touching localStorage, which isn't available under the Node test runner.
export function migrateState(state) {
  if (state.player && !state.player.consumables) state.player.consumables = {};
  if (state.player && state.player.maxCharge === undefined) {
    state.player.maxCharge = 3;
    state.player.charge = 3;
  }
  if (state.player && !state.player.loadouts) state.player.loadouts = { 1: null, 2: null };
  if (state.flags) {
    if (!state.flags.visitedMaps) state.flags.visitedMaps = { [state.currentMap]: true };
    if (!state.flags.metNpc) state.flags.metNpc = {};
    if (!state.flags.quizAsked) state.flags.quizAsked = {};
    if (!state.flags.quests) state.flags.quests = {};
    if (!state.flags.secretsFound) state.flags.secretsFound = {};
    if (!state.flags.achievements) state.flags.achievements = {};
    if (!state.flags.achievementsSeen) state.flags.achievementsSeen = {};
    if (state.flags.ngPlusCycle === undefined) state.flags.ngPlusCycle = 0;
    if (!state.flags.hintsShown) state.flags.hintsShown = {};
    if (!state.flags.enemiesDefeated) state.flags.enemiesDefeated = {};
  }
  if (!state.settings) state.settings = {};
  if (!state.settings.difficulty) state.settings.difficulty = 'normal';
  if (state.settings.muted === undefined) state.settings.muted = false;
  if (state.settings.musicVolume === undefined) state.settings.musicVolume = 1;
  if (state.settings.sfxVolume === undefined) state.settings.sfxVolume = 1;
  return state;
}

// A save is only ever trusted after this shape check - just enough structure
// to know migrateState() and the rest of the game won't immediately crash on
// it, without trying to validate every field.
export function looksLikeSave(parsed) {
  return !!(parsed && typeof parsed === 'object' && parsed.player && parsed.flags && parsed.player.materials);
}

export function saveGame(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn('Save failed', e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    return migrateState(state);
  } catch (e) {
    console.warn('Load failed', e);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(KEY);
}

// Returns the raw save JSON exactly as stored, or null if there's nothing to
// export yet - handed straight to a Blob for download, no parsing needed.
export function exportSaveString() {
  return localStorage.getItem(KEY);
}

// Parses, migrates, and validates an externally-provided save string (e.g.
// from an imported file) before ever writing it to localStorage, so a
// corrupt or unrelated JSON file can't brick the save. Returns true/false.
export function importSaveString(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!looksLikeSave(parsed)) return false;
    const migrated = migrateState(parsed);
    localStorage.setItem(KEY, JSON.stringify(migrated));
    return true;
  } catch (e) {
    console.warn('Import failed', e);
    return false;
  }
}

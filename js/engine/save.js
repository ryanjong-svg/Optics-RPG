const KEY = 'optics-rpg-save-v1';

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
    // Backfill fields added after this save was written, so older saves don't crash.
    if (state.flags) {
      if (!state.flags.visitedMaps) state.flags.visitedMaps = { [state.currentMap]: true };
      if (!state.flags.metNpc) state.flags.metNpc = {};
      if (!state.flags.quizAsked) state.flags.quizAsked = {};
    }
    return state;
  } catch (e) {
    console.warn('Load failed', e);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(KEY);
}

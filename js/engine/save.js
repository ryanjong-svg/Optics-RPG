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
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Load failed', e);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(KEY);
}

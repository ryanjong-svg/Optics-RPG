// Pre-slots saves lived under this exact key with no slot suffix - kept as a
// one-time fallback so upgrading to slots never silently drops an existing
// player's progress (see readSlotRaw below).
const LEGACY_KEY = 'optics-rpg-save-v1';
const CURRENT_SLOT_KEY = 'optics-rpg-current-slot';
export const SLOT_COUNT = 3;

function slotKey(slot) {
  return `optics-rpg-save-v1:slot${slot}`;
}

export function getCurrentSlot() {
  try {
    const raw = Number(localStorage.getItem(CURRENT_SLOT_KEY));
    return raw >= 1 && raw <= SLOT_COUNT ? raw : 1;
  } catch (e) {
    return 1;
  }
}

export function setCurrentSlot(slot) {
  try {
    localStorage.setItem(CURRENT_SLOT_KEY, String(slot));
  } catch (e) {
    console.warn('Could not switch save slot', e);
  }
}

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
  if (state.player && state.player.specialization === undefined) state.player.specialization = null;
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
    if (!state.flags.badgeSeen) state.flags.badgeSeen = { bestiary: 0, codex: 0, chronicle: 0 };
    if (state.flags.snellHits === undefined) state.flags.snellHits = 0;
    if (!state.flags.specializationsTried) state.flags.specializationsTried = {};
    if (state.flags.totalDamageDealt === undefined) state.flags.totalDamageDealt = 0;
    if (!state.flags.abilityUseCountsLifetime) state.flags.abilityUseCountsLifetime = {};
    if (state.flags.fastestBossKillTurns === undefined) state.flags.fastestBossKillTurns = null;
    if (state.flags.totalVictories === undefined) state.flags.totalVictories = 0;
    if (state.flags.allAchievementsEarned === undefined) state.flags.allAchievementsEarned = false;
    // Any save from before version tracking existed is treated as being on
    // '1.0.0', so it sees every changelog entry added since as unread.
    if (state.flags.lastSeenVersion === undefined) state.flags.lastSeenVersion = '1.0.0';
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

export function saveGameToSlot(state, slot) {
  try {
    localStorage.setItem(slotKey(slot), JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn('Save failed', e);
    return false;
  }
}

export function saveGame(state) {
  return saveGameToSlot(state, getCurrentSlot());
}

// A slot's raw JSON, falling back to the pre-slots legacy key for slot 1
// only - a one-time read-path so upgrading to slots doesn't strand an
// existing player's save. The very next saveGame() call writes it into the
// real slot-1 key, after which the legacy key is never consulted again.
function readSlotRaw(slot) {
  const raw = localStorage.getItem(slotKey(slot));
  if (raw) return raw;
  return slot === 1 ? localStorage.getItem(LEGACY_KEY) : null;
}

export function loadGameFromSlot(slot) {
  try {
    const raw = readSlotRaw(slot);
    if (!raw) return null;
    const state = JSON.parse(raw);
    return migrateState(state);
  } catch (e) {
    console.warn('Load failed', e);
    return null;
  }
}

export function loadGame() {
  return loadGameFromSlot(getCurrentSlot());
}

export function clearSlot(slot) {
  localStorage.removeItem(slotKey(slot));
  if (slot === 1) localStorage.removeItem(LEGACY_KEY);
}

export function clearSave() {
  clearSlot(getCurrentSlot());
}

// Returns the raw save JSON exactly as stored, or null if there's nothing to
// export yet - handed straight to a Blob for download, no parsing needed.
export function exportSaveString() {
  return readSlotRaw(getCurrentSlot());
}

// Parses, migrates, and validates an externally-provided save string (e.g.
// from an imported file) before ever writing it to localStorage, so a
// corrupt or unrelated JSON file can't brick the save. Returns true/false.
export function importSaveString(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!looksLikeSave(parsed)) return false;
    const migrated = migrateState(parsed);
    return saveGameToSlot(migrated, getCurrentSlot());
  } catch (e) {
    console.warn('Import failed', e);
    return false;
  }
}

// Lightweight metadata for the save-slot picker - null if the slot is empty.
export function slotSummary(slot) {
  const state = loadGameFromSlot(slot);
  if (!state) return null;
  return {
    slot,
    playerName: state.player.name,
    level: state.player.level,
    currentMap: state.currentMap,
    ngPlusCycle: state.flags.ngPlusCycle || 0
  };
}

export function allSlotSummaries() {
  const summaries = [];
  for (let slot = 1; slot <= SLOT_COUNT; slot++) summaries.push(slotSummary(slot));
  return summaries;
}

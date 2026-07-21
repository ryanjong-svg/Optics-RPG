import { MATERIAL_LIST } from '../data/materials.js';
import { GAME_VERSION } from '../data/changelog.js';

export function newGameState() {
  const materials = {};
  MATERIAL_LIST.forEach(m => { materials[m.id] = 0; });
  return {
    mode: 'overworld', // overworld | battle | dialogue | craft | codex | gameover | victory
    currentMap: 'village',
    pos: { x: 7, y: 8 },
    player: {
      name: 'Apprentice',
      level: 1, xp: 0, xpToNext: 20,
      maxHp: 40, hp: 40, focus: 6,
      maxCharge: 3, charge: 3,
      materials,
      ownedGear: {},
      equipped: { lens: null, mirror: null, prism: null, filter: null },
      consumables: {},
      loadouts: { 1: null, 2: null },
      specialization: null
    },
    flags: {
      seenIntro: false,
      guardianDefeated: {},
      bossDefeated: false,
      takenItems: {},
      visitedMaps: { village: true },
      metNpc: {},
      quizAsked: {},
      quests: {},
      secretsFound: {},
      achievements: {},
      achievementsSeen: {},
      ngPlusCycle: 0,
      hintsShown: {},
      enemiesDefeated: {},
      badgeSeen: { bestiary: 0, codex: 0, chronicle: 0 },
      snellHits: 0,
      specializationsTried: {},
      totalDamageDealt: 0,
      abilityUseCountsLifetime: {},
      fastestBossKillTurns: null,
      totalVictories: 0,
      allAchievementsEarned: false,
      // A brand new game starts fully caught up - only saves that predate
      // this system (backfilled to '1.0.0' in migrateState) should see the
      // What's New panel light up.
      lastSeenVersion: GAME_VERSION
    },
    settings: {
      difficulty: 'normal',
      muted: false,
      musicVolume: 1,
      sfxVolume: 1
    },
    codexUnlocked: {}
  };
}

export function grantXp(state, amount, log) {
  const p = state.player;
  p.xp += amount;
  log(`Gained ${amount} XP.`);
  while (p.xp >= p.xpToNext) {
    p.xp -= p.xpToNext;
    p.level += 1;
    p.maxHp += 8;
    p.focus += 2;
    p.maxCharge += 1;
    p.hp = p.maxHp;
    p.charge = p.maxCharge;
    p.xpToNext = Math.round(p.xpToNext * 1.4);
    log(`Level up! You are now level ${p.level}. Max HP, Focus, and Charge increased, HP and Charge restored.`);
  }
}

// One-time onboarding tips (e.g. "the Quests button tracks this"): the first
// caller for a given hintId gets true and should display the tip; every
// later call (this run or a future one, since it's saved) gets false.
export function claimHint(state, hintId) {
  if (state.flags.hintsShown[hintId]) return false;
  state.flags.hintsShown[hintId] = true;
  return true;
}

export function unlockCodex(state, conceptId, log) {
  if (!conceptId) return;
  if (!state.codexUnlocked[conceptId]) {
    state.codexUnlocked[conceptId] = true;
    if (log) log(`New Codex entry unlocked!`);
  }
}

// Resets exploration progress (guardians, secrets, quests, visited maps,
// event-flagged achievements) for a fresh, tougher run — level, gear,
// materials, and all Codex/Chronicle knowledge carry over unchanged.
export function startNewGamePlus(state) {
  state.flags.ngPlusCycle = (state.flags.ngPlusCycle || 0) + 1;
  state.flags.guardianDefeated = {};
  state.flags.secretsFound = {};
  state.flags.bossDefeated = false;
  state.flags.takenItems = {};
  state.flags.visitedMaps = { village: true };
  state.flags.metNpc = {};
  state.flags.quizAsked = {};
  state.flags.quests = {};
  state.flags.achievements = {};
  state.flags.achievementsSeen = {};
  state.currentMap = 'village';
  state.pos = { x: 7, y: 8 };
  state.mode = 'overworld';
  return state;
}


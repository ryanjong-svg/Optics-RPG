import { MATERIAL_LIST } from '../data/materials.js';

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
      materials,
      ownedGear: {},
      equipped: { lens: null, mirror: null, prism: null, filter: null }
    },
    flags: {
      seenIntro: false,
      guardianDefeated: {},
      bossDefeated: false,
      takenItems: {},
      visitedMaps: { village: true },
      metNpc: {}
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
    p.hp = p.maxHp;
    p.xpToNext = Math.round(p.xpToNext * 1.4);
    log(`Level up! You are now level ${p.level}. Max HP and Focus increased, HP restored.`);
  }
}

export function unlockCodex(state, conceptId, log) {
  if (!conceptId) return;
  if (!state.codexUnlocked[conceptId]) {
    state.codexUnlocked[conceptId] = true;
    if (log) log(`New Codex entry unlocked!`);
  }
}


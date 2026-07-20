import { CODEX } from '../data/codex.js';
import { LORE, isLoreUnlocked } from '../data/lore.js';
import { RECIPES } from '../data/equipment.js';
import { QUESTS } from '../data/quests.js';
import { MAPS } from '../data/maps.js';
import { ACHIEVEMENTS, unlockedAchievements } from '../data/achievements.js';
import { ENEMIES } from '../data/enemies.js';
import { findAbility } from '../data/abilities.js';

const GUARDIAN_MAP_IDS = Object.values(MAPS).filter(m => m.guardian).map(m => m.id);
const SECRET_MAP_IDS = Object.values(MAPS).filter(m => m.secret).map(m => m.id);

function computeStats(state) {
  const guardiansDefeated = GUARDIAN_MAP_IDS.filter(id => state.flags.guardianDefeated[id]).length;
  const questsCompleted = Object.keys(QUESTS).filter(id => state.flags.quests[id] === 'completed').length;
  const codexUnlocked = Object.keys(CODEX).filter(id => state.codexUnlocked[id]).length;
  const chronicleUnlocked = Object.keys(LORE).filter(id => isLoreUnlocked(state, LORE[id])).length;
  const equipmentCrafted = RECIPES.filter(r => state.player.ownedGear[r.id]).length;
  const secretsFound = SECRET_MAP_IDS.filter(id => state.flags.secretsFound && state.flags.secretsFound[id]).length;
  const enemiesCataloged = Object.keys(ENEMIES).filter(id => state.flags.enemiesDefeated[id]).length;

  const rows = [
    { label: 'Guardians Defeated', done: guardiansDefeated, total: GUARDIAN_MAP_IDS.length },
    { label: 'The Null Medium', done: state.flags.bossDefeated ? 1 : 0, total: 1 },
    { label: 'Side Quests Completed', done: questsCompleted, total: Object.keys(QUESTS).length },
    { label: 'Codex Entries Unlocked', done: codexUnlocked, total: Object.keys(CODEX).length },
    { label: 'Chronicle Entries Unlocked', done: chronicleUnlocked, total: Object.keys(LORE).length },
    { label: 'Equipment Crafted', done: equipmentCrafted, total: RECIPES.length },
    { label: 'Hidden Caches Found', done: secretsFound, total: SECRET_MAP_IDS.length },
    { label: 'Bestiary Entries Cataloged', done: enemiesCataloged, total: Object.keys(ENEMIES).length }
  ];

  const totalDone = rows.reduce((s, r) => s + r.done, 0);
  const totalAll = rows.reduce((s, r) => s + r.total, 0);
  const overallPct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;

  return { rows, overallPct };
}

// Lifetime totals, distinct from the completion-percentage rows above: those
// track "how much of the game have you seen," this tracks "how have you
// actually played it" — kept purely additive so a training-dummy practice
// fight (which never touches these flags) can't distort it.
export function computeLifetimeStats(state) {
  const flags = state.flags;
  const useCounts = flags.abilityUseCountsLifetime || {};
  let mostUsedAbility = null;
  let mostUsedCount = 0;
  for (const [id, count] of Object.entries(useCounts)) {
    if (count > mostUsedCount) { mostUsedCount = count; mostUsedAbility = id; }
  }
  const mostUsedName = mostUsedAbility ? (findAbility(mostUsedAbility) || {}).name || mostUsedAbility : null;

  return {
    totalDamageDealt: flags.totalDamageDealt || 0,
    totalVictories: flags.totalVictories || 0,
    fastestBossKillTurns: flags.fastestBossKillTurns != null ? flags.fastestBossKillTurns : null,
    mostUsedAbilityName: mostUsedName,
    mostUsedAbilityCount: mostUsedCount
  };
}

export function openCompletion(game) {
  game.state.mode = 'completion';
  game.showPanel('completion');
  renderCompletion(game);
}

export function closeCompletion(game) {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
}

export function renderCompletion(game) {
  const { rows, overallPct } = computeStats(game.state);
  const cycle = game.state.flags.ngPlusCycle || 0;
  game.dom.completionOverall.textContent = cycle > 0
    ? `${overallPct}% Complete — New Game+ Cycle ${cycle}`
    : `${overallPct}% Complete`;
  game.dom.completionList.innerHTML = rows.map(r => {
    const pct = r.total ? Math.round((r.done / r.total) * 100) : 0;
    return `
      <div class="completion-row">
        <div class="completion-row-head"><span>${r.label}</span><span>${r.done} / ${r.total}</span></div>
        <div class="bar-wrap completion-bar"><div class="bar-fill xp" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');

  if (game.dom.completionStats) {
    const s = computeLifetimeStats(game.state);
    const rows = [
      `Total Damage Dealt: ${s.totalDamageDealt}`,
      `Battles Won: ${s.totalVictories}`,
      `Fastest Null Medium Kill: ${s.fastestBossKillTurns != null ? `${s.fastestBossKillTurns} turn${s.fastestBossKillTurns === 1 ? '' : 's'}` : 'Not yet defeated'}`,
      `Most-Used Ability: ${s.mostUsedAbilityName ? `${s.mostUsedAbilityName} (${s.mostUsedAbilityCount}x)` : 'None yet'}`
    ];
    game.dom.completionStats.innerHTML = rows.map(r => `<div class="completion-row-head"><span>${r}</span></div>`).join('');
  }

  if (game.dom.completionAchievements) {
    const unlockedIds = new Set(unlockedAchievements(game.state).map(([id]) => id));
    const entries = Object.entries(ACHIEVEMENTS);
    game.dom.completionAchievements.innerHTML = entries.map(([id, a]) => {
      const done = unlockedIds.has(id);
      return `
        <div class="codex-entry${done ? '' : ' locked'}">
          <h3>🏆 ${done ? a.title : '???'}</h3>
          <p>${done ? a.desc : 'Not yet discovered.'}</p>
        </div>
      `;
    }).join('');
  }
}

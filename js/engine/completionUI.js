import { CODEX } from '../data/codex.js';
import { LORE, isLoreUnlocked } from '../data/lore.js';
import { RECIPES } from '../data/equipment.js';
import { QUESTS } from '../data/quests.js';
import { MAPS } from '../data/maps.js';

const GUARDIAN_MAP_IDS = Object.values(MAPS).filter(m => m.guardian).map(m => m.id);

function computeStats(state) {
  const guardiansDefeated = GUARDIAN_MAP_IDS.filter(id => state.flags.guardianDefeated[id]).length;
  const questsCompleted = Object.keys(QUESTS).filter(id => state.flags.quests[id] === 'completed').length;
  const codexUnlocked = Object.keys(CODEX).filter(id => state.codexUnlocked[id]).length;
  const chronicleUnlocked = Object.keys(LORE).filter(id => isLoreUnlocked(state, LORE[id])).length;
  const equipmentCrafted = RECIPES.filter(r => state.player.ownedGear[r.id]).length;

  const rows = [
    { label: 'Guardians Defeated', done: guardiansDefeated, total: GUARDIAN_MAP_IDS.length },
    { label: 'The Null Medium', done: state.flags.bossDefeated ? 1 : 0, total: 1 },
    { label: 'Side Quests Completed', done: questsCompleted, total: Object.keys(QUESTS).length },
    { label: 'Codex Entries Unlocked', done: codexUnlocked, total: Object.keys(CODEX).length },
    { label: 'Chronicle Entries Unlocked', done: chronicleUnlocked, total: Object.keys(LORE).length },
    { label: 'Equipment Crafted', done: equipmentCrafted, total: RECIPES.length }
  ];

  const totalDone = rows.reduce((s, r) => s + r.done, 0);
  const totalAll = rows.reduce((s, r) => s + r.total, 0);
  const overallPct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;

  return { rows, overallPct };
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
  game.dom.completionOverall.textContent = `${overallPct}% Complete`;
  game.dom.completionList.innerHTML = rows.map(r => {
    const pct = r.total ? Math.round((r.done / r.total) * 100) : 0;
    return `
      <div class="completion-row">
        <div class="completion-row-head"><span>${r.label}</span><span>${r.done} / ${r.total}</span></div>
        <div class="bar-wrap completion-bar"><div class="bar-fill xp" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');
}

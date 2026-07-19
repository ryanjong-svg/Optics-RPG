import { QUESTS, isObjectiveMet } from '../data/quests.js';
import { MATERIALS } from '../data/materials.js';
import { MAPS } from '../data/maps.js';

export function openQuestLog(game) {
  game.state.mode = 'questlog';
  game.showPanel('questlog');
  renderQuestLog(game);
}

export function closeQuestLog(game) {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
}

export function progressText(state, quest) {
  const obj = quest.objective;
  if (obj.type === 'collect') {
    const have = Math.min(state.player.materials[obj.material] || 0, obj.count);
    return `Collect ${MATERIALS[obj.material].name} (${have}/${obj.count})`;
  }
  if (obj.type === 'defeat_guardian') {
    return `Defeat the guardian of ${MAPS[obj.map].name}`;
  }
  return '';
}

export function npcName(npcId) {
  return { prof_lumen: 'Professor Lumen', prof_mirrors: 'Professor Silvers', prof_labs: 'Professor Gapp' }[npcId] || npcId;
}

export function renderQuestLog(game) {
  const state = game.state;
  const entries = Object.entries(QUESTS);

  const active = entries.filter(([id]) => state.flags.quests[id] === 'active');
  const completed = entries.filter(([id]) => state.flags.quests[id] === 'completed');
  const unstarted = entries.filter(([id]) => !state.flags.quests[id]);

  game.dom.questlogActive.innerHTML = active.length ? active.map(([id, quest]) => {
    const ready = isObjectiveMet(state, quest);
    return `
      <div class="codex-entry${ready ? ' quest-ready' : ''}">
        <h3>${quest.title}${ready ? ' — ready to turn in!' : ''}</h3>
        <p>${progressText(state, quest)}<br>Talk to ${npcName(quest.npc)} to turn it in.</p>
      </div>
    `;
  }).join('') : `<div class="codex-entry locked"><h3>No active quests</h3><p>Talk to a professor in Lumen Village to pick one up.</p></div>`;

  game.dom.questlogUnstarted.innerHTML = unstarted.length ? unstarted.map(() => `
    <div class="codex-entry locked"><h3>??? (undiscovered)</h3><p>Talk to the professors around the village to find more quests.</p></div>
  `).join('') : `<div class="codex-entry locked"><h3>None left</h3><p>Every quest has been offered.</p></div>`;

  game.dom.questlogCompleted.innerHTML = completed.length ? completed.map(([, quest]) => `
    <div class="codex-entry"><h3>${quest.title} ✓</h3><p>Completed for ${npcName(quest.npc)}.</p></div>
  `).join('') : `<div class="codex-entry locked"><h3>None yet</h3><p>Completed quests will appear here.</p></div>`;
}

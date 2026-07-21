import { allSlotSummaries, getCurrentSlot, setCurrentSlot, clearSlot, loadGame, saveGame, getSlotName, setSlotName } from './save.js';
import { newGameState } from './state.js';
import { renderOverworld } from '../world/overworld.js';
import { MAPS } from '../../data/maps.js';
import * as audio from '../audio.js';

export function renderSaveSlots(game) {
  const current = getCurrentSlot();
  const summaries = allSlotSummaries();
  game.dom.settingsSlots.innerHTML = summaries.map((s, i) => {
    const slot = i + 1;
    const isCurrent = slot === current;
    const name = getSlotName(slot);
    const heading = `Slot ${slot}${name ? ` — ${name}` : ''}${isCurrent ? ' (current)' : ''}`;
    const label = s
      ? `Lv.${s.level} · ${(MAPS[s.currentMap] || {}).name || s.currentMap}${s.ngPlusCycle ? ` · NG+${s.ngPlusCycle}` : ''}`
      : 'Empty — start a new game here';
    return `
      <div class="slot-row${isCurrent ? ' slot-row-current' : ''}">
        <div class="slot-row-head"><span>${heading}</span></div>
        <div class="slot-row-desc">${label}</div>
        <div class="slot-row-actions">
          <button class="action-btn slot-switch" data-slot="${slot}" ${isCurrent ? 'disabled' : ''}>${isCurrent ? 'Playing' : 'Switch'}</button>
          <button class="action-btn ghost slot-rename" data-slot="${slot}">Rename</button>
          ${s ? `<button class="action-btn ghost slot-clear" data-slot="${slot}">Clear</button>` : ''}
        </div>
      </div>
    `;
  }).join('');

  game.dom.settingsSlots.querySelectorAll('.slot-switch').forEach(btn => {
    btn.onclick = () => switchToSlot(game, Number(btn.dataset.slot));
  });
  game.dom.settingsSlots.querySelectorAll('.slot-rename').forEach(btn => {
    btn.onclick = () => {
      const slot = Number(btn.dataset.slot);
      const name = window.prompt('Name this save slot (leave blank to clear the name):', getSlotName(slot) || '');
      if (name === null) return;
      setSlotName(slot, name.trim());
      renderSaveSlots(game);
    };
  });
  game.dom.settingsSlots.querySelectorAll('.slot-clear').forEach(btn => {
    btn.onclick = () => {
      const slot = Number(btn.dataset.slot);
      const confirmed = window.confirm(`Permanently delete the save in Slot ${slot}? This can't be undone.`);
      if (!confirmed) return;
      clearSlot(slot);
      renderSaveSlots(game);
    };
  });
}

// Switching slots reloads the entire game object in place - a brand new
// state if the target slot is empty, or that slot's own save otherwise -
// then re-renders everything a fresh page load would have set up.
export function switchToSlot(game, slot) {
  setCurrentSlot(slot);
  game.battle = null;
  game.dialogue = null;
  game.state = loadGame() || newGameState();
  saveGame(game.state);
  game.state.mode = 'overworld';
  game.showPanel('overworld');
  renderOverworld(game);
  game.renderHud();
  game.updateBadges();
  audio.stopMusic();
  audio.playOverworldMusic();
  audio.playZoneAmbience(MAPS[game.state.currentMap].zone);
  renderSaveSlots(game);
}

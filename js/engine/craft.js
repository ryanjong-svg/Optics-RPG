import { RECIPES, findRecipe } from '../data/equipment.js';
import { MATERIALS } from '../data/materials.js';
import { CONSUMABLES } from '../data/consumables.js';
import { unlockCodex } from './state.js';
import { saveGame } from './save.js';
import { canCraftConsumable, craftConsumable, useConsumableOutOfBattle } from './consumables.js';
import * as audio from './audio.js';

const CONCEPT_BY_SLOT_HINT = {
  lens: 'snell', mirror: 'reflection', prism: 'dispersion', filter: 'polarization'
};

// Turns a recipe's built stats into plain-English, real-number gameplay
// effects — the physics `fact` text explains *why*, this explains *what it
// actually does for your stats*.
function describeStats(stats) {
  const lines = [];
  if (stats.focusPower !== undefined) {
    lines.push(`Focus Power ${stats.focusPower} — adds ${Math.round(stats.focusPower * 0.6)} flat damage to Refraction Bend`);
  }
  if (stats.critBonus) {
    lines.push(`+${Math.round(stats.critBonus * 100)}% crit chance on Laser Focus`);
  }
  if (stats.evasionBonus) {
    lines.push(`+${Math.round(stats.evasionBonus * 100)}% chance to dodge an enemy attack entirely`);
  }
  if (stats.reflectivity !== undefined) {
    lines.push(`${Math.round(stats.reflectivity * 100)}% reflectivity — boosts Reflect Strike damage`);
  }
  if (stats.defenseBonus) {
    lines.push(`-${stats.defenseBonus} flat damage from every enemy attack`);
  }
  if (stats.glareReduction) {
    lines.push(`-${Math.round(stats.glareReduction * 100)}% damage from glare attacks (Polarize Filter)`);
  }
  if (stats.tirBonus) {
    lines.push(`+${Math.round(stats.tirBonus * 100)}% TIR Shield block chance`);
  }
  if (stats.bandgapPierce) {
    lines.push(`Photoelectric Shock always clears the band gap`);
  }
  if (stats.diffractionBonus) {
    lines.push(`+${Math.round(stats.diffractionBonus * 100)}% Diffraction Wave defense-ignore`);
  }
  if (stats.hologramBonus) {
    lines.push(`+${Math.round(stats.hologramBonus * 100)}% Interference Cancel full-negate chance`);
  }
  if (stats.dispersionBonus) {
    lines.push(`+${stats.dispersionBonus} flat damage per hit on Dispersion Burst`);
  }
  if (stats.abbe !== undefined) {
    const hits = Math.max(2, Math.min(7, Math.round(280 / stats.abbe)));
    lines.push(stats.correctsChroma
      ? `Corrects chromatic smear; Dispersion Burst splits into ${hits} hits`
      : `Dispersion Burst splits into ${hits} hits (Abbe ${stats.abbe})`);
  }
  return lines;
}

export function openCraft(game) {
  game.state.mode = 'craft';
  game.showPanel('craft');
  renderCraft(game);
}

export function closeCraft(game) {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
  saveGame(game.state);
}

function canAfford(player, recipe) {
  return recipe.materials.every(matId => (player.materials[matId] || 0) >= recipe.count);
}

export function craftItem(game, recipeId) {
  const recipe = findRecipe(recipeId);
  const player = game.state.player;
  if (!recipe || player.ownedGear[recipeId] || !canAfford(player, recipe)) return;
  recipe.materials.forEach(matId => { player.materials[matId] -= recipe.count; });
  player.ownedGear[recipeId] = true;
  if (!player.equipped[recipe.slot]) player.equipped[recipe.slot] = recipeId;
  unlockCodex(game.state, CONCEPT_BY_SLOT_HINT[recipe.slot], null);
  audio.playCraftSuccess();
  saveGame(game.state);
  renderCraft(game);
}

export function equipItem(game, slot, recipeId) {
  game.state.player.equipped[slot] = recipeId || null;
  saveGame(game.state);
  renderCraft(game);
}

// Loadouts are just a saved snapshot of `equipped` - no new gear is created,
// so switching builds mid-adventure doesn't need a trip through every dropdown.
// Pure state mutations (no dom/save side effects) so they stay unit-testable;
// saveLoadout()/loadLoadout() below are the UI-wired versions callers use.
export function applySaveLoadout(state, slot) {
  state.player.loadouts[slot] = { ...state.player.equipped };
}

export function applyLoadLoadout(state, slot) {
  const player = state.player;
  const loadout = player.loadouts[slot];
  if (!loadout) return false;
  ['lens', 'mirror', 'prism', 'filter'].forEach(s => {
    const recipeId = loadout[s];
    player.equipped[s] = (recipeId && player.ownedGear[recipeId]) ? recipeId : null;
  });
  return true;
}

export function saveLoadout(game, slot) {
  applySaveLoadout(game.state, slot);
  saveGame(game.state);
  renderCraft(game);
}

export function loadLoadout(game, slot) {
  if (!applyLoadLoadout(game.state, slot)) return;
  saveGame(game.state);
  renderCraft(game);
}

function craftConsumableAndRender(game, itemId) {
  craftConsumable(game, itemId);
  renderCraft(game);
}

function useConsumableAndRender(game, itemId) {
  useConsumableOutOfBattle(game, itemId);
  game.renderHud();
  renderCraft(game);
}

export function renderCraft(game) {
  const player = game.state.player;
  const d = game.dom;

  d.craftMaterials.innerHTML = Object.values(MATERIALS).map(m => {
    const count = player.materials[m.id] || 0;
    return `<div class="mat-chip" title="${m.fact}"><span>${m.glyph}</span> ${m.name} <b>${count}</b></div>`;
  }).join('');

  if (d.craftLoadouts) {
    d.craftLoadouts.innerHTML = '';
    [1, 2].forEach(slot => {
      const loadout = player.loadouts[slot];
      const summary = loadout
        ? ['lens', 'mirror', 'prism', 'filter'].map(s => loadout[s] ? findRecipe(loadout[s]).name : '(none)').join(' • ')
        : 'Empty — nothing saved yet.';
      const row = document.createElement('div');
      row.className = 'recipe-row';
      row.innerHTML = `
        <div class="recipe-head"><strong>Loadout ${slot}</strong></div>
        <div class="recipe-req">${summary}</div>
      `;
      const btnRow = document.createElement('div');
      btnRow.className = 'recipe-btn-row';
      const saveBtn = document.createElement('button');
      saveBtn.className = 'action-btn';
      saveBtn.textContent = 'Save Current';
      saveBtn.onclick = () => saveLoadout(game, slot);
      const loadBtn = document.createElement('button');
      loadBtn.className = 'action-btn';
      loadBtn.textContent = 'Load';
      loadBtn.disabled = !loadout;
      loadBtn.onclick = () => loadLoadout(game, slot);
      btnRow.appendChild(saveBtn);
      btnRow.appendChild(loadBtn);
      row.appendChild(btnRow);
      d.craftLoadouts.appendChild(row);
    });
  }

  d.craftConsumables.innerHTML = '';
  CONSUMABLES.forEach(item => {
    const owned = player.consumables[item.id] || 0;
    const affordable = canCraftConsumable(player, item);
    const reqText = item.materials.map(mId => `${MATERIALS[mId].name} x${item.count}`).join(', ');
    const row = document.createElement('div');
    row.className = 'recipe-row';
    row.innerHTML = `
      <div class="recipe-head"><span>${item.glyph}</span> <strong>${item.name}</strong> <span class="slot-tag">x${owned}</span></div>
      <div class="recipe-req">Needs: ${reqText}</div>
      <ul class="recipe-effects"><li>Restores ${item.heal} HP</li></ul>
      <div class="recipe-fact">${item.fact}</div>
    `;
    const btnRow = document.createElement('div');
    btnRow.className = 'recipe-btn-row';
    const craftBtn = document.createElement('button');
    craftBtn.className = 'action-btn';
    craftBtn.textContent = affordable ? 'Craft' : 'Need materials';
    craftBtn.disabled = !affordable;
    craftBtn.onclick = () => craftConsumableAndRender(game, item.id);
    const useBtn = document.createElement('button');
    useBtn.className = 'action-btn';
    const full = player.hp >= player.maxHp;
    useBtn.textContent = full ? 'Full HP' : 'Use';
    useBtn.disabled = owned <= 0 || full;
    useBtn.onclick = () => useConsumableAndRender(game, item.id);
    btnRow.appendChild(craftBtn);
    btnRow.appendChild(useBtn);
    row.appendChild(btnRow);
    d.craftConsumables.appendChild(row);
  });

  d.craftRecipes.innerHTML = '';
  RECIPES.forEach(recipe => {
    const owned = !!player.ownedGear[recipe.id];
    const affordable = canAfford(player, recipe);
    const reqText = recipe.materials.map(mId => `${MATERIALS[mId].name} x${recipe.count}`).join(', ');
    const effectLines = describeStats(recipe.build());
    const row = document.createElement('div');
    row.className = 'recipe-row';
    row.innerHTML = `
      <div class="recipe-head"><span>${recipe.glyph}</span> <strong>${recipe.name}</strong> <span class="slot-tag">${recipe.slot}</span></div>
      <div class="recipe-req">Needs: ${reqText}</div>
      <ul class="recipe-effects">${effectLines.map(l => `<li>${l}</li>`).join('')}</ul>
      <div class="recipe-fact">${recipe.fact}</div>
    `;
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    if (owned) {
      btn.textContent = 'Crafted';
      btn.disabled = true;
    } else {
      btn.textContent = affordable ? 'Craft' : 'Need materials';
      btn.disabled = !affordable;
      btn.onclick = () => craftItem(game, recipe.id);
    }
    row.appendChild(btn);
    d.craftRecipes.appendChild(row);
  });

  d.craftEquipped.innerHTML = '';
  ['lens', 'mirror', 'prism', 'filter'].forEach(slot => {
    const owned = RECIPES.filter(r => r.slot === slot && player.ownedGear[r.id]);
    const wrap = document.createElement('div');
    wrap.className = 'equip-slot';
    const select = document.createElement('select');
    const noneOpt = document.createElement('option');
    noneOpt.value = ''; noneOpt.textContent = '(none)';
    select.appendChild(noneOpt);
    owned.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id; opt.textContent = r.name;
      if (player.equipped[slot] === r.id) opt.selected = true;
      select.appendChild(opt);
    });
    if (!player.equipped[slot]) noneOpt.selected = true;
    select.onchange = () => equipItem(game, slot, select.value);
    wrap.innerHTML = `<label>${slot.toUpperCase()}</label>`;
    wrap.appendChild(select);

    const equippedRecipe = owned.find(r => r.id === player.equipped[slot]);
    const effectEl = document.createElement('div');
    effectEl.className = 'equip-effect';
    effectEl.textContent = equippedRecipe
      ? describeStats(equippedRecipe.build()).join(' • ')
      : 'No bonus equipped';
    wrap.appendChild(effectEl);

    d.craftEquipped.appendChild(wrap);
  });
}

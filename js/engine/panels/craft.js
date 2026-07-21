import { RECIPES, findRecipe } from '../../data/equipment.js';
import { MATERIALS } from '../../data/materials.js';
import { CONSUMABLES } from '../../data/consumables.js';
import { unlockCodex } from '../core/state.js';
import { saveGame } from '../core/save.js';
import { canCraftConsumable, craftConsumable, useConsumableOutOfBattle } from '../core/consumables.js';
import { applySaveLoadout, applyLoadLoadout, applyRenameLoadout } from '../core/gear.js';
import { SPECIALIZATIONS } from '../../data/specializations.js';
import { startBattle } from '../battle/battle.js';
import { renderBounties } from '../battle/bountyUI.js';
import * as audio from '../audio.js';

const SPECIALIZATION_LEVEL = 5;

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
    const bonus = stats.bandgapPierceEV != null ? stats.bandgapPierceEV : 0.8;
    lines.push(`+${bonus.toFixed(1)} eV photon energy for Photoelectric Shock — always clears the band gap`);
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

// A recipe with `upgradesFrom` combines an owned predecessor with fresh
// materials into a stronger item in the same slot, instead of building from
// raw materials alone — so it also requires already owning that predecessor.
export function canCraftRecipe(player, recipe) {
  if (recipe.upgradesFrom && !player.ownedGear[recipe.upgradesFrom]) return false;
  return recipe.materials.every(matId => (player.materials[matId] || 0) >= recipe.count);
}

// Pure state mutation (no dom/save/audio side effects) so it stays
// unit-testable; craftItem() below is the UI-wired version callers use.
// Combining consumes the predecessor recipe (no longer owned), and carries
// its equipped slot over to the new item — a seamless upgrade, not a swap
// to nothing.
export function applyCraftRecipe(player, recipe) {
  if (player.ownedGear[recipe.id] || !canCraftRecipe(player, recipe)) return false;
  recipe.materials.forEach(matId => { player.materials[matId] -= recipe.count; });
  if (recipe.upgradesFrom) {
    player.ownedGear[recipe.upgradesFrom] = false;
  }
  player.ownedGear[recipe.id] = true;
  if (!player.equipped[recipe.slot] || player.equipped[recipe.slot] === recipe.upgradesFrom) {
    player.equipped[recipe.slot] = recipe.id;
  }
  return true;
}

export function craftItem(game, recipeId) {
  const recipe = findRecipe(recipeId);
  if (!recipe || !applyCraftRecipe(game.state.player, recipe)) return;
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

export function saveLoadout(game, slot) {
  applySaveLoadout(game.state, slot);
  saveGame(game.state);
  renderCraft(game);
}

export function renameLoadout(game, slot) {
  const loadout = game.state.player.loadouts[slot];
  if (!loadout) return;
  const name = window.prompt('Name this loadout:', loadout.name || '');
  if (name === null) return;
  applyRenameLoadout(game.state, slot, name.trim());
  saveGame(game.state);
  renderCraft(game);
}

// Free to pick and re-pick at will once unlocked (level 5+) — this is a
// build-identity choice, not a resource sink, so there's no reason to punish
// experimenting with the other path. Also records which specializations have
// ever been chosen (state.flags.specializationsTried), for the "tried both
// paths" achievement — that's a lifetime record, so it's not cleared when
// switching back to null.
export function applySetSpecialization(state, specId) {
  const player = state.player;
  if (player.level < SPECIALIZATION_LEVEL) return false;
  if (specId !== null && !SPECIALIZATIONS[specId]) return false;
  player.specialization = specId;
  if (specId !== null) {
    if (!state.flags.specializationsTried) state.flags.specializationsTried = {};
    state.flags.specializationsTried[specId] = true;
  }
  return true;
}

export function setSpecialization(game, specId) {
  if (!applySetSpecialization(game.state, specId)) return;
  audio.playCraftSuccess();
  saveGame(game.state);
  renderCraft(game);
}

// Charge only otherwise recovers by 1 per completed battle round, and
// persists between fights like HP does - Meditate is the one place (only
// here, only at the Workbench) to fully top it off between adventures.
export function applyMeditate(player) {
  if (player.charge >= player.maxCharge) return false;
  player.charge = player.maxCharge;
  return true;
}

export function meditate(game) {
  if (!applyMeditate(game.state.player)) return;
  audio.playHeal();
  saveGame(game.state);
  renderCraft(game);
}

// A zero-risk battle against a training dummy: no damage taken, no XP,
// materials, Bestiary entry, or achievements — purely for trying out a
// loadout/specialization/puzzle timing before it matters for real.
export function practiceAtDummy(game) {
  startBattle(game, 'training_dummy', { practice: true, introText: 'You set up the training dummy for a sparring round.' });
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

  if (d.craftMeditate) {
    const full = player.charge >= player.maxCharge;
    d.craftMeditate.innerHTML = `<div class="recipe-row"><div class="recipe-req">Charge: ${player.charge} / ${player.maxCharge}</div></div>`;
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.textContent = full ? 'Charge Full' : 'Meditate';
    btn.disabled = full;
    btn.onclick = () => meditate(game);
    d.craftMeditate.querySelector('.recipe-row').appendChild(btn);
  }

  if (d.craftPractice) {
    d.craftPractice.innerHTML = '<div class="recipe-row"><div class="recipe-req">Training Dummy: 60 HP, deals no damage</div></div>';
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.textContent = 'Spar';
    btn.onclick = () => practiceAtDummy(game);
    d.craftPractice.querySelector('.recipe-row').appendChild(btn);
  }

  renderBounties(game);

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
      const heading = `Loadout ${slot}${loadout && loadout.name ? ` — ${loadout.name}` : ''}`;
      const row = document.createElement('div');
      row.className = 'recipe-row';
      row.innerHTML = `
        <div class="recipe-head"><strong>${heading}</strong></div>
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
      const renameBtn = document.createElement('button');
      renameBtn.className = 'action-btn ghost';
      renameBtn.textContent = 'Rename';
      renameBtn.disabled = !loadout;
      renameBtn.onclick = () => renameLoadout(game, slot);
      btnRow.appendChild(saveBtn);
      btnRow.appendChild(loadBtn);
      btnRow.appendChild(renameBtn);
      row.appendChild(btnRow);
      d.craftLoadouts.appendChild(row);
    });
  }

  if (d.craftSpecialization) {
    d.craftSpecialization.innerHTML = '';
    if (player.level < SPECIALIZATION_LEVEL) {
      const row = document.createElement('div');
      row.className = 'recipe-row';
      row.innerHTML = `<div class="recipe-req">Reach character level ${SPECIALIZATION_LEVEL} to choose a specialization.</div>`;
      d.craftSpecialization.appendChild(row);
    } else {
      Object.values(SPECIALIZATIONS).forEach(spec => {
        const active = player.specialization === spec.id;
        const row = document.createElement('div');
        row.className = `recipe-row${active ? ' quest-ready' : ''}`;
        row.innerHTML = `
          <div class="recipe-head"><strong>${spec.name}</strong>${active ? ' <span class="slot-tag">Active</span>' : ''}</div>
          <div class="recipe-req">${spec.desc}</div>
        `;
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = active ? 'Active' : 'Choose';
        btn.disabled = active;
        btn.onclick = () => setSpecialization(game, spec.id);
        row.appendChild(btn);
        d.craftSpecialization.appendChild(row);
      });
      if (player.specialization) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'action-btn ghost';
        clearBtn.textContent = 'Clear Specialization';
        clearBtn.onclick = () => setSpecialization(game, null);
        d.craftSpecialization.appendChild(clearBtn);
      }
    }
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
  const SLOT_LABELS = { lens: 'Lenses', mirror: 'Mirrors', prism: 'Prisms', filter: 'Filters' };
  ['lens', 'mirror', 'prism', 'filter'].forEach(slot => {
    const slotRecipes = RECIPES.filter(r => r.slot === slot);
    if (!slotRecipes.length) return;
    const heading = document.createElement('h3');
    heading.className = 'completion-subhead';
    heading.textContent = SLOT_LABELS[slot];
    d.craftRecipes.appendChild(heading);

    slotRecipes.forEach(recipe => {
      const owned = !!player.ownedGear[recipe.id];
      const predecessor = recipe.upgradesFrom ? findRecipe(recipe.upgradesFrom) : null;
      const matReqText = recipe.materials.map(mId => `${MATERIALS[mId].name} x${recipe.count}`).join(', ');
      const reqText = predecessor ? `${predecessor.name} + ${matReqText}` : matReqText;
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
      } else if (predecessor && !player.ownedGear[predecessor.id]) {
        btn.textContent = `Craft ${predecessor.name} first`;
        btn.disabled = true;
      } else {
        const craftable = canCraftRecipe(player, recipe);
        btn.textContent = craftable ? (predecessor ? 'Combine' : 'Craft') : 'Need materials';
        btn.disabled = !craftable;
        btn.onclick = () => {
          if (predecessor && !window.confirm(
            `Combine your ${predecessor.name} with these materials into a ${recipe.name}? The ${predecessor.name} will be consumed.`
          )) return;
          craftItem(game, recipe.id);
        };
      }
      row.appendChild(btn);
      d.craftRecipes.appendChild(row);
    });
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

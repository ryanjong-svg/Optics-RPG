import { RECIPES, findRecipe } from '../data/equipment.js';
import { MATERIALS } from '../data/materials.js';
import { unlockCodex } from './state.js';
import { saveGame } from './save.js';

const CONCEPT_BY_SLOT_HINT = {
  lens: 'snell', mirror: 'reflection', prism: 'dispersion', filter: 'polarization'
};

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
  saveGame(game.state);
  renderCraft(game);
}

export function equipItem(game, slot, recipeId) {
  game.state.player.equipped[slot] = recipeId || null;
  saveGame(game.state);
  renderCraft(game);
}

export function renderCraft(game) {
  const player = game.state.player;
  const d = game.dom;

  d.craftMaterials.innerHTML = Object.values(MATERIALS).map(m => {
    const count = player.materials[m.id] || 0;
    return `<div class="mat-chip" title="${m.fact}"><span>${m.glyph}</span> ${m.name} <b>${count}</b></div>`;
  }).join('');

  d.craftRecipes.innerHTML = '';
  RECIPES.forEach(recipe => {
    const owned = !!player.ownedGear[recipe.id];
    const affordable = canAfford(player, recipe);
    const reqText = recipe.materials.map(mId => `${MATERIALS[mId].name} x${recipe.count}`).join(', ');
    const row = document.createElement('div');
    row.className = 'recipe-row';
    row.innerHTML = `
      <div class="recipe-head"><span>${recipe.glyph}</span> <strong>${recipe.name}</strong> <span class="slot-tag">${recipe.slot}</span></div>
      <div class="recipe-req">Needs: ${reqText}</div>
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
    d.craftEquipped.appendChild(wrap);
  });
}

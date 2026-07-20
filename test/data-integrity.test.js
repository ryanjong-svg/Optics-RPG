// Cross-reference checks between data files. These exist because two real
// bugs slipped through manual browser testing this session: equipment stats
// that were computed but never read anywhere, and a professor quest
// assignment that broke the intended 1-collect+1-defeat symmetry. Neither
// crashed anything or showed an error - they just silently did nothing or
// did the wrong thing, which is exactly what these tests are for.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MATERIALS } from '../js/data/materials.js';
import { RECIPES } from '../js/data/equipment.js';
import { ABILITIES, findAbility } from '../js/data/abilities.js';
import { ENEMIES } from '../js/data/enemies.js';
import { MAPS } from '../js/data/maps.js';
import { QUESTS } from '../js/data/quests.js';
import { LORE } from '../js/data/lore.js';
import { CODEX } from '../js/data/codex.js';
import { CHARACTER_SPRITES, PALETTES, SHAPES, itemSprite } from '../js/data/pixelArt.js';
import { BACKDROP_THEMES } from '../js/engine/pixelSprites.js';
import { ZONE_ENCOUNTERS, ZONE_WALL_COLORS } from '../js/engine/overworld.js';
import { CONSUMABLES } from '../js/data/consumables.js';

const VALID_SLOTS = new Set(['lens', 'mirror', 'prism', 'filter']);
const ATTACK_ABILITY_IDS = new Set(ABILITIES.filter(a => a.type === 'attack').map(a => a.id));
const PROFESSOR_IDS = new Set(['prof_lumen', 'prof_mirrors', 'prof_labs']);

// Each depth zone is reached from, and returns to, exactly one parent zone —
// not the village hub. This is the core structural claim of the "deeper
// zones" expansion, so it gets its own explicit regression test.
const DEPTH_ZONE_PARENTS = {
  mirrors_deep: 'mirrors',
  prism_deep: 'prism',
  fiber_deep: 'fiber',
  grating_deep: 'grating',
  hologram_deep: 'hologram',
  lab_deep: 'lab'
};

test('every recipe requires materials that exist', () => {
  for (const recipe of RECIPES) {
    for (const matId of recipe.materials) {
      assert.ok(MATERIALS[matId], `${recipe.id} requires unknown material "${matId}"`);
    }
    assert.ok(VALID_SLOTS.has(recipe.slot), `${recipe.id} has invalid slot "${recipe.slot}"`);
  }
});

test('every recipe upgradesFrom reference is a real recipe in the same slot', () => {
  for (const recipe of RECIPES) {
    if (!recipe.upgradesFrom) continue;
    const predecessor = RECIPES.find(r => r.id === recipe.upgradesFrom);
    assert.ok(predecessor, `${recipe.id} upgradesFrom unknown recipe "${recipe.upgradesFrom}"`);
    assert.equal(predecessor.slot, recipe.slot, `${recipe.id} upgradesFrom a recipe in a different slot`);
    assert.notEqual(predecessor.id, recipe.id, `${recipe.id} cannot upgrade from itself`);
  }
});

test('every consumable requires materials that exist', () => {
  for (const item of CONSUMABLES) {
    for (const matId of item.materials) {
      assert.ok(MATERIALS[matId], `${item.id} requires unknown material "${matId}"`);
    }
  }
});

test('every enemy weakness/resistance references a real attack ability (not a defense/utility ability)', () => {
  for (const enemy of Object.values(ENEMIES)) {
    for (const abilityId of [...(enemy.weakTo || []), ...(enemy.resists || [])]) {
      assert.ok(findAbility(abilityId), `${enemy.id} references unknown ability "${abilityId}"`);
      assert.ok(
        ATTACK_ABILITY_IDS.has(abilityId),
        `${enemy.id} lists "${abilityId}" as a weakness/resistance, but it's not an attack-type ability ` +
        `so the matchup bonus can never trigger`
      );
    }
  }
});

test('every enemy drop material exists', () => {
  for (const enemy of Object.values(ENEMIES)) {
    for (const matId of enemy.mats || []) {
      assert.ok(MATERIALS[matId], `${enemy.id} drops unknown material "${matId}"`);
    }
  }
});

test('every map guardian/boss references a real enemy', () => {
  for (const map of Object.values(MAPS)) {
    if (map.guardian) assert.ok(ENEMIES[map.guardian.enemyId], `${map.id} guardian references unknown enemy "${map.guardian.enemyId}"`);
    if (map.boss) assert.ok(ENEMIES[map.boss.enemyId], `${map.id} boss references unknown enemy "${map.boss.enemyId}"`);
  }
});

test('every zone encounter pool references a real enemy that actually belongs to that zone', () => {
  for (const [zone, enemyIds] of Object.entries(ZONE_ENCOUNTERS)) {
    assert.ok(MAPS[zone], `ZONE_ENCOUNTERS references unknown map "${zone}"`);
    for (const enemyId of enemyIds) {
      const enemy = ENEMIES[enemyId];
      assert.ok(enemy, `zone "${zone}" encounter pool references unknown enemy "${enemyId}"`);
      assert.equal(enemy.zone, zone, `enemy "${enemyId}" is listed under zone "${zone}" but its own zone field says "${enemy.zone}"`);
    }
  }
});

test('every non-village, non-boss-only map has a wall color and every wall color maps to a real map', () => {
  for (const map of Object.values(MAPS)) {
    assert.ok(ZONE_WALL_COLORS[map.zone], `map "${map.id}" (zone "${map.zone}") has no wall color entry`);
  }
});

test('every zone has a battle backdrop theme, so no zone silently falls back to the default look', () => {
  for (const map of Object.values(MAPS)) {
    assert.ok(BACKDROP_THEMES[map.zone], `map "${map.id}" (zone "${map.zone}") has no BACKDROP_THEMES entry`);
  }
});

test('every character sprite reference resolves to a real shape and palette', () => {
  for (const [id, sprite] of Object.entries(CHARACTER_SPRITES)) {
    assert.ok(SHAPES[sprite.shape], `sprite for "${id}" references unknown shape "${sprite.shape}"`);
    assert.ok(PALETTES[sprite.palette], `sprite for "${id}" references unknown palette "${sprite.palette}"`);
  }
});

test('every material has a matching item-pickup gem palette', () => {
  for (const matId of Object.keys(MATERIALS)) {
    const sprite = itemSprite(matId);
    assert.ok(PALETTES[sprite.palette], `material "${matId}" has no matching gem palette "${sprite.palette}" - item pickups for it would render invisible`);
  }
});

test('every quest references a real professor, and collect/defeat objectives reference real materials/maps', () => {
  for (const [id, quest] of Object.entries(QUESTS)) {
    assert.ok(PROFESSOR_IDS.has(quest.npc), `quest "${id}" assigned to unknown npc "${quest.npc}"`);
    if (quest.objective.type === 'collect') {
      assert.ok(MATERIALS[quest.objective.material], `quest "${id}" collect objective references unknown material "${quest.objective.material}"`);
    } else if (quest.objective.type === 'defeat_guardian') {
      const map = MAPS[quest.objective.map];
      assert.ok(map, `quest "${id}" defeat objective references unknown map "${quest.objective.map}"`);
      assert.ok(map.guardian, `quest "${id}" defeat objective targets map "${quest.objective.map}", which has no guardian`);
    } else {
      assert.fail(`quest "${id}" has unrecognized objective type "${quest.objective.type}"`);
    }
    if (quest.reward.material) {
      assert.ok(MATERIALS[quest.reward.material.id], `quest "${id}" reward references unknown material "${quest.reward.material.id}"`);
    }
  }
});

test('quest symmetry: each professor offers exactly one collect quest and one defeat quest', () => {
  for (const npcId of PROFESSOR_IDS) {
    const npcQuests = Object.values(QUESTS).filter(q => q.npc === npcId);
    const collectCount = npcQuests.filter(q => q.objective.type === 'collect').length;
    const defeatCount = npcQuests.filter(q => q.objective.type === 'defeat_guardian').length;
    assert.equal(npcQuests.length, 2, `${npcId} should have exactly 2 quests, has ${npcQuests.length}`);
    assert.equal(collectCount, 1, `${npcId} should have exactly 1 collect quest, has ${collectCount}`);
    assert.equal(defeatCount, 1, `${npcId} should have exactly 1 defeat quest, has ${defeatCount}`);
  }
});

test('every Chronicle (lore) unlock condition references a real map or professor', () => {
  for (const [id, entry] of Object.entries(LORE)) {
    if (entry.unlock.type === 'map') assert.ok(MAPS[entry.unlock.map], `lore "${id}" references unknown map "${entry.unlock.map}"`);
    if (entry.unlock.type === 'npc') assert.ok(PROFESSOR_IDS.has(entry.unlock.npc), `lore "${id}" references unknown npc "${entry.unlock.npc}"`);
  }
});

test('every ability concept has a matching Codex entry', () => {
  for (const ability of ABILITIES) {
    assert.ok(CODEX[ability.concept], `ability "${ability.id}" concept "${ability.concept}" has no matching Codex entry`);
  }
});

test('the boss phase sequence references real attack abilities', () => {
  const boss = Object.values(ENEMIES).find(e => e.isBoss);
  assert.ok(boss, 'no boss enemy found');
  for (const abilityId of boss.phases) {
    assert.ok(ATTACK_ABILITY_IDS.has(abilityId), `boss phase references "${abilityId}", which is not a valid attack ability`);
  }
});

test('every depth zone is reachable only from its designated parent zone, and returns only to it', () => {
  for (const [childId, parentId] of Object.entries(DEPTH_ZONE_PARENTS)) {
    const child = MAPS[childId];
    const parent = MAPS[parentId];
    assert.ok(child, `depth zone "${childId}" is missing from MAPS`);
    assert.ok(parent, `parent zone "${parentId}" is missing from MAPS`);

    const parentToChild = (parent.exits || []).filter(e => e.to === childId);
    assert.equal(parentToChild.length, 1, `"${parentId}" should have exactly one exit into "${childId}"`);

    const childExits = child.exits || [];
    assert.equal(childExits.length, 1, `"${childId}" should have exactly one exit (back to its parent)`);
    assert.equal(childExits[0].to, parentId, `"${childId}" should only exit back to "${parentId}"`);
  }
});

test('every depth zone declares a codexConcept that matches a real Codex entry', () => {
  for (const childId of Object.keys(DEPTH_ZONE_PARENTS)) {
    const map = MAPS[childId];
    assert.ok(map.codexConcept, `depth zone "${childId}" has no codexConcept`);
    assert.ok(CODEX[map.codexConcept], `depth zone "${childId}" references unknown codex concept "${map.codexConcept}"`);
  }
});

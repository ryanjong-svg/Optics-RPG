import { ABILITIES, findAbility } from '../data/abilities.js';
import { makeEnemyInstance, weaknessResistanceText } from '../data/enemies.js';
import { MATERIALS } from '../data/materials.js';
import { MAPS } from '../data/maps.js';
import { GUARDIAN_INTRO, BOSS_INTRO } from '../data/dialogue.js';
import { CHARACTER_SPRITES } from '../data/pixelArt.js';
import { ACHIEVEMENTS, checkNewAchievements, formatAchievementLines } from '../data/achievements.js';
import { CODEX } from '../data/codex.js';
import { CONSUMABLES, findConsumable } from '../data/consumables.js';
import { findDifficulty } from '../data/difficulty.js';
import { drawSprite, drawZoneBackdrop, playerPaletteFor } from './pixelSprites.js';
import { buildGear } from './gear.js';
import { grantXp, unlockCodex, claimHint } from './state.js';
import { saveGame } from './save.js';
import { applyConsumable } from './consumables.js';
import { showToast } from './toastUI.js';
import { SPECIALIZATIONS } from '../data/specializations.js';
import { openSnellPuzzle } from './snellPuzzleUI.js';
import { openDiffractionPuzzle } from './diffractionPuzzleUI.js';
import { openBrewsterPuzzle } from './brewsterPuzzleUI.js';
import * as audio from './audio.js';

// A personal "Bestiary": once you've beaten an enemy type before, its known
// weakness/resistance is surfaced up front on the next encounter, turning
// "remember what worked last time" into an explicit part of the teaching.
export function bestiaryHintText(enemy) {
  const text = weaknessResistanceText(enemy);
  return text ? `📖 Bestiary: You've fought this before. ${text}` : null;
}

function unlockAchievement(state, id, log) {
  if (state.flags.achievements[id]) return;
  state.flags.achievements[id] = true;
  // Also marks it seen, since it's already announced right here — otherwise
  // the generic checkNewAchievements() pass below would announce it again.
  if (!state.flags.achievementsSeen) state.flags.achievementsSeen = {};
  state.flags.achievementsSeen[id] = true;
  const achievement = ACHIEVEMENTS[id];
  if (achievement && log) log(`🏆 Achievement unlocked: ${achievement.title}`);
}

function grantXpWithSound(state, amount, log) {
  grantXp(state, amount, msg => {
    if (msg.startsWith('Level up!')) audio.playLevelUp();
    log(msg);
  });
}

const PORTRAIT_PX = 5;

// NG+ cycle 2+ exclusive: the boss borrows one more property (coherence) for
// a bonus fifth phase, on top of its usual four. Exported as its own pure
// function so the cycle-gating logic is unit-testable without a full battle.
const NG_PLUS_BONUS_PHASE_CYCLE = 2;
const NG_PLUS_BONUS_PHASE_ABILITY = 'laser_focus';
export function ngPlusBonusPhaseAbility(cycle) {
  return (cycle || 0) >= NG_PLUS_BONUS_PHASE_CYCLE ? NG_PLUS_BONUS_PHASE_ABILITY : null;
}

// Re-triggerable CSS animation: strip the class, force a reflow, re-add it,
// then clean up — so back-to-back hits each get their own shake/flash.
function pulseEffect(el, className, duration = 400) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}

function spawnDamagePopup(canvasEl, text, variant) {
  if (!canvasEl || !canvasEl.parentElement) return;
  const popup = document.createElement('div');
  popup.className = 'dmg-popup' + (variant ? ` dmg-popup-${variant}` : '');
  popup.textContent = text;
  canvasEl.parentElement.appendChild(popup);
  setTimeout(() => popup.remove(), 900);
}

function showHitFx(game, canvasEl, dmg, isCrit) {
  if (dmg > 0) {
    pulseEffect(canvasEl, isCrit ? 'portrait-crit' : 'portrait-hit');
    spawnDamagePopup(canvasEl, `-${dmg}`, isCrit ? 'crit' : 'normal');
  } else {
    pulseEffect(canvasEl, 'portrait-miss');
    spawnDamagePopup(canvasEl, 'MISS', 'miss');
  }
}

function logMsg(game, msg) {
  const log = game.battle.log;
  log.push(msg);
  if (log.length > 60) log.shift();
}

// Random-encounter enemies get a mild stat bump per player level, so early
// zones don't stay trivial forever — guardians and the boss are untouched
// by this one, their difficulty is tuned by story position, not player level.
function scaleEnemyToLevel(enemy, level) {
  if (!level || level <= 1) return;
  const hpScale = 1 + (level - 1) * 0.12;
  const combatScale = 1 + (level - 1) * 0.08;
  enemy.hp = Math.round(enemy.hp * hpScale);
  enemy.curHp = enemy.hp;
  enemy.atk = Math.round(enemy.atk * combatScale);
  enemy.def = Math.round(enemy.def * combatScale);
}

// New Game+ toughens *every* enemy, including guardians and the boss, unlike
// the per-level scaling above — each completed cycle is meant to be a full,
// harder replay, not just "the same fight with a higher-level player."
export function applyNgPlusScaling(enemy, cycle) {
  if (!cycle) return;
  const mult = 1 + cycle * 0.25;
  enemy.hp = Math.round(enemy.hp * mult);
  enemy.curHp = enemy.hp;
  enemy.atk = Math.round(enemy.atk * mult);
  enemy.def = Math.round(enemy.def * mult);
}

// The player's chosen difficulty setting - applies to every enemy (including
// guardians/the boss) and stacks with both NG+ and per-level scaling.
export function applyDifficultyScaling(enemy, difficultyId) {
  const mult = findDifficulty(difficultyId).enemyMult;
  if (mult === 1) return;
  enemy.hp = Math.round(enemy.hp * mult);
  enemy.curHp = enemy.hp;
  enemy.atk = Math.round(enemy.atk * mult);
  enemy.def = Math.round(enemy.def * mult);
}

// A practice-only opponent, deliberately kept out of ENEMIES — it must never
// be reachable by ZONE_ENCOUNTERS, the Bestiary, or "defeat every enemy type"
// completion tracking, since fighting it is meant to leave zero trace.
const TRAINING_DUMMY = {
  id: 'training_dummy', name: 'Training Dummy', hp: 60, atk: 0, def: 0, xp: 0, mats: [],
  weakTo: [], resists: [],
  flavor: 'A silent stand-in for testing loadouts and timing — it won\'t fight back, and nothing here counts for real.'
};

export function startBattle(game, enemyId, opts = {}) {
  const isDummy = enemyId === 'training_dummy';
  const enemy = isDummy ? { ...TRAINING_DUMMY, curHp: TRAINING_DUMMY.hp, phaseIdx: 0 } : makeEnemyInstance(enemyId);
  if (!isDummy) {
    applyDifficultyScaling(enemy, game.state.settings.difficulty);
    applyNgPlusScaling(enemy, game.state.flags.ngPlusCycle);
    if (opts.scaleToLevel && !enemy.isBoss) scaleEnemyToLevel(enemy, opts.scaleToLevel);
  }
  // Snapshot atk right after run-level scaling (NG+/difficulty) but before any
  // in-fight escalation (phase2/enrage) — telegraphed hits scale off this
  // baseline instead of an already-escalated atk, so the two mechanics don't
  // compound into an unfair one-shot when both happen to be active at once.
  enemy.baseAtk = enemy.atk;
  if (enemy.isBoss) {
    // enemy.phases is still the shared ENEMIES data array reference at this
    // point, so this clones rather than mutates it in place.
    const bonusAbility = ngPlusBonusPhaseAbility(game.state.flags.ngPlusCycle);
    if (bonusAbility && !enemy.phases.includes(bonusAbility)) {
      enemy.phases = [...enemy.phases, bonusAbility];
      enemy.ngPlusBonusPhase = true;
    }
    enemy.phaseIdx = 0;
    enemy.phaseTargetHp = Math.max(1, enemy.hp - Math.ceil((enemy.hp / enemy.phases.length) * (enemy.phaseIdx + 1)));
  }
  const packMates = (opts.packIds || []).map(id => {
    const mate = makeEnemyInstance(id);
    applyDifficultyScaling(mate, game.state.settings.difficulty);
    applyNgPlusScaling(mate, game.state.flags.ngPlusCycle);
    if (opts.scaleToLevel) scaleEnemyToLevel(mate, opts.scaleToLevel);
    return mate;
  });

  game.battle = {
    enemy, packMates, log: [], playerBuff: null, storedEnergy: 0, opts, over: false,
    damageTaken: 0, abilitiesUsed: new Set(), abilityUseCounts: {}, phase2Triggered: false, bossEnrageTriggered: false,
    cooldowns: {}, enemyTelegraphed: false, surpriseAvailable: !!opts.surpriseBonus
  };
  game.state.mode = 'battle';
  logMsg(game, opts.introText || GUARDIAN_INTRO[enemyId] || (enemy.isBoss ? BOSS_INTRO : `A wild ${enemy.name} appears!`));
  if (enemy.flavor) logMsg(game, enemy.flavor);
  if (enemy.ngPlusBonusPhase) {
    logMsg(game, 'Something is different this cycle — The Null Medium has learned to borrow one more property: coherence itself.');
  }
  if (packMates.length) {
    logMsg(game, `${packMates.map(m => m.name).join(' and ')} join${packMates.length === 1 ? 's' : ''} the fight!`);
    if (claimHint(game.state, 'firstPack')) {
      logMsg(game, '💡 Tip: Facing multiple enemies — every attack ability hits all of them at once.');
    }
  }
  if (opts.surpriseBonus && claimHint(game.state, 'firstWanderer')) {
    logMsg(game, '💡 Tip: Approaching a visible enemy grants a surprise attack bonus on your first hit.');
  }
  if (game.state.flags.enemiesDefeated[enemyId]) {
    const hint = bestiaryHintText(enemy);
    if (hint) logMsg(game, hint);
  }
  audio.stopZoneAmbience();
  audio.playBattleMusic();
  game.showPanel('battle');
  renderBattle(game);
}

function applyBossAction(game, ability, ctx, storedBonus) {
  const battle = game.battle;
  const enemy = battle.enemy;
  const neededId = enemy.phases[enemy.phaseIdx];
  const result = applyOffensiveModifiers(game, ability, ability.effect(ctx));
  if (ability.id !== neededId) {
    logMsg(game, `${ability.name} passes right through The Null Medium — it hasn't taken on that property yet.`);
    return { isCrit: false, landed: false, dmg: 0 };
  }
  let dmg = result.dmg != null ? result.dmg : (result.perHit ? result.perHit * (result.hits || 1) : 10);
  dmg = Math.max(1, Math.round(dmg + storedBonus));
  enemy.curHp = Math.max(0, enemy.curHp - dmg);
  if (dmg >= enemy.hp) unlockAchievement(game.state, 'overqualified', m => logMsg(game, m));
  logMsg(game, `${ability.name} lands true! The Null Medium reels for ${dmg} damage. ${result.note || ''}`);
  enemy.phaseIdx += 1;
  if (enemy.curHp > 0 && enemy.phaseIdx < enemy.phases.length) {
    const nextName = findAbility(enemy.phases[enemy.phaseIdx]).name;
    logMsg(game, `It shudders and takes on a new property — try ${nextName} next.`);
  }
  return { isCrit: !!result.isCrit, landed: true, dmg };
}

// True exactly once per battle, the first time an attack ability is used
// after a surprise (wanderer) encounter — consumed by whichever code path
// checks it, single-target or pack.
export function shouldApplySurprise(battle, ability) {
  return !!(battle.surpriseAvailable && ability.type === 'attack');
}

function applyPlayerAction(game, ability, ctx) {
  const battle = game.battle;
  let storedBonus = 0;
  if (ability.type === 'attack' && battle.storedEnergy) {
    storedBonus = battle.storedEnergy;
    battle.storedEnergy = 0;
    logMsg(game, `Releasing ${storedBonus} stored (Stokes-shifted) energy from last turn.`);
  }

  const surprised = shouldApplySurprise(battle, ability);
  if (surprised) {
    battle.surpriseAvailable = false;
    logMsg(game, 'Surprise attack! The unprepared foe takes extra damage.');
  }
  const surpriseMult = surprised ? 1.3 : 1;

  if (battle.enemy.isBoss && ability.type === 'attack') {
    return applyBossAction(game, ability, ctx, storedBonus);
  }

  if (ability.type === 'attack' && battle.packMates.length > 0) {
    return applyPlayerActionPack(game, ability, ctx, storedBonus, surpriseMult);
  }

  const result = ability.type === 'attack'
    ? applyOffensiveModifiers(game, ability, ability.effect(ctx))
    : applyDefensiveModifiers(game, ability, ability.effect(ctx));

  if (ability.type === 'attack') {
    let net;
    if (result.hits) {
      let total = 0;
      for (let i = 0; i < result.hits; i++) {
        total += Math.max(1, Math.round(result.perHit - battle.enemy.def * 0.5));
      }
      net = total + storedBonus;
      logMsg(game, `${ability.name}: ${result.hits} hits for ${net} total damage. ${result.note || ''}`);
    } else {
      const ignoreFrac = result.ignoreDefFrac || 0;
      const defApplied = battle.enemy.def * (1 - ignoreFrac);
      let raw = (result.dmg || 0);
      net = Math.round(raw - defApplied) + storedBonus;
      if (!(ability.noDamageFloor && result.dmg === 0)) net = Math.max(net, raw > 0 || storedBonus > 0 ? 1 : 0);
      logMsg(game, `${ability.name}: dealt ${Math.max(0, net)} damage. ${result.note || ''}`);
    }
    net = Math.max(0, net);
    net = Math.round(net * surpriseMult);
    battle.enemy.curHp = Math.max(0, battle.enemy.curHp - net);
    if (net >= battle.enemy.hp) unlockAchievement(game.state, 'overqualified', m => logMsg(game, m));
    return { isCrit: !!result.isCrit, landed: true, dmg: net };
  }

  battle.playerBuff = result;
  logMsg(game, `${ability.name}: ${result.note || 'You brace for the next attack.'}`);
  return { isCrit: false, landed: false, dmg: 0 };
}

// Attack abilities cleave to every living target when fighting a pack —
// no per-enemy targeting UI needed, and every ability becomes a real AoE
// tool in exactly the fights where that matters.
function applyPlayerActionPack(game, ability, ctx, storedBonus, surpriseMult) {
  const battle = game.battle;
  const targets = [battle.enemy, ...battle.packMates].filter(t => t.curHp > 0);
  let totalDealt = 0;
  let firstNote = '';
  let anyCrit = false;
  targets.forEach((target, i) => {
    const targetCtx = { ...ctx, enemy: target, log: i === 0 ? ctx.log : () => {} };
    const result = applyOffensiveModifiers(game, ability, ability.effect(targetCtx));
    let net;
    if (result.hits) {
      let total = 0;
      for (let h = 0; h < result.hits; h++) total += Math.max(1, Math.round(result.perHit - target.def * 0.5));
      net = total + (i === 0 ? storedBonus : 0);
    } else {
      const ignoreFrac = result.ignoreDefFrac || 0;
      const defApplied = target.def * (1 - ignoreFrac);
      const raw = result.dmg || 0;
      net = Math.round(raw - defApplied) + (i === 0 ? storedBonus : 0);
      if (!(ability.noDamageFloor && result.dmg === 0)) net = Math.max(net, raw > 0 ? 1 : 0);
    }
    net = Math.max(0, net);
    net = Math.round(net * surpriseMult);
    target.curHp = Math.max(0, target.curHp - net);
    totalDealt += net;
    if (i === 0) { firstNote = result.note || ''; anyCrit = !!result.isCrit; }
    if (net >= target.hp) unlockAchievement(game.state, 'overqualified', m => logMsg(game, m));
  });
  logMsg(game, `${ability.name} sweeps the group for ${totalDealt} total damage. ${firstNote}`);
  return { isCrit: anyCrit, landed: totalDealt > 0, dmg: totalDealt };
}

function enemyTurn(game) {
  const battle = game.battle;
  const enemy = battle.enemy;
  const player = game.state.player;
  if (enemy.curHp <= 0) return { dmg: 0 };
  if (battle.opts.practice) return { dmg: 0 };

  const gear = buildGear(player);

  // Telegraphed heavy attack: guardians/the boss occasionally announce a
  // bigger strike a full turn ahead, giving the player one round's warning
  // to raise a defense ability before it lands.
  if (!battle.enemyTelegraphed && isTelegraphEligible(battle) && Math.random() < 0.25) {
    battle.enemyTelegraphed = true;
    logMsg(game, `${enemy.name}'s form flares ominously — it's gathering strength for something bigger next turn!`);
    return { dmg: 0 };
  }

  const evasion = gear.lens && gear.lens.evasionBonus ? gear.lens.evasionBonus : 0;
  if (evasion && Math.random() < evasion) {
    logMsg(game, `${enemy.name}'s attack misses completely — your diverging lens scattered its aim.`);
    battle.playerBuff = null;
    battle.enemyTelegraphed = false;
    return { dmg: 0 };
  }

  const telegraphed = battle.enemyTelegraphed;
  battle.enemyTelegraphed = false;
  let dmg = Math.max(1, telegraphDamageBase(enemy, telegraphed) + Math.floor(Math.random() * 5) - 2);
  if (telegraphed) dmg = Math.round(dmg * 1.8);
  const defenseBonus = gear.mirror && gear.mirror.defenseBonus ? gear.mirror.defenseBonus : 0;
  if (defenseBonus) dmg = Math.max(1, dmg - defenseBonus);
  const buff = battle.playerBuff;
  let note = '';
  if (buff) {
    if (buff.fullNegateChance && Math.random() < buff.fullNegateChance) {
      dmg = 0; note = 'Destructive interference cancels the attack completely!';
    } else if (buff.block && Math.random() < buff.block) {
      dmg = Math.round(dmg * 0.15); note = 'Mostly blocked!';
    } else if (buff.glareShield) {
      dmg = Math.round(dmg * (1 - buff.glareShield)); note = 'The polarizing filter cuts much of the glare.';
    } else if (buff.absorbShield) {
      const absorbed = Math.round(dmg * buff.absorbShield);
      dmg = Math.max(0, dmg - absorbed);
      battle.storedEnergy = (battle.storedEnergy || 0) + Math.round(absorbed * 0.6);
      note = `Absorbed ${absorbed} damage, storing some for your next turn.`;
    }
  }
  dmg = Math.max(0, dmg);
  player.hp = Math.max(0, player.hp - dmg);
  logMsg(game, telegraphed
    ? `${enemy.name} unleashes the gathered strike for ${dmg} damage! ${note}`
    : `${enemy.name} attacks for ${dmg} damage. ${note}`);
  battle.playerBuff = null;
  if (player.hp > 0 && player.hp / player.maxHp < 0.25 && claimHint(game.state, 'criticalHp')) {
    logMsg(game, '💡 Tip: Craft a Photon Salve at the Workbench to heal HP — usable anytime, even mid-battle.');
  }
  return { dmg };
}

// Every living pack member attacks once each round — packs are always
// ordinary (non-guardian, non-boss) encounters, so this is deliberately
// simpler than enemyTurn() (no telegraph mechanic) and left fully separate
// from it rather than merged, so the single-enemy path stays untouched.
function packEnemiesTurn(game) {
  const battle = game.battle;
  const player = game.state.player;
  const targets = [battle.enemy, ...battle.packMates].filter(e => e.curHp > 0);
  const gear = buildGear(player);
  const evasion = gear.lens && gear.lens.evasionBonus ? gear.lens.evasionBonus : 0;
  const defenseBonus = gear.mirror && gear.mirror.defenseBonus ? gear.mirror.defenseBonus : 0;
  const buff = battle.playerBuff;
  let totalDmg = 0;
  targets.forEach(enemy => {
    if (evasion && Math.random() < evasion) {
      logMsg(game, `${enemy.name}'s attack misses completely — your diverging lens scattered its aim.`);
      return;
    }
    let dmg = Math.max(1, enemy.atk + Math.floor(Math.random() * 5) - 2);
    if (defenseBonus) dmg = Math.max(1, dmg - defenseBonus);
    let note = '';
    if (buff) {
      if (buff.fullNegateChance && Math.random() < buff.fullNegateChance) {
        dmg = 0; note = 'Destructive interference cancels the attack completely!';
      } else if (buff.block && Math.random() < buff.block) {
        dmg = Math.round(dmg * 0.15); note = 'Mostly blocked!';
      } else if (buff.glareShield) {
        dmg = Math.round(dmg * (1 - buff.glareShield)); note = 'The polarizing filter cuts much of the glare.';
      } else if (buff.absorbShield) {
        const absorbed = Math.round(dmg * buff.absorbShield);
        dmg = Math.max(0, dmg - absorbed);
        battle.storedEnergy = (battle.storedEnergy || 0) + Math.round(absorbed * 0.6);
        note = `Absorbed ${absorbed} damage, storing some for your next turn.`;
      }
    }
    dmg = Math.max(0, dmg);
    player.hp = Math.max(0, player.hp - dmg);
    totalDmg += dmg;
    logMsg(game, `${enemy.name} attacks for ${dmg} damage. ${note}`);
  });
  battle.playerBuff = null;
  if (player.hp > 0 && player.hp / player.maxHp < 0.25 && claimHint(game.state, 'criticalHp')) {
    logMsg(game, '💡 Tip: Craft a Photon Salve at the Workbench to heal HP — usable anytime, even mid-battle.');
  }
  return { dmg: totalDmg };
}

function resolveEnemyTurn(game) {
  return game.battle.packMates.length > 0 ? packEnemiesTurn(game) : enemyTurn(game);
}

export function allEnemiesDefeated(battle) {
  return battle.enemy.curHp <= 0 && battle.packMates.every(m => m.curHp <= 0);
}

// A guardian that drops to half HP or below shudders and hits harder for the
// rest of the fight — one-time, guardian-only (the boss already has its own
// ability-phase mechanic and doesn't need a second one layered on top).
export function shouldTriggerGuardianPhase2(battle) {
  return !!(
    battle.opts.guardianMap && !battle.phase2Triggered &&
    battle.enemy.curHp > 0 && battle.enemy.curHp <= battle.enemy.hp * 0.5
  );
}

export function applyGuardianPhase2(enemy) {
  enemy.atk = Math.round(enemy.atk * 1.25);
}

// The boss's climax: cornered at a quarter HP or below, it hits noticeably
// harder for the rest of the fight — one-time, separate from (and stacks
// with) its existing ability-phase-matching mechanic.
export function shouldTriggerBossEnrage(battle) {
  return !!(
    battle.enemy.isBoss && !battle.bossEnrageTriggered &&
    battle.enemy.curHp > 0 && battle.enemy.curHp <= battle.enemy.hp * 0.25
  );
}

export function applyBossEnrage(enemy) {
  enemy.atk = Math.round(enemy.atk * 1.3);
}

// Cooldowns tick down once per completed round (win, loss, or a normal
// exchange) regardless of which ability was used that round, so "cooldown: 2"
// means "unusable for your next 2 turns" in the ordinary RPG sense.
export function decrementCooldowns(battle) {
  for (const id of Object.keys(battle.cooldowns)) {
    if (battle.cooldowns[id] > 0) battle.cooldowns[id] -= 1;
  }
}

// Only guardians and the boss telegraph a heavy attack — regular random
// encounters stay simple.
export function isTelegraphEligible(battle) {
  return !!(battle.opts.guardianMap || battle.enemy.isBoss);
}

// A telegraphed hit scales off the enemy's atk as it stood right after
// run-level scaling (NG+/difficulty), not its current (possibly
// phase2/enrage-boosted) atk — so a telegraph landing after the enemy has
// already escalated doesn't multiply on top of that escalation too.
export function telegraphDamageBase(enemy, telegraphed) {
  return telegraphed && enemy.baseAtk != null ? enemy.baseAtk : enemy.atk;
}

// Charge regenerates by 1 every completed round (same points as
// decrementCooldowns), capped at the player's current max — Wave Mechanics
// specialists regenerate 1 extra.
export function regenCharge(player) {
  const spec = SPECIALIZATIONS[player.specialization];
  const bonus = spec && spec.chargeRegenBonus ? spec.chargeRegenBonus : 0;
  player.charge = Math.min(player.maxCharge, player.charge + 1 + bonus);
}

export function specializationDamageMult(player, ability) {
  const spec = SPECIALIZATIONS[player.specialization];
  return spec && spec.concepts.includes(ability.concept) ? spec.damageMult : 1;
}

// Photon Focus specialists pay 1 less Charge (floor 1) for the abilities it
// covers — the button's displayed cost and the affordability check both
// need this, not just the final deduction, so it's exported for renderBattle.
export function effectiveChargeCost(player, ability) {
  const base = ability.chargeCost || 0;
  if (!base) return 0;
  const spec = SPECIALIZATIONS[player.specialization];
  if (spec && spec.chargeCostReduction && spec.concepts.includes(ability.concept)) {
    return Math.max(1, base - spec.chargeCostReduction);
  }
  return base;
}

// New Game+ cycle 1+ makes guardians/the boss "adapt" to an overused
// ability: once its use count this fight crosses a cycle-scaled threshold,
// its damage is halved for the rest of the fight — so replaying with a
// higher cycle rewards rotating abilities instead of spamming one favorite,
// rather than just being the same fight against bigger numbers.
export function adaptiveResistMultiplier(game, ability) {
  const battle = game.battle;
  const cycle = game.state.flags.ngPlusCycle || 0;
  if (!cycle || !isTelegraphEligible(battle)) return 1;
  const threshold = Math.max(2, 4 - cycle);
  const count = battle.abilityUseCounts[ability.id] || 0;
  if (count <= threshold) return 1;
  if (count === threshold + 1) {
    logMsg(game, `${battle.enemy.name} has adapted to ${ability.name} — it's noticeably less effective now. Try something else.`);
  }
  return 0.5;
}

// Applied right after ability.effect(ctx) runs, in every damage-resolution
// path (single target, boss, and per-target in a pack) — scales whichever
// damage field that ability's effect actually returned.
function applyOffensiveModifiers(game, ability, result) {
  const player = game.state.player;
  const battle = game.battle;
  let mult = specializationDamageMult(player, ability) * adaptiveResistMultiplier(game, ability);
  // Set (and cleared) by whichever aiming puzzle's onFire callback is
  // currently resolving — only one can be active per chooseAbility() call,
  // so a single shared field is enough regardless of which puzzle it was.
  if (battle.puzzleBonusMult) mult *= battle.puzzleBonusMult;
  if (mult === 1) return result;
  if (result.dmg != null) result.dmg = Math.max(1, Math.round(result.dmg * mult));
  if (result.perHit != null) result.perHit = Math.max(1, Math.round(result.perHit * mult));
  return result;
}

// The defense-side counterpart to applyOffensiveModifiers — only the puzzle
// bonus mult applies here (specialization/adaptive-resist are damage-dealing
// concepts, not defensive ones), scaling glareShield instead of dmg.
function applyDefensiveModifiers(game, ability, result) {
  const battle = game.battle;
  const mult = battle.puzzleBonusMult || 1;
  if (mult === 1) return result;
  if (result.glareShield != null) result.glareShield = Math.min(0.95, result.glareShield * mult);
  return result;
}

export function chooseAbility(game, abilityId) {
  const battle = game.battle;
  if (!battle || battle.over) return;
  const ability = findAbility(abilityId);
  if ((battle.cooldowns[abilityId] || 0) > 0) {
    logMsg(game, `${ability.name} is still recovering — ${battle.cooldowns[abilityId]} more turn(s).`);
    if (claimHint(game.state, 'abilityCooldown')) {
      logMsg(game, '💡 Tip: Abilities on cooldown recover automatically after a couple of turns — try a different one meanwhile.');
    }
    renderBattle(game);
    return;
  }
  const player = game.state.player;
  const chargeCost = effectiveChargeCost(player, ability);
  if (chargeCost > player.charge) {
    logMsg(game, `Not enough Charge for ${ability.name} — need ${chargeCost}, have ${player.charge}.`);
    if (claimHint(game.state, 'chargeEmpty')) {
      logMsg(game, '💡 Tip: Charge regenerates slowly during battle, or fully restores anytime at the Workbench via Meditate.');
    }
    renderBattle(game);
    return;
  }
  const gear = buildGear(player);
  const ctx = { player, enemy: battle.enemy, gear, log: m => logMsg(game, m) };
  unlockCodex(game.state, ability.concept, m => logMsg(game, m));
  battle.abilitiesUsed.add(ability.id);
  battle.abilityUseCounts[ability.id] = (battle.abilityUseCounts[ability.id] || 0) + 1;
  battle.turnCount = (battle.turnCount || 0) + 1;

  const actionResult = applyPlayerAction(game, ability, ctx);
  if (ability.cooldown) battle.cooldowns[abilityId] = ability.cooldown;
  if (chargeCost) player.charge -= chargeCost;
  if (ability.type === 'attack') {
    if (actionResult.landed) {
      if (actionResult.isCrit) audio.playCrit();
      else audio.playHit();
    }
    showHitFx(game, game.dom.battleEnemyCanvas, actionResult.dmg, actionResult.isCrit);
  }
  // Lifetime stats (Field Log) - a practice fight is meant to leave zero
  // trace, so it's excluded here the same way it already skips XP/mats/save.
  if (!battle.opts.practice) {
    const flags = game.state.flags;
    flags.totalDamageDealt = (flags.totalDamageDealt || 0) + (actionResult.dmg || 0);
    if (!flags.abilityUseCountsLifetime) flags.abilityUseCountsLifetime = {};
    flags.abilityUseCountsLifetime[ability.id] = (flags.abilityUseCountsLifetime[ability.id] || 0) + 1;
  }

  if (allEnemiesDefeated(battle)) {
    resolveVictory(game);
    renderBattle(game);
    return;
  }

  if (shouldTriggerGuardianPhase2(battle)) {
    battle.phase2Triggered = true;
    applyGuardianPhase2(battle.enemy);
    logMsg(game, `${battle.enemy.name} shudders, wounded but not finished — it hits harder now.`);
  }

  if (shouldTriggerBossEnrage(battle)) {
    battle.bossEnrageTriggered = true;
    applyBossEnrage(battle.enemy);
    logMsg(game, `Cornered and unraveling, The Null Medium borrows every property at once for one final surge — it hits far harder now.`);
    pulseEffect(game.dom.battleEnemyCanvas, 'portrait-crit', 700);
  }

  decrementCooldowns(battle);
  regenCharge(player);
  const enemyResult = resolveEnemyTurn(game);
  battle.damageTaken += enemyResult.dmg;
  showHitFx(game, game.dom.battlePlayerCanvas, enemyResult.dmg, false);

  if (game.state.player.hp <= 0) {
    resolveDefeat(game);
    renderBattle(game);
    return;
  }

  renderBattle(game);
}

// Refraction Bend's button opens the Snell's-law aiming puzzle instead of
// casting directly (see renderBattle) — this is the puzzle's onFire
// callback, applying the resulting bonus/normal multiplier via the shared
// battle.puzzleBonusMult hook applyOffensiveModifiers reads.
function resolveSnellPuzzleShot(game, hit, refractedDeg) {
  const battle = game.battle;
  if (!battle || battle.over) return;
  battle.puzzleBonusMult = hit ? 1.8 : 1;
  logMsg(game, hit
    ? `The beam refracts to ${refractedDeg.toFixed(1)}° — right on target! Bonus damage.`
    : `The beam refracts to ${refractedDeg.toFixed(1)}° — off the mark, but still lands. Normal damage.`);
  if (hit) {
    game.state.flags.snellHits = (game.state.flags.snellHits || 0) + 1;
    const newlyUnlocked = checkNewAchievements(game.state);
    if (newlyUnlocked.length) {
      audio.playAchievement();
      formatAchievementLines(newlyUnlocked).forEach(m => showToast(game, m));
    }
  }
  chooseAbility(game, 'refraction_bend');
  delete battle.puzzleBonusMult;
}

// Diffraction Wave's button opens the fringe-finding puzzle the same way.
function resolveDiffractionPuzzleShot(game, hit, angleDeg) {
  const battle = game.battle;
  if (!battle || battle.over) return;
  battle.puzzleBonusMult = hit ? 1.8 : 1;
  logMsg(game, hit
    ? `The angle lands on the first bright fringe at ${angleDeg}° — constructive interference! Bonus damage.`
    : `${angleDeg}° falls between fringes, mostly destructive. Normal damage.`);
  chooseAbility(game, 'diffraction_wave');
  delete battle.puzzleBonusMult;
}

// Polarize Filter's button opens the Brewster's-angle puzzle — a defense
// ability, so unlike the two attack puzzles above the bonus mult scales
// glareShield (see applyDefensiveModifiers) instead of dmg.
function resolveBrewsterPuzzleShot(game, hit, angleDeg) {
  const battle = game.battle;
  if (!battle || battle.over) return;
  battle.puzzleBonusMult = hit ? 1.6 : 1;
  logMsg(game, hit
    ? `The reflection at ${angleDeg}° comes back fully polarized — the filter blocks it almost entirely!`
    : `${angleDeg}° isn't Brewster's angle — some glare still gets through. Normal block.`);
  chooseAbility(game, 'polarize_filter');
  delete battle.puzzleBonusMult;
}

export function flee(game) {
  const battle = game.battle;
  if (!battle || battle.over) return;
  if (battle.opts.guardianMap || battle.enemy.isBoss) {
    logMsg(game, 'There’s no running from this one.');
    renderBattle(game);
    return;
  }
  if (Math.random() < 0.65) {
    logMsg(game, 'You slip away safely.');
    battle.over = true;
    renderBattle(game);
    setTimeout(() => endBattle(game), 300);
  } else {
    logMsg(game, 'Couldn’t escape!');
    decrementCooldowns(battle);
    regenCharge(game.state.player);
    const enemyResult = resolveEnemyTurn(game);
    battle.damageTaken += enemyResult.dmg;
    showHitFx(game, game.dom.battlePlayerCanvas, enemyResult.dmg, false);
    if (game.state.player.hp <= 0) {
      resolveDefeat(game);
    }
    renderBattle(game);
  }
}

// Using an item still costs your turn — the enemy gets to act right after —
// except when it would do nothing (already at full HP), which is free so
// players can't be punished for misclicking.
export function useItemInBattle(game, itemId) {
  const battle = game.battle;
  if (!battle || battle.over) return;
  const item = findConsumable(itemId);
  if (!item || (game.state.player.consumables[itemId] || 0) <= 0) return;

  if (game.state.player.hp >= game.state.player.maxHp) {
    logMsg(game, `You're already at full health — no need for the ${item.name}.`);
    renderBattle(game);
    return;
  }

  const healed = applyConsumable(game.state, itemId);
  audio.playHeal();
  logMsg(game, `You use the ${item.name}, recovering ${healed} HP.`);

  decrementCooldowns(battle);
  regenCharge(game.state.player);
  const enemyResult = resolveEnemyTurn(game);
  battle.damageTaken += enemyResult.dmg;
  showHitFx(game, game.dom.battlePlayerCanvas, enemyResult.dmg, false);

  if (game.state.player.hp <= 0) {
    resolveDefeat(game);
    renderBattle(game);
    return;
  }

  renderBattle(game);
}

function resolveVictory(game) {
  const battle = game.battle;
  const enemy = battle.enemy;
  const state = game.state;
  battle.over = true;
  if (battle.opts.practice) {
    logMsg(game, `${enemy.name} is defeated! No rewards or records in practice — come back anytime.`);
    audio.stopMusic();
    audio.playVictory();
    return;
  }
  const allDefeated = [enemy, ...battle.packMates];
  logMsg(game, battle.packMates.length ? 'The pack is defeated!' : `${enemy.name} is defeated!`);
  const newlyCataloged = new Set();
  allDefeated.forEach(e => {
    if (!state.flags.enemiesDefeated[e.id]) newlyCataloged.add(e.id);
    state.flags.enemiesDefeated[e.id] = true;
  });
  newlyCataloged.forEach(id => {
    logMsg(game, `📖 New Bestiary entry: ${allDefeated.find(e => e.id === id).name} cataloged!`);
  });
  audio.stopMusic();
  audio.playVictory();
  const totalXp = allDefeated.reduce((sum, e) => sum + e.xp, 0);
  const xpAward = Math.round(totalXp * findDifficulty(state.settings.difficulty).xpMult);
  grantXpWithSound(state, xpAward, m => logMsg(game, m));
  allDefeated.forEach(e => {
    (e.mats || []).forEach(matId => {
      state.player.materials[matId] = (state.player.materials[matId] || 0) + 1;
      logMsg(game, `Gained 1 ${MATERIALS[matId].name}.`);
    });
  });
  if (battle.opts.guardianMap) {
    state.flags.guardianDefeated[battle.opts.guardianMap] = true;
    logMsg(game, `The path deeper in feels different now...`);
    if (battle.damageTaken === 0) unlockAchievement(state, 'unscathed', m => logMsg(game, m));
    if (battle.abilitiesUsed.size === 1) unlockAchievement(state, 'one_trick', m => logMsg(game, m));
    if (claimHint(state, 'firstGuardian')) {
      logMsg(game, '💡 Tip: Track achievements and overall progress anytime in the Log panel (top bar).');
    }
  }
  if (enemy.isBoss) {
    state.flags.bossDefeated = true;
    state.mode = 'victory';
    if (enemy.ngPlusBonusPhase) unlockAchievement(state, 'fifth_property', m => logMsg(game, m));
    if (state.flags.fastestBossKillTurns == null || battle.turnCount < state.flags.fastestBossKillTurns) {
      state.flags.fastestBossKillTurns = battle.turnCount;
    }
  }
  state.flags.totalVictories = (state.flags.totalVictories || 0) + 1;
  const newlyUnlocked = checkNewAchievements(state);
  if (newlyUnlocked.length) audio.playAchievement();
  formatAchievementLines(newlyUnlocked).forEach(m => showToast(game, m));
  saveGame(state);
}

function resolveDefeat(game) {
  const state = game.state;
  game.battle.over = true;
  logMsg(game, 'You have been overwhelmed! Retreating to the village to recover...');
  audio.stopMusic();
  audio.playDefeat();
  state.player.hp = state.player.maxHp;
  state.currentMap = 'village';
  state.pos = { x: 7, y: 8 };
  saveGame(state);
}

export function endBattle(game) {
  const state = game.state;
  if (state.mode === 'victory') {
    game.showPanel('victory');
    return;
  }
  state.mode = 'overworld';
  game.showPanel('overworld');
  game.renderOverworld();
  game.renderHud();
  audio.playOverworldMusic();
  audio.playZoneAmbience(MAPS[state.currentMap].zone);
  saveGame(state);
}

export function renderBattle(game) {
  const battle = game.battle;
  if (!battle) return;
  const { enemy } = battle;
  const player = game.state.player;
  const d = game.dom;

  const enemySprite = CHARACTER_SPRITES[enemy.id];
  drawZoneBackdrop(d.battleEnemyCtx, d.battleEnemyCanvas.width, d.battleEnemyCanvas.height, enemy.zone);
  if (enemySprite) {
    const px = enemy.isBoss ? PORTRAIT_PX * 1.15 : PORTRAIT_PX;
    drawSprite(d.battleEnemyCtx, enemySprite.shape, enemySprite.palette, d.battleEnemyCanvas.width / 2, d.battleEnemyCanvas.height / 2 + 6, px);
  }
  drawZoneBackdrop(d.battlePlayerCtx, d.battlePlayerCanvas.width, d.battlePlayerCanvas.height, enemy.zone);
  drawSprite(d.battlePlayerCtx, 'humanoid', playerPaletteFor(game.state.flags.ngPlusCycle), d.battlePlayerCanvas.width / 2, d.battlePlayerCanvas.height / 2 + 6, PORTRAIT_PX);

  d.battleEnemyName.textContent = enemy.isBoss ? enemy.name + ' (?!)' : enemy.name;
  const enemyPct = Math.max(0, Math.round((enemy.curHp / enemy.hp) * 100));
  d.battleEnemyHpBar.style.width = enemyPct + '%';
  d.battleEnemyHpText.textContent = `${Math.max(0, enemy.curHp)} / ${enemy.hp}`;
  d.battleEnemyHpBar.classList.toggle('critical', enemy.curHp / enemy.hp < 0.25);

  d.battlePlayerHpBar.style.width = Math.max(0, Math.round((player.hp / player.maxHp) * 100)) + '%';
  d.battlePlayerHpText.textContent = `${player.hp} / ${player.maxHp}`;
  d.battlePlayerLevel.textContent = `Lv.${player.level}`;
  d.battlePlayerHpBar.classList.toggle('critical', player.hp / player.maxHp < 0.25);

  if (d.battleChargeBar) {
    d.battleChargeBar.style.width = Math.max(0, Math.round((player.charge / player.maxCharge) * 100)) + '%';
    d.battleChargeText.textContent = `${player.charge} / ${player.maxCharge}`;
  }

  if (d.battlePackMates) {
    d.battlePackMates.innerHTML = battle.packMates.map(m => `
      <div class="pack-mate${m.curHp <= 0 ? ' pack-mate-dead' : ''}">${m.name}: ${Math.max(0, m.curHp)} / ${m.hp} HP</div>
    `).join('');
  }

  d.battleLog.innerHTML = battle.log.map(l => `<div>${l}</div>`).join('');
  d.battleLog.scrollTop = d.battleLog.scrollHeight;

  d.battleActions.innerHTML = '';
  if (battle.over) {
    const btn = document.createElement('button');
    btn.className = 'action-btn primary';
    btn.textContent = game.state.mode === 'victory' ? 'Continue' : 'Continue';
    btn.onclick = () => endBattle(game);
    d.battleActions.appendChild(btn);
    return;
  }

  // Number-key shortcuts (see main.js's keydown handler) select buttons by
  // DOM order, so each gets a visible key hint in that same order.
  let actionIndex = 0;
  function keyHint() {
    actionIndex += 1;
    return actionIndex <= 9 ? `<span class="key-hint">${actionIndex}</span> ` : '';
  }

  // Abilities that open an aiming puzzle instead of resolving instantly.
  const PUZZLE_ABILITIES = {
    refraction_bend: (g, cb) => openSnellPuzzle(g, cb),
    diffraction_wave: (g, cb) => openDiffractionPuzzle(g, cb),
    polarize_filter: (g, cb) => openBrewsterPuzzle(g, cb)
  };
  const PUZZLE_RESOLVERS = {
    refraction_bend: resolveSnellPuzzleShot,
    diffraction_wave: resolveDiffractionPuzzleShot,
    polarize_filter: resolveBrewsterPuzzleShot
  };

  ABILITIES.forEach(a => {
    const cd = battle.cooldowns[a.id] || 0;
    const cost = effectiveChargeCost(player, a);
    const shortOnCharge = cost > player.charge;
    const btn = document.createElement('button');
    btn.className = 'action-btn ability-btn';
    const costTag = cost ? ` <span class="charge-tag">${cost}⚡</span>` : '';
    // Puzzle abilities are aimed instead of resolving instantly — a small
    // tag marks them so the button doesn't look identical to an ordinary
    // instant-cast ability.
    const aimTag = PUZZLE_ABILITIES[a.id] ? ' <span class="charge-tag">🎯 Aim</span>' : '';
    btn.innerHTML = `<strong>${keyHint()}${a.name}${cd > 0 ? ` (${cd})` : ''}${costTag}${aimTag}</strong><span class="ability-desc">${a.desc}</span>`;
    // The button already shows a one-line gameplay blurb; the full Codex
    // explanation (once unlocked) goes in the title attribute so the deeper
    // "why" is a hover away without leaving battle for the Codex panel.
    const codexEntry = CODEX[a.concept];
    if (codexEntry && game.state.codexUnlocked[a.concept]) {
      btn.title = `${codexEntry.title}\n\n${codexEntry.body}`;
    }
    btn.disabled = cd > 0 || shortOnCharge;
    btn.onclick = PUZZLE_ABILITIES[a.id]
      ? () => {
          if (claimHint(game.state, 'aimingPuzzle')) {
            logMsg(game, '💡 Tip: This ability opens an aiming puzzle — landing the target zone boosts its effect, but missing still gives the normal result.');
          }
          PUZZLE_ABILITIES[a.id](game, (hit, value) => PUZZLE_RESOLVERS[a.id](game, hit, value));
        }
      : () => chooseAbility(game, a.id);
    d.battleActions.appendChild(btn);
  });

  CONSUMABLES.forEach(item => {
    const owned = player.consumables[item.id] || 0;
    if (owned <= 0) return;
    const btn = document.createElement('button');
    btn.className = 'action-btn ability-btn';
    btn.innerHTML = `<strong>${keyHint()}Use ${item.name} (x${owned})</strong><span class="ability-desc">Restores ${item.heal} HP.</span>`;
    if (item.fact) btn.title = item.fact;
    btn.onclick = () => useItemInBattle(game, item.id);
    d.battleActions.appendChild(btn);
  });

  const fleeBtn = document.createElement('button');
  fleeBtn.className = 'action-btn flee-btn';
  fleeBtn.innerHTML = keyHint() + ((battle.opts.guardianMap || enemy.isBoss) ? 'Flee (unavailable)' : 'Flee');
  fleeBtn.disabled = !!(battle.opts.guardianMap || enemy.isBoss);
  fleeBtn.onclick = () => flee(game);
  d.battleActions.appendChild(fleeBtn);
}

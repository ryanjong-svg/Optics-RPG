// Pure combat math and eligibility checks, split out of battle.js - none of
// these touch game.dom, logMsg, audio, or renderBattle, so they carry no risk
// of a circular import back to battle.js (which still owns the actual battle
// flow: starting/resolving fights, the DOM-driven action handlers, and
// renderBattle itself). Kept unit-testable exactly as they were before the
// split; only their import path moved.
import { findDifficulty } from '../../data/content/difficulty.js';
import { SPECIALIZATIONS } from '../../data/content/specializations.js';
import { weaknessResistanceText } from '../../data/content/enemies.js';

// A personal "Bestiary": once you've beaten an enemy type before, its known
// weakness/resistance is surfaced up front on the next encounter, turning
// "remember what worked last time" into an explicit part of the teaching.
export function bestiaryHintText(enemy) {
  const text = weaknessResistanceText(enemy);
  return text ? `📖 Bestiary: You've fought this before. ${text}` : null;
}

// NG+ cycle 2+ exclusive: the boss borrows one more property (coherence) for
// a bonus fifth phase, on top of its usual four. Exported as its own pure
// function so the cycle-gating logic is unit-testable without a full battle.
const NG_PLUS_BONUS_PHASE_CYCLE = 2;
const NG_PLUS_BONUS_PHASE_ABILITY = 'laser_focus';
export function ngPlusBonusPhaseAbility(cycle) {
  return (cycle || 0) >= NG_PLUS_BONUS_PHASE_CYCLE ? NG_PLUS_BONUS_PHASE_ABILITY : null;
}

// Random-encounter enemies get a mild stat bump per player level, so early
// zones don't stay trivial forever — guardians and the boss are untouched
// by this one, their difficulty is tuned by story position, not player level.
export function scaleEnemyToLevel(enemy, level) {
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

// Ability combos: using one of these "setup" abilities right before the
// matching "payoff" ability grants the payoff a damage bonus — a reason to
// plan a short sequence instead of always picking whichever single ability
// deals the most damage in isolation. Exported as its own pure function for
// direct testing.
export const COMBOS = {
  tir_shield: ['reflect_strike'],
  interference_cancel: ['diffraction_wave'],
  polarize_filter: ['photoelectric_shock'],
  refraction_bend: ['laser_focus'],
  absorb_reemit: ['dispersion_burst'],
  dispersion_burst: ['photoelectric_shock']
};
export const COMBO_MULT = 1.4;

// A chain is two combo hops landed back-to-back in the same fight (e.g.
// Absorb & Re-emit -> Dispersion Burst -> Photoelectric Shock, the one
// sequence in COMBOS where a payoff is itself another pair's setup) - a
// bigger, rarer bonus for planning a full 3-step sequence instead of just
// one combo. Exported as its own pure function for direct testing.
export const CHAIN_MULT = 1.75;

export function isComboFollowUp(lastAbilityId, abilityId) {
  const followUps = COMBOS[lastAbilityId];
  return !!(followUps && followUps.includes(abilityId));
}

export function isComboChain(comboTriggered, prevTurnWasCombo) {
  return !!(comboTriggered && prevTurnWasCombo);
}

// Elite variant: a rare, tougher, better-rewarding version of a normal
// random encounter. Implemented as a stat multiplier applied at spawn time
// rather than ~40 duplicated enemy entries — the sprite/id/zone stay the
// same (so it still counts as the ordinary enemy for the Bestiary), only its
// display name, stats, and rewards change.
export const ELITE_CHANCE = 0.12;
const ELITE_CHANCE_PER_CYCLE = 0.04;
const ELITE_CHANCE_MAX = 0.32;
const ELITE_STAT_MULT = 1.6;
const ELITE_XP_MULT = 2.2;

// Elites get more common each New Game+ cycle - a reason for late-game
// replays to keep running into them, capped so a normal encounter never
// becomes the exception rather than the rule.
export function eliteChanceForCycle(cycle) {
  return Math.min(ELITE_CHANCE_MAX, ELITE_CHANCE + (cycle || 0) * ELITE_CHANCE_PER_CYCLE);
}

export function applyEliteVariant(enemy) {
  enemy.isElite = true;
  enemy.name = `Elite ${enemy.name}`;
  enemy.hp = Math.round(enemy.hp * ELITE_STAT_MULT);
  enemy.curHp = enemy.hp;
  enemy.atk = Math.round(enemy.atk * ELITE_STAT_MULT);
  enemy.def = Math.round(enemy.def * ELITE_STAT_MULT);
  enemy.xp = Math.round(enemy.xp * ELITE_XP_MULT);
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

// True exactly once per battle, the first time an attack ability is used
// after a surprise (wanderer) encounter — consumed by whichever code path
// checks it, single-target or pack.
export function shouldApplySurprise(battle, ability) {
  return !!(battle.surpriseAvailable && ability.type === 'attack');
}

export function shouldGrantHardcorePuzzleBonus(hit, isPractice, puzzleHints) {
  return !!(hit && !isPractice && puzzleHints === false);
}

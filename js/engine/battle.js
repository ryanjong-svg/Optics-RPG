import { ABILITIES, findAbility } from '../data/abilities.js';
import { makeEnemyInstance } from '../data/enemies.js';
import { MATERIALS } from '../data/materials.js';
import { GUARDIAN_INTRO, BOSS_INTRO } from '../data/dialogue.js';
import { CHARACTER_SPRITES } from '../data/pixelArt.js';
import { drawSprite } from './pixelSprites.js';
import { buildGear } from './gear.js';
import { grantXp, unlockCodex } from './state.js';
import { saveGame } from './save.js';
import * as audio from './audio.js';

function grantXpWithSound(state, amount, log) {
  grantXp(state, amount, msg => {
    if (msg.startsWith('Level up!')) audio.playLevelUp();
    log(msg);
  });
}

const PORTRAIT_PX = 5;

function logMsg(game, msg) {
  const log = game.battle.log;
  log.push(msg);
  if (log.length > 60) log.shift();
}

// Random-encounter enemies get a mild stat bump per player level, so early
// zones don't stay trivial forever — guardians and the boss are untouched,
// their difficulty is tuned by story position, not player level.
function scaleEnemyToLevel(enemy, level) {
  if (!level || level <= 1) return;
  const hpScale = 1 + (level - 1) * 0.12;
  const combatScale = 1 + (level - 1) * 0.08;
  enemy.hp = Math.round(enemy.hp * hpScale);
  enemy.curHp = enemy.hp;
  enemy.atk = Math.round(enemy.atk * combatScale);
  enemy.def = Math.round(enemy.def * combatScale);
}

export function startBattle(game, enemyId, opts = {}) {
  const enemy = makeEnemyInstance(enemyId);
  if (opts.scaleToLevel && !enemy.isBoss) scaleEnemyToLevel(enemy, opts.scaleToLevel);
  if (enemy.isBoss) {
    enemy.phaseIdx = 0;
    enemy.phaseTargetHp = Math.max(1, enemy.hp - Math.ceil((enemy.hp / enemy.phases.length) * (enemy.phaseIdx + 1)));
  }
  game.battle = { enemy, log: [], playerBuff: null, storedEnergy: 0, opts, over: false };
  game.state.mode = 'battle';
  logMsg(game, opts.introText || GUARDIAN_INTRO[enemyId] || (enemy.isBoss ? BOSS_INTRO : `A wild ${enemy.name} appears!`));
  if (enemy.flavor) logMsg(game, enemy.flavor);
  audio.playBattleMusic();
  game.showPanel('battle');
  renderBattle(game);
}

function applyBossAction(game, ability, ctx, storedBonus) {
  const battle = game.battle;
  const enemy = battle.enemy;
  const neededId = enemy.phases[enemy.phaseIdx];
  const result = ability.effect(ctx);
  if (ability.id !== neededId) {
    logMsg(game, `${ability.name} passes right through The Null Medium — it hasn't taken on that property yet.`);
    return { isCrit: false, landed: false };
  }
  let dmg = result.dmg != null ? result.dmg : (result.perHit ? result.perHit * (result.hits || 1) : 10);
  dmg = Math.max(1, Math.round(dmg + storedBonus));
  enemy.curHp = Math.max(0, enemy.curHp - dmg);
  logMsg(game, `${ability.name} lands true! The Null Medium reels for ${dmg} damage. ${result.note || ''}`);
  enemy.phaseIdx += 1;
  if (enemy.curHp > 0 && enemy.phaseIdx < enemy.phases.length) {
    const nextName = findAbility(enemy.phases[enemy.phaseIdx]).name;
    logMsg(game, `It shudders and takes on a new property — try ${nextName} next.`);
  }
  return { isCrit: !!result.isCrit, landed: true };
}

function applyPlayerAction(game, ability, ctx) {
  const battle = game.battle;
  let storedBonus = 0;
  if (ability.type === 'attack' && battle.storedEnergy) {
    storedBonus = battle.storedEnergy;
    battle.storedEnergy = 0;
    logMsg(game, `Releasing ${storedBonus} stored (Stokes-shifted) energy from last turn.`);
  }

  if (battle.enemy.isBoss && ability.type === 'attack') {
    return applyBossAction(game, ability, ctx, storedBonus);
  }

  const result = ability.effect(ctx);

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
    battle.enemy.curHp = Math.max(0, battle.enemy.curHp - Math.max(0, net));
    return { isCrit: !!result.isCrit, landed: true };
  }

  battle.playerBuff = result;
  logMsg(game, `${ability.name}: ${result.note || 'You brace for the next attack.'}`);
  return { isCrit: false, landed: false };
}

function enemyTurn(game) {
  const battle = game.battle;
  const enemy = battle.enemy;
  const player = game.state.player;
  if (enemy.curHp <= 0) return;

  const gear = buildGear(player);
  const evasion = gear.lens && gear.lens.evasionBonus ? gear.lens.evasionBonus : 0;
  if (evasion && Math.random() < evasion) {
    logMsg(game, `${enemy.name}'s attack misses completely — your diverging lens scattered its aim.`);
    battle.playerBuff = null;
    return;
  }

  let dmg = Math.max(1, enemy.atk + Math.floor(Math.random() * 5) - 2);
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
  logMsg(game, `${enemy.name} attacks for ${dmg} damage. ${note}`);
  battle.playerBuff = null;
}

export function chooseAbility(game, abilityId) {
  const battle = game.battle;
  if (!battle || battle.over) return;
  const ability = findAbility(abilityId);
  const gear = buildGear(game.state.player);
  const ctx = { player: game.state.player, enemy: battle.enemy, gear, log: m => logMsg(game, m) };
  unlockCodex(game.state, ability.concept, m => logMsg(game, m));

  const actionResult = applyPlayerAction(game, ability, ctx);
  if (actionResult.landed) {
    if (actionResult.isCrit) audio.playCrit();
    else audio.playHit();
  }

  if (battle.enemy.curHp <= 0) {
    resolveVictory(game);
    renderBattle(game);
    return;
  }

  enemyTurn(game);

  if (game.state.player.hp <= 0) {
    resolveDefeat(game);
    renderBattle(game);
    return;
  }

  renderBattle(game);
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
    enemyTurn(game);
    if (game.state.player.hp <= 0) {
      resolveDefeat(game);
    }
    renderBattle(game);
  }
}

function resolveVictory(game) {
  const battle = game.battle;
  const enemy = battle.enemy;
  const state = game.state;
  battle.over = true;
  logMsg(game, `${enemy.name} is defeated!`);
  audio.stopMusic();
  audio.playVictory();
  grantXpWithSound(state, enemy.xp, m => logMsg(game, m));
  (enemy.mats || []).forEach(matId => {
    state.player.materials[matId] = (state.player.materials[matId] || 0) + 1;
    logMsg(game, `Gained 1 ${MATERIALS[matId].name}.`);
  });
  if (battle.opts.guardianMap) {
    state.flags.guardianDefeated[battle.opts.guardianMap] = true;
    logMsg(game, `The path deeper in feels different now...`);
  }
  if (enemy.isBoss) {
    state.flags.bossDefeated = true;
    state.mode = 'victory';
  }
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
  saveGame(state);
}

export function renderBattle(game) {
  const battle = game.battle;
  if (!battle) return;
  const { enemy } = battle;
  const player = game.state.player;
  const d = game.dom;

  const enemySprite = CHARACTER_SPRITES[enemy.id];
  d.battleEnemyCtx.clearRect(0, 0, d.battleEnemyCanvas.width, d.battleEnemyCanvas.height);
  if (enemySprite) {
    const px = enemy.isBoss ? PORTRAIT_PX * 1.15 : PORTRAIT_PX;
    drawSprite(d.battleEnemyCtx, enemySprite.shape, enemySprite.palette, d.battleEnemyCanvas.width / 2, d.battleEnemyCanvas.height / 2 + 6, px);
  }
  d.battlePlayerCtx.clearRect(0, 0, d.battlePlayerCanvas.width, d.battlePlayerCanvas.height);
  drawSprite(d.battlePlayerCtx, 'humanoid', 'player', d.battlePlayerCanvas.width / 2, d.battlePlayerCanvas.height / 2 + 6, PORTRAIT_PX);

  d.battleEnemyName.textContent = enemy.isBoss ? enemy.name + ' (?!)' : enemy.name;
  const enemyPct = Math.max(0, Math.round((enemy.curHp / enemy.hp) * 100));
  d.battleEnemyHpBar.style.width = enemyPct + '%';
  d.battleEnemyHpText.textContent = `${Math.max(0, enemy.curHp)} / ${enemy.hp}`;
  d.battleEnemyHpBar.classList.toggle('critical', enemy.curHp / enemy.hp < 0.25);

  d.battlePlayerHpBar.style.width = Math.max(0, Math.round((player.hp / player.maxHp) * 100)) + '%';
  d.battlePlayerHpText.textContent = `${player.hp} / ${player.maxHp}`;
  d.battlePlayerLevel.textContent = `Lv.${player.level}`;
  d.battlePlayerHpBar.classList.toggle('critical', player.hp / player.maxHp < 0.25);

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

  ABILITIES.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'action-btn ability-btn';
    btn.innerHTML = `<strong>${a.name}</strong><span class="ability-desc">${a.desc}</span>`;
    btn.onclick = () => chooseAbility(game, a.id);
    d.battleActions.appendChild(btn);
  });

  const fleeBtn = document.createElement('button');
  fleeBtn.className = 'action-btn flee-btn';
  fleeBtn.textContent = (battle.opts.guardianMap || enemy.isBoss) ? 'Flee (unavailable)' : 'Flee';
  fleeBtn.disabled = !!(battle.opts.guardianMap || enemy.isBoss);
  fleeBtn.onclick = () => flee(game);
  d.battleActions.appendChild(fleeBtn);
}

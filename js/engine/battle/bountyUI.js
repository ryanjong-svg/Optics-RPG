import { ensureBounties, bountyProgress, canClaimBounty, applyClaimBounty, canRerollBounty, applyRerollBounty, bountyStreakMultiplier, BOUNTY_STREAK_BONUS_MAX_PCT } from './bounty.js';
import { ENEMIES } from '../../data/content/enemies.js';
import { MATERIALS } from '../../data/content/materials.js';
import { findDifficulty } from '../../data/content/difficulty.js';
import { saveGame } from '../core/save.js';
import { showToast } from '../panels/toastUI.js';
import { checkNewAchievements, formatAchievementLines } from '../../data/meta/achievements.js';
import * as audio from '../audio.js';

export function renderBounties(game) {
  if (!game.dom.craftBounties) return;
  const state = game.state;
  const bounties = ensureBounties(state);
  const streak = state.flags.bountyStreak || 0;
  const mult = bountyStreakMultiplier(streak);
  const bonusPct = Math.round((mult - 1) * 100);
  const xpMult = findDifficulty(state.settings.difficulty).xpMult;
  game.dom.craftBounties.innerHTML = bounties.map((bounty, i) => {
    const enemy = ENEMIES[bounty.enemyId];
    const progress = bountyProgress(state, bounty);
    const claimable = canClaimBounty(state, bounty);
    const rerollable = canRerollBounty(bounty);
    const matAmount = Math.round(bounty.rewardAmount * mult);
    const xpAmount = Math.round(bounty.rewardXp * mult * xpMult);
    const reward = bounty.rewardMaterialId
      ? `${matAmount} ${MATERIALS[bounty.rewardMaterialId].name} + ${xpAmount} XP`
      : `${xpAmount} XP`;
    return `
      <div class="recipe-row">
        <div class="recipe-head"><strong>Defeat ${bounty.targetCount} ${enemy.name}</strong></div>
        <div class="recipe-req">Progress: ${progress} / ${bounty.targetCount} — Reward: ${reward}${bonusPct ? ` (+${bonusPct}% streak bonus)` : ''}</div>
        <div class="recipe-btn-row">
          <button class="action-btn bounty-claim" data-slot="${i}" ${claimable ? '' : 'disabled'}>${claimable ? 'Claim' : 'In Progress'}</button>
          <button class="action-btn ghost bounty-reroll" data-slot="${i}" ${rerollable ? '' : 'disabled'}>${rerollable ? 'Reroll' : 'Rerolled'}</button>
        </div>
      </div>
    `;
  }).join('');
  if (game.dom.bountyStreak) {
    game.dom.bountyStreak.textContent = streak
      ? `Bounty Streak: ${streak} (+${bonusPct}% reward bonus, up to +${BOUNTY_STREAK_BONUS_MAX_PCT}%) — rerolling resets it`
      : 'Bounty Streak: 0 — claim bounties back-to-back for a growing reward bonus';
  }

  game.dom.craftBounties.querySelectorAll('.bounty-claim').forEach(btn => {
    btn.onclick = () => claimBounty(game, Number(btn.dataset.slot));
  });
  game.dom.craftBounties.querySelectorAll('.bounty-reroll').forEach(btn => {
    btn.onclick = () => rerollBounty(game, Number(btn.dataset.slot));
  });
}

export function rerollBounty(game, slotIndex) {
  const ok = applyRerollBounty(game.state, slotIndex);
  if (!ok) return;
  audio.playClick();
  saveGame(game.state);
  renderBounties(game);
}

export function claimBounty(game, slotIndex) {
  const state = game.state;
  const ok = applyClaimBounty(state, slotIndex, m => showToast(game, m));
  if (!ok) return;
  audio.playQuestComplete();
  const newlyUnlocked = checkNewAchievements(state);
  if (newlyUnlocked.length) audio.playAchievement();
  formatAchievementLines(newlyUnlocked).forEach(m => showToast(game, m));
  saveGame(state);
  renderBounties(game);
}

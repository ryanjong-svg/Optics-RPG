import { ensureBounties, bountyProgress, canClaimBounty, applyClaimBounty } from './bounty.js';
import { ENEMIES } from '../data/enemies.js';
import { MATERIALS } from '../data/materials.js';
import { saveGame } from './save.js';
import { showToast } from './toastUI.js';
import { checkNewAchievements, formatAchievementLines } from '../data/achievements.js';
import * as audio from './audio.js';

export function renderBounties(game) {
  if (!game.dom.craftBounties) return;
  const state = game.state;
  const bounties = ensureBounties(state);
  game.dom.craftBounties.innerHTML = bounties.map((bounty, i) => {
    const enemy = ENEMIES[bounty.enemyId];
    const progress = bountyProgress(state, bounty);
    const claimable = canClaimBounty(state, bounty);
    const reward = bounty.rewardMaterialId
      ? `${bounty.rewardAmount} ${MATERIALS[bounty.rewardMaterialId].name} + ${bounty.rewardXp} XP`
      : `${bounty.rewardXp} XP`;
    return `
      <div class="recipe-row">
        <div class="recipe-head"><strong>Defeat ${bounty.targetCount} ${enemy.name}</strong></div>
        <div class="recipe-req">Progress: ${progress} / ${bounty.targetCount} — Reward: ${reward}</div>
        <div class="recipe-btn-row">
          <button class="action-btn bounty-claim" data-slot="${i}" ${claimable ? '' : 'disabled'}>${claimable ? 'Claim' : 'In Progress'}</button>
        </div>
      </div>
    `;
  }).join('');

  game.dom.craftBounties.querySelectorAll('.bounty-claim').forEach(btn => {
    btn.onclick = () => claimBounty(game, Number(btn.dataset.slot));
  });
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

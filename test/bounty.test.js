import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BOUNTY_SLOT_COUNT, generateBounty, ensureBounties, bountyProgress, canClaimBounty, applyClaimBounty,
  canRerollBounty, applyRerollBounty, MAX_REROLLS_PER_BOUNTY, bountyStreakMultiplier, BOUNTY_STREAK_BONUS_MAX_PCT
} from '../js/engine/battle/bounty.js';
import { ZONE_ENCOUNTERS } from '../js/engine/world/overworld.js';
import { ENEMIES } from '../js/data/content/enemies.js';
import { newGameState } from '../js/engine/core/state.js';

const ALL_CANDIDATES = new Set(Object.values(ZONE_ENCOUNTERS).flat());

test('generateBounty: targets a real, repeatable random-encounter enemy with a reasonable target count', () => {
  const state = newGameState();
  const bounty = generateBounty(state);
  assert.ok(ALL_CANDIDATES.has(bounty.enemyId), 'bounty enemy should come from a real ZONE_ENCOUNTERS pool');
  assert.ok(bounty.targetCount >= 3 && bounty.targetCount <= 6);
  assert.equal(bounty.baseline, 0, 'a fresh state has no kills yet');
});

test('generateBounty: reward is derived from the target enemy\'s own material drop', () => {
  const state = newGameState();
  const bounty = generateBounty(state);
  const enemy = ENEMIES[bounty.enemyId];
  assert.equal(bounty.rewardMaterialId, enemy.mats[0]);
  assert.ok(bounty.rewardAmount >= 1);
  assert.ok(bounty.rewardXp > 0);
});

test('generateBounty: baseline snapshots the enemy\'s current lifetime kill count, not zero', () => {
  const state = newGameState();
  state.flags.enemyKillCounts.wisp = 7;
  const bounty = generateBounty(state, [/* force wisp by excluding everything else won't work, so just check via retry */]);
  // Regenerate until we happen to land on wisp (deterministic enough given the small pool), or check the invariant directly.
  for (let i = 0; i < 200; i++) {
    const b = generateBounty(state);
    if (b.enemyId === 'wisp') {
      assert.equal(b.baseline, 7);
      return;
    }
  }
  assert.fail('expected to roll "wisp" at least once in 200 tries to verify its baseline');
});

test('ensureBounties: fills the board to BOUNTY_SLOT_COUNT and leaves an already-full board untouched', () => {
  const state = newGameState();
  const bounties = ensureBounties(state);
  assert.equal(bounties.length, BOUNTY_SLOT_COUNT);
  assert.equal(ensureBounties(state), state.flags.bounties, 'should not regenerate an already-full board');
});

test('bountyProgress/canClaimBounty: tracks kills since the bounty was issued, not lifetime kills', () => {
  const state = newGameState();
  state.flags.enemyKillCounts.wisp = 5;
  const bounty = { enemyId: 'wisp', targetCount: 3, baseline: 5 };
  assert.equal(bountyProgress(state, bounty), 0);
  assert.equal(canClaimBounty(state, bounty), false);

  state.flags.enemyKillCounts.wisp = 8;
  assert.equal(bountyProgress(state, bounty), 3);
  assert.equal(canClaimBounty(state, bounty), true);
});

test('bountyProgress: clamps at the target even if far more kills have happened since', () => {
  const state = newGameState();
  state.flags.enemyKillCounts.wisp = 50;
  const bounty = { enemyId: 'wisp', targetCount: 3, baseline: 0 };
  assert.equal(bountyProgress(state, bounty), 3);
});

test('applyClaimBounty: refuses (returns false) when the bounty is not yet complete', () => {
  const state = newGameState();
  state.flags.bounties = [{ enemyId: 'wisp', targetCount: 5, baseline: 0, rewardMaterialId: 'water', rewardAmount: 2, rewardXp: 20 }];
  state.flags.enemyKillCounts.wisp = 2;
  assert.equal(applyClaimBounty(state, 0), false);
});

test('applyClaimBounty: grants the material + XP reward, increments bountiesClaimed, and replaces the slot', () => {
  const state = newGameState();
  state.flags.bounties = [{ enemyId: 'wisp', targetCount: 3, baseline: 0, rewardMaterialId: 'water', rewardAmount: 2, rewardXp: 20 }];
  state.flags.enemyKillCounts.wisp = 3;
  const ok = applyClaimBounty(state, 0, () => {});
  assert.equal(ok, true);
  assert.equal(state.player.materials.water, 2);
  assert.equal(state.flags.bountiesClaimed, 1);
  assert.ok(state.flags.bounties[0], 'the slot should be refilled with a new bounty, not left empty');
});

test('applyClaimBounty: works with no reward material (grants XP only), if a bounty somehow has none', () => {
  const state = newGameState();
  state.flags.bounties = [{ enemyId: 'wisp', targetCount: 1, baseline: 0, rewardMaterialId: null, rewardAmount: 0, rewardXp: 10 }];
  state.flags.enemyKillCounts.wisp = 1;
  const xpBefore = state.player.xp;
  const ok = applyClaimBounty(state, 0, () => {});
  assert.equal(ok, true);
  assert.ok(state.player.xp > xpBefore || state.player.level > 1, 'XP should have been granted');
});

test('canRerollBounty: allowed up to MAX_REROLLS_PER_BOUNTY, then refused', () => {
  const bounty = { rerollsUsed: 0 };
  assert.equal(canRerollBounty(bounty), true);
  bounty.rerollsUsed = MAX_REROLLS_PER_BOUNTY;
  assert.equal(canRerollBounty(bounty), false);
});

test('applyRerollBounty: swaps the slot for a fresh bounty and consumes the reroll allowance', () => {
  const state = newGameState();
  state.flags.bounties = [{ enemyId: 'wisp', targetCount: 3, baseline: 0, rerollsUsed: 0, rewardMaterialId: 'water', rewardAmount: 1, rewardXp: 10 }];
  const ok = applyRerollBounty(state, 0);
  assert.equal(ok, true);
  const rerolled = state.flags.bounties[0];
  assert.equal(rerolled.rerollsUsed, 1);
  assert.equal(canRerollBounty(rerolled), false, 'the fresh bounty should already be out of rerolls');
});

test('applyRerollBounty: refuses once the slot\'s reroll allowance is used up', () => {
  const state = newGameState();
  state.flags.bounties = [{ enemyId: 'wisp', targetCount: 3, baseline: 0, rerollsUsed: MAX_REROLLS_PER_BOUNTY, rewardMaterialId: 'water', rewardAmount: 1, rewardXp: 10 }];
  assert.equal(applyRerollBounty(state, 0), false);
});

test('bountyStreakMultiplier: grows 10% per streak point, capped at BOUNTY_STREAK_BONUS_MAX_PCT', () => {
  assert.equal(bountyStreakMultiplier(0), 1);
  assert.equal(bountyStreakMultiplier(1), 1.1);
  assert.equal(bountyStreakMultiplier(3), 1.3);
  assert.equal(bountyStreakMultiplier(5), 1 + BOUNTY_STREAK_BONUS_MAX_PCT / 100);
  assert.equal(bountyStreakMultiplier(50), 1 + BOUNTY_STREAK_BONUS_MAX_PCT / 100, 'should not keep growing past the cap');
  assert.equal(bountyStreakMultiplier(undefined), 1, 'a missing streak should behave like zero');
});

test('applyClaimBounty: increments the streak and applies its reward bonus on the next claim', () => {
  const state = newGameState();
  state.flags.bounties = [{ enemyId: 'wisp', targetCount: 1, baseline: 0, rewardMaterialId: 'water', rewardAmount: 5, rewardXp: 100 }];
  state.flags.enemyKillCounts.wisp = 1;
  applyClaimBounty(state, 0, () => {});
  assert.equal(state.flags.bountyStreak, 1, 'streak should advance after a claim');
  assert.equal(state.player.materials.water, 5, 'no bonus yet on this first claim (streak was 0 going in)');

  // Second claim, now at streak 1 going in -> a 10% bonus should apply.
  state.flags.bounties[0] = { enemyId: 'wisp', targetCount: 1, baseline: 1, rewardMaterialId: 'water', rewardAmount: 5, rewardXp: 100 };
  state.flags.enemyKillCounts.wisp = 2;
  applyClaimBounty(state, 0, () => {});
  assert.equal(state.player.materials.water, 5 + 6, 'Math.round(5 * 1.1) = 6 bonus material granted');
  assert.equal(state.flags.bountyStreak, 2);
});

test('applyRerollBounty: resets the streak back to zero', () => {
  const state = newGameState();
  state.flags.bountyStreak = 3;
  state.flags.bounties = [{ enemyId: 'wisp', targetCount: 3, baseline: 0, rerollsUsed: 0, rewardMaterialId: 'water', rewardAmount: 1, rewardXp: 10 }];
  applyRerollBounty(state, 0);
  assert.equal(state.flags.bountyStreak, 0);
});

test('applyClaimBounty: tracks the best streak ever reached, surviving a later reroll reset', () => {
  const state = newGameState();
  state.flags.bounties = [{ enemyId: 'wisp', targetCount: 1, baseline: 0, rerollsUsed: 0, rewardMaterialId: 'water', rewardAmount: 1, rewardXp: 10 }];
  state.flags.enemyKillCounts.wisp = 1;
  applyClaimBounty(state, 0, () => {});
  assert.equal(state.flags.bestBountyStreak, 1);

  state.flags.bounties[0] = { enemyId: 'wisp', targetCount: 1, baseline: 1, rerollsUsed: 0, rewardMaterialId: 'water', rewardAmount: 1, rewardXp: 10 };
  state.flags.enemyKillCounts.wisp = 2;
  applyClaimBounty(state, 0, () => {});
  assert.equal(state.flags.bestBountyStreak, 2);

  applyRerollBounty(state, 0);
  assert.equal(state.flags.bountyStreak, 0);
  assert.equal(state.flags.bestBountyStreak, 2, 'the best-ever streak should not be erased by a reroll reset');
});

test('applyClaimBounty: XP reward scales with the difficulty xpMult; materials never do', () => {
  const grantedXp = difficultyId => {
    const state = newGameState();
    state.settings.difficulty = difficultyId;
    state.flags.bounties = [{ enemyId: 'wisp', targetCount: 1, baseline: 0, rewardMaterialId: 'water', rewardAmount: 4, rewardXp: 100 }];
    state.flags.enemyKillCounts.wisp = 1;
    const msgs = [];
    applyClaimBounty(state, 0, m => msgs.push(m));
    const xpMsg = msgs.find(m => /^Gained \d+ XP\.$/.test(m));
    return { xp: Number(xpMsg.match(/\d+/)[0]), material: state.player.materials.water };
  };

  const normal = grantedXp('normal');
  const hard = grantedXp('hard');
  const easy = grantedXp('easy');
  assert.equal(normal.xp, 100, 'normal has xpMult 1');
  assert.equal(hard.xp, 90, 'hard has xpMult 0.9');
  assert.equal(easy.xp, 115, 'easy has xpMult 1.15');
  assert.equal(normal.material, 4);
  assert.equal(hard.material, 4, 'materials do not scale with difficulty, unlike XP');
  assert.equal(easy.material, 4);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BOUNTY_SLOT_COUNT, generateBounty, ensureBounties, bountyProgress, canClaimBounty, applyClaimBounty
} from '../js/engine/bounty.js';
import { ZONE_ENCOUNTERS } from '../js/engine/overworld.js';
import { ENEMIES } from '../js/data/enemies.js';
import { newGameState } from '../js/engine/state.js';

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

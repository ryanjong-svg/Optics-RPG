// Named achievements, shown in the Field Log. Milestone achievements are
// computed live from existing state; the three "special" ones are captured
// at the moment they happen in battle.js and stored in state.flags.achievements.
import { CODEX } from './codex.js';
import { LORE, isLoreUnlocked } from './lore.js';
import { RECIPES } from './equipment.js';
import { QUESTS } from './quests.js';
import { MAPS } from './maps.js';

const GUARDIAN_MAP_IDS = Object.values(MAPS).filter(m => m.guardian).map(m => m.id);
const SECRET_MAP_IDS = Object.values(MAPS).filter(m => m.secret).map(m => m.id);

export const ACHIEVEMENTS = {
  apprentice_no_more: {
    title: 'Apprentice No More',
    desc: 'Reach character level 5.',
    check: state => state.player.level >= 5
  },
  renaissance_scholar: {
    title: 'Renaissance Scholar',
    desc: 'Unlock every Codex entry.',
    check: state => Object.keys(CODEX).every(id => state.codexUnlocked[id])
  },
  living_chronicle: {
    title: 'Living Chronicle',
    desc: 'Unlock every Chronicle entry.',
    check: state => Object.entries(LORE).every(([, entry]) => isLoreUnlocked(state, entry))
  },
  fully_equipped: {
    title: 'Fully Equipped',
    desc: 'Craft every piece of equipment.',
    check: state => RECIPES.every(r => state.player.ownedGear[r.id])
  },
  debt_collector: {
    title: 'Debt Collector',
    desc: 'Complete every side quest.',
    check: state => Object.keys(QUESTS).every(id => state.flags.quests[id] === 'completed')
  },
  all_guardians: {
    title: 'Guardian of the Reach',
    desc: `Defeat every zone guardian (${GUARDIAN_MAP_IDS.length} total).`,
    check: state => GUARDIAN_MAP_IDS.every(id => state.flags.guardianDefeated[id])
  },
  treasure_hunter: {
    title: 'Treasure Hunter',
    desc: 'Find every hidden cache.',
    check: state => SECRET_MAP_IDS.every(id => state.flags.secretsFound && state.flags.secretsFound[id])
  },
  bending_resolved: {
    title: 'The Bending Resolved',
    desc: 'Defeat the Null Medium.',
    check: state => !!state.flags.bossDefeated
  },
  overqualified: {
    title: 'Overqualified',
    desc: 'Deal more damage in one hit than an enemy\'s full health.',
    check: state => !!(state.flags.achievements && state.flags.achievements.overqualified)
  },
  unscathed: {
    title: 'Unscathed',
    desc: 'Defeat a guardian without taking any damage.',
    check: state => !!(state.flags.achievements && state.flags.achievements.unscathed)
  },
  one_trick: {
    title: 'One Trick',
    desc: 'Defeat a guardian using only a single ability all fight.',
    check: state => !!(state.flags.achievements && state.flags.achievements.one_trick)
  },
  cycle_walker: {
    title: 'Cycle Walker',
    desc: 'Begin a New Game+.',
    check: state => (state.flags.ngPlusCycle || 0) >= 1
  }
};

export function unlockedAchievements(state) {
  return Object.entries(ACHIEVEMENTS).filter(([, a]) => a.check(state));
}

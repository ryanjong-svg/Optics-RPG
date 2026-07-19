// A player-chosen, always-on setting (unlike New Game+, which only ratchets
// up after beating the boss) - stacks multiplicatively with both NG+ and the
// existing per-level scaling.
export const DIFFICULTIES = {
  easy: {
    id: 'easy', label: 'Easy', enemyMult: 0.75, xpMult: 1.15,
    desc: 'Weaker enemies, more XP per fight — good for focusing on the physics without much combat pressure.'
  },
  normal: {
    id: 'normal', label: 'Normal', enemyMult: 1, xpMult: 1,
    desc: 'The default balance.'
  },
  hard: {
    id: 'hard', label: 'Hard', enemyMult: 1.35, xpMult: 0.9,
    desc: 'Tougher enemies, less XP per fight — for players who want the combat to bite back.'
  }
};

export function findDifficulty(id) {
  return DIFFICULTIES[id] || DIFFICULTIES.normal;
}

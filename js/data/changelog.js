// Bumped whenever a batch of player-visible changes ships. Compared against
// state.flags.lastSeenVersion (see save.js/whatsNewUI.js) to decide whether
// the What's New panel has anything unread to show.
export const GAME_VERSION = '1.4.0';

export const CHANGELOG = [
  {
    version: '1.4.0',
    highlights: [
      'Fixed a bug where leaving a zone (or a depth zone) could teleport you far from the passage you actually used - you now land right back at that doorway.',
      'Multiple save slots - keep separate runs side by side, switchable from Settings.',
      'A What\'s New panel (you\'re looking at it) to catch up on recent changes.',
      'Elite enemy variants can now occasionally appear in place of a normal encounter - tougher, and better rewarded.',
      'Ability combos: chaining certain abilities back-to-back now grants a small bonus.',
      'A post-battle report card breaking down damage, hits, and turns for the fight you just finished.'
    ]
  },
  {
    version: '1.3.0',
    highlights: [
      'A zero-risk Training Dummy to practice loadouts and puzzle timing at the Workbench.',
      'New Game+ cycle 3 or later unlocks a cosmetic "ascended" look for your character.',
      'The Field Log now tracks lifetime stats: damage dealt, battles won, fastest boss kill, most-used ability.',
      'A Chronicle epilogue unlocks once every achievement has been earned.'
    ]
  },
  {
    version: '1.2.0',
    highlights: [
      'A Brewster\'s-angle aiming puzzle for Polarize Filter.',
      'New Game+ cycle 2 or later gives the final boss a bonus fifth phase.',
      'The overworld now shows drifting, zone-tinted ambience matching each zone\'s battle backdrop.',
      'A second equipment upgrade tier: the Single-Photon Avalanche Diode.'
    ]
  },
  {
    version: '1.1.0',
    highlights: [
      'A one-time onboarding hint the first time an aiming-puzzle ability is used.',
      'Two new achievements: Perfect Refraction and Dual Nature.',
      'A second physics aiming puzzle, for Diffraction Wave.',
      'A new zone, The Avalanche Well, completing every zone\'s depth-variant pair.',
      'Battle portraits now show a canvas-drawn, zone-themed backdrop instead of a plain background.'
    ]
  },
  {
    version: '1.0.0',
    highlights: [
      'The full base game: 6 zones plus 6 depth variants, a final boss, crafting, specializations, New Game+, and a full achievement set.'
    ]
  }
];

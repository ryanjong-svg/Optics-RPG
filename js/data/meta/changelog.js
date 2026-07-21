// Bumped whenever a batch of player-visible changes ships. Compared against
// state.flags.lastSeenVersion (see save.js/whatsNewUI.js) to decide whether
// the What's New panel has anything unread to show.
export const GAME_VERSION = '1.13.0';

export const CHANGELOG = [
  {
    version: '1.13.0',
    highlights: [
      'The Fiber Optic Tunnels and Graded Core can now roll a "fog" weather event, boosting TIR Shield for a few fights — the tunnels\' counterpart to Prism Peak\'s glare.',
      'Reaching Trusted standing with any professor now unlocks a 15% Trading Post discount, plus a one-time bonus line of dialogue at Trusted and Cherished.',
      'The Quest Log\'s Standing section now shows a progress bar toward each professor\'s next tier.',
      'The Trading Post now shows a "Last trade" readout after every barter.'
    ]
  },
  {
    version: '1.12.0',
    highlights: [
      'The three professors now track your standing with them (Stranger through Cherished), visible in a new "Standing" section of the Quest Log.',
      'A new Trading Post at the Workbench lets you barter one material directly for another, at a rate based on rarity.',
      'Prism Peak and the Rutile Chasm can now roll a temporary "glare" event that makes Polarize Filter block even more for a few fights.'
    ]
  },
  {
    version: '1.11.0',
    highlights: [
      'The Field Log now tracks hardcore puzzle hits (landed with Puzzle Hints off), backing a new "Blind Marksman" achievement.',
      'The Field Log now shows exactly which zones still need an Elite kill toward the Zone Conqueror achievement.',
      'Loadouts can now be swapped mid-battle - costs your turn, same as using an item.',
      'Bounty Board XP rewards now scale with your difficulty setting, like every other XP grant.'
    ]
  },
  {
    version: '1.10.0',
    highlights: [
      'The Field Log now shows your current and best-ever Bounty Board claim streak.',
      'A new "Zone Conqueror" achievement for defeating an Elite enemy in every zone that has them.',
      'Landing an aiming-puzzle shot with Puzzle Hints off now grants a small bonus XP.',
      'Bestiary entries can now be starred as favorites - they float to the top of every view, regardless of sort or search.'
    ]
  },
  {
    version: '1.9.0',
    highlights: [
      'Landing two ability combos back-to-back now completes a "combo chain" for an even bigger bonus, backing a new "Chain Reaction" achievement.'
    ]
  },
  {
    version: '1.8.0',
    highlights: [
      'Claiming Bounty Board goals back-to-back now builds a streak for a growing reward bonus.',
      'The Field Log now tracks Elites defeated, broken down by zone.',
      'A "Puzzle Hints" setting: turn it off to hide aiming-puzzle targets for a real challenge instead of always being shown the answer.',
      'The Field Log now tracks which ability combos you\'ve actually landed at least once.',
      'The Bestiary can now be sorted by zone order, alphabetically, or uncaught-first, alongside the existing search.'
    ]
  },
  {
    version: '1.7.0',
    highlights: [
      'Bounty Board goals can now be rerolled once before they must be claimed.',
      'The Elite enemy aura now tints to match each zone\'s own battle-backdrop color instead of a fixed amber.',
      'A Keyboard Shortcuts reference added to the Help panel.',
      'A Reduced Motion setting to turn off the CRT overlay and screen-shake/pulse animations.',
      'The Bestiary can now be searched by name.'
    ]
  },
  {
    version: '1.6.0',
    highlights: [
      'Loadout presets can now be given custom names.',
      'Elite enemies now play a distinct sound cue on encounter.',
      'Elite encounter frequency now rises with each New Game+ cycle.',
      'A repeatable Bounty Board at the Workbench for ongoing side goals between quests.',
      'A new Chronicle entry covering Elite enemies.'
    ]
  },
  {
    version: '1.5.0',
    highlights: [
      'New achievements for defeating Elite enemies and landing ability combos.',
      'Two more ability combo pairs added to the existing set.',
      'Save slots can now be given custom names.',
      'Audited and fixed several tactical-map connectivity issues.'
    ]
  },
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

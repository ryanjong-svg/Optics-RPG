// A persistent reference for mechanics otherwise only explained once via a
// one-time onboarding hint (see state.js's claimHint) — easy to miss or forget.
export const HELP_TOPICS = [
  {
    title: 'Charge',
    body: 'Your strongest attacks cost Charge (shown as the ⚡ bar in battle). It regenerates slowly each ' +
      'completed turn, or you can fully restore it anytime by Meditating at the Workbench. Cheaper abilities ' +
      'that cost no Charge are always available.'
  },
  {
    title: 'Ability Cooldowns',
    body: 'The three strongest attacks also need a turn or two to recover after use — the battle log will tell ' +
      'you exactly how many turns are left. Weaker abilities have no cooldown, so they are always a fallback ' +
      'when your best options are recharging.'
  },
  {
    title: 'Multi-Enemy Packs',
    body: 'In the deeper zones, you can sometimes run into two enemies traveling together. Most abilities hit ' +
      'every living target in a pack at once, but so do their attacks — expect faster, bigger battles.'
  },
  {
    title: 'Wanderers & Surprise Attacks',
    body: 'Some enemies are visible on the map before you fight them. Walking into one grants a one-time damage ' +
      'bonus on your first attack of that fight — a small reward for spotting the threat first.'
  },
  {
    title: 'Telegraphed Attacks',
    body: 'Guardians and the final boss sometimes announce a heavy attack a turn in advance. Use that warning to ' +
      'shore up your defenses or land a decisive hit of your own before it lands.'
  },
  {
    title: 'Guardian Second Phase & Boss Enrage',
    body: 'Guardians fight harder once dropped to half health, and the final boss enrages below a quarter — both ' +
      'are one-time attack boosts, not something that stacks further no matter how long the fight drags on.'
  },
  {
    title: 'Gear Loadouts',
    body: 'Save your currently equipped gear to either of two Workbench loadout slots, then load it back anytime ' +
      '— handy for switching between builds without revisiting every equipment dropdown.'
  },
  {
    title: 'Combining Gear',
    body: 'A few end-game recipes are upgrades rather than fresh builds — the Workbench shows a "Combine" button ' +
      'once you own the right predecessor item. Combining consumes that predecessor (it is no longer owned), and ' +
      'the upgrade takes its place if it was equipped, so nothing is lost in the process.'
  },
  {
    title: 'Difficulty Settings',
    body: 'Change difficulty anytime from the Settings panel. Easy weakens enemies and raises XP gain; Hard ' +
      'toughens enemies and lowers it. This does not require starting over.'
  },
  {
    title: 'New Game+',
    body: 'After defeating the Null Medium, you can begin a New Game+ cycle: every guardian, secret, and quest ' +
      'resets for a tougher replay with escalating enemy stats, while your level, gear, materials, and ' +
      'Codex/Chronicle/Bestiary knowledge all carry over. From cycle 1 onward, guardians and the boss also ' +
      '"adapt" to an overused ability — its damage drops noticeably if you keep repeating it, so rotating ' +
      'abilities matters more each cycle, not just bigger enemy numbers.'
  },
  {
    title: 'Specialization',
    body: 'Once you reach character level 5, the Workbench lets you choose between Photon Focus (boosts Laser ' +
      'Focus and Photoelectric Shock, and reduces their Charge cost) and Wave Mechanics (boosts Diffraction Wave, ' +
      'Interference Cancel, and Dispersion Burst, and regenerates Charge faster). Switching is free and instant, ' +
      'any time — try both and see which fits your playstyle.'
  },
  {
    title: 'Aiming the Beam',
    body: 'Refraction Bend opens a small puzzle instead of firing instantly: set the incident angle and Snell\'s ' +
      'Law (n₁sinθ₁ = n₂sinθ₂) determines exactly where the refracted ray lands. Hit the target zone for bonus ' +
      'damage — missing still lands a normal hit, so there is no risk in experimenting with the angle.'
  },
  {
    title: 'Ability Combos',
    body: 'Using certain abilities right before a matching follow-up grants a bonus on that follow-up: TIR Shield ' +
      'into Reflect Strike, Interference Cancel into Diffraction Wave, Polarize Filter into Photoelectric Shock, ' +
      'and Refraction Bend into Laser Focus. The battle log calls out a combo the moment it lands, so it is easy ' +
      'to learn by playing rather than needing to memorize this list up front.'
  },
  {
    title: 'Elite Enemies',
    body: 'Random encounters occasionally spawn as a tougher "Elite" variant, marked by a pulsing amber glow on ' +
      'its portrait and a renamed label in the battle log. Elites hit harder and have more HP, but drop double ' +
      'materials and far more XP — worth the extra fight if you can spare the Charge.'
  }
];

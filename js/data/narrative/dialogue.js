export const INTRO_LINES = [
  'Welcome to Candela’s Reach, apprentice — and to Lumen Village, the one patch of ground where its rival optical traditions share a Workbench instead of a wall.',
  'Legend says every creature here is a fragment of the First Ray, still deciding what to become at some boundary it once crossed. Scholars call that first, world-splitting moment the Bending.',
  'Out there, creatures of misunderstood light and matter roam free — Prism Sprites, Mirror Golems, things that shouldn’t exist if you really understood optics.',
  'Gather materials, craft real lenses, mirrors, prisms and filters at the Workbench, and use the actual physics of light to put them right.',
  'Talk to the three Professors near the Workbench any time — they’ll test what you know and reward you for it. Check the Chronicle button to learn the Reach’s history as you explore, and the Codex for the physics behind every fight.',
  'Use arrow keys or WASD to move. Walk into an enemy, NPC, item, or the Workbench to interact.'
];

export const NPC_INTRO = {
  prof_lumen: 'Professor Lumen adjusts her spectacles. "Snell\'s Law, reflection, the basics — the Unbroken Ray teaches this first for a reason. Ask and I shall quiz you."',
  prof_mirrors: 'Professor Silvers polishes a mirror shard. "Total internal reflection, polarization — the Silvered Circle\'s whole trade. Ask away."',
  prof_labs: 'Professor Gapp taps a silicon wafer. "Band gaps, the photoelectric effect — the Vanguard\'s modern stuff. Ready?"'
};

// A one-time bonus line of in-character flavor, shown alongside the standing
// toast the moment a professor's reputation first crosses into Trusted or
// Cherished - a small narrative payoff for reaching those tiers, on top of
// the Trading Post discount that Trusted+ standing also unlocks.
export const NPC_TIER_FLAVOR = {
  prof_lumen: {
    Trusted: 'Professor Lumen sets down her chalk. "You\'ve earned more than answers now — ask, and I\'ll explain the parts I usually skip."',
    Cherished: 'Professor Lumen almost smiles. "Between us, apprentice — you\'ve out-studied half my old cohort at the Unbroken Ray."'
  },
  prof_mirrors: {
    Trusted: 'Professor Silvers lowers her guard, just slightly. "Most people I still call \'apprentice.\' You I\'ll call by name, if you\'d like."',
    Cherished: 'Professor Silvers exhales. "The Silvered Circle doesn\'t trust easily. I do, now — for what that\'s worth."'
  },
  prof_labs: {
    Trusted: 'Professor Gapp grins wider than usual. "Alright, you\'ve earned lab-partner status. Don\'t make me regret it."',
    Cherished: 'Professor Gapp claps you on the shoulder. "Vanguard\'s modern stuff, ancient trust — you\'ve got both from me now."'
  }
};

export const GUARDIAN_INTRO = {
  reflection_wraith: 'An endless hallway of reflections coalesces into a shrieking wraith!',
  chroma_beast: 'Blurred rainbow fringes converge into a lumbering beast!',
  attenuation_slug: 'A slow, light-draining slug blocks the tunnel ahead!',
  photon_sentinel: 'A crystalline sentinel powers on, humming at exactly 1.1 eV.',
  aperture_sentinel: 'Two points of light drift toward each other in the dark — and the Sentinel decides, once and for all, whether you can still tell them apart.',
  archive_wraith: 'A shape steps out of the recorded light, sure of its own footsteps, certain it was never anything but real.'
};

export const BOSS_INTRO =
  'The air itself thins to nothing. This is the one fragment of the Bending that refused every fate offered — the Null Medium has no index, no reflectivity, no band gap of its own. It will borrow yours, one property at a time, and only the matching concept can touch it.';

export const BOSS_LOCKED_MESSAGE =
  'The Null Medium ignores you completely. "Understand your neighbor first," it seems to say, glancing at the Photon Sentinel.';

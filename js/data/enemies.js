export const ENEMIES = {
  wisp: {
    id: 'wisp', name: 'Will-o’-Wisp', hp: 22, atk: 5, def: 1, xp: 10, mats: ['water'],
    weakTo: ['laser_focus'], weakNote: 'coherent light cuts through scattered fog; incoherent light just scatters more.',
    resists: ['reflect_strike'], resistNote: 'fog has no solid surface to bounce a reflection off.',
    zone: 'village', flavor: 'A patch of light scattered by water droplets, drifting over the marsh (Rayleigh/Mie scattering).'
  },
  puddle_imp: {
    id: 'puddle_imp', name: 'Puddle Imp', hp: 18, atk: 4, def: 1, xp: 8, mats: ['water'],
    weakTo: ['refraction_bend'], weakNote: 'a shallow puddle bends light easily at any incidence angle.',
    resists: [], zone: 'village', flavor: 'A mischievous ripple that mirrors and bends whatever pokes it.'
  },
  glint_moth: {
    id: 'glint_moth', name: 'Glint Moth', hp: 20, atk: 5, def: 1, xp: 10, mats: ['water'],
    weakTo: ['diffraction_wave'], weakNote: 'its erratic, fluttering path is exactly the kind of small obstacle a wave bends around easily.',
    resists: ['laser_focus'], resistNote: 'a narrow, focused beam keeps missing something that never flies in a straight line.',
    zone: 'village', flavor: 'A small light-drawn creature that never settles on one path — the Bending in miniature, still deciding where to go.'
  },
  mirror_golem: {
    id: 'mirror_golem', name: 'Mirror Golem', hp: 40, atk: 8, def: 6, xp: 20, mats: ['silver', 'aluminum'],
    weakTo: ['polarize_filter', 'diffraction_wave'],
    weakNote: 'glare from its polished shell is fully polarized at Brewster’s angle, and waves diffract right around its flat face.',
    resists: ['reflect_strike'], resistNote: 'a mirror strike reflects straight back off its polished shell.',
    zone: 'mirrors', flavor: 'A hulking construct of silvered glass panels, endlessly bouncing light between its plates.'
  },
  reflection_wraith: {
    id: 'reflection_wraith', name: 'Infinite Reflection Wraith', hp: 34, atk: 7, def: 3, xp: 22, mats: ['silver'],
    weakTo: ['absorb_reemit'], weakNote: 'absorbing swallows every ghost-image the wraith throws back at once.',
    resists: ['dispersion_burst'], resistNote: 'splitting light into more copies just feeds a creature made of copies.',
    zone: 'mirrors', flavor: 'Two facing mirrors gone wrong — an endless hallway of its own reflection given form.'
  },
  fractured_pane: {
    id: 'fractured_pane', name: 'Fractured Pane', hp: 30, atk: 6, def: 4, xp: 16, mats: ['silver', 'aluminum'],
    weakTo: ['diffraction_wave'], weakNote: 'light bends cleanly through the cracks running across its broken surface.',
    resists: ['reflect_strike'], resistNote: 'a shattered mirror scatters a clean reflection in a dozen wrong directions instead of bouncing it back.',
    zone: 'mirrors', flavor: 'A shard of the Hall’s original glasswork, still trying and failing to reflect anything whole.'
  },
  prism_sprite: {
    id: 'prism_sprite', name: 'Prism Sprite', hp: 30, atk: 6, def: 2, xp: 18, mats: ['flint_glass'],
    weakTo: ['refraction_bend'], weakNote: 'a clean achromatic bend cuts through without adding more color spread.',
    resists: ['dispersion_burst'], resistNote: 'it’s already made of split rainbow light — more dispersion barely registers.',
    zone: 'prism', flavor: 'A living shard of dispersed light, forever splitting into color.'
  },
  chroma_beast: {
    id: 'chroma_beast', name: 'Chromatic Aberration Beast', hp: 38, atk: 9, def: 3, xp: 24, mats: ['flint_glass', 'crown_glass'],
    weakTo: ['laser_focus'], weakNote: 'a single coherent color has no fringing for it to smear.',
    resists: ['refraction_bend'], resistNote: 'ordinary refraction just adds more chromatic smear, feeding it.',
    zone: 'prism', flavor: 'A beast wreathed in blurred rainbow fringes, born from an uncorrected lens.'
  },
  spectral_moth: {
    id: 'spectral_moth', name: 'Spectral Moth', hp: 26, atk: 6, def: 2, xp: 14, mats: ['flint_glass'],
    weakTo: ['laser_focus'], weakNote: 'a single coherent color can’t be split any further the way scattered white light can.',
    resists: ['refraction_bend'], resistNote: 'ordinary refraction just adds one more bend to a creature already made of split color.',
    zone: 'prism', flavor: 'A flickering, many-colored shape that never holds still long enough to be one wavelength.'
  },
  signal_wisp: {
    id: 'signal_wisp', name: 'Signal Wisp', hp: 26, atk: 6, def: 2, xp: 16, mats: ['quartz'],
    weakTo: ['refraction_bend'], weakNote: 'a fiber-matched refraction keeps the signal bouncing cleanly down the core.',
    resists: ['diffraction_wave'], resistNote: 'diffraction spreads the signal out — exactly how real fibers lose data.',
    zone: 'fiber', flavor: 'A pulse of guided light, born of a fiber-optic core-cladding boundary.'
  },
  attenuation_slug: {
    id: 'attenuation_slug', name: 'Attenuation Slug', hp: 32, atk: 5, def: 4, xp: 18, mats: ['quartz'],
    weakTo: ['laser_focus'], weakNote: 'a tight coherent beam resists losing energy to scattering far better than spread light.',
    resists: ['diffraction_wave'], resistNote: 'more spreading just feeds its favorite meal: attenuation.',
    zone: 'fiber', flavor: 'A slow drain on any beam that passes — every fiber loses some light to absorption and scattering.'
  },
  drift_echo: {
    id: 'drift_echo', name: 'Drift Echo', hp: 24, atk: 5, def: 2, xp: 13, mats: ['quartz', 'water'],
    weakTo: ['reflect_strike'], weakNote: 'a single clean reflection collapses a stray echo back into one signal.',
    resists: ['dispersion_burst'], resistNote: 'it’s already a guided, single-color pulse — splitting it into more colors doesn’t confuse it.',
    zone: 'fiber', flavor: 'A message that never arrived, still bouncing down a corridor toward a receiver that stopped listening lifetimes ago.'
  },
  photon_sentinel: {
    id: 'photon_sentinel', name: 'Photon Sentinel', hp: 46, atk: 10, def: 8, xp: 30, mats: ['silicon'],
    bandgapEV: 1.1,
    weakTo: ['photoelectric_shock'], weakNote: 'only photons above its 1.1 eV band gap can knock an electron loose.',
    resists: ['reflect_strike', 'refraction_bend', 'dispersion_burst', 'diffraction_wave', 'laser_focus'],
    resistNote: 'below the band gap, no matter how the light arrives, it just passes through or reflects off harmlessly.',
    zone: 'lab', flavor: 'A crystalline sentry standing guard over the Semiconductor Labs, immune to light it cannot absorb.'
  },
  null_medium: {
    id: 'null_medium', name: 'The Null Medium', hp: 70, atk: 11, def: 5, xp: 80, mats: [],
    isBoss: true,
    phases: ['reflect_strike', 'refraction_bend', 'dispersion_burst', 'photoelectric_shock'],
    flavor: 'A perfect vacuum given a grudge. It has no index, no reflectivity, no band gap of its own — it borrows a different property from you each phase, and only the matching concept can touch it.'
  }
};

export function makeEnemyInstance(id) {
  const base = ENEMIES[id];
  return { ...base, curHp: base.hp, phaseIdx: 0 };
}

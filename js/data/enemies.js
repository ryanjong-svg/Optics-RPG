export const ENEMIES = {
  wisp: {
    id: 'wisp', name: 'Will-o’-Wisp', glyph: '\u{1F441}\u{FE0F}', hp: 22, atk: 5, def: 1, xp: 10, mats: ['water'],
    weakTo: ['laser_focus'], weakNote: 'coherent light cuts through scattered fog; incoherent light just scatters more.',
    resists: ['reflect_strike'], resistNote: 'fog has no solid surface to bounce a reflection off.',
    zone: 'village', flavor: 'A patch of light scattered by water droplets, drifting over the marsh (Rayleigh/Mie scattering).'
  },
  puddle_imp: {
    id: 'puddle_imp', name: 'Puddle Imp', glyph: '\u{1F4A6}', hp: 18, atk: 4, def: 1, xp: 8, mats: ['water'],
    weakTo: ['refraction_bend'], weakNote: 'a shallow puddle bends light easily at any incidence angle.',
    resists: [], zone: 'village', flavor: 'A mischievous ripple that mirrors and bends whatever pokes it.'
  },
  mirror_golem: {
    id: 'mirror_golem', name: 'Mirror Golem', glyph: '\u{1FA9E}', hp: 40, atk: 8, def: 6, xp: 20, mats: ['silver', 'aluminum'],
    weakTo: ['polarize_filter', 'diffraction_wave'],
    weakNote: 'glare from its polished shell is fully polarized at Brewster’s angle, and waves diffract right around its flat face.',
    resists: ['reflect_strike'], resistNote: 'a mirror strike reflects straight back off its polished shell.',
    zone: 'mirrors', flavor: 'A hulking construct of silvered glass panels, endlessly bouncing light between its plates.'
  },
  reflection_wraith: {
    id: 'reflection_wraith', name: 'Infinite Reflection Wraith', glyph: '\u{1F47B}', hp: 34, atk: 7, def: 3, xp: 22, mats: ['silver'],
    weakTo: ['absorb_reemit'], weakNote: 'absorbing swallows every ghost-image the wraith throws back at once.',
    resists: ['dispersion_burst'], resistNote: 'splitting light into more copies just feeds a creature made of copies.',
    zone: 'mirrors', flavor: 'Two facing mirrors gone wrong — an endless hallway of its own reflection given form.'
  },
  prism_sprite: {
    id: 'prism_sprite', name: 'Prism Sprite', glyph: '\u{1F53A}', hp: 30, atk: 6, def: 2, xp: 18, mats: ['flint_glass'],
    weakTo: ['refraction_bend'], weakNote: 'a clean achromatic bend cuts through without adding more color spread.',
    resists: ['dispersion_burst'], resistNote: 'it’s already made of split rainbow light — more dispersion barely registers.',
    zone: 'prism', flavor: 'A living shard of dispersed light, forever splitting into color.'
  },
  chroma_beast: {
    id: 'chroma_beast', name: 'Chromatic Aberration Beast', glyph: '\u{1F308}', hp: 38, atk: 9, def: 3, xp: 24, mats: ['flint_glass', 'crown_glass'],
    weakTo: ['laser_focus'], weakNote: 'a single coherent color has no fringing for it to smear.',
    resists: ['refraction_bend'], resistNote: 'ordinary refraction just adds more chromatic smear, feeding it.',
    zone: 'prism', flavor: 'A beast wreathed in blurred rainbow fringes, born from an uncorrected lens.'
  },
  signal_wisp: {
    id: 'signal_wisp', name: 'Signal Wisp', glyph: '\u{1F4A1}', hp: 26, atk: 6, def: 2, xp: 16, mats: ['quartz'],
    weakTo: ['refraction_bend'], weakNote: 'a fiber-matched refraction keeps the signal bouncing cleanly down the core.',
    resists: ['diffraction_wave'], resistNote: 'diffraction spreads the signal out — exactly how real fibers lose data.',
    zone: 'fiber', flavor: 'A pulse of guided light, born of a fiber-optic core-cladding boundary.'
  },
  attenuation_slug: {
    id: 'attenuation_slug', name: 'Attenuation Slug', glyph: '\u{1F40C}', hp: 32, atk: 5, def: 4, xp: 18, mats: ['quartz'],
    weakTo: ['laser_focus'], weakNote: 'a tight coherent beam resists losing energy to scattering far better than spread light.',
    resists: ['diffraction_wave'], resistNote: 'more spreading just feeds its favorite meal: attenuation.',
    zone: 'fiber', flavor: 'A slow drain on any beam that passes — every fiber loses some light to absorption and scattering.'
  },
  photon_sentinel: {
    id: 'photon_sentinel', name: 'Photon Sentinel', glyph: '\u{1F916}', hp: 46, atk: 10, def: 8, xp: 30, mats: ['silicon'],
    bandgapEV: 1.1,
    weakTo: ['photoelectric_shock'], weakNote: 'only photons above its 1.1 eV band gap can knock an electron loose.',
    resists: ['reflect_strike', 'refraction_bend', 'dispersion_burst', 'diffraction_wave', 'laser_focus'],
    resistNote: 'below the band gap, no matter how the light arrives, it just passes through or reflects off harmlessly.',
    zone: 'lab', flavor: 'A crystalline sentry standing guard over the Semiconductor Labs, immune to light it cannot absorb.'
  },
  null_medium: {
    id: 'null_medium', name: 'The Null Medium', glyph: '\u{26AA}', hp: 70, atk: 11, def: 5, xp: 80, mats: [],
    isBoss: true,
    phases: ['reflect_strike', 'refraction_bend', 'dispersion_burst', 'photoelectric_shock'],
    flavor: 'A perfect vacuum given a grudge. It has no index, no reflectivity, no band gap of its own — it borrows a different property from you each phase, and only the matching concept can touch it.'
  }
};

export function makeEnemyInstance(id) {
  const base = ENEMIES[id];
  return { ...base, curHp: base.hp, phaseIdx: 0 };
}

import { findAbility } from './abilities.js';

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
    weakTo: ['diffraction_wave'],
    weakNote: 'waves diffract cleanly around its flat, polished face.',
    resists: ['reflect_strike'], resistNote: 'a mirror strike reflects straight back off its polished shell.',
    zone: 'mirrors', flavor: 'A hulking construct of silvered glass panels, endlessly bouncing light between its plates.'
  },
  reflection_wraith: {
    id: 'reflection_wraith', name: 'Infinite Reflection Wraith', hp: 34, atk: 7, def: 3, xp: 22, mats: ['silver'],
    weakTo: ['refraction_bend'], weakNote: 'a beam that refracts through its surface escapes the endless reflection loop instead of feeding it.',
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
    id: 'attenuation_slug', name: 'Attenuation Slug', hp: 36, atk: 7, def: 5, xp: 20, mats: ['quartz'],
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
  slit_wisp: {
    id: 'slit_wisp', name: 'Slit Wisp', hp: 28, atk: 6, def: 2, xp: 15, mats: ['opal'],
    weakTo: ['diffraction_wave'], weakNote: 'a wave bends cleanly around its double-slit pattern and catches both paths of light at once.',
    resists: ['reflect_strike'], resistNote: 'it can’t decide whether it’s one bright thing or two — a flat reflection has nothing solid to bounce off.',
    zone: 'grating', flavor: 'A flicker born where two paths of the same light insisted on interfering with each other.'
  },
  grating_wraith: {
    id: 'grating_wraith', name: 'Grating Wraith', hp: 36, atk: 8, def: 4, xp: 20, mats: ['opal', 'quartz'],
    weakTo: ['laser_focus'], weakNote: 'a single coherent color isn’t split into confusing orders the way white light is.',
    resists: ['dispersion_burst'], resistNote: 'it’s already a ruled, periodic spectrum — more splitting just adds to its own pattern.',
    zone: 'grating', flavor: 'A shard of a shattered diffraction grating, still carrying its ruled lines like old scars.'
  },
  standing_wave: {
    id: 'standing_wave', name: 'Standing Wave', hp: 26, atk: 6, def: 2, xp: 14, mats: ['silver_halide'],
    weakTo: ['reflect_strike'], weakNote: 'a standing wave is literally built from a wave reflecting into itself — one more clean reflection collapses its nodes.',
    resists: ['laser_focus'], resistNote: 'a steady coherent beam just reinforces the pattern instead of disrupting it.',
    zone: 'hologram', flavor: 'A pattern of nodes and antinodes that never travels, only pulses in place.'
  },
  fringe_phantom: {
    id: 'fringe_phantom', name: 'Fringe Phantom', hp: 34, atk: 8, def: 3, xp: 19, mats: ['silver_halide', 'quartz'],
    weakTo: ['dispersion_burst'], weakNote: 'it holds together only as a single pure wavelength — splitting it into colors unravels its coherence.',
    resists: ['reflect_strike'], resistNote: 'reflecting the wave just adds another wave for it to interfere with, feeding it.',
    zone: 'hologram', flavor: 'A creature stitched from interference fringes, coherent only so long as its color stays pure.'
  },
  photon_sentinel: {
    id: 'photon_sentinel', name: 'Photon Sentinel', hp: 46, atk: 10, def: 8, xp: 30, mats: ['silicon'],
    bandgapEV: 1.1,
    weakTo: ['photoelectric_shock'], weakNote: 'only photons above its 1.1 eV band gap can knock an electron loose.',
    resists: ['reflect_strike', 'refraction_bend', 'dispersion_burst', 'diffraction_wave', 'laser_focus'],
    resistNote: 'below the band gap, no matter how the light arrives, it just passes through or reflects off harmlessly.',
    zone: 'lab', flavor: 'A crystalline sentry standing guard over the Semiconductor Labs, immune to light it cannot absorb.'
  },
  aperture_sentinel: {
    id: 'aperture_sentinel', name: 'Aperture Sentinel', hp: 42, atk: 9, def: 6, xp: 26, mats: ['opal'],
    weakTo: ['laser_focus'], weakNote: 'only a coherent, tightly resolved beam is precise enough to be told apart from the space beside it — the Rayleigh criterion made literal.',
    resists: ['diffraction_wave', 'dispersion_burst'], resistNote: 'spreading light out — by diffraction or dispersion — only blurs it further past resolving.',
    zone: 'grating', flavor: 'A patient, faceted watcher that blurs anything struck without precision back into an indistinct smear.'
  },
  archive_wraith: {
    id: 'archive_wraith', name: 'Archive Wraith', hp: 44, atk: 10, def: 6, xp: 28, mats: ['silver_halide', 'silver'],
    weakTo: ['refraction_bend'], weakNote: 'bending the reconstructing beam breaks the exact angle match a hologram needs to replay correctly.',
    resists: ['laser_focus', 'reflect_strike'], resistNote: 'a coherent beam and a clean reflection are exactly what a hologram is built from — both just feed the illusion.',
    zone: 'hologram', flavor: 'A hologram of an old guardian, reconstructed so faithfully from its recorded fringes that it no longer accepts it is a copy.'
  },
  split_ray_wisp: {
    id: 'split_ray_wisp', name: 'Split-Ray Wisp', hp: 28, atk: 6, def: 3, xp: 17, mats: ['calcite'],
    weakTo: ['refraction_bend'], weakNote: 'a beam obeying Snell’s law splits clean along the crystal’s two indices instead of blurring further.',
    resists: ['dispersion_burst'], resistNote: 'it’s already dividing one ray into two — further splitting barely registers.',
    zone: 'mirrors_deep', flavor: 'A flicker that never travels as one ray — birefringence given a will of its own.'
  },
  twin_flicker: {
    id: 'twin_flicker', name: 'Twin Flicker', hp: 32, atk: 7, def: 4, xp: 19, mats: ['calcite', 'silver'],
    weakTo: ['diffraction_wave'], weakNote: 'a wave already spreading on its own doesn’t care which of the crystal’s two indices it meets.',
    resists: ['reflect_strike'], resistNote: 'a flat reflection bounces off both twinned images identically, changing nothing.',
    zone: 'mirrors_deep', flavor: 'Two afterimages of the same light, permanently out of step with each other.'
  },
  twinned_specter: {
    id: 'twinned_specter', name: 'Twinned Specter', hp: 48, atk: 10, def: 7, xp: 34, mats: ['calcite', 'silver'],
    weakTo: ['refraction_bend'], weakNote: 'a beam bent by Snell’s law separates cleanly along the crystal’s ordinary and extraordinary axes, unraveling the twin for good.',
    resists: ['reflect_strike'], resistNote: 'reflecting doesn’t touch the crystal’s internal index split at all.',
    zone: 'mirrors_deep', flavor: 'The Hall of Mirrors’ oldest secret finally given a shape: a guardian that is, quite literally, always two things at once.'
  },
  fire_moth: {
    id: 'fire_moth', name: 'Fire Moth', hp: 30, atk: 7, def: 3, xp: 18, mats: ['rutile'],
    weakTo: ['laser_focus'], weakNote: 'a single coherent color has no fire left to disperse.',
    resists: ['refraction_bend'], resistNote: 'ordinary bending just adds more smear to a creature already made of it.',
    zone: 'prism_deep', flavor: 'A cinder of pure chromatic fire, cut loose from a gemstone that refracts harder than diamond.'
  },
  ember_shard: {
    id: 'ember_shard', name: 'Ember Shard', hp: 34, atk: 8, def: 4, xp: 20, mats: ['rutile', 'flint_glass'],
    weakTo: ['dispersion_burst'], weakNote: 'oddly, splitting it further overloads a fire that was never meant to burn in this many colors at once.',
    resists: ['reflect_strike'], resistNote: 'a plain reflection has no dispersion in it at all — nothing for the shard to catch fire from.',
    zone: 'prism_deep', flavor: 'A splinter of rutile still burning with refracted light long after it broke free of the mountain.'
  },
  rutile_wyrm: {
    id: 'rutile_wyrm', name: 'Rutile Wyrm', hp: 50, atk: 11, def: 8, xp: 36, mats: ['rutile', 'flint_glass'],
    weakTo: ['laser_focus'], weakNote: 'one coherent color is the only light this creature can’t split into more fire to feed on.',
    resists: ['dispersion_burst'], resistNote: 'it’s made of pure extreme dispersion already — more splitting just feeds it.',
    zone: 'prism_deep', flavor: 'Coiled at the bottom of the chasm, wreathed in a refracted fire hotter and stranger than the mountain above it.'
  },
  mode_flicker: {
    id: 'mode_flicker', name: 'Mode Flicker', hp: 28, atk: 6, def: 3, xp: 17, mats: ['ge_doped_silica'],
    weakTo: ['refraction_bend'], weakNote: 'a graded-index profile is nothing but continuous refraction — a clean bend fits right through it.',
    resists: ['diffraction_wave'], resistNote: 'spreading out is exactly what a graded core is built to prevent.',
    zone: 'fiber_deep', flavor: 'A pulse that keeps almost losing its shape, then doesn’t — the graded core correcting it faster than it can blur.'
  },
  core_leech: {
    id: 'core_leech', name: 'Core Leech', hp: 32, atk: 7, def: 4, xp: 19, mats: ['ge_doped_silica', 'quartz'],
    weakTo: ['photoelectric_shock'], weakNote: 'a photon energetic enough to clear a real band gap punches straight through its graded shell.',
    resists: ['laser_focus'], resistNote: 'a single coherent mode is exactly what a graded-index core is tuned to carry cleanly — it barely notices.',
    zone: 'fiber_deep', flavor: 'Something that has learned to live inside a fiber core, feeding on whatever light loses its way there.'
  },
  dispersion_choke: {
    id: 'dispersion_choke', name: 'Dispersion Choke', hp: 52, atk: 11, def: 8, xp: 36, mats: ['ge_doped_silica', 'quartz'],
    weakTo: ['laser_focus'], weakNote: 'single-mode coherent light is immune to the modal dispersion this guardian depends on.',
    resists: ['diffraction_wave'], resistNote: 'a graded index profile is precisely engineered to resist any further spreading.',
    zone: 'fiber_deep', flavor: 'The Tunnels’ deepest choke point, where every multimode signal that ever wandered too wide still waits to arrive.'
  },
  lattice_wisp: {
    id: 'lattice_wisp', name: 'Lattice Wisp', hp: 30, atk: 7, def: 4, xp: 18, mats: ['photonic_crystal'],
    bandgapEV: 1.4,
    weakTo: ['photoelectric_shock'], weakNote: 'like an electronic band gap, only photon energies outside its photonic band gap get through at all.',
    resists: ['diffraction_wave'], resistNote: 'it’s built from a periodic lattice already tuned to diffract at this exact spacing — more of the same barely registers.',
    zone: 'grating_deep', flavor: 'A flicker of light trapped in a lattice fine enough to forbid it a way through at all.'
  },
  forbidden_mote: {
    id: 'forbidden_mote', name: 'Forbidden Mote', hp: 34, atk: 8, def: 5, xp: 21, mats: ['photonic_crystal', 'opal'],
    bandgapEV: 1.4,
    weakTo: ['photoelectric_shock'], weakNote: 'only energy that clears its forbidden band actually reaches it.',
    resists: ['dispersion_burst'], resistNote: 'splitting light into more colors just gives it more wavelengths already inside its own forbidden band.',
    zone: 'grating_deep', flavor: 'A mote of light that exists only in the narrow band the lattice around it refuses to forbid.'
  },
  lattice_warden: {
    id: 'lattice_warden', name: 'Lattice Warden', hp: 54, atk: 12, def: 9, xp: 38, mats: ['photonic_crystal', 'opal'],
    bandgapEV: 1.4,
    weakTo: ['photoelectric_shock'], weakNote: 'exactly like a semiconductor band gap, only a photon energetic enough clears its photonic one.',
    resists: ['diffraction_wave', 'dispersion_burst'], resistNote: 'diffracting or splitting the beam further just adds more wavelengths already forbidden by its own lattice.',
    zone: 'grating_deep', flavor: 'The engineered heart of the Grating Gardens’ deepest lattice, forbidding almost everything except the one energy that was always going to end it.'
  },
  phase_echo: {
    id: 'phase_echo', name: 'Phase Echo', hp: 30, atk: 7, def: 4, xp: 18, mats: ['lithium_niobate'],
    weakTo: ['refraction_bend'], weakNote: 'an electro-optic crystal bends light by voltage-induced index change — a direct refraction attack overloads that exact mechanism.',
    resists: ['reflect_strike'], resistNote: 'a plain reflection never touches the crystal’s internal field at all.',
    zone: 'hologram_deep', flavor: 'A recording that keeps almost resolving into an image, held together by a field with nowhere left to discharge.'
  },
  fringe_ghost: {
    id: 'fringe_ghost', name: 'Fringe Ghost', hp: 34, atk: 8, def: 4, xp: 20, mats: ['lithium_niobate', 'silver_halide'],
    weakTo: ['dispersion_burst'], weakNote: 'splitting its recorded light into separate colors breaks the single reference wavelength it needs to reconstruct.',
    resists: ['laser_focus'], resistNote: 'a single coherent beam is exactly the reference wave a hologram is built to answer — it just reinforces the recording.',
    zone: 'hologram_deep', flavor: 'The ghost of an interference pattern recorded so many times over it no longer remembers which exposure it actually is.'
  },
  volume_warden: {
    id: 'volume_warden', name: 'Volume Warden', hp: 52, atk: 11, def: 8, xp: 37, mats: ['lithium_niobate', 'silver_halide'],
    weakTo: ['refraction_bend'], weakNote: 'a direct index-changing bend overloads the same electro-optic effect the warden runs on.',
    resists: ['laser_focus', 'reflect_strike'], resistNote: 'a coherent beam and a clean reflection are exactly the two things a volume hologram is built to answer with — both just feed it.',
    zone: 'hologram_deep', flavor: 'A guardian recorded so deep in the vault’s crystal that it doesn’t just show a memory of a defender anymore — the electro-optic field holding it up simply refuses to switch off.'
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

// Shared by the in-battle Bestiary hint and the Bestiary panel, so both
// describe an enemy's known matchups the same way.
export function weaknessResistanceText(enemy) {
  const weak = (enemy.weakTo || []).map(id => findAbility(id)).filter(Boolean).map(a => a.name);
  const resist = (enemy.resists || []).map(id => findAbility(id)).filter(Boolean).map(a => a.name);
  const parts = [];
  if (weak.length) parts.push(`Weak to: ${weak.join(', ')}.`);
  if (resist.length) parts.push(`Resists: ${resist.join(', ')}.`);
  return parts.join(' ');
}

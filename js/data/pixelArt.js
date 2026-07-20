// Hand-authored 8-bit-style sprites, River City Ransom-esque: chunky, thick-outlined,
// symmetric silhouettes. Each shape is defined as its LEFT HALF only (one char per
// pixel column, left edge -> center); the renderer mirrors it to build the full sprite.
// '.' = transparent, 'K' = outline, everything else is a palette key resolved per instance.
export const SHAPES = {
  humanoid: [
    '....KH',
    '...KHH',
    '..KHHH',
    '..KSSS',
    '..KSES',
    '...KSS',
    '....KS',
    '.KJJJJ',
    '.KJJJJ',
    '.KJJJG',
    '.KJJJJ',
    '..KJJJ',
    '...KPP',
    '...KP.',
    '...KP.',
    '..KPP.'
  ],
  ghost: [
    '....KA',
    '...KAA',
    '..KAAA',
    '.KAAAA',
    '.KAAAA',
    '.KAEAA',
    '.KAAAA',
    '.KAAAA',
    '..KAAA',
    '...KAA',
    '....KA',
    '.....K'
  ],
  imp: [
    '....KC',
    '...KCC',
    '..KAAA',
    '.KAEAA',
    '.KAAAA',
    '.KAAAA',
    '..KAAA',
    '..KAAA',
    '...KAA',
    '...K.A',
    '...K.A',
    '...K..'
  ],
  golem: [
    '..KAAA',
    '.KAAAA',
    '.KADAA',
    '.KAAAA',
    '..KAAA',
    '.KAAAA',
    '.KAAAA',
    '.KABAA',
    '.KAAAA',
    '.KAAAA',
    '..KAAA',
    '..KAAA',
    '..KAAA',
    '...KAA'
  ],
  wraith: [
    '.....K',
    '....KA',
    '...KAA',
    '..KAAA',
    '..KAEA',
    '..KAAA',
    '.KAAAA',
    '.KAAAA',
    '.KAAAA',
    '.KAAAA',
    '.KAAAA',
    '.KAAAA',
    '..KAAA',
    '..KAAA',
    '...KAA',
    '....KA'
  ],
  slug: [
    '..KAAA',
    '.KAEAA',
    '.KAAAA',
    'KAAAAA',
    'KAAAAA',
    'KAAAAA',
    '.KAAAA',
    '..KAAA'
  ],
  voidling: [
    '......K',
    '.....KA',
    '...KAAA',
    '..KAAAA',
    '.KAAAAA',
    '.KAAAAA',
    'KAAAEAA',
    'KAAAEAA',
    '.KAAAAA',
    '.KAAAAA',
    '..KAAAA',
    '..KAAAA',
    '...KAAA',
    '....KAA'
  ],
  gem: [
    '..K.',
    '.KDA',
    'KAAA',
    '.KAA',
    '..K.'
  ],
  signpost: [
    '..KA.',
    '.KAAA',
    '.KAAA',
    '..KB.',
    '..KB.',
    '..KB.',
    '..KB.'
  ],
  toolbox: [
    '..KAAA',
    '.KAAAA',
    'KAAAAA',
    'KABAAA',
    'KAAAAA',
    'KAAAAA',
    '.KAAAA',
    '..KAAA'
  ],
  // A bulkier, broader-shouldered golem variant with a twinned core glow —
  // reserved for the game's crystalline/lattice guardians (photon_sentinel,
  // lattice_warden) so its most "monumental" fights stand apart visually.
  colossus: [
    '.KAAAA',
    'KAAAAA',
    'KAAAAA',
    'KADDAA',
    'KAAAAA',
    'KAAAAA',
    '.KAAAA',
    '.KABBA',
    '.KAAAA',
    '.KAAAA',
    '.KAAAA',
    '..KAAA',
    '..KAAA',
    '..KAAA',
    '...KAA'
  ],
  // A wraith with a second, fainter silhouette bleeding off its left edge —
  // reserved for twinned_specter, whose entire identity is birefringence:
  // one ray splitting into two. The doubling is drawn, not just described.
  twin_wraith: [
    '....CK',
    '...CKA',
    '..CKAA',
    '..KAAA',
    '..KAEA',
    '..KAAA',
    '.CKAAA',
    '.KAAAA',
    '.KAAAA',
    '.KAAAA',
    '.KAAAA',
    '.KAAAA',
    '..KAAA',
    '..KAAA',
    '...KAA',
    '....KA'
  ]
};

const OUTLINE = '#100a1a';

export const PALETTES = {
  player: { K: OUTLINE, H: '#5a3a22', S: '#f2c18c', E: '#151018', J: '#2e8b57', G: '#ffd166', P: '#2b4c8c' },
  prof_lumen: { K: OUTLINE, H: '#d8d8e6', S: '#f2c18c', E: '#151018', J: '#7c4dff', G: '#ffe28a', P: '#3a2f5c' },
  prof_mirrors: { K: OUTLINE, H: '#2a2020', S: '#e8b384', E: '#151018', J: '#26a69a', G: '#dff7f4', P: '#1f4d48' },
  prof_labs: { K: OUTLINE, H: '#161616', S: '#c98a5b', E: '#151018', J: '#ff7043', G: '#ffe0b3', P: '#5c3a1f' },

  wisp: { K: OUTLINE, A: '#dfe9ff', E: '#1a1a2e' },
  signal_wisp: { K: OUTLINE, A: '#7dfcff', E: '#0a2a2e' },
  drift_echo: { K: OUTLINE, A: '#6b8fff', E: '#0a1030' },
  slit_wisp: { K: OUTLINE, A: '#e8d9a0', E: '#2a2408' },
  standing_wave: { K: OUTLINE, A: '#b088e0', E: '#1a0a2e' },

  puddle_imp: { K: OUTLINE, A: '#3aa0ff', C: '#1a5fb4', E: '#0a1a2e' },
  prism_sprite: { K: OUTLINE, A: '#c084fc', C: '#f472b6', E: '#2a0a2e' },
  glint_moth: { K: OUTLINE, A: '#d9e88a', C: '#8fae3a', E: '#1a2408' },

  mirror_golem: { K: OUTLINE, A: '#b8bfc7', B: '#6b7280', D: '#eaf6ff' },
  photon_sentinel: { K: OUTLINE, A: '#2a2a55', B: '#39ff88', D: '#c6ff5c' },
  fractured_pane: { K: OUTLINE, A: '#c9d6e0', B: '#5a6570', D: '#ffffff' },
  aperture_sentinel: { K: OUTLINE, A: '#f0d878', B: '#a8862e', D: '#ffffff' },

  reflection_wraith: { K: OUTLINE, A: '#241b3a', E: '#e8f0ff' },
  chroma_beast: { K: '#2a0a1a', A: '#8b3fae', E: '#5cf0ff' },
  spectral_moth: { K: '#2a0a1a', A: '#f4a6d8', E: '#3a0a2a' },
  grating_wraith: { K: OUTLINE, A: '#c9a15c', E: '#e8f0ff' },
  fringe_phantom: { K: '#2a0a1a', A: '#e05ca0', E: '#2a0a1a' },
  archive_wraith: { K: OUTLINE, A: '#4a2a6e', E: '#dcc8ff' },

  attenuation_slug: { K: OUTLINE, A: '#6b7a3a', E: '#c0392b' },

  null_medium: { K: '#3a2a5c', A: '#0a0612', E: '#ffffff' },

  toolbox: { K: OUTLINE, A: '#8a5a2e', B: '#c0c0c0' },
  signpost: { K: OUTLINE, A: '#e8e0c8', B: '#7a4a2b' },

  gem_water: { K: OUTLINE, A: '#4aa3ff', D: '#eaf6ff' },
  gem_crown_glass: { K: OUTLINE, A: '#cfe8ff', D: '#ffffff' },
  gem_flint_glass: { K: OUTLINE, A: '#e0a457', D: '#fff2d9' },
  gem_quartz: { K: OUTLINE, A: '#f0c6e0', D: '#ffffff' },
  gem_diamond: { K: OUTLINE, A: '#eaf6ff', D: '#ffffff' },
  gem_silicon: { K: OUTLINE, A: '#5a6270', D: '#c6d0e0' },
  gem_silver: { K: OUTLINE, A: '#cfd4da', D: '#ffffff' },
  gem_aluminum: { K: OUTLINE, A: '#9fb2c4', D: '#eef4fa' },
  gem_polaroid: { K: OUTLINE, A: '#5c4a8a', D: '#c9b8ff' },
  gem_sapphire: { K: OUTLINE, A: '#2e5fd6', D: '#bcd4ff' },
  gem_opal: { K: OUTLINE, A: '#cdeee0', D: '#ff9ff3' },
  gem_silver_halide: { K: OUTLINE, A: '#8a8a94', D: '#e8d8c0' },
  gem_calcite: { K: OUTLINE, A: '#bfe3ff', D: '#ffffff' },
  gem_rutile: { K: OUTLINE, A: '#ff6a3a', D: '#ffd9a0' },
  gem_ge_doped_silica: { K: OUTLINE, A: '#7fe0c8', D: '#eafff8' },
  gem_photonic_crystal: { K: OUTLINE, A: '#b088e0', D: '#e8d9ff' },
  gem_lithium_niobate: { K: OUTLINE, A: '#d94aa0', D: '#ffd9ef' },
  gem_avalanche_silicon: { K: OUTLINE, A: '#ffcc33', D: '#ffffff' },
  gem_geiger_mode_silicon: { K: OUTLINE, A: '#ff3333', D: '#ffffff' },

  split_ray_wisp: { K: OUTLINE, A: '#bfe3ff', E: '#0a2a3a' },
  twin_flicker: { K: OUTLINE, A: '#8fc7e0', C: '#e8f7ff', E: '#0a2a3a' },
  twinned_specter: { K: OUTLINE, A: '#4a7d94', C: '#2a4d5c', E: '#eaf7ff' },

  fire_moth: { K: OUTLINE, A: '#ff8a4a', C: '#ffd166', E: '#3a0a0a' },
  ember_shard: { K: '#3a0a0a', A: '#ff5a2a', E: '#ffd166' },
  rutile_wyrm: { K: OUTLINE, A: '#c23a1a', B: '#7a1f0a', D: '#ffb066' },

  mode_flicker: { K: OUTLINE, A: '#7fe0c8', E: '#0a2a24' },
  core_leech: { K: OUTLINE, A: '#4aa88a', E: '#c0392b' },
  dispersion_choke: { K: OUTLINE, A: '#2f8f74', B: '#1c5c48', D: '#c8fff0' },

  lattice_wisp: { K: OUTLINE, A: '#b088e0', E: '#1a0a2e' },
  forbidden_mote: { K: OUTLINE, A: '#9a6ad0', C: '#e0c8ff', E: '#1a0a2e' },
  lattice_warden: { K: OUTLINE, A: '#6a3fae', B: '#3f1f6e', D: '#e8d9ff' },

  phase_echo: { K: OUTLINE, A: '#d94aa0', E: '#2a0a1e' },
  fringe_ghost: { K: '#2a0a1e', A: '#b23a80', E: '#ffd9ef' },
  volume_warden: { K: OUTLINE, A: '#8a2a60', B: '#5c1a40', D: '#ffb0dd' },

  dark_current_wisp: { K: OUTLINE, A: '#3a3a4a', E: '#ffee88' },
  gain_specter: { K: OUTLINE, A: '#ffcc33', C: '#ffffff', E: '#1a1a2e' },
  multiplication_warden: { K: OUTLINE, A: '#2a2a55', B: '#ffcc33', D: '#ffffff' }
};

// enemyId/npcId -> { shape, palette }
export const CHARACTER_SPRITES = {
  player: { shape: 'humanoid', palette: 'player' },
  prof_lumen: { shape: 'humanoid', palette: 'prof_lumen' },
  prof_mirrors: { shape: 'humanoid', palette: 'prof_mirrors' },
  prof_labs: { shape: 'humanoid', palette: 'prof_labs' },

  wisp: { shape: 'ghost', palette: 'wisp' },
  signal_wisp: { shape: 'ghost', palette: 'signal_wisp' },
  drift_echo: { shape: 'ghost', palette: 'drift_echo' },
  slit_wisp: { shape: 'ghost', palette: 'slit_wisp' },
  standing_wave: { shape: 'ghost', palette: 'standing_wave' },
  puddle_imp: { shape: 'imp', palette: 'puddle_imp' },
  prism_sprite: { shape: 'imp', palette: 'prism_sprite' },
  glint_moth: { shape: 'imp', palette: 'glint_moth' },
  mirror_golem: { shape: 'golem', palette: 'mirror_golem' },
  photon_sentinel: { shape: 'colossus', palette: 'photon_sentinel' },
  fractured_pane: { shape: 'golem', palette: 'fractured_pane' },
  aperture_sentinel: { shape: 'golem', palette: 'aperture_sentinel' },
  reflection_wraith: { shape: 'wraith', palette: 'reflection_wraith' },
  chroma_beast: { shape: 'wraith', palette: 'chroma_beast' },
  spectral_moth: { shape: 'wraith', palette: 'spectral_moth' },
  grating_wraith: { shape: 'wraith', palette: 'grating_wraith' },
  fringe_phantom: { shape: 'wraith', palette: 'fringe_phantom' },
  archive_wraith: { shape: 'wraith', palette: 'archive_wraith' },
  attenuation_slug: { shape: 'slug', palette: 'attenuation_slug' },
  null_medium: { shape: 'voidling', palette: 'null_medium' },

  split_ray_wisp: { shape: 'ghost', palette: 'split_ray_wisp' },
  twin_flicker: { shape: 'imp', palette: 'twin_flicker' },
  twinned_specter: { shape: 'twin_wraith', palette: 'twinned_specter' },

  fire_moth: { shape: 'imp', palette: 'fire_moth' },
  ember_shard: { shape: 'wraith', palette: 'ember_shard' },
  rutile_wyrm: { shape: 'golem', palette: 'rutile_wyrm' },

  mode_flicker: { shape: 'ghost', palette: 'mode_flicker' },
  core_leech: { shape: 'slug', palette: 'core_leech' },
  dispersion_choke: { shape: 'golem', palette: 'dispersion_choke' },

  lattice_wisp: { shape: 'ghost', palette: 'lattice_wisp' },
  forbidden_mote: { shape: 'imp', palette: 'forbidden_mote' },
  lattice_warden: { shape: 'colossus', palette: 'lattice_warden' },

  phase_echo: { shape: 'ghost', palette: 'phase_echo' },
  fringe_ghost: { shape: 'wraith', palette: 'fringe_ghost' },
  volume_warden: { shape: 'golem', palette: 'volume_warden' },

  dark_current_wisp: { shape: 'ghost', palette: 'dark_current_wisp' },
  gain_specter: { shape: 'imp', palette: 'gain_specter' },
  multiplication_warden: { shape: 'colossus', palette: 'multiplication_warden' }
};

export function itemSprite(materialId) {
  return { shape: 'gem', palette: `gem_${materialId}` };
}

// Grid only encodes walls/floor/grass. Everything interactive is layered on top
// as coordinate lists so it's easy to reason about and hard to typo into a bug.
// '#' wall (blocks movement), '.' floor, ',' grass (random-encounter zone)
const W = 16, H = 11;

function borderedGrassBlock() {
  return [
    '################',
    '#..............#',
    '#..,,,....,,,..#',
    '#..,,,....,,,..#',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..,,,....,,,..#',
    '#..,,,....,,,..#',
    '#..............#',
    '################'
  ];
}

export const MAPS = {
  village: {
    id: 'village', name: 'Lumen Village', zone: 'village',
    rows: [
      '################',
      '#..,,......,,..#',
      '#..,,......,,..#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..,,......,,..#',
      '#..,,......,,..#',
      '################'
    ],
    spawn: { x: 7, y: 8 },
    workbench: { x: 6, y: 5 },
    npcs: [
      { x: 5, y: 6, id: 'prof_lumen', name: 'Professor Lumen' },
      { x: 6, y: 6, id: 'prof_mirrors', name: 'Professor Silvers' },
      { x: 7, y: 6, id: 'prof_labs', name: 'Professor Gapp' }
    ],
    items: [
      { x: 13, y: 1, material: 'crown_glass' },
      { x: 2, y: 9, material: 'water' },
      { x: 13, y: 9, material: 'polaroid' }
    ],
    exits: [
      { x: 3, y: 2, to: 'mirrors', label: 'Hall of Mirrors' },
      { x: 12, y: 2, to: 'prism', label: 'Prism Peak' },
      { x: 3, y: 8, to: 'fiber', label: 'Fiber Optic Tunnels' },
      { x: 12, y: 8, to: 'lab', label: 'Semiconductor Labs' },
      { x: 8, y: 2, to: 'grating', label: 'The Grating Gardens' },
      { x: 8, y: 8, to: 'hologram', label: 'The Hologram Archive' }
    ]
  },
  mirrors: {
    id: 'mirrors', name: 'Hall of Mirrors', zone: 'mirrors',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    arrival: 'Your own reflection multiplies down every corridor, a half-step behind you no matter how fast you turn.',
    exits: [
      { x: 2, y: 1, to: 'village', label: 'Lumen Village' },
      { x: 13, y: 5, to: 'mirrors_deep', label: 'The Birefringent Depths' }
    ],
    items: [
      { x: 13, y: 1, material: 'silver' },
      { x: 2, y: 9, material: 'aluminum' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'reflection_wraith' },
    secret: { x: 8, y: 3, material: 'quartz', findText: 'Tucked behind a panel that shouldn’t reflect anything, you find a shard of quartz. Someone from the Tunnels must have passed through here once.' }
  },
  prism: {
    id: 'prism', name: 'Prism Peak', zone: 'prism',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    arrival: 'The air itself seems to fracture into color here, like walking through a rainbow that never quite resolves.',
    exits: [
      { x: 2, y: 1, to: 'village', label: 'Lumen Village' },
      { x: 13, y: 5, to: 'prism_deep', label: 'The Rutile Chasm' }
    ],
    items: [
      { x: 13, y: 1, material: 'flint_glass' },
      { x: 2, y: 9, material: 'crown_glass' },
      { x: 8, y: 5, material: 'sapphire' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'chroma_beast' },
    secret: { x: 8, y: 3, material: 'silver', findText: 'Half-buried in scattered light, a shard of silver — clearly not native to this mountain.' }
  },
  fiber: {
    id: 'fiber', name: 'Fiber Optic Tunnels', zone: 'fiber',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    arrival: 'A faint hum runs through the tunnel walls — signal, still traveling, still looking for somewhere to arrive.',
    exits: [
      { x: 2, y: 1, to: 'village', label: 'Lumen Village' },
      { x: 13, y: 5, to: 'fiber_deep', label: 'The Graded Core' }
    ],
    items: [
      { x: 13, y: 1, material: 'quartz' },
      { x: 2, y: 9, material: 'water' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'attenuation_slug' },
    secret: { x: 8, y: 3, material: 'opal', findText: 'Light catches on this stone the way it does at the Grating Gardens, not here. Someone carried it a long way.' }
  },
  grating: {
    id: 'grating', name: 'The Grating Gardens', zone: 'grating',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    arrival: 'Every surface here is ruled with impossibly fine lines, scattering your shadow into a dozen faint copies.',
    exits: [
      { x: 2, y: 1, to: 'village', label: 'Lumen Village' },
      { x: 13, y: 5, to: 'grating_deep', label: 'The Photonic Lattice' }
    ],
    items: [
      { x: 13, y: 1, material: 'opal' },
      { x: 2, y: 9, material: 'quartz' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'aperture_sentinel' },
    secret: { x: 8, y: 3, material: 'silver_halide', findText: 'A scrap of film, exposed to nothing in particular. It shouldn’t be here — the Archive is nowhere close.' }
  },
  hologram: {
    id: 'hologram', name: 'The Hologram Archive', zone: 'hologram',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    arrival: 'The air shimmers faintly, like a memory replaying just out of reach.',
    exits: [
      { x: 2, y: 1, to: 'village', label: 'Lumen Village' },
      { x: 13, y: 5, to: 'hologram_deep', label: 'The Volume Vault' }
    ],
    items: [
      { x: 13, y: 1, material: 'silver_halide' },
      { x: 2, y: 9, material: 'silver' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'archive_wraith' },
    secret: { x: 8, y: 3, material: 'flint_glass', findText: 'An old prism shard, recorded here by accident and never reclaimed.' }
  },
  lab: {
    id: 'lab', name: 'Semiconductor Labs', zone: 'lab',
    rows: [
      '################',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '################'
    ],
    spawn: { x: 2, y: 5 },
    arrival: 'The silence here has a texture — the hush of machines that powered down mid-thought.',
    exits: [{ x: 2, y: 5, to: 'village', label: 'Lumen Village' }],
    items: [
      { x: 2, y: 2, material: 'silicon' },
      { x: 14, y: 9, material: 'diamond' }
    ],
    guardian: { x: 8, y: 5, enemyId: 'photon_sentinel' },
    boss: { x: 14, y: 5, enemyId: 'null_medium', requiresGuardian: true },
    secret: { x: 8, y: 3, material: 'polaroid', findText: 'A filter fragment, oddly out of place in a semiconductor facility. It doesn’t belong to any experiment on record here.' }
  },
  mirrors_deep: {
    id: 'mirrors_deep', name: 'The Birefringent Depths', zone: 'mirrors_deep',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    arrival: 'Here the reflections don’t just repeat — they split, each answering you an instant apart, in colors you didn’t send.',
    codexConcept: 'birefringence',
    exits: [{ x: 2, y: 1, to: 'mirrors', label: 'Hall of Mirrors' }],
    items: [
      { x: 13, y: 1, material: 'calcite' },
      { x: 2, y: 9, material: 'silver' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'twinned_specter' },
    wanderer: { x: 2, y: 5, enemyId: 'split_ray_wisp' },
    secret: { x: 8, y: 3, material: 'lithium_niobate', findText: 'A shard of crystal that hums faintly when struck, as if it still remembers a voltage from somewhere deeper still.' }
  },
  prism_deep: {
    id: 'prism_deep', name: 'The Rutile Chasm', zone: 'prism_deep',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    arrival: 'The light down here doesn’t just bend, it burns — a fire with no heat, refracted so hard the color forgets what white looked like.',
    codexConcept: 'refractive_index_extremes',
    exits: [{ x: 2, y: 1, to: 'prism', label: 'Prism Peak' }],
    items: [
      { x: 13, y: 1, material: 'rutile' },
      { x: 2, y: 9, material: 'flint_glass' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'rutile_wyrm' },
    wanderer: { x: 2, y: 5, enemyId: 'fire_moth' },
    secret: { x: 8, y: 3, material: 'calcite', findText: 'A crystal that shows everything behind it twice, slightly apart. Nothing in this chasm should refract that cleanly.' }
  },
  fiber_deep: {
    id: 'fiber_deep', name: 'The Graded Core', zone: 'fiber_deep',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    arrival: 'The tunnel narrows and somehow the signal gets cleaner, not worse — as if something down here has been tuning the walls for centuries.',
    codexConcept: 'graded_index',
    exits: [{ x: 2, y: 1, to: 'fiber', label: 'Fiber Optic Tunnels' }],
    items: [
      { x: 13, y: 1, material: 'ge_doped_silica' },
      { x: 2, y: 9, material: 'quartz' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'dispersion_choke' },
    wanderer: { x: 2, y: 5, enemyId: 'mode_flicker' },
    secret: { x: 8, y: 3, material: 'rutile', findText: 'A cinder of fire-bright crystal, still faintly warm. Nothing down here should burn like the Chasm does.' }
  },
  grating_deep: {
    id: 'grating_deep', name: 'The Photonic Lattice', zone: 'grating_deep',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    arrival: 'The lines rule themselves smaller the deeper you go, until whole wavelengths simply aren’t allowed to pass at all.',
    codexConcept: 'photonic_bandgap',
    exits: [{ x: 2, y: 1, to: 'grating', label: 'The Grating Gardens' }],
    items: [
      { x: 13, y: 1, material: 'photonic_crystal' },
      { x: 2, y: 9, material: 'opal' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'lattice_warden' },
    wanderer: { x: 2, y: 5, enemyId: 'lattice_wisp' },
    secret: { x: 8, y: 3, material: 'ge_doped_silica', findText: 'A sliver of fiber core, doped and graded with a precision this lattice shouldn’t have any use for.' }
  },
  hologram_deep: {
    id: 'hologram_deep', name: 'The Volume Vault', zone: 'hologram_deep',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    arrival: 'Every surface flickers between what it is and what was once recorded onto it, and the crystal underfoot seems to be listening for a voltage that never quite arrives.',
    codexConcept: 'electro_optic',
    exits: [{ x: 2, y: 1, to: 'hologram', label: 'The Hologram Archive' }],
    items: [
      { x: 13, y: 1, material: 'lithium_niobate' },
      { x: 2, y: 9, material: 'silver_halide' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'volume_warden' },
    wanderer: { x: 2, y: 5, enemyId: 'phase_echo' },
    secret: { x: 8, y: 3, material: 'photonic_crystal', findText: 'A shard of engineered lattice, forbidding light in a way nothing in this vault was built to do.' }
  }
};

export function mapWidth() { return W; }
export function mapHeight() { return H; }

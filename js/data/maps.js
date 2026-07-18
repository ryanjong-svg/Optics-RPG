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
      { x: 12, y: 8, to: 'lab', label: 'Semiconductor Labs' }
    ]
  },
  mirrors: {
    id: 'mirrors', name: 'Hall of Mirrors', zone: 'mirrors',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    exits: [{ x: 2, y: 1, to: 'village', label: 'Lumen Village' }],
    items: [
      { x: 13, y: 1, material: 'silver' },
      { x: 2, y: 9, material: 'aluminum' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'reflection_wraith' }
  },
  prism: {
    id: 'prism', name: 'Prism Peak', zone: 'prism',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    exits: [{ x: 2, y: 1, to: 'village', label: 'Lumen Village' }],
    items: [
      { x: 13, y: 1, material: 'flint_glass' },
      { x: 2, y: 9, material: 'crown_glass' },
      { x: 8, y: 5, material: 'sapphire' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'chroma_beast' }
  },
  fiber: {
    id: 'fiber', name: 'Fiber Optic Tunnels', zone: 'fiber',
    rows: borderedGrassBlock(),
    spawn: { x: 2, y: 1 },
    exits: [{ x: 2, y: 1, to: 'village', label: 'Lumen Village' }],
    items: [
      { x: 13, y: 1, material: 'quartz' },
      { x: 2, y: 9, material: 'water' }
    ],
    guardian: { x: 13, y: 9, enemyId: 'attenuation_slug' }
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
    exits: [{ x: 2, y: 5, to: 'village', label: 'Lumen Village' }],
    items: [
      { x: 2, y: 2, material: 'silicon' },
      { x: 14, y: 9, material: 'diamond' }
    ],
    guardian: { x: 8, y: 5, enemyId: 'photon_sentinel' },
    boss: { x: 14, y: 5, enemyId: 'null_medium', requiresGuardian: true }
  }
};

export function mapWidth() { return W; }
export function mapHeight() { return H; }

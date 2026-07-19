import { MAPS } from '../data/maps.js';

// Mirrors the real village exit layout: grating/mirrors/prism sit at the
// north exits, fiber/hologram/lab at the south exits, village in the middle.
// Each depth zone sits directly beside its parent, one ring further out.
const LAYOUT = [
  ['mirrors', 'grating', 'prism'],
  ['mirrors_deep', 'grating_deep', 'prism_deep'],
  [null, 'village', null],
  ['fiber', 'hologram', 'lab'],
  ['fiber_deep', 'hologram_deep', null]
];

export function openMap(game) {
  game.state.mode = 'map';
  game.showPanel('map');
  renderMap(game);
}

export function closeMap(game) {
  game.state.mode = 'overworld';
  game.showPanel('overworld');
}

function nodeStatus(state, id, map) {
  const visited = id === 'village' || !!state.flags.visitedMaps[id];
  if (!visited) return { visited, text: '???' };
  if (map.boss) return { visited, text: state.flags.bossDefeated ? 'Cleared' : (state.flags.guardianDefeated[id] ? 'Boss Awaits' : 'Guardian Active') };
  if (map.guardian) return { visited, text: state.flags.guardianDefeated[id] ? 'Guardian Defeated' : 'Guardian Active' };
  return { visited, text: 'Explored' };
}

export function renderMap(game) {
  const state = game.state;
  const cells = LAYOUT.flat().map(id => {
    if (!id) return '<div class="map-node map-node-empty"></div>';
    const map = MAPS[id];
    const isCurrent = state.currentMap === id;
    const { visited, text } = nodeStatus(state, id, map);
    const classes = ['map-node'];
    if (isCurrent) classes.push('map-node-current');
    if (!visited) classes.push('map-node-unvisited');
    return `
      <div class="${classes.join(' ')}">
        <div class="map-node-name">${visited ? map.name : 'Unexplored'}</div>
        <div class="map-node-status">${text}</div>
      </div>
    `;
  });
  game.dom.mapDiagram.innerHTML = `<div class="map-grid">${cells.join('')}</div>`;
}

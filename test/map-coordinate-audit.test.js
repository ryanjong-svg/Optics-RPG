// A systematic sweep of every map's interactive coordinates, prompted by a
// real bug (zone exits landing the player at the wrong tile - see
// exitLandingPos in overworld.js). Two bug classes this specifically guards
// against, neither caught by data-integrity.test.js's reference checks:
//   1. A coordinate that lands on a wall tile ('#') or outside the grid -
//      unreachable (for an entity) or a stuck-in-a-wall spawn.
//   2. Two different entities sharing one tile - handleMove checks entity
//      types in a fixed priority order (npc > workbench > guardian >
//      wanderer > boss > wall > item > secret > exit), so a lower-priority
//      one sharing a tile with a higher-priority one can never trigger.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MAPS, mapWidth, mapHeight } from '../js/data/maps.js';

const W = mapWidth(), H = mapHeight();

// Matches handleMove's real check order in overworld.js exactly, so a
// "collides with" failure here reflects which entity would actually win.
function collectEntities(map) {
  const entities = [];
  (map.npcs || []).forEach(n => entities.push({ kind: `npc:${n.id}`, x: n.x, y: n.y }));
  if (map.workbench) entities.push({ kind: 'workbench', x: map.workbench.x, y: map.workbench.y });
  if (map.guardian) entities.push({ kind: 'guardian', x: map.guardian.x, y: map.guardian.y });
  if (map.wanderer) entities.push({ kind: 'wanderer', x: map.wanderer.x, y: map.wanderer.y });
  if (map.boss) entities.push({ kind: 'boss', x: map.boss.x, y: map.boss.y });
  (map.items || []).forEach((it, i) => entities.push({ kind: `item[${i}]:${it.material}`, x: it.x, y: it.y }));
  if (map.secret) entities.push({ kind: 'secret', x: map.secret.x, y: map.secret.y });
  (map.exits || []).forEach((e, i) => entities.push({ kind: `exit[${i}]:${e.to}`, x: e.x, y: e.y }));
  return entities;
}

test('every map coordinate (spawn + every entity) is within grid bounds', () => {
  for (const map of Object.values(MAPS)) {
    const all = [{ kind: 'spawn', x: map.spawn.x, y: map.spawn.y }, ...collectEntities(map)];
    for (const e of all) {
      assert.ok(e.x >= 0 && e.x < W && e.y >= 0 && e.y < H, `${map.id}: ${e.kind} at (${e.x},${e.y}) is out of the ${W}x${H} grid`);
    }
  }
});

test('every map coordinate (spawn + every entity) sits on a walkable tile, not a wall', () => {
  for (const map of Object.values(MAPS)) {
    const all = [{ kind: 'spawn', x: map.spawn.x, y: map.spawn.y }, ...collectEntities(map)];
    for (const e of all) {
      const tile = map.rows[e.y][e.x];
      assert.notEqual(tile, '#', `${map.id}: ${e.kind} at (${e.x},${e.y}) sits on a wall tile - unreachable, or a stuck spawn`);
    }
  }
});

test('no two different entities within the same map share a tile (the higher-priority one would silently hide the other)', () => {
  for (const map of Object.values(MAPS)) {
    const entities = collectEntities(map);
    const byTile = new Map();
    for (const e of entities) {
      const key = `${e.x},${e.y}`;
      if (byTile.has(key)) {
        assert.fail(`${map.id}: "${byTile.get(key)}" and "${e.kind}" both sit at (${e.x},${e.y}) - the one checked first in handleMove's priority order would always win`);
      }
      byTile.set(key, e.kind);
    }
  }
});

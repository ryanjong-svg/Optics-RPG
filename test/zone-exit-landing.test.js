import { test } from 'node:test';
import assert from 'node:assert/strict';

import { exitLandingPos } from '../js/engine/world/overworld.js';
import { MAPS } from '../js/data/world/maps.js';

test('exitLandingPos: lands on the target\'s own exit back to the zone being left, not its spawn', () => {
  // mirrors' entrance to mirrors_deep sits at (13,5), far from mirrors' own
  // spawn/village-return tile at (2,1) - leaving mirrors_deep should surface
  // back at (13,5), not reset all the way over to (2,1).
  const pos = exitLandingPos(MAPS.mirrors, 'mirrors_deep');
  assert.deepEqual(pos, { x: 13, y: 5 });
});

test('exitLandingPos: falls back to spawn when the target has no exit back to the origin', () => {
  const fakeTarget = { spawn: { x: 4, y: 4 }, exits: [{ x: 1, y: 1, to: 'somewhere_else' }] };
  const pos = exitLandingPos(fakeTarget, 'not_linked');
  assert.deepEqual(pos, { x: 4, y: 4 });
});

test('exitLandingPos: falls back to spawn when the target has no exits at all', () => {
  const fakeTarget = { spawn: { x: 9, y: 2 } };
  assert.deepEqual(exitLandingPos(fakeTarget, 'anywhere'), { x: 9, y: 2 });
});

test('exitLandingPos: every zone <-> village crossing now lands at the actual gate, not the village hub spawn', () => {
  for (const map of Object.values(MAPS)) {
    const toVillage = (map.exits || []).find(e => e.to === 'village');
    if (!toVillage) continue;
    const pos = exitLandingPos(MAPS.village, map.id);
    const villageGate = MAPS.village.exits.find(e => e.to === map.id);
    assert.ok(villageGate, `village should have a matching exit back into "${map.id}"`);
    assert.deepEqual(pos, { x: villageGate.x, y: villageGate.y });
  }
});

test('exitLandingPos: every depth zone surfaces at its parent\'s real entrance tile, not the parent\'s spawn', () => {
  const depthParents = { mirrors_deep: 'mirrors', prism_deep: 'prism', fiber_deep: 'fiber', grating_deep: 'grating', hologram_deep: 'hologram', lab_deep: 'lab' };
  for (const [childId, parentId] of Object.entries(depthParents)) {
    const parent = MAPS[parentId];
    const entranceExit = parent.exits.find(e => e.to === childId);
    const pos = exitLandingPos(parent, childId);
    assert.deepEqual(pos, { x: entranceExit.x, y: entranceExit.y }, `${childId} should surface at ${parentId}'s entrance tile`);
  }
});

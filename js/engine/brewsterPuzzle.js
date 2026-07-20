// Brewster's angle: the angle of incidence at which reflected light becomes
// fully s-polarized (the p-component isn't reflected at all) — tan(theta_B) = n.
// Landing the incident angle on theta_B is what makes Polarize Filter's glare
// block maximally effective this turn.
export function computeBrewsterAngleDeg(n) {
  return Math.atan(n) * 180 / Math.PI;
}

export function makeBrewsterPuzzle(enemyId) {
  let hash = 0;
  for (let i = 0; i < enemyId.length; i++) hash = (hash * 43 + enemyId.charCodeAt(i) + 13) >>> 0;
  const n = Math.round((1.3 + (hash % 100) / 100 * 1.1) * 100) / 100; // 1.30 - 2.40
  const targetDeg = Math.round(computeBrewsterAngleDeg(n));
  return { n, targetDeg, tolerance: 3 };
}

export function resolveBrewsterShot(puzzle, angleDeg) {
  const hit = Math.abs(angleDeg - puzzle.targetDeg) <= puzzle.tolerance;
  return { hit, angleDeg };
}

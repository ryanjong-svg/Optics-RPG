// Double-slit constructive interference: d*sin(theta) = m*lambda. This
// puzzle targets the first-order bright fringe (m=1): sin(theta) = lambda/d,
// i.e. theta = arcsin(1 / (d/lambda)) — the angle away from straight-ahead
// where the path difference between the two slits is exactly one wavelength.
export function computeFringeAngleDeg(dOverLambda) {
  return Math.asin(Math.min(1, 1 / dOverLambda)) * 180 / Math.PI;
}

// Deterministic per-enemy puzzle parameters (a different hash mix than the
// Snell puzzle's, so the same enemy doesn't pose an identical-looking
// puzzle in both places).
export function makeDiffractionPuzzle(enemyId) {
  let hash = 0;
  for (let i = 0; i < enemyId.length; i++) hash = (hash * 37 + enemyId.charCodeAt(i) + 7) >>> 0;
  const dOverLambda = Math.round((1.5 + (hash % 100) / 100 * 2.5) * 100) / 100; // 1.50 - 4.00
  const targetDeg = Math.round(computeFringeAngleDeg(dOverLambda));
  return { dOverLambda, targetDeg, tolerance: 3 };
}

export function resolveDiffractionShot(puzzle, angleDeg) {
  const hit = Math.abs(angleDeg - puzzle.targetDeg) <= puzzle.tolerance;
  return { hit, angleDeg };
}

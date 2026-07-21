// Real Snell's law: n1 * sin(theta1) = n2 * sin(theta2). The puzzle always
// goes from air (n1 = 1) into a denser medium (n2 > 1), so
// sin(theta2) = sin(theta1) / n2 is always <= 1 — there's no total internal
// reflection edge case to handle in this direction, keeping the math (and
// the player-facing puzzle) always well-defined.
export function computeRefractedDeg(n2, incidentDeg) {
  const incidentRad = incidentDeg * Math.PI / 180;
  const sinRefracted = Math.sin(incidentRad) / n2;
  return Math.asin(sinRefracted) * 180 / Math.PI;
}

// Deterministic per-enemy puzzle parameters (seeded by enemy id), so a given
// enemy always poses the same puzzle — reproducible, and fair against
// Bestiary knowledge from a prior encounter.
export function makeSnellPuzzle(enemyId) {
  let hash = 0;
  for (let i = 0; i < enemyId.length; i++) hash = (hash * 31 + enemyId.charCodeAt(i)) >>> 0;
  const n2 = Math.round((1.3 + (hash % 100) / 100 * 1.1) * 100) / 100; // 1.30 - 2.40
  const targetDeg = Math.round(15 + (Math.floor(hash / 100) % 100) / 100 * 30); // 15 - 45
  return { n2, targetDeg, tolerance: 3 };
}

export function resolveSnellShot(puzzle, incidentDeg) {
  const refractedDeg = computeRefractedDeg(puzzle.n2, incidentDeg);
  const hit = Math.abs(refractedDeg - puzzle.targetDeg) <= puzzle.tolerance;
  return { refractedDeg, hit };
}

import { makeSnellPuzzle, computeRefractedDeg, resolveSnellShot } from './snellPuzzle.js';

// Deliberately does NOT import from battle.js — the caller supplies an
// onFire callback instead, so this module and battle.js don't need a
// circular dependency on each other.
export function openSnellPuzzle(game, onFire) {
  game.snellPuzzle = { puzzle: makeSnellPuzzle(game.battle.enemy.id), onFire };
  game.dom.snellAngle.value = 45;
  game.dom.snellPuzzlePanel.classList.remove('hidden');
  renderSnellPuzzle(game);
}

export function closeSnellPuzzle(game) {
  game.dom.snellPuzzlePanel.classList.add('hidden');
  game.snellPuzzle = null;
}

function drawSnellDiagram(canvas, puzzle, incidentDeg, showHint) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const rayLen = h / 2 - 12;
  ctx.clearRect(0, 0, w, h);

  // boundary between media
  ctx.strokeStyle = '#2a7f96';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

  // normal (dashed)
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#7d92a3';
  ctx.beginPath(); ctx.moveTo(cx, cy - h / 2); ctx.lineTo(cx, cy + h / 2); ctx.stroke();
  ctx.setLineDash([]);

  // target wedge, in the refracted (lower) medium - hidden with Puzzle
  // Hints off, so the only way to line it up is computing it from n2.
  if (showHint) {
    const targetRad = puzzle.targetDeg * Math.PI / 180;
    const tolRad = puzzle.tolerance * Math.PI / 180;
    ctx.fillStyle = 'rgba(92,255,157,0.25)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rayLen, Math.PI / 2 - (targetRad + tolRad), Math.PI / 2 - (targetRad - tolRad));
    ctx.closePath();
    ctx.fill();
  }

  // incident ray, in the upper (air) medium
  const incRad = incidentDeg * Math.PI / 180;
  ctx.strokeStyle = '#4fd8ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - rayLen * Math.sin(incRad), cy - rayLen * Math.cos(incRad));
  ctx.lineTo(cx, cy);
  ctx.stroke();

  // refracted ray, in the lower medium
  const refDeg = computeRefractedDeg(puzzle.n2, incidentDeg);
  const refRad = refDeg * Math.PI / 180;
  ctx.strokeStyle = '#ffcc33';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + rayLen * Math.sin(refRad), cy + rayLen * Math.cos(refRad));
  ctx.stroke();
  ctx.lineWidth = 1;
}

export function renderSnellPuzzle(game) {
  if (!game.snellPuzzle) return;
  const { puzzle } = game.snellPuzzle;
  const incidentDeg = Number(game.dom.snellAngle.value);
  const refractedDeg = computeRefractedDeg(puzzle.n2, incidentDeg);
  const showHint = game.state.settings.puzzleHints !== false;
  game.dom.snellAngleValue.textContent = `${incidentDeg}°`;
  game.dom.snellReadout.textContent = showHint
    ? `n₂ = ${puzzle.n2} — refracted ray: ${refractedDeg.toFixed(1)}° from normal. Target: ${puzzle.targetDeg}° ± ${puzzle.tolerance}°.`
    : `n₂ = ${puzzle.n2} — refracted ray: ${refractedDeg.toFixed(1)}° from normal. Puzzle Hints are off — work out the target from n₁sinθ₁ = n₂sinθ₂.`;
  drawSnellDiagram(game.dom.snellCanvas, puzzle, incidentDeg, showHint);
}

export function fireSnellPuzzle(game) {
  if (!game.snellPuzzle) return;
  const { puzzle, onFire } = game.snellPuzzle;
  const incidentDeg = Number(game.dom.snellAngle.value);
  const { hit, refractedDeg } = resolveSnellShot(puzzle, incidentDeg);
  closeSnellPuzzle(game);
  onFire(hit, refractedDeg);
}

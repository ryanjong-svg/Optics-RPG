import { makeBrewsterPuzzle, resolveBrewsterShot } from './brewsterPuzzle.js';

// Same independence-from-battle.js pattern as the other aiming puzzles — the
// caller supplies an onFire callback instead of this module importing
// chooseAbility directly, so the two engine modules never need a circular
// dependency.
export function openBrewsterPuzzle(game, onFire) {
  game.brewsterPuzzle = { puzzle: makeBrewsterPuzzle(game.battle.enemy.id), onFire };
  game.dom.brewsterAngle.value = 55;
  game.dom.brewsterPuzzlePanel.classList.remove('hidden');
  renderBrewsterPuzzle(game);
}

export function closeBrewsterPuzzle(game) {
  game.dom.brewsterPuzzlePanel.classList.add('hidden');
  game.brewsterPuzzle = null;
}

function drawBrewsterDiagram(canvas, puzzle, angleDeg) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const rayLen = h / 2 - 12;
  ctx.clearRect(0, 0, w, h);

  // reflecting surface
  ctx.strokeStyle = '#2a7f96';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

  // normal (dashed)
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#7d92a3';
  ctx.beginPath(); ctx.moveTo(cx, cy - h / 2); ctx.lineTo(cx, cy + h / 2); ctx.stroke();
  ctx.setLineDash([]);

  // target wedge for the reflected ray (angle of reflection = angle of incidence)
  const targetRad = puzzle.targetDeg * Math.PI / 180;
  const tolRad = puzzle.tolerance * Math.PI / 180;
  ctx.fillStyle = 'rgba(92,255,157,0.25)';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, rayLen, -Math.PI / 2 - (targetRad + tolRad), -Math.PI / 2 - (targetRad - tolRad));
  ctx.closePath();
  ctx.fill();

  // incident ray, from the upper-left
  const incRad = angleDeg * Math.PI / 180;
  ctx.strokeStyle = '#4fd8ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - rayLen * Math.sin(incRad), cy - rayLen * Math.cos(incRad));
  ctx.lineTo(cx, cy);
  ctx.stroke();

  // reflected ray, mirrored to the upper-right at the same angle from normal
  ctx.strokeStyle = '#ffcc33';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + rayLen * Math.sin(incRad), cy - rayLen * Math.cos(incRad));
  ctx.stroke();
  ctx.lineWidth = 1;
}

export function renderBrewsterPuzzle(game) {
  if (!game.brewsterPuzzle) return;
  const { puzzle } = game.brewsterPuzzle;
  const angleDeg = Number(game.dom.brewsterAngle.value);
  game.dom.brewsterAngleValue.textContent = `${angleDeg}°`;
  game.dom.brewsterReadout.textContent =
    `n = ${puzzle.n} — Brewster's angle: arctan(n) = ${puzzle.targetDeg}° ± ${puzzle.tolerance}°.`;
  drawBrewsterDiagram(game.dom.brewsterCanvas, puzzle, angleDeg);
}

export function fireBrewsterPuzzle(game) {
  if (!game.brewsterPuzzle) return;
  const { puzzle, onFire } = game.brewsterPuzzle;
  const angleDeg = Number(game.dom.brewsterAngle.value);
  const { hit } = resolveBrewsterShot(puzzle, angleDeg);
  closeBrewsterPuzzle(game);
  onFire(hit, angleDeg);
}

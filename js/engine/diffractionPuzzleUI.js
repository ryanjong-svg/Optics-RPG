import { makeDiffractionPuzzle, resolveDiffractionShot } from './diffractionPuzzle.js';

// Same independence-from-battle.js pattern as snellPuzzleUI.js — the caller
// supplies an onFire callback instead of this module importing chooseAbility
// directly, so the two engine modules never need a circular dependency.
export function openDiffractionPuzzle(game, onFire) {
  game.diffractionPuzzle = { puzzle: makeDiffractionPuzzle(game.battle.enemy.id), onFire };
  game.dom.diffractionAngle.value = 20;
  game.dom.diffractionPuzzlePanel.classList.remove('hidden');
  renderDiffractionPuzzle(game);
}

export function closeDiffractionPuzzle(game) {
  game.dom.diffractionPuzzlePanel.classList.add('hidden');
  game.diffractionPuzzle = null;
}

function drawFringeDiagram(canvas, puzzle, angleDeg) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h - 16;
  const rayLen = h - 30;
  ctx.clearRect(0, 0, w, h);

  // the two slits, close together at the bottom center
  ctx.strokeStyle = '#2a7f96';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
  ctx.fillStyle = '#4fd8ff';
  ctx.fillRect(cx - 5, cy - 2, 3, 4);
  ctx.fillRect(cx + 2, cy - 2, 3, 4);

  // straight-ahead reference (dashed)
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#7d92a3';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - rayLen); ctx.stroke();
  ctx.setLineDash([]);

  // target fringe wedge
  const targetRad = puzzle.targetDeg * Math.PI / 180;
  const tolRad = puzzle.tolerance * Math.PI / 180;
  ctx.fillStyle = 'rgba(92,255,157,0.25)';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, rayLen, -Math.PI / 2 - (targetRad + tolRad), -Math.PI / 2 - (targetRad - tolRad));
  ctx.closePath();
  ctx.fill();

  // chosen angle ray
  const rad = angleDeg * Math.PI / 180;
  ctx.strokeStyle = '#ffcc33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + rayLen * Math.sin(rad), cy - rayLen * Math.cos(rad));
  ctx.stroke();
  ctx.lineWidth = 1;
}

export function renderDiffractionPuzzle(game) {
  if (!game.diffractionPuzzle) return;
  const { puzzle } = game.diffractionPuzzle;
  const angleDeg = Number(game.dom.diffractionAngle.value);
  game.dom.diffractionAngleValue.textContent = `${angleDeg}°`;
  game.dom.diffractionReadout.textContent =
    `d/λ = ${puzzle.dOverLambda} — first bright fringe at ${puzzle.targetDeg}° ± ${puzzle.tolerance}°.`;
  drawFringeDiagram(game.dom.diffractionCanvas, puzzle, angleDeg);
}

export function fireDiffractionPuzzle(game) {
  if (!game.diffractionPuzzle) return;
  const { puzzle, onFire } = game.diffractionPuzzle;
  const angleDeg = Number(game.dom.diffractionAngle.value);
  const { hit } = resolveDiffractionShot(puzzle, angleDeg);
  closeDiffractionPuzzle(game);
  onFire(hit, angleDeg);
}

// A lightweight, non-blocking notification — unlike showMessages() (dialogueUI.js),
// which takes over the whole screen and requires a click to dismiss, a toast just
// appears, holds briefly, and fades — for events (like an achievement unlocking)
// that shouldn't interrupt whatever the player is doing (exploring, mid-battle).
const VISIBLE_MS = 3200;
const FADE_MS = 300;

export function showToast(game, message) {
  const container = game.dom.toastContainer;
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast-visible'));
  setTimeout(() => {
    el.classList.remove('toast-visible');
    setTimeout(() => el.remove(), FADE_MS);
  }, VISIBLE_MS);
}

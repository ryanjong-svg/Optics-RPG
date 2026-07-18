import { QUIZZES } from '../data/quizzes.js';
import { NPC_INTRO } from '../data/dialogue.js';
import { grantXp } from './state.js';
import { saveGame } from './save.js';

// A tiny queued-message dialogue box, reused for intro text, NPC lines, and quizzes.
// dlg.kind: 'lines' (just text, Next advances/ends) or 'quiz' (intro -> question -> result)
export function showMessages(game, lines, onDone) {
  game.dialogue = { kind: 'lines', lines: [...lines], onDone: onDone || null };
  game.state.mode = 'dialogue';
  game.showPanel('dialogue');
  renderDialogue(game);
}

export function startQuiz(game, npcId) {
  const questions = QUIZZES[npcId] || [];
  if (!questions.length) return;
  const q = questions[Math.floor(Math.random() * questions.length)];
  game.dialogue = {
    kind: 'quiz', phase: 'intro',
    introText: NPC_INTRO[npcId] || 'Ready for a question?',
    quiz: q, resultText: ''
  };
  game.state.mode = 'dialogue';
  game.showPanel('dialogue');
  renderDialogue(game);
}

export function advanceDialogue(game) {
  const dlg = game.dialogue;
  if (!dlg) return;

  if (dlg.kind === 'lines') {
    if (dlg.lines.length > 1) {
      dlg.lines.shift();
      renderDialogue(game);
      return;
    }
    endDialogue(game, dlg.onDone);
    return;
  }

  // kind === 'quiz'
  if (dlg.phase === 'intro') {
    dlg.phase = 'question';
    renderDialogue(game);
    return;
  }
  if (dlg.phase === 'result') {
    endDialogue(game, null);
  }
  // phase === 'question' has no Next button; nothing to do here
}

export function answerQuiz(game, choiceIdx) {
  const dlg = game.dialogue;
  if (!dlg || dlg.kind !== 'quiz' || dlg.phase !== 'question') return;
  const correct = choiceIdx === dlg.quiz.answer;
  if (correct) {
    grantXp(game.state, 12, () => {});
    dlg.resultText = 'Correct! ' + dlg.quiz.explain + ' (+12 XP)';
  } else {
    dlg.resultText = 'Not quite. ' + dlg.quiz.explain;
  }
  dlg.phase = 'result';
  renderDialogue(game);
}

function endDialogue(game, onDone) {
  game.dialogue = null;
  game.state.mode = 'overworld';
  game.showPanel('overworld');
  if (onDone) onDone();
  game.renderHud();
  saveGame(game.state);
}

export function renderDialogue(game) {
  const dlg = game.dialogue;
  const d = game.dom;
  if (!dlg) return;
  d.dialogueChoices.innerHTML = '';
  d.dialogueNext.style.display = 'none';

  if (dlg.kind === 'lines') {
    d.dialogueText.textContent = dlg.lines[0];
    d.dialogueNext.style.display = 'inline-block';
    d.dialogueNext.textContent = dlg.lines.length > 1 ? 'Next' : 'Close';
    return;
  }

  if (dlg.phase === 'intro') {
    d.dialogueText.textContent = dlg.introText;
    d.dialogueNext.style.display = 'inline-block';
    d.dialogueNext.textContent = 'Ask away';
    return;
  }
  if (dlg.phase === 'question') {
    d.dialogueText.textContent = dlg.quiz.q;
    dlg.quiz.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.textContent = choice;
      btn.onclick = () => answerQuiz(game, idx);
      d.dialogueChoices.appendChild(btn);
    });
    return;
  }
  if (dlg.phase === 'result') {
    d.dialogueText.textContent = dlg.resultText;
    d.dialogueNext.style.display = 'inline-block';
    d.dialogueNext.textContent = 'Close';
  }
}

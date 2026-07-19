// Tiny procedural audio engine — no external sound files, everything is
// synthesized with Web Audio oscillators. Browsers block audio until a user
// gesture, so call unlockAudio() from the first keydown/click.
let ctx = null;
let muted = false;
let musicTimeoutId = null;
let currentTrack = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
}

export function isMuted() { return muted; }

export function setMuted(value) {
  muted = value;
  if (ambienceNodes) {
    const c = getCtx();
    ambienceNodes.master.gain.setValueAtTime(muted ? 0 : ambienceNodes.baseGain, c.currentTime);
    ambienceNodes.lfoGain.gain.setValueAtTime(muted ? 0 : ambienceNodes.baseGain * 0.5, c.currentTime);
  }
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

function tone(freq, startTime, duration, { type = 'square', gain = 0.15, attack = 0.005, release = 0.05 } = {}) {
  if (muted || !freq) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(gain, startTime + attack);
  g.gain.linearRampToValueAtTime(0.0001, startTime + duration + release);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + release + 0.02);
}

function playSequence(notes, { type = 'square', gain = 0.15 } = {}) {
  const c = getCtx();
  let t = c.currentTime + 0.01;
  notes.forEach(([freq, dur]) => {
    tone(freq, t, dur, { type, gain });
    t += dur;
  });
}

// ---------- One-shot SFX ----------
export function playClick() { playSequence([[880, 0.025]], { type: 'square', gain: 0.06 }); }
export function playPickup() { playSequence([[880, 0.05], [1320, 0.07]], { type: 'triangle', gain: 0.12 }); }
export function playHit() { playSequence([[150, 0.08]], { type: 'square', gain: 0.16 }); }
export function playCrit() {
  const c = getCtx();
  const t = c.currentTime + 0.01;
  tone(140, t, 0.12, { type: 'square', gain: 0.18 });
  tone(280, t, 0.12, { type: 'square', gain: 0.12 });
}
export function playLevelUp() { playSequence([[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.18]], { type: 'triangle', gain: 0.15 }); }
export function playVictory() { playSequence([[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.3]], { type: 'square', gain: 0.16 }); }
export function playDefeat() { playSequence([[392, 0.15], [349, 0.15], [294, 0.3]], { type: 'sawtooth', gain: 0.14 }); }
export function playCraftSuccess() { playSequence([[784, 0.07], [988, 0.07], [1175, 0.16]], { type: 'sine', gain: 0.14 }); }
export function playQuestComplete() { playSequence([[659, 0.09], [880, 0.09], [1047, 0.09], [1319, 0.2]], { type: 'triangle', gain: 0.15 }); }
export function playCorrect() { playSequence([[659, 0.07], [988, 0.14]], { type: 'triangle', gain: 0.13 }); }
export function playIncorrect() { playSequence([[220, 0.12], [175, 0.18]], { type: 'sawtooth', gain: 0.11 }); }

// ---------- Looping background music ----------
const OVERWORLD_MELODY = [
  [392, 0.3], [440, 0.3], [523, 0.3], [440, 0.3],
  [392, 0.3], [349, 0.3], [392, 0.6],
  [0, 0.3]
];
const BATTLE_MELODY = [
  [220, 0.2], [220, 0.2], [277, 0.2], [220, 0.2],
  [246, 0.2], [246, 0.2], [196, 0.4],
  [0, 0.2]
];

function scheduleMusicLoop(melody, type, gain) {
  const c = getCtx();
  let t = c.currentTime + 0.05;
  melody.forEach(([freq, dur]) => {
    tone(freq, t, dur * 0.9, { type, gain });
    t += dur;
  });
  const totalDurMs = melody.reduce((s, [, d]) => s + d, 0) * 1000;
  musicTimeoutId = setTimeout(() => scheduleMusicLoop(melody, type, gain), totalDurMs);
}

function playMusic(track, melody, type, gain) {
  if (currentTrack === track) return;
  stopMusic();
  currentTrack = track;
  scheduleMusicLoop(melody, type, gain);
}

export function playOverworldMusic() { playMusic('overworld', OVERWORLD_MELODY, 'triangle', 0.05); }
export function playBattleMusic() { playMusic('battle', BATTLE_MELODY, 'square', 0.05); }

export function stopMusic() {
  if (musicTimeoutId) clearTimeout(musicTimeoutId);
  musicTimeoutId = null;
  currentTrack = null;
}

// ---------- Per-zone ambience ----------
// A quiet, continuous drone distinct per zone — layered under the overworld
// melody, not a replacement for it. Two close oscillators create a slow
// "beating" shimmer for the more otherworldly zones (mirrors/hologram).
const ZONE_AMBIENCE = {
  village: { freq: 220, freq2: null, lfoRate: 0.15, gain: 0.02 },
  mirrors: { freq: 330, freq2: 332, lfoRate: 0.2, gain: 0.018 },
  prism: { freq: 294, freq2: null, lfoRate: 0.35, gain: 0.02 },
  fiber: { freq: 130, freq2: null, lfoRate: 0.1, gain: 0.025 },
  grating: { freq: 246, freq2: null, lfoRate: 0.6, gain: 0.018 },
  hologram: { freq: 260, freq2: 261.5, lfoRate: 0.18, gain: 0.018 },
  lab: { freq: 82, freq2: null, lfoRate: 0.08, gain: 0.03 },
  mirrors_deep: { freq: 330, freq2: 336, lfoRate: 0.25, gain: 0.02 },
  prism_deep: { freq: 220, freq2: null, lfoRate: 0.5, gain: 0.024 },
  fiber_deep: { freq: 110, freq2: null, lfoRate: 0.12, gain: 0.027 },
  grating_deep: { freq: 246, freq2: null, lfoRate: 0.9, gain: 0.02 },
  hologram_deep: { freq: 196, freq2: 197.5, lfoRate: 0.14, gain: 0.02 }
};

let ambienceNodes = null;
let ambienceZone = null;

export function playZoneAmbience(zone) {
  const config = ZONE_AMBIENCE[zone];
  if (!config || ambienceZone === zone) return;
  stopZoneAmbience();
  ambienceZone = zone;

  const c = getCtx();
  const startGain = muted ? 0 : config.gain;
  const master = c.createGain();
  master.gain.setValueAtTime(startGain, c.currentTime);
  master.connect(c.destination);

  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = config.lfoRate;
  lfoGain.gain.value = muted ? 0 : config.gain * 0.5;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);
  lfo.start();

  const oscillators = [lfo];
  for (const freq of [config.freq, config.freq2]) {
    if (!freq) continue;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(master);
    osc.start();
    oscillators.push(osc);
  }

  ambienceNodes = { master, lfoGain, baseGain: config.gain, oscillators };
}

export function stopZoneAmbience() {
  ambienceZone = null;
  if (!ambienceNodes) return;
  ambienceNodes.oscillators.forEach(osc => { try { osc.stop(); } catch { /* already stopped */ } });
  ambienceNodes = null;
}

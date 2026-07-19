// World-building/mythos content, separate from the physics Codex. Entries unlock
// by exploring the world (visiting a place, meeting a teacher) rather than by
// battle mechanics — this is flavor and history, not a taught concept.
export const LORE = {
  bending: {
    title: 'On the Bending',
    unlock: { type: 'always' },
    body: `Before there were surfaces, there was one Ray, and it had nowhere to arrive. Then the world cracked into two densities that did not agree with each other, and the Ray was forced, for the first time, to become something. We are still living in the aftermath of that first decision. Every wisp in this village is a piece of it that hasn't finished deciding.`
  },
  founding_village: {
    title: 'On the Founding of Lumen Village',
    unlock: { type: 'always' },
    body: `Three roads that should never have agreed on anything — an old ray-path, a Circle relay line, a Vanguard supply route — happened to cross in one unremarkable field. One stubborn professor put a workbench there and told three rival traditions to share it. Astonishingly, they did.`
  },
  unbroken_ray: {
    title: 'On the Order of the Unbroken Ray',
    unlock: { type: 'npc', npc: 'prof_lumen' },
    body: `They will tell you a ray never lies, only the surface does. Give them a protractor and an afternoon and they will out-argue a god. Give them a genuinely quantum problem and watch them very carefully change the subject.`
  },
  silvered_circle: {
    title: 'On the Silvered Circle',
    unlock: { type: 'npc', npc: 'prof_mirrors' },
    body: `Once, a message could cross half the Reach through stone, never touching open air, never losing its shape — carried whole by the discipline of angles too steep to escape. The Circle built that. The Circle also, in time, let stretches of it rot. They do not enjoy being reminded of the second part.`
  },
  photonic_vanguard: {
    title: 'On the Photonic Vanguard',
    unlock: { type: 'npc', npc: 'prof_labs' },
    body: `The young ones say light comes in grains, not lines, and that matter can be taught to answer it with lightning. The old ones say the young ones are describing a special case and calling it the whole truth. Both are right. Neither will admit it in the same room.`
  },
  hall_of_mirrors: {
    title: 'On the Hall of Mirrors',
    unlock: { type: 'map', map: 'mirrors' },
    body: `A noble house once built a room to multiply its own reflection forever. It succeeded. Nothing that walked in afterward ever fully walked back out as only one of itself.`
  },
  prism_peak: {
    title: 'On Prism Peak',
    unlock: { type: 'map', map: 'prism' },
    body: `Two schools of thought once shared a mountain and split white light into colors nobody had properly named. Then they stopped agreeing on what a ray even was, and the mountain, having absorbed a century of argument, decided to keep scattering things forever.`
  },
  fiber_tunnels: {
    title: 'On the Fiber Optic Tunnels',
    unlock: { type: 'map', map: 'fiber' },
    body: `For generations a message could travel the length of the Reach through raw stone without once escaping into open air. Some stretches were maintained with care. Some were not. Guess which stretches now drain the life out of travelers.`
  },
  semiconductor_labs: {
    title: 'On Semiconductor Labs',
    unlock: { type: 'map', map: 'lab' },
    body: `The newest ruin in the Reach, and the only one within living memory. A young researcher tried to teach a crystal to hold light rather than merely answer it. Something answered instead, and it has been standing guard over an experiment that ended years ago as though the order to stop never arrived.`
  },
  null_medium: {
    title: 'On the Null Medium',
    unlock: { type: 'map', map: 'lab' },
    body: `Every wakened thing in this world is a fragment of the first Ray that chose a fate at a boundary. One fragment refused every fate offered. It has no reflectivity, no index, no gap of its own — and reaches into travelers to borrow ours, one insult at a time, before discarding each in turn. Scholars of every rival order agree on exactly one thing: until it is resolved, the Bending itself is not finished, and neither, perhaps, is the world.`
  },
  grating_gardens: {
    title: 'On the Grating Gardens',
    unlock: { type: 'map', map: 'grating' },
    body: `A scholar once ruled lines into glass fine enough, she believed, to resolve any two things in the world from one another. She was correct about the lines. She was wrong about the world. What remains of her garden no longer distinguishes visitors by name, deed, or intention — only by whether it can tell them apart from the space beside them at all.`
  },
  hologram_archive: {
    title: 'On the Hologram Archive',
    unlock: { type: 'map', map: 'hologram' },
    body: `A splinter of the Silvered Circle set out to record light itself, rather than what light merely showed them, and built a vault to hold every fringe pattern the Reach cast. The recordings outlasted their recorders. Now the archive answers no one who asks whether what it shows them ever actually happened — only that it is willing, endlessly, to show it again.`
  }
};

export function isLoreUnlocked(state, entry) {
  const u = entry.unlock;
  if (u.type === 'always') return true;
  if (u.type === 'map') return !!(state.flags.visitedMaps && state.flags.visitedMaps[u.map]);
  if (u.type === 'npc') return !!(state.flags.metNpc && state.flags.metNpc[u.npc]);
  return false;
}

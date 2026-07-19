// Lightweight side quests from the three professors. Deliberately simple —
// no separate quest log UI; the NPC just tells you what's still needed each
// time you talk to them, which doubles as the "log."
export const QUESTS = {
  lumen_opal: {
    npc: 'prof_lumen',
    title: 'Grating Gardens Sample',
    offer: 'Professor Lumen taps her chin. "I\'ve heard the Grating Gardens can rule light into sharper lines than any lens I\'ve ground by hand. Bring me 2 Opal from there and I\'ll make it worth your trip."',
    objective: { type: 'collect', material: 'opal', count: 2 },
    reward: { xp: 20, material: { id: 'sapphire', count: 1 } },
    reminder: 'Professor Lumen: "Still no Opal from the Grating Gardens? Two pieces, whenever you find them."',
    complete: 'Professor Lumen turns the two Opals over in the light. "Beautiful ruling. Here — a Sapphire for your trouble, and my thanks."'
  },
  silvers_film: {
    npc: 'prof_mirrors',
    title: 'Hologram Archive Sample',
    offer: 'Professor Silvers lowers her voice. "The Hologram Archive still has Silver Halide Film in it, if the recordings haven\'t reclaimed it all. Bring me 2 and I\'ll trade you something useful."',
    objective: { type: 'collect', material: 'silver_halide', count: 2 },
    reward: { xp: 20, material: { id: 'diamond', count: 1 } },
    reminder: 'Professor Silvers: "Two pieces of Silver Halide Film from the Archive — still waiting."',
    complete: 'Professor Silvers pockets the film carefully. "This confirms what I feared about that place — and I keep my promises. Here."'
  },
  gapp_sentinel: {
    npc: 'prof_labs',
    title: 'Resolve the Sentinel',
    offer: 'Professor Gapp grins. "Word is the Grating Gardens has a guardian that can\'t be hit without real precision. Prove the Rayleigh criterion right — defeat the Aperture Sentinel — and I\'ll owe you one."',
    objective: { type: 'defeat_guardian', map: 'grating' },
    reward: { xp: 30, material: { id: 'silicon', count: 1 } },
    reminder: 'Professor Gapp: "That Aperture Sentinel still standing? Resolution takes precision, not brightness."',
    complete: 'Professor Gapp pumps a fist. "Knew you had the resolving power. Here\'s a little something from my own bench."'
  }
};

export function isObjectiveMet(state, quest) {
  const obj = quest.objective;
  if (obj.type === 'collect') return (state.player.materials[obj.material] || 0) >= obj.count;
  if (obj.type === 'defeat_guardian') return !!(state.flags.guardianDefeated && state.flags.guardianDefeated[obj.map]);
  return false;
}

export function findQuestForNpc(npcId) {
  const entry = Object.entries(QUESTS).find(([, q]) => q.npc === npcId);
  return entry ? { id: entry[0], quest: entry[1] } : null;
}

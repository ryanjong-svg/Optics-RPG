// Chosen (and freely re-chosen) at the Workbench once level 5+ — a light
// build-identity layer on top of flat level-ups and gear, themed around the
// real wave/particle divide in optics: coherent, particle-like light effects
// vs. wave-interference effects.
export const SPECIALIZATIONS = {
  photon_focus: {
    id: 'photon_focus',
    name: 'Photon Focus',
    concepts: ['coherence', 'photoelectric'],
    desc: 'Laser Focus and Photoelectric Shock hit 20% harder and cost 1 less Charge.',
    damageMult: 1.2,
    chargeCostReduction: 1
  },
  wave_mechanics: {
    id: 'wave_mechanics',
    name: 'Wave Mechanics',
    concepts: ['diffraction', 'interference', 'dispersion'],
    desc: 'Diffraction Wave, Interference Cancel, and Dispersion Burst hit 20% harder, and Charge regenerates 1 extra per turn.',
    damageMult: 1.2,
    chargeRegenBonus: 1
  }
};

export function findSpecialization(id) {
  return SPECIALIZATIONS[id] || null;
}

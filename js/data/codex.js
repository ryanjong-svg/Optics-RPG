// Unlocked progressively as the player encounters the matching ability/enemy/material.
// This is the explicit "teaching" surface of the game.
export const CODEX = {
  reflection: {
    title: 'Reflection & the Fresnel Equations',
    body: `When light hits a boundary between two materials, some of it bounces back. At normal incidence, the reflected fraction is R = ((n1-n2)/(n1+n2))^2. Metals like silver and aluminum have huge effective index contrast with air, so they reflect ~90-95% of light — that's why we coat glass with them to make mirrors.`
  },
  snell: {
    title: "Snell's Law",
    body: `n1 sin(θ1) = n2 sin(θ2). Light bends toward the normal when entering a denser (higher-n) medium, and away from it when leaving one. Every lens in this game — and in real cameras, eyes, and telescopes — is just a carefully shaped surface exploiting this one equation.`
  },
  tir: {
    title: 'Total Internal Reflection & the Critical Angle',
    body: `Going from a denser to a less dense medium, past a critical angle θc = arcsin(n2/n1), light can't refract out at all — it reflects back inside 100%. This is exactly how optical fiber traps light for kilometers with almost no loss, and why diamonds sparkle so much (n=2.42 gives a small critical angle, so light bounces around a lot before escaping).`
  },
  dispersion: {
    title: 'Dispersion & the Abbe Number',
    body: `Refractive index actually depends on wavelength — that's why a prism splits white light into a rainbow. The Abbe number measures how little a material disperses light: high Abbe (like crown glass, 59) barely splits colors; low Abbe (like flint glass, 36) splits them a lot. Camera lenses combine high- and low-Abbe glass ("achromatic doublets") to cancel the color fringing out.`
  },
  polarization: {
    title: "Polarization & Brewster's Angle",
    body: `Light is a transverse wave — it can vibrate in any direction perpendicular to travel. At Brewster's angle, reflected light becomes fully polarized in one plane. Polarizing sunglasses block that plane, which is why they cut glare off water and wet roads so effectively.`
  },
  diffraction: {
    title: 'Diffraction',
    body: `Waves bend around obstacles and spread out after passing through small openings — a direct consequence of light's wave nature. A periodic grating diffracts light at sharp angles given by d·sinθ = mλ (opal owes its shifting colors to exactly this, from a natural lattice of silica spheres). Diffraction also sets a hard floor on resolution — the Rayleigh criterion says no optical system, however well made, can distinguish two points closer together than roughly 1.22λ/D. That's why a shadow's edge is never perfectly sharp, and why very small camera apertures actually blur images ("diffraction-limited" optics).`
  },
  coherence: {
    title: 'Coherence & Lasers',
    body: `Ordinary light sources emit many wavelengths and phases jumbled together. A laser emits coherent light: one wavelength, one phase, marching in lockstep. That's why it can be focused to a tiny, intense point instead of spreading out like a flashlight beam.`
  },
  interference: {
    title: 'Interference',
    body: `When two light waves overlap in phase (crest meets crest) they add up — constructive interference. Out of phase (crest meets trough) they cancel — destructive interference. Holography takes this further: a hologram physically records the interference pattern between a reference beam and light reflected off an object (often in silver halide film), then reconstructs the full 3D wavefront when lit again the same way. The same principle underlies anti-reflective coatings and noise-cancelling optics research.`
  },
  photoelectric: {
    title: 'The Photoelectric Effect & Band Gaps',
    body: `Light knocks electrons loose only if each photon carries more energy than the material's band gap (E = hf). More photons of too-low energy still do nothing — it's a threshold effect, not a matter of total brightness. This is exactly how solar cells and digital camera sensors work, and it's what won Einstein his Nobel Prize.`
  },
  stokes: {
    title: 'Fluorescence & the Stokes Shift',
    body: `A fluorescent material absorbs a photon, loses a little energy as heat, then re-emits a lower-energy (longer-wavelength) photon. That energy loss is the Stokes shift — it's why highlighter ink glows a different color than the light you shine on it.`
  },
  hardness: {
    title: 'The Mohs Hardness Scale',
    body: `Mohs hardness ranks how well a material resists scratching, from talc (1) to diamond (10). Optical instruments need hard, stable materials for lenses and windows that survive years of handling — sapphire (9) and diamond (10) are prized for exactly this.`
  },
  semiconductors: {
    title: 'Semiconductors & Band Gaps',
    body: `In a semiconductor like silicon, electrons need a minimum "band gap" energy to jump from a bound state to a freely conducting one. Photons below that energy pass through or get absorbed as heat; photons above it can generate usable electric current. Silicon's ~1.1 eV gap is why solar panels are tuned to the visible/near-infrared spectrum.`
  },
  fiber_optics: {
    title: 'Optical Fiber',
    body: `A fiber has a higher-index core surrounded by a lower-index cladding. Light launched inside the core beyond the critical angle undergoes continuous total internal reflection, guiding it for enormous distances. Real fibers still lose a little light each kilometer to absorption and scattering — that loss is called attenuation.`
  }
};

export function unlockedCodexIds(state) {
  return Object.keys(state.codexUnlocked || {});
}

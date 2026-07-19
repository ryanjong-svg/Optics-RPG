// Real (approximate) material science / optics constants drive every stat here.
// n = refractive index, abbe = Abbe number (higher = less dispersion),
// hardness = Mohs scale, reflectivity = fraction of normal-incidence light reflected (metals).
export const MATERIALS = {
  water: {
    id: 'water', name: 'Water', glyph: '\u{1F4A7}', n: 1.33, abbe: 56, hardness: 0,
    transparency: 0.99, density: 1.0,
    fact: 'Water bends light gently (n=1.33) — that’s why a straw looks broken in a glass.'
  },
  crown_glass: {
    id: 'crown_glass', name: 'Crown Glass', glyph: '\u{1F9CA}', n: 1.52, abbe: 59, hardness: 6,
    transparency: 0.95, density: 2.5,
    fact: 'Crown glass has low dispersion (Abbe 59) — good for lenses that don’t smear color.'
  },
  flint_glass: {
    id: 'flint_glass', name: 'Flint Glass', glyph: '\u{1F536}', n: 1.62, abbe: 36, hardness: 5,
    transparency: 0.9, density: 3.6,
    fact: 'Flint glass has heavy lead content, high index, and low Abbe number — great for prisms, bad for sharp images alone.'
  },
  quartz: {
    id: 'quartz', name: 'Quartz Crystal', glyph: '\u{1F48E}', n: 1.54, abbe: 45, hardness: 7,
    transparency: 0.92, density: 2.65,
    fact: 'Quartz is piezoelectric and forms the low-loss core of optical fiber.'
  },
  diamond: {
    id: 'diamond', name: 'Diamond', glyph: '\u{1F48E}', n: 2.42, abbe: 55, hardness: 10,
    transparency: 0.98, density: 3.5,
    fact: 'Diamond’s huge refractive index (2.42) traps light in total internal reflection — that’s the "fire" you see in a cut gem.'
  },
  silicon: {
    id: 'silicon', name: 'Silicon Wafer', glyph: '\u{1F529}', n: 3.5, abbe: 0, hardness: 7,
    transparency: 0.05, bandgapEV: 1.1, density: 2.33,
    fact: 'Silicon’s 1.1 eV band gap means photons below that energy just pass through — no photoelectric current.'
  },
  silver: {
    id: 'silver', name: 'Silver Coating', glyph: '\u{1FA99}', n: 0.15, abbe: 0, hardness: 2.5,
    reflectivity: 0.95, density: 10.5,
    fact: 'Silver reflects ~95% of visible light — the best common mirror coating.'
  },
  aluminum: {
    id: 'aluminum', name: 'Aluminum Coating', glyph: '\u{2699}\u{FE0F}', n: 1.4, abbe: 0, hardness: 2.75,
    reflectivity: 0.9, density: 2.7,
    fact: 'Aluminum reflects ~90% of light across the whole visible spectrum and doesn’t tarnish like silver.'
  },
  polaroid: {
    id: 'polaroid', name: 'Polaroid Film', glyph: '\u{1F576}\u{FE0F}', n: 1.5, abbe: 0, hardness: 1,
    transparency: 0.4, density: 1.2,
    fact: 'Polaroid film absorbs light vibrating along its molecular chains, passing only one polarization.'
  },
  sapphire: {
    id: 'sapphire', name: 'Sapphire', glyph: '\u{1F535}', n: 1.76, abbe: 72, hardness: 9,
    transparency: 0.85, density: 3.98,
    fact: 'Sapphire is nearly as hard as diamond, so it’s used for scratch-proof watch faces and camera lens covers.'
  },
  opal: {
    id: 'opal', name: 'Opal', glyph: '\u{1F5FF}', n: 1.45, abbe: 50, hardness: 6,
    transparency: 0.6, density: 2.1,
    fact: 'Opal’s "play of color" comes from a periodic lattice of silica nanospheres acting as a natural diffraction grating.'
  },
  silver_halide: {
    id: 'silver_halide', name: 'Silver Halide Film', glyph: '\u{1F4F7}', n: 2.0, abbe: 0, hardness: 2,
    transparency: 0.2, density: 6.47,
    fact: 'Photographic and holographic emulsions use silver halide crystals to physically record interference fringe patterns.'
  }
};

export const MATERIAL_LIST = Object.values(MATERIALS);

import { MATERIALS } from './materials.js';

// Equipment recipes: combine materials at the Workbench. Stats are derived from
// real formulas (see comments) so better physics choices really do make better gear.
export const RECIPES = [
  {
    id: 'converging_lens', name: 'Converging Lens', slot: 'lens', glyph: '\u{1F50D}',
    materials: ['crown_glass'], count: 2,
    build(mats) {
      const n = MATERIALS.crown_glass.n;
      // Lensmaker's-equation flavor: focusing power grows with (n-1).
      return { focusPower: Math.round((n - 1) * 40), critBonus: 0.15 };
    },
    fact: 'A converging lens (n-1 factor) bends parallel rays to a point — the higher the index, the shorter the focal length.'
  },
  {
    id: 'diverging_lens', name: 'Diverging Lens', slot: 'lens', glyph: '\u{1F506}',
    materials: ['flint_glass'], count: 2,
    build() {
      return { focusPower: 8, evasionBonus: 0.12 };
    },
    fact: 'A diverging (concave) lens spreads rays out — harder to hit, harder to focus damage with.'
  },
  {
    id: 'prism', name: 'Dispersion Prism', slot: 'prism', glyph: '\u{1F53A}',
    materials: ['flint_glass'], count: 3,
    build() {
      return { abbe: MATERIALS.flint_glass.abbe };
    },
    fact: 'Low-Abbe-number glass splits white light into more, wider color bands.'
  },
  {
    id: 'achromatic_doublet', name: 'Achromatic Doublet', slot: 'prism', glyph: '\u{1F308}',
    materials: ['crown_glass', 'flint_glass'], count: 1,
    build() {
      return { abbe: 999, correctsChroma: true };
    },
    fact: 'Pairing a crown lens with a flint lens cancels their dispersions — real camera lenses do this to kill color fringing.'
  },
  {
    id: 'silver_mirror', name: 'Silver Mirror', slot: 'mirror', glyph: '\u{1FA9E}',
    materials: ['silver'], count: 2,
    build() {
      return { reflectivity: MATERIALS.silver.reflectivity };
    },
    fact: 'R = ((n1-n2)/(n1+n2))^2 — silvering makes n effectively very different from air, so almost everything reflects.'
  },
  {
    id: 'aluminum_mirror', name: 'Aluminum Mirror', slot: 'mirror', glyph: '\u{1FA9E}',
    materials: ['aluminum'], count: 2,
    build() {
      return { reflectivity: MATERIALS.aluminum.reflectivity };
    },
    fact: 'Slightly less reflective than silver, but aluminum resists tarnishing — most telescope mirrors use it.'
  },
  {
    id: 'polarizing_filter', name: 'Polarizing Filter', slot: 'filter', glyph: '\u{1F576}\u{FE0F}',
    materials: ['polaroid'], count: 2,
    build() {
      return { glareReduction: 0.6 };
    },
    fact: 'At Brewster’s angle, reflected glare is fully polarized — a polarizing filter blocks it outright.'
  },
  {
    id: 'optical_fiber', name: 'Optical Fiber', slot: 'filter', glyph: '\u{1F9F5}',
    materials: ['quartz', 'water'], count: 2,
    build() {
      const core = MATERIALS.quartz.n, clad = MATERIALS.water.n;
      const criticalAngleDeg = Math.round(Math.asin(clad / core) * 180 / Math.PI);
      return { tirBonus: 0.35, criticalAngleDeg };
    },
    fact: 'A fiber needs a higher-index core than cladding so light hitting the wall beyond the critical angle undergoes total internal reflection.'
  },
  {
    id: 'diamond_loupe', name: 'Diamond Loupe', slot: 'lens', glyph: '\u{1F48E}',
    materials: ['diamond'], count: 1,
    build() {
      const n = MATERIALS.diamond.n;
      return { focusPower: Math.round((n - 1) * 40), critBonus: 0.4, abbe: MATERIALS.diamond.abbe };
    },
    fact: 'Diamond’s huge index gives ferocious focusing power and brilliant "fire" from dispersion — an end-game lens.'
  },
  {
    id: 'photodetector', name: 'Silicon Photodetector', slot: 'filter', glyph: '\u{1F529}',
    materials: ['silicon'], count: 2,
    build() {
      return { bandgapPierce: true, bandgapEV: MATERIALS.silicon.bandgapEV };
    },
    fact: 'A silicon photodiode only registers photons carrying more energy than its 1.1 eV band gap.'
  },
  {
    id: 'sapphire_window', name: 'Sapphire Window', slot: 'mirror', glyph: '\u{1F535}',
    materials: ['sapphire'], count: 2,
    build() {
      return { reflectivity: 0.3, defenseBonus: 8 };
    },
    fact: 'Sapphire (Mohs 9) barely scratches — used as a tough, clear shield in real optical instruments.'
  }
];

export function findRecipe(id) {
  return RECIPES.find(r => r.id === id);
}

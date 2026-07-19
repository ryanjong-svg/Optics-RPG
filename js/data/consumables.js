// Consumables are crafted at the Workbench like equipment, but they stack and
// get used up instead of being equipped permanently — the game's only way to
// restore HP outside of leveling up.
export const CONSUMABLES = [
  {
    id: 'photon_salve', name: 'Photon Salve', glyph: '\u{1FA79}',
    materials: ['water', 'quartz'], count: 2, heal: 20,
    fact: 'Photobiomodulation uses low-power red/near-infrared light (roughly 660-850nm) to stimulate mitochondrial repair — real "cold laser therapy" devices exploit this "therapeutic window," the band where blood and water absorb least and light penetrates deepest into tissue.'
  }
];

export function findConsumable(id) {
  return CONSUMABLES.find(c => c.id === id);
}

// Tests the pure ability effect() formulas in isolation (no battle.js/DOM
// involved) - these are the actual physics-derived numbers the player sees.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findAbility } from '../../js/data/content/abilities.js';

const noop = () => {};

test('reflect_strike: weakness amplifies 1.8x, resistance reduces to 0.4x, matching real Fresnel-reflectivity scaling', () => {
  const ability = findAbility('reflect_strike');
  const player = { focus: 6 };
  const gear = {};
  const neutral = ability.effect({ player, gear, log: noop, enemy: { name: 'N', weakTo: [], resists: [] } });
  const weak = ability.effect({ player, gear, log: noop, enemy: { name: 'W', weakTo: ['reflect_strike'], resists: [], weakNote: 'x' } });
  const resist = ability.effect({ player, gear, log: noop, enemy: { name: 'R', weakTo: [], resists: ['reflect_strike'], resistNote: 'y' } });

  // base = round((10 + 6*0.4) * (0.5 + 0.2)) = round(12.4 * 0.7) = 9
  assert.equal(neutral.dmg, 9);
  assert.equal(weak.dmg, Math.round(9 * 1.8));
  assert.equal(resist.dmg, Math.round(9 * 0.4));
});

test('reflect_strike: a mirror with higher reflectivity deals more damage', () => {
  const ability = findAbility('reflect_strike');
  const player = { focus: 6 };
  const enemy = { weakTo: [], resists: [] };
  const noMirror = ability.effect({ player, gear: {}, log: noop, enemy });
  const silverMirror = ability.effect({ player, gear: { mirror: { reflectivity: 0.95 } }, log: noop, enemy });
  assert.ok(silverMirror.dmg > noMirror.dmg);
});

test('dispersion_burst: hit count scales inversely with Abbe number, clamped to [2, 7]', () => {
  const ability = findAbility('dispersion_burst');
  const player = { focus: 0 };
  const enemy = { weakTo: [], resists: [] };
  const defaultAbbe = ability.effect({ player, gear: {}, log: noop, enemy });
  assert.equal(defaultAbbe.hits, Math.max(2, Math.min(7, Math.round(280 / 55))));

  const lowAbbe = ability.effect({ player, gear: { prism: { abbe: 36 } }, log: noop, enemy });
  assert.equal(lowAbbe.hits, 7); // round(280/36)=8, clamped to the max of 7

  const veryHighAbbe = ability.effect({ player, gear: { prism: { abbe: 999 } }, log: noop, enemy });
  assert.equal(veryHighAbbe.hits, 2); // round(280/999)=0, clamped to the min of 2
});

test('dispersion_burst: a Rutile Prism adds flat damage per hit on top of the base formula', () => {
  const ability = findAbility('dispersion_burst');
  const player = { focus: 0 };
  const enemy = { weakTo: [], resists: [] };
  const base = ability.effect({ player, gear: {}, log: noop, enemy });
  const withRutile = ability.effect({ player, gear: { prism: { abbe: 55, dispersionBonus: 3 } }, log: noop, enemy });
  assert.equal(withRutile.perHit, base.perHit + 3);
});

test('diffraction_wave: a Diffraction Grating adds to the base 0.5 defense-ignore fraction', () => {
  const ability = findAbility('diffraction_wave');
  const player = { focus: 0 };
  const enemy = { weakTo: [], resists: [] };
  const base = ability.effect({ player, gear: {}, log: noop, enemy });
  assert.equal(base.ignoreDefFrac, 0.5);
  const withGrating = ability.effect({ player, gear: { prism: { diffractionBonus: 0.15 } }, log: noop, enemy });
  assert.equal(withGrating.ignoreDefFrac, 0.65);
});

test('interference_cancel: a Holographic Plate adds to the base 0.25 full-negate chance', () => {
  const ability = findAbility('interference_cancel');
  const base = ability.effect({ player: {}, gear: {}, log: noop, enemy: {} });
  assert.equal(base.fullNegateChance, 0.25);
  const withPlate = ability.effect({ player: {}, gear: { filter: { hologramBonus: 0.15 } }, log: noop, enemy: {} });
  assert.equal(withPlate.fullNegateChance, 0.4);
});

test('photoelectric_shock: deals zero damage strictly below the band gap, positive damage above it', () => {
  const ability = findAbility('photoelectric_shock');
  const player = { focus: 0 }; // photonEV = 1.0 eV exactly, no gear bonus
  const belowGap = ability.effect({ player, gear: {}, log: noop, enemy: { bandgapEV: 1.1, weakTo: [], resists: [] } });
  assert.equal(belowGap.dmg, 0);

  const aboveGap = ability.effect({ player, gear: {}, log: noop, enemy: { bandgapEV: 0.5, weakTo: [], resists: [] } });
  assert.ok(aboveGap.dmg > 0, 'expected positive damage once photon energy exceeds the band gap');

  const withPiercingFilter = ability.effect({ player, gear: { filter: { bandgapPierce: true } }, log: noop, enemy: { bandgapEV: 1.1, weakTo: [], resists: [] } });
  assert.ok(withPiercingFilter.dmg > 0, 'a piercing filter should clear a band gap that would otherwise block the hit');
});

test('photoelectric_shock: a larger bandgapPierceEV (e.g. the Avalanche Photodetector) clears a higher band gap and deals more excess damage than the default 0.8 eV pierce', () => {
  const ability = findAbility('photoelectric_shock');
  const player = { focus: 0 };
  const enemy = { bandgapEV: 1.6, weakTo: [], resists: [] }; // just above the default pierce's 1.8 eV total, so default alone still clears it — use a higher gap to differentiate
  const highGapEnemy = { bandgapEV: 2.0, weakTo: [], resists: [] };

  const defaultPierce = ability.effect({ player, gear: { filter: { bandgapPierce: true } }, log: noop, enemy: highGapEnemy });
  assert.equal(defaultPierce.dmg, 0, 'the default 0.8 eV pierce should not clear a 2.0 eV gap');

  const strongerPierce = ability.effect({ player, gear: { filter: { bandgapPierce: true, bandgapPierceEV: 1.5 } }, log: noop, enemy: highGapEnemy });
  assert.ok(strongerPierce.dmg > 0, 'the Avalanche Photodetector\'s 1.5 eV pierce should clear a 2.0 eV gap');

  const bothClear = ability.effect({ player, gear: { filter: { bandgapPierce: true, bandgapPierceEV: 1.5 } }, log: noop, enemy });
  const defaultClear = ability.effect({ player, gear: { filter: { bandgapPierce: true } }, log: noop, enemy });
  assert.ok(bothClear.dmg > defaultClear.dmg, 'a bigger pierce bonus should deal more excess-energy damage once both clear the gap');
});

test('polarize_filter: an active glare event adds ctx.glareBonus on top of the gear\'s base reduction', () => {
  const ability = findAbility('polarize_filter');
  const base = ability.effect({ player: {}, gear: {}, log: noop, enemy: {} });
  assert.equal(base.glareShield, 0.3);
  const withGlareEvent = ability.effect({ player: {}, gear: {}, log: noop, enemy: {}, glareBonus: 0.15 });
  assert.ok(Math.abs(withGlareEvent.glareShield - 0.45) < 1e-9);
  assert.notEqual(withGlareEvent.note, base.note, 'the note should call out the active glare event');
});

test('laser_focus: a guaranteed crit applies the 1.8x crit multiplier on top of base damage', () => {
  const ability = findAbility('laser_focus');
  const player = { focus: 6 };
  const enemy = { weakTo: [], resists: [] };
  const originalRandom = Math.random;
  try {
    Math.random = () => 0; // always below the 0.2 crit threshold -> guaranteed crit
    const result = ability.effect({ player, gear: {}, log: noop, enemy });
    assert.equal(result.isCrit, true);
    // base = round(12 + 6*0.5) = 15; crit = round(15*1.8) = 27
    assert.equal(result.dmg, 27);
  } finally {
    Math.random = originalRandom;
  }
});

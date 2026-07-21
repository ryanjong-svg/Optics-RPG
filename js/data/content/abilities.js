// Every ability's *mechanic* is a simplified but real optics formula, not just flavor text.
// battle.js calls `effect(ctx)` where ctx = { player, enemy, log, gear }
export const ABILITIES = [
  {
    id: 'reflect_strike', name: 'Reflect Strike', concept: 'reflection', slot: 'mirror',
    type: 'attack', basePower: 10, chargeCost: 1,
    desc: 'Bounce focused light off your mirror coating straight at the foe.',
    effect(ctx) {
      const R = ctx.gear.mirror ? ctx.gear.mirror.reflectivity : 0.2;
      let dmg = Math.round((this.basePower + ctx.player.focus * 0.4) * (0.5 + R));
      dmg = applyMatchup(ctx, this.id, dmg);
      return { dmg, note: `Reflectivity ${(R * 100).toFixed(0)}% amplifies the strike.` };
    }
  },
  {
    id: 'refraction_bend', name: 'Refraction Bend', concept: 'snell', slot: 'lens',
    type: 'attack', basePower: 9, chargeCost: 1,
    desc: 'Snell’s Law bends your beam around the enemy’s guard.',
    effect(ctx) {
      const n = ctx.gear.lens ? ctx.gear.lens.focusPower : 4;
      let dmg = Math.round(this.basePower + n * 0.6 + ctx.player.focus * 0.3);
      dmg = applyMatchup(ctx, this.id, dmg);
      return { dmg, ignoreDefFrac: 0.3, note: 'The beam bends past part of the enemy’s defense.' };
    }
  },
  {
    id: 'tir_shield', name: 'TIR Shield', concept: 'tir', slot: 'filter',
    type: 'defense', basePower: 0,
    desc: 'Trap incoming light via total internal reflection — raises block chance this turn.',
    effect(ctx) {
      const bonus = ctx.gear.filter && ctx.gear.filter.tirBonus ? ctx.gear.filter.tirBonus : 0.15;
      return { block: 0.45 + bonus, note: 'Light beyond the critical angle can’t escape — it reflects back inside.' };
    }
  },
  {
    id: 'dispersion_burst', name: 'Dispersion Burst', concept: 'dispersion', slot: 'prism',
    type: 'attack', basePower: 4, cooldown: 1, chargeCost: 2,
    desc: 'Split white light into a rainbow of smaller hits — more hits with lower-Abbe glass.',
    effect(ctx) {
      const abbe = ctx.gear.prism ? ctx.gear.prism.abbe : 55;
      const hits = Math.max(2, Math.min(7, Math.round(280 / abbe)));
      const dispersionBonus = ctx.gear.prism && ctx.gear.prism.dispersionBonus ? ctx.gear.prism.dispersionBonus : 0;
      let per = Math.round(this.basePower + ctx.player.focus * 0.15 + dispersionBonus);
      per = applyMatchup(ctx, this.id, per);
      return { hits, perHit: per, note: `Abbe number ${abbe} splits the beam into ${hits} colors.` };
    }
  },
  {
    id: 'polarize_filter', name: 'Polarize Filter', concept: 'polarization', slot: 'filter',
    type: 'defense', basePower: 0,
    effect(ctx) {
      const base = ctx.gear.filter && ctx.gear.filter.glareReduction ? ctx.gear.filter.glareReduction : 0.3;
      const reduction = base + (ctx.glareBonus || 0);
      return {
        glareShield: reduction,
        note: ctx.glareBonus
          ? 'Only light aligned with the filter axis gets through — and this glare-heavy air makes the effect even stronger.'
          : 'Only light aligned with the filter axis gets through.'
      };
    },
    desc: 'Block glare-based attacks at Brewster’s angle.'
  },
  {
    id: 'diffraction_wave', name: 'Diffraction Wave', concept: 'diffraction', slot: 'prism',
    type: 'attack', basePower: 7, chargeCost: 1,
    desc: 'Bend the beam around obstacles — ignores half the enemy’s guard.',
    effect(ctx) {
      let dmg = Math.round(this.basePower + ctx.player.focus * 0.3);
      dmg = applyMatchup(ctx, this.id, dmg);
      const bonus = ctx.gear.prism && ctx.gear.prism.diffractionBonus ? ctx.gear.prism.diffractionBonus : 0;
      return {
        dmg, ignoreDefFrac: 0.5 + bonus,
        note: bonus ? `A ruled grating sharpens the bend — ignores even more of the guard.` : 'Waves spread around the edges of any obstacle.'
      };
    }
  },
  {
    id: 'laser_focus', name: 'Laser Focus', concept: 'coherence', slot: 'lens',
    type: 'attack', basePower: 12, cooldown: 2, chargeCost: 2,
    desc: 'A coherent, single-color beam — high critical-hit chance.',
    effect(ctx) {
      const critBonus = ctx.gear.lens ? (ctx.gear.lens.critBonus || 0) : 0;
      const isCrit = Math.random() < (0.2 + critBonus);
      let dmg = Math.round(this.basePower + ctx.player.focus * 0.5);
      if (isCrit) dmg = Math.round(dmg * 1.8);
      dmg = applyMatchup(ctx, this.id, dmg);
      return { dmg, isCrit, note: isCrit ? 'Coherent light stays in phase — critical hit!' : 'A focused, steady beam.' };
    }
  },
  {
    id: 'interference_cancel', name: 'Interference Cancel', concept: 'interference', slot: 'filter',
    type: 'defense', basePower: 0,
    desc: 'Time an out-of-phase wave to destructively cancel the next attack.',
    effect(ctx) {
      const bonus = ctx.gear.filter && ctx.gear.filter.hologramBonus ? ctx.gear.filter.hologramBonus : 0;
      return {
        block: 0.55, fullNegateChance: 0.25 + bonus,
        note: bonus ? 'A recorded reference pattern predicts the incoming wave — near-perfect cancellation.' : 'Trough meets crest — the wave cancels itself out.'
      };
    }
  },
  {
    id: 'photoelectric_shock', name: 'Photoelectric Shock', concept: 'photoelectric', slot: 'filter',
    type: 'attack', basePower: 14, cooldown: 2, chargeCost: 2,
    desc: 'Only works if photon energy clears the target’s band gap — but hits hard when it does.',
    effect(ctx) {
      const filter = ctx.gear.filter;
      const pierceBonus = filter && filter.bandgapPierce ? (filter.bandgapPierceEV != null ? filter.bandgapPierceEV : 0.8) : 0;
      const photonEV = 1.0 + ctx.player.focus * 0.05 + pierceBonus;
      const gap = ctx.enemy.bandgapEV != null ? ctx.enemy.bandgapEV : 0;
      if (photonEV <= gap) {
        return { dmg: 0, note: `Photon energy ${photonEV.toFixed(1)} eV can’t clear the ${gap.toFixed(1)} eV band gap — no current flows.` };
      }
      const excess = photonEV - gap;
      let dmg = Math.round(this.basePower + excess * 20);
      dmg = applyMatchup(ctx, this.id, dmg);
      return { dmg, note: `Photon energy exceeds the band gap by ${excess.toFixed(1)} eV — electrons knocked free!` };
    }
  },
  {
    id: 'absorb_reemit', name: 'Absorb & Re-emit', concept: 'stokes', slot: null,
    type: 'utility', basePower: 0,
    desc: 'Absorb this hit, store the energy, release it next turn at reduced (Stokes-shifted) strength.',
    effect(ctx) {
      return { absorbShield: 0.7, storeForNextTurn: true, note: 'Energy absorbed now, some lost as heat, released next turn.' };
    }
  }
];

// Simple, explainable "type chart": each enemy declares weak/resist ability ids.
// The matchup always prints WHY, so the numeric swing teaches the concept.
function applyMatchup(ctx, abilityId, dmg) {
  const enemy = ctx.enemy;
  if (enemy.weakTo && enemy.weakTo.includes(abilityId)) {
    ctx.log(`${enemy.name} is vulnerable to this: ${enemy.weakNote || ''}`);
    return Math.round(dmg * 1.8);
  }
  if (enemy.resists && enemy.resists.includes(abilityId)) {
    ctx.log(`${enemy.name} resists this: ${enemy.resistNote || ''}`);
    return Math.round(dmg * 0.4);
  }
  return dmg;
}

export function findAbility(id) {
  return ABILITIES.find(a => a.id === id);
}

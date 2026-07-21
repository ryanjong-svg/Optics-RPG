# Prism & Photon: Candela's Reach

[![Tests](https://github.com/ryanjong-svg/Optics-RPG/actions/workflows/test.yml/badge.svg)](https://github.com/ryanjong-svg/Optics-RPG/actions/workflows/test.yml)

A turn-based graphical RPG for teaching optics and materials science. Explore Lumen
Village and eleven themed dungeons, gather real materials (water, crown/flint glass,
quartz, silicon, silver, aluminum, calcite, rutile, and more), craft lenses, mirrors,
prisms, and filters at the Workbench, and fight creatures of misunderstood light using
abilities grounded in real physics — Snell's Law, total internal reflection,
dispersion, polarization, diffraction, coherence, interference, the photoelectric
effect, and the Stokes shift. A Codex unlocks real explanations as you encounter each
concept, a Chronicle reveals the world's lore as you explore, and three Professor NPCs
quiz you along the way.

No build step, no dependencies — plain HTML/CSS/JS with ES modules.

**Play it live:** https://ryanjong-svg.github.io/Optics-RPG/

## Run it locally

**Windows:** double-click `Play Optics RPG.bat`. It starts a local server and opens
the game in your browser automatically.

**Manual / other OS:** ES modules require a local server (opening `index.html`
directly via `file://` won't work due to browser CORS restrictions on modules).

```
python -m http.server 5090
```

then open `http://localhost:5090`.

## Controls

Arrow keys / WASD to move (on-screen d-pad on touch devices). Walk into NPCs, the
Workbench, items, or enemies to interact.

## Testing

The core game logic (battle formulas, save migration, quests, achievements, data
integrity across every zone/enemy/recipe) is covered by a zero-dependency test suite
using Node's built-in test runner:

```
npm test
```

Tests run automatically on every push and pull request via GitHub Actions
(`.github/workflows/test.yml`).

## Features

- 12 zones (Lumen Village, 5 main dungeons, 5 deeper "depth" variants, and the final
  confrontation) each teaching a distinct optics concept, with a guardian and a hidden
  secret per zone
- Turn-based battles with a matchup system (abilities are strong/weak against specific
  enemies, mirroring real physical mechanisms), ability cooldowns, a Charge resource
  that gates your strongest attacks, and ability combos (certain abilities used
  back-to-back grant a bonus, and chaining two combos in a row completes an even
  bigger "combo chain")
- Elite enemy variants that occasionally replace a normal encounter — tougher and
  better-rewarded, with a zone-tinted aura and their own Field Log tracking
- Multi-enemy pack encounters, overworld "wanderers" with a surprise-attack bonus, and
  telegraphed heavy attacks from guardians/the boss
- Crafting system (materials → gear) with end-game recipes that combine/upgrade an
  owned predecessor item instead of building from scratch, gear loadout presets that
  can be swapped mid-battle, consumable recovery items, a Meditate action to restore
  Charge, and a repeatable Bounty Board with a streak bonus for claiming goals
  back-to-back
- Codex (physics concepts), Chronicle (world lore), Quest Log, a personal Bestiary
  (searchable, sortable, and favoritable) of every enemy you've fought, and a Field
  Log tracking overall completion and named achievements
- Difficulty settings, a New Game+ cycle with escalating enemy stats and adaptive
  guardian/boss resistance to an overused ability, and save export/import for backing
  up or transferring progress
- Three interactive aiming puzzles grounded in real physics — Snell's Law
  (n₁sinθ₁ = n₂sinθ₂) for Refraction Bend, double-slit interference for Diffraction
  Wave, and Brewster's angle for Polarize Filter — each fired through instead of an
  instant cast, with an optional "Puzzle Hints" setting to hide the target for a
  harder, hint-free challenge; plus a free-to-switch specialization system (Photon
  Focus / Wave Mechanics) unlocked at level 5
- Procedural audio (SFX + music via the Web Audio API) and a hand-authored pixel-art
  sprite system rendered in an isometric overworld with an XCOM-2-inspired tactical UI

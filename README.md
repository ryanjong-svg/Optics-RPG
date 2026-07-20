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
  enemies, mirroring real physical mechanisms), ability cooldowns, and a Charge
  resource that gates your strongest attacks
- Multi-enemy pack encounters, overworld "wanderers" with a surprise-attack bonus, and
  telegraphed heavy attacks from guardians/the boss
- Crafting system (materials → gear), gear loadout presets, consumable recovery items,
  and a Meditate action to restore Charge
- Codex (physics concepts), Chronicle (world lore), Quest Log, a personal Bestiary of
  every enemy you've fought, and a Field Log tracking overall completion and named
  achievements
- Difficulty settings, a New Game+ cycle with escalating enemy scaling, and save
  export/import for backing up or transferring progress
- Procedural audio (SFX + music via the Web Audio API) and a hand-authored pixel-art
  sprite system rendered in an isometric overworld with an XCOM-2-inspired tactical UI

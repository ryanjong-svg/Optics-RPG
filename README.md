# Prism & Photon — An Optics RPG

A turn-based graphical RPG for teaching optics and materials science. Explore Lumen
Village and four themed dungeons, gather real materials (water, crown/flint glass,
quartz, diamond, silicon, silver, aluminum, polaroid film, sapphire), craft lenses,
mirrors, prisms, and filters at the Workbench, and fight creatures of misunderstood
light using abilities grounded in real physics — Snell's Law, total internal
reflection, dispersion, polarization, diffraction, coherence, interference, the
photoelectric effect, and the Stokes shift. A Codex unlocks real explanations as you
encounter each concept, and three Professor NPCs quiz you along the way.

No build step, no dependencies — plain HTML/CSS/JS with ES modules.

## Run it

**Windows:** double-click `Play Optics RPG.bat`. It starts a local server and opens
the game in your browser automatically.

**Manual / other OS:** ES modules require a local server (opening `index.html`
directly via `file://` won't work due to browser CORS restrictions on modules).

```
python -m http.server 5090
```

then open `http://localhost:5090`.

## Controls

Arrow keys / WASD to move. Walk into NPCs, the Workbench, items, or enemies to
interact.

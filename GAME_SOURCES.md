# CloudPlay Game Sources & Licensing

CloudPlay is committed to respecting open-source software licenses, creator attribution, and intellectual property. This document records the original repository, author, license, and integration architecture for every game available on the platform.

---

## Game Registry & Attribution

### 1. Cyber 2048
- **Category**: Puzzle / Strategy
- **Architecture**: Local module (`src/games/Cyber2048/`)
- **Original Author**: Gabriele Cirulli
- **Original Repository**: [https://github.com/gabrielecirulli/2048](https://github.com/gabrielecirulli/2048)
- **License**: MIT License (Copyright (c) 2014 Gabriele Cirulli)
- **Description**: Rebuilt edition of Gabriele Cirulli's classic open-source 2048 game with cybernetic neon visuals, Web Audio procedural synth effects, multi-grid dimensions (3x3 Blitz, 4x4 Classic, 5x5 Expanded), undo history, touch swipe support, and CloudPlay progression integration.

### 2. Hill Climb Racing
- **Category**: 2D Physics Racing / Hill Climb
- **Architecture**: Local module (`src/games/HillClimb.jsx` + `src/games/hillClimbPhysics.js`)
- **Author / Source**: CloudPlay Original
- **License**: CloudPlay Proprietary
- **Description**: Classic physics-based hill climbing racer featuring Bill Newton, independent front/rear wheel suspension, gas/brake throttle tipping, air flips, fuel management with Jerry can pickups, rolling hills, coins, and garage upgrades (Engine, Tyres, Suspension).

### 3. Asteroid Fury
- **Category**: Arcade / Space Survival Shooter
- **Architecture**: Local module (`src/games/AsteroidFury/`)
- **Game Engine**: [Phaser 3](https://github.com/phaserjs/phaser) (MIT License)
- **Author / Source**: CloudPlay Original
- **License**: CloudPlay Proprietary (Phaser Framework under MIT)
- **Description**: Procedurally rendered vector-style arcade shooter with splitting asteroids, particle engine, directional thruster mechanics, kinetic shields, and difficulty scaling.

### 4. Block Drop
- **Category**: Puzzle / Falling Blocks
- **Architecture**: Local module (`src/games/BlockPuzzle/`)
- **Game Engine**: [Phaser 3](https://github.com/phaserjs/phaser) (MIT License)
- **Author / Source**: CloudPlay Original
- **License**: CloudPlay Proprietary (Phaser Framework under MIT)
- **Description**: High-speed tetromino block-clearing game with SRS rotation wall-kicks, ghost landing indicators, hold queues, next-piece pipeline, and touch gesture controls.

### 5. Ludo Royale
- **Category**: Board / Strategy
- **Architecture**: Local module (`src/games/Ludo.jsx`)
- **Author / Source**: CloudPlay Original
- **License**: CloudPlay Proprietary
- **Description**: Responsive 2-to-4 player pass-and-play board game featuring deterministic dice rolling, safe spaces, home lanes, token capture dynamics, and responsive touch/mouse controls.

### 6. Super Kart 3D
- **Category**: 3D Kart Racing
- **Architecture**: Sandboxed in-app embed
- **Original Author**: Fernando Colinhares (`fecolinhares`)
- **Original Repository**: [https://github.com/fecolinhares/super-kart-3djs](https://github.com/fecolinhares/super-kart-3djs)
- **License**: MIT License
- **Attribution**: Copyright (c) Fernando Colinhares. Used under the terms of the MIT License.

### 7. Grapple God: The Ascent
- **Category**: 2D Platformer
- **Architecture**: Sandboxed in-app embed
- **Original Author**: Eric Rossman (`ejrossma`)
- **Original Repository**: [https://github.com/ejrossma/GrappleGod](https://github.com/ejrossma/GrappleGod)
- **Game Engine**: Phaser 3
- **License**: Open-source independent project
- **Attribution**: Built by Eric Rossman and Kevin Lewis.

### 8. Drift
- **Category**: 3D Night Circuit Racing
- **Architecture**: Sandboxed in-app embed
- **Original Author**: Makone
- **Original Source**: [https://www.makone.dev/w/drift/](https://www.makone.dev/w/drift/)
- **License**: MIT License
- **Attribution**: Created by Makone.

### 9. Snowdrift
- **Category**: 3D Winter Driving Simulation
- **Architecture**: Sandboxed in-app embed
- **Original Author**: Makone
- **Original Source**: [https://www.makone.dev/w/snowdrift/](https://www.makone.dev/w/snowdrift/)
- **License**: MIT License
- **Attribution**: Created by Makone.

### 10. Swarm
- **Category**: 3D Aerial Combat / Action
- **Architecture**: Sandboxed in-app embed
- **Original Author**: Makone
- **Original Source**: [https://www.makone.dev/w/swarm/](https://www.makone.dev/w/swarm/)
- **License**: MIT License
- **Attribution**: Created by Makone.

### 11. Neon Velocity: Cyber Highway
- **Category**: 3D Cyberpunk Highway Racing
- **Architecture**: Sandboxed in-app embed
- **Original Author**: Bhanu Pratap Saini (`bhanu2006-24`)
- **Original Repository**: [https://github.com/bhanu2006-24/neon-velocity](https://github.com/bhanu2006-24/neon-velocity)
- **License**: MIT License
- **Attribution**: Built by Bhanu Pratap Saini using Three.js, WebGL, and HTML5. Enhanced in CloudPlay with mobile touch controls and gyroscope tilt steering.

### 12. HexGL
- **Category**: 3D Sci-Fi Racing
- **Architecture**: Sandboxed in-app embed
- **Curated From**: [michelpereira/awesome-open-source-games](https://github.com/michelpereira/awesome-open-source-games#racing)
- **Original Author**: Thibaut Despoulain (BKcore)
- **Original Repository**: [https://github.com/BKcore/HexGL](https://github.com/BKcore/HexGL)
- **License**: MIT License
- **Attribution**: Copyright (c) 2012 Thibaut Despoulain. Built with Three.js and WebGL.

### 12. Clumsy Bird
- **Category**: Arcade / Casual
- **Architecture**: Sandboxed in-app embed
- **Curated From**: [michelpereira/awesome-open-source-games](https://github.com/michelpereira/awesome-open-source-games#arcade)
- **Original Author**: Ellison Leão
- **Original Repository**: [https://github.com/ellisonleao/clumsy-bird](https://github.com/ellisonleao/clumsy-bird)
- **License**: MIT License
- **Attribution**: Copyright (c) 2014 Ellison Leão. Built with MelonJS.

### 13. Particle Clicker
- **Category**: Strategy / Clicker
- **Architecture**: Sandboxed in-app embed
- **Curated From**: [michelpereira/awesome-open-source-games](https://github.com/michelpereira/awesome-open-source-games#clicker)
- **Original Author**: CERN / Particle Clicker Team
- **Original Repository**: [https://github.com/particle-clicker/particle-clicker](https://github.com/particle-clicker/particle-clicker)
- **License**: MIT License
- **Attribution**: Created by the Particle Clicker team at CERN.

### 14. Sandboxels
- **Category**: Simulation / Physics
- **Architecture**: Sandboxed in-app embed
- **Curated From**: [michelpereira/awesome-open-source-games](https://github.com/michelpereira/awesome-open-source-games#sandbox)
- **Original Author**: R74n
- **Original Repository**: [https://github.com/R74nCom/sandboxels](https://github.com/R74nCom/sandboxels)
- **License**: GNU General Public License v3.0 (GPL-3.0)
- **Attribution**: Copyright (c) R74n. Falling sand chemical reaction simulator.

### 15. A Dark Room
- **Category**: Adventure / Text RPG
- **Architecture**: Sandboxed in-app embed
- **Curated From**: [michelpereira/awesome-open-source-games](https://github.com/michelpereira/awesome-open-source-games#puzzle)
- **Original Author**: Michael Townsend (Doublespeak Games)
- **Original Repository**: [https://github.com/doublespeakgames/adarkroom](https://github.com/doublespeakgames/adarkroom)
- **License**: Mozilla Public License 2.0 (MPL-2.0)
- **Attribution**: Copyright (c) Doublespeak Games. Minimalist text adventure.

### 16. Astray
- **Category**: Puzzle / 3D Maze
- **Architecture**: Sandboxed in-app embed
- **Curated From**: [michelpereira/awesome-open-source-games](https://github.com/michelpereira/awesome-open-source-games#puzzle)
- **Original Author**: wwwtyro
- **Original Repository**: [https://github.com/wwwtyro/Astray](https://github.com/wwwtyro/Astray)
- **License**: MIT License
- **Attribution**: Created by wwwtyro with Three.js and Box2D.

### 17. DuckHunt JS
- **Category**: Arcade / Retro
- **Architecture**: Sandboxed in-app embed
- **Curated From**: [michelpereira/awesome-open-source-games](https://github.com/michelpereira/awesome-open-source-games#arcade)
- **Original Author**: Matt Surabian
- **Original Repository**: [https://github.com/MattSurabian/DuckHunt-JS](https://github.com/MattSurabian/DuckHunt-JS)
- **License**: MIT License
- **Attribution**: Copyright (c) Matt Surabian. HTML5 canvas remake.

### 18. SkiFree.js
- **Category**: Arcade / Retro Action
- **Architecture**: Sandboxed in-app embed
- **Curated From**: [michelpereira/awesome-open-source-games](https://github.com/michelpereira/awesome-open-source-games#arcade)
- **Original Author**: Dan Hough
- **Original Repository**: [https://github.com/basicallydan/skifree.js](https://github.com/basicallydan/skifree.js)
- **License**: MIT License
- **Attribution**: Copyright (c) Dan Hough. Remake of the classic 1991 SkiFree.

### 19. Trigger Rally 3D
- **Category**: 3D Rally Racing
- **Architecture**: Sandboxed in-app embed
- **Curated From**: [michelpereira/awesome-open-source-games](https://github.com/michelpereira/awesome-open-source-games#racing)
- **Original Author**: CodeArtemis
- **Original Repository**: [https://github.com/CodeArtemis/TriggerRally](https://github.com/CodeArtemis/TriggerRally)
- **License**: GNU General Public License v2.0 (GPL-2.0)
- **Attribution**: Ported from C to WebGL and Three.js with Web Audio engine sound synthesis.

### 20. OpenWorld 3D
- **Category**: 3D Open World Adventure
- **Architecture**: Sandboxed in-app embed
- **Original Author**: obecerra3
- **Original Repository**: [https://github.com/obecerra3/OpenWorldJS](https://github.com/obecerra3/OpenWorldJS)
- **License**: MIT License
- **Attribution**: Built with Three.js and Ammo.js 3D physics.

### 21. Temple Run
- **Category**: 3D Arcade / Infinite Runner
- **Architecture**: Local native module (`src/games/TempleRun/`)
- **Original Author**: GameHelix
- **Original Repository**: [https://github.com/GameHelix/temple_run](https://github.com/GameHelix/temple_run)
- **License**: MIT License
- **Attribution**: Original open-source React + HTML5 Canvas 2.0 implementation by GameHelix. Ported into CloudPlay as a 100% client-side local React component with procedural Web Audio synthesis, 3-lane pseudo-3D perspective projection, dynamic speed ramping, obstacle dodging, coin collection, customizable difficulty modes (Novice, Explorer, Relic Master), responsive touch swipe controls, and direct CloudPlay progression (XP and coin sync).

---

## Artwork & Game Photography Policy

All game card covers stored under `frontend/public/game-covers/` are authentic high-resolution game photography and real screenshots:
- No artificial, low-quality, or synthetic AI-generated graphics.
- Real, licensed photography and gameplay images showcasing authentic vehicle physics, tracks, runners, and retro boards.
- Fully optimized JPEG format at 800px width with responsive web delivery.

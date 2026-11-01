# CloudPlay Game Sources & Licensing

CloudPlay is committed to respecting open-source software licenses, creator attribution, and intellectual property. This document records the original repository, author, license, and integration architecture for every game available on the platform.

---

## Game Registry & Attribution

### 1. CloudPlay: Arena Strike
- **Category**: 3D Multiplayer First-Person Shooter
- **Architecture**: Local 3D module (`src/games/arenaStrike/`) + Node.js Socket.IO server (`backend/multiplayer/`)
- **Game Engine**: Three.js & React Three Fiber (MIT License)
- **Author / Source**: CloudPlay Original
- **License**: CloudPlay Proprietary
- **Description**: Original 3D multiplayer first-person shooter set in a futuristic industrial research facility. Features server-authoritative hit registration, Deathmatch (FFA) and Team Deathmatch modes, procedural weapon synthesis, dynamic recoil, spatial audio, and room matchmaking.

### 2. Trail Rush
- **Category**: 2D Physics Racing / Hill Climb
- **Architecture**: Local module (`src/games/HillClimb.jsx` + `src/games/trailRushPhysics.js`)
- **Author / Source**: CloudPlay Original
- **License**: CloudPlay Proprietary
- **Description**: Custom physics-based driving simulation with independent front/rear wheel suspension, spring/damping dynamics, aerial rotational control, garage vehicle selection, and component upgrades.

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

---

## Original Artwork Policy

All game cover illustrations stored under `frontend/public/game-covers/` were originally authored in vector SVG format specifically for CloudPlay:
- No copyrighted commercial game assets (such as Nintendo Mario, Rockstar GTA, etc.) are utilized.
- No third-party trademarked logos are reproduced without permission.
- Each vector illustration reflects the mood and theme of the respective game.

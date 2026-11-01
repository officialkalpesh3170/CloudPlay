/**
 * CloudPlay Game Catalog v2
 *
 * All games listed here. Local games run as React components.
 * External games are embedded in the sandboxed iframe player.
 *
 * License notes for all games are maintained in GAME_SOURCES.md
 */

export const GAME_CATEGORIES = [
  "All",
  "Racing",
  "Platformer",
  "Arcade",
  "Puzzle",
  "Board",
  "Simulation",
  "Action",
  "Adventure",
  "Strategy",
];

export const games = [
  // ── LOCAL ORIGINAL GAMES ─────────────────────────────────────────────────

  {
    id: "cyber-2048",
    title: "Cyber 2048",
    category: "Puzzle",
    tags: ["puzzle", "strategy", "2048", "open-source", "synth", "casual"],
    mode: "local",
    component: "Cyber2048",
    cover: "/game-covers/cyber-2048.svg",
    description:
      "The legendary open-source puzzle game by Gabriele Cirulli, rebuilt with cyberpunk neon visuals, procedural synth audio, multi-grid modes, and undo.",
    highlight: "Gabriele Cirulli · MIT Licence · Synth Audio",
    rating: 4.9,
    players: "1 player",
    controls: "Arrow keys / WASD / Swipe",
    featured: true,
    new: true,
    trending: true,
    source: "Gabriele Cirulli · MIT Licence",
    repo: "https://github.com/gabrielecirulli/2048",
    licence: "MIT",
  },

  {
    id: "temple-run",
    title: "Temple Run",
    category: "Action",
    tags: ["3D", "runner", "endless", "neon", "cyberpunk", "open-source"],
    mode: "local",
    component: "TempleRun",
    cover: "/game-covers/temple-run.svg",
    description:
      "Fast-paced pseudo-3D neon endless runner. Dash across 3 lanes, jump over obstacles, slide under high beams, turn corners, and grab gold coins with procedural synth audio.",
    highlight: "GameHelix · MIT Licence · 100% Local 3D Runner",
    rating: 4.9,
    players: "1 player",
    controls: "Arrow keys / WASD / Swipe",
    featured: true,
    new: true,
    trending: true,
    source: "GameHelix · MIT Licence",
    repo: "https://github.com/GameHelix/temple_run",
    licence: "MIT",
  },

  {
    id: "hill-climb",
    title: "Hill Climb Racing",
    category: "Racing",
    tags: ["physics", "driving", "hills", "upgrades", "coins", "fuel"],
    mode: "local",
    component: "HillClimb",
    cover: "/game-covers/hill-climb.svg",
    description:
      "The classic physics-based hill climbing racer. Drive Bill Newton up steep hills, collect coins, perform air flips, manage fuel, and upgrade your 4x4 rig.",
    highlight: "Physics driving · Bill Newton · Upgradeable 4x4",
    rating: 4.8,
    players: "1 player",
    controls: "Keyboard / Touch",
    featured: true,
    new: false,
    trending: true,
    source: "CloudPlay Original",
    licence: "Proprietary · CloudPlay",
  },

  {
    id: "asteroid-fury",
    title: "Asteroid Fury",
    category: "Arcade",
    tags: ["space", "shooter", "survival", "phaser"],
    mode: "local",
    component: "AsteroidFury",
    cover: "/game-covers/asteroid-fury.svg",
    description:
      "Pilot your ship through an asteroid belt, blast rocks for points, and survive as long as you can.",
    highlight: "Arcade survival · Phaser engine",
    rating: 4.5,
    players: "1 player",
    controls: "Keyboard / Touch",
    featured: true,
    new: true,
    trending: true,
    source: "CloudPlay Original",
    licence: "Proprietary · CloudPlay",
  },

  {
    id: "block-puzzle",
    title: "Block Drop",
    category: "Puzzle",
    tags: ["tetris-like", "blocks", "casual", "phaser"],
    mode: "local",
    component: "BlockPuzzle",
    cover: "/game-covers/block-puzzle.svg",
    description:
      "Drop and rotate blocks to clear rows. Simple controls, deep strategy — how high can you stack?",
    highlight: "Tetris-inspired · endless",
    rating: 4.4,
    players: "1 player",
    controls: "Keyboard / Touch",
    featured: false,
    new: true,
    trending: false,
    source: "CloudPlay Original",
    licence: "Proprietary · CloudPlay",
  },

  {
    id: "ludo-royale",
    title: "Ludo Royale",
    category: "Board",
    tags: ["board", "multiplayer", "local", "strategy"],
    mode: "local",
    component: "LudoGame",
    cover: "/game-covers/ludo-royale.svg",
    description:
      "A polished pass-and-play Ludo for 2–4 players on one device. Classic strategy, vibrant board.",
    highlight: "Local multiplayer · 2–4 players",
    rating: 4.6,
    players: "2–4 players",
    controls: "Mouse / Touch",
    featured: false,
    new: false,
    trending: false,
    source: "CloudPlay Original",
    licence: "Proprietary · CloudPlay",
  },

  // ── EXTERNAL OPEN-SOURCE GAMES (michelpereira/awesome-open-source-games) ──

  {
    id: "neon-velocity",
    title: "Neon Velocity: Cyber Highway",
    category: "Racing",
    tags: ["3D", "cyberpunk", "racing", "speed", "three.js", "open-source", "webgl"],
    mode: "embed",
    url: "https://bhanu2006-24.github.io/neon-velocity/",
    cover: "/game-covers/neon-velocity.svg",
    description:
      "High-speed 3D futuristic endless highway racer built with Three.js. Weave through cyberpunk highway traffic, collect nitro canisters, activate energy shields, and chain near-miss speed multipliers.",
    highlight: "Bhanu Pratap Saini · Three.js 3D WebGL · Open Source",
    rating: 4.90,
    players: "1 player",
    controls: "Arrow keys / WASD / Mobile Touch / Gyroscope",
    featured: true,
    new: true,
    trending: true,
    source: "bhanu2006-24/neon-velocity · Open Source",
    repo: "https://github.com/bhanu2006-24/neon-velocity",
    licence: "MIT",
  },

  {
    id: "hexgl",
    title: "HexGL",
    category: "Racing",
    tags: ["3D", "racing", "sci-fi", "webgl", "speed", "open-source"],
    mode: "embed",
    url: "https://hexgl.bkcore.com/play/",
    cover: "/game-covers/hexgl.svg",
    description:
      "Iconic futuristic 3D WebGL anti-gravity racing game inspired by Wipeout and F-Zero. Pilot high-speed hovercraft through neon circuits.",
    highlight: "Thibaut Despoulain · MIT Licence · 3D WebGL",
    rating: 4.9,
    players: "1 player",
    controls: "Arrow keys / WASD",
    featured: true,
    new: true,
    trending: true,
    source: "BKcore · MIT Licence",
    repo: "https://github.com/BKcore/HexGL",
    licence: "MIT",
  },

  {
    id: "trigger-rally",
    title: "Trigger Rally 3D",
    category: "Racing",
    tags: ["3D", "rally", "racing", "webgl", "threejs", "physics", "open-source"],
    mode: "embed",
    url: "https://codeartemis.github.io/TriggerRally/server/public/",
    cover: "/game-covers/trigger-rally.svg",
    description:
      "Fast-paced 3D WebGL rally racing through rugged 3D terrain and time-trial checkpoints with real vehicle physics and dynamic engine sounds.",
    highlight: "CodeArtemis · Open Source · 3D WebGL Rally",
    rating: 4.8,
    players: "1 player",
    controls: "Arrow keys / WASD",
    featured: false,
    new: true,
    trending: true,
    source: "CodeArtemis · Open Source",
    repo: "https://github.com/CodeArtemis/TriggerRally",
    licence: "GPL-2.0",
  },

  {
    id: "open-world-3d",
    title: "OpenWorld 3D",
    category: "Adventure",
    tags: ["3D", "open-world", "exploration", "threejs", "ammojs", "adventure", "open-source"],
    mode: "embed",
    url: "https://obecerra3.github.io/OpenWorldJS/",
    cover: "/game-covers/open-world-3d.svg",
    description:
      "Explore an expansive 3D world in this third-person exploration sandbox powered by Three.js and Ammo.js physics. Run, jump, and climb across 3D terrain.",
    highlight: "Three.js + Ammo.js · 3D Open World",
    rating: 4.7,
    players: "1 player",
    controls: "WASD Move / Space Jump / Mouse Look",
    featured: false,
    new: true,
    trending: true,
    source: "obecerra3 · Open Source",
    repo: "https://github.com/obecerra3/OpenWorldJS",
    licence: "MIT",
  },

  {
    id: "clumsy-bird",
    title: "Clumsy Bird",
    category: "Arcade",
    tags: ["arcade", "casual", "flappy", "melonjs", "open-source"],
    mode: "embed",
    url: "https://ellisonleao.github.io/clumsy-bird/",
    cover: "/game-covers/clumsy-bird.svg",
    description:
      "The famous open-source Flappy Bird remake built with MelonJS. Flap between green pipes, beat your high score, and enjoy smooth physics.",
    highlight: "Ellison Leão · MIT Licence · MelonJS",
    rating: 4.7,
    players: "1 player",
    controls: "Space / Mouse Click / Touch",
    featured: false,
    new: true,
    trending: true,
    source: "Ellison Leão · MIT Licence",
    repo: "https://github.com/ellisonleao/clumsy-bird",
    licence: "MIT",
  },

  {
    id: "particle-clicker",
    title: "Particle Clicker",
    category: "Strategy",
    tags: ["clicker", "strategy", "cern", "physics", "science", "open-source"],
    mode: "embed",
    url: "https://particle-clicker.web.cern.ch/",
    cover: "/game-covers/particle-clicker.svg",
    description:
      "Addictive incremental clicker game made by CERN developers. Collide particles, discover the Higgs Boson, and manage research budgets.",
    highlight: "CERN Team · MIT Licence · Incremental",
    rating: 4.8,
    players: "1 player",
    controls: "Mouse Click / Touch",
    featured: true,
    new: true,
    trending: true,
    source: "CERN · MIT Licence",
    repo: "https://github.com/particle-clicker/particle-clicker",
    licence: "MIT",
  },

  {
    id: "sandboxels",
    title: "Sandboxels",
    category: "Simulation",
    tags: ["simulation", "physics", "sandbox", "chemistry", "open-source"],
    mode: "embed",
    url: "https://sandboxels.r74n.com/",
    cover: "/game-covers/sandboxels.svg",
    description:
      "Viral falling-sand chemistry & physics simulation. Over 500 interactive elements: melt metals, cook foods, grow forests, and trigger reactions.",
    highlight: "R74n · Open Source · 500+ Elements",
    rating: 4.9,
    players: "1 player",
    controls: "Mouse / Touch",
    featured: false,
    new: true,
    trending: true,
    source: "R74n · GPL-3.0",
    repo: "https://github.com/R74nCom/sandboxels",
    licence: "GPL-3.0",
  },

  {
    id: "a-dark-room",
    title: "A Dark Room",
    category: "Adventure",
    tags: ["rpg", "adventure", "text", "survival", "minimalist", "open-source"],
    mode: "embed",
    url: "https://adarkroom.doublespeakgames.com/",
    cover: "/game-covers/a-dark-room.svg",
    description:
      "Award-winning minimalist text RPG and atmospheric survival adventure. Stoke the fire, explore the wasteland, and unravel the mystery.",
    highlight: "Doublespeak Games · MPL-2.0 · Award Winner",
    rating: 4.9,
    players: "1 player",
    controls: "Mouse / Keyboard",
    featured: false,
    new: true,
    trending: false,
    source: "Doublespeak Games · MPL-2.0",
    repo: "https://github.com/doublespeakgames/adarkroom",
    licence: "MPL-2.0",
  },

  {
    id: "astray",
    title: "Astray",
    category: "Puzzle",
    tags: ["3D", "maze", "physics", "threejs", "webgl", "open-source"],
    mode: "embed",
    url: "https://wwwtyro.github.io/Astray/",
    cover: "/game-covers/astray.svg",
    description:
      "Moody 3D maze puzzle game built with Three.js and Box2D physics. Guide a glowing marble through procedurally styled labyrinth chambers.",
    highlight: "wwwtyro · MIT Licence · 3D WebGL",
    rating: 4.6,
    players: "1 player",
    controls: "Arrow keys / WASD",
    featured: false,
    new: true,
    trending: false,
    source: "wwwtyro · MIT Licence",
    repo: "https://github.com/wwwtyro/Astray",
    licence: "MIT",
  },

  {
    id: "duck-hunt",
    title: "DuckHunt JS",
    category: "Arcade",
    tags: ["arcade", "retro", "shooting", "classic", "open-source"],
    mode: "embed",
    url: "https://mattsurabian.com/duckhunt/",
    cover: "/game-covers/duck-hunt.svg",
    description:
      "The classic NES Duck Hunt faithfully ported to HTML5 canvas and JavaScript. Aim, shoot the flying ducks, and watch out for the laughing hound!",
    highlight: "Matt Surabian · MIT Licence · Retro NES",
    rating: 4.5,
    players: "1 player",
    controls: "Mouse Aim & Click",
    featured: false,
    new: true,
    trending: false,
    source: "Matt Surabian · MIT Licence",
    repo: "https://github.com/MattSurabian/DuckHunt-JS",
    licence: "MIT",
  },

  {
    id: "skifree",
    title: "SkiFree.js",
    category: "Arcade",
    tags: ["arcade", "retro", "skiing", "winter", "open-source"],
    mode: "embed",
    url: "https://basicallydan.github.io/skifree.js/",
    cover: "/game-covers/skifree.svg",
    description:
      "HTML5 remake of the beloved 90s Windows SkiFree game. Carve down the alpine mountain, jump over snow banks, and outrun the Abominable Snow Monster!",
    highlight: "Dan Hough · MIT Licence · 90s Classic",
    rating: 4.5,
    players: "1 player",
    controls: "Arrow keys / Mouse",
    featured: false,
    new: true,
    trending: false,
    source: "Dan Hough · MIT Licence",
    repo: "https://github.com/basicallydan/skifree.js",
    licence: "MIT",
  },

  // ── EXTERNAL CURATED GAMES ────────────────────────────────────────────────

  {
    id: "super-kart",
    title: "Super Kart 3D",
    category: "Racing",
    tags: ["3D", "kart", "racing", "ai"],
    mode: "embed",
    url: "https://fecolinhares.github.io/super-kart-3djs/",
    cover: "/game-covers/super-kart.svg",
    description:
      "Drift through two vibrant tracks, out-race AI rivals and use a full set of power-ups in this polished 3D kart racer.",
    highlight: "3D graphics · AI racers · power-ups",
    rating: 4.8,
    players: "1 player",
    controls: "Keyboard / Gamepad",
    featured: true,
    new: false,
    trending: true,
    source: "fecolinhares · MIT Licence",
    repo: "https://github.com/fecolinhares/super-kart-3djs",
    licence: "MIT",
  },

  {
    id: "grapple-god",
    title: "Grapple God: The Ascent",
    category: "Platformer",
    tags: ["platformer", "grapple", "boss", "phaser"],
    mode: "embed",
    url: "https://ejrossma.github.io/GrappleGod/",
    cover: "/game-covers/open-world-3d.svg",
    description:
      "Swing through a hand-crafted platforming challenge and face a multi-phase boss with grapple mechanics.",
    highlight: "Grapple movement · boss fight",
    rating: 4.5,
    players: "1 player",
    controls: "Keyboard",
    featured: false,
    new: false,
    trending: false,
    source: "ejrossma · Independent",
    repo: "https://github.com/ejrossma/GrappleGod",
    licence: "See GAME_SOURCES.md",
  },

  {
    id: "drift",
    title: "Drift",
    category: "Racing",
    tags: ["3D", "drift", "racing", "night"],
    mode: "embed",
    url: "https://www.makone.dev/w/drift/",
    cover: "/game-covers/drift.svg",
    description:
      "Hold a controlled slide around a moody night circuit. Pure drift racing atmosphere.",
    highlight: "3D drift racing · night circuit",
    rating: 4.3,
    players: "1 player",
    controls: "Keyboard",
    featured: false,
    new: false,
    trending: false,
    source: "Makone · MIT",
    licence: "MIT",
  },

  {
    id: "snowdrift",
    title: "Snowdrift",
    category: "Simulation",
    tags: ["3D", "snow", "driving", "casual"],
    mode: "embed",
    url: "https://www.makone.dev/w/snowdrift/",
    cover: "/game-covers/snowdrift.svg",
    description:
      "Clear a winter road with a plow truck before the storm closes in. Relaxing yet challenging.",
    highlight: "3D snow driving · unique concept",
    rating: 4.2,
    players: "1 player",
    controls: "Keyboard",
    featured: false,
    new: false,
    trending: false,
    source: "Makone · MIT",
    licence: "MIT",
  },

  {
    id: "swarm",
    title: "Swarm",
    category: "Action",
    tags: ["3D", "aerial", "combat", "survival"],
    mode: "embed",
    url: "https://www.makone.dev/w/swarm/",
    cover: "/game-covers/swarm.svg",
    description:
      "Outmaneuver four hostile machines in a high-altitude aerial fight. React fast or be destroyed.",
    highlight: "3D aerial combat · intense",
    rating: 4.4,
    players: "1 player",
    controls: "Keyboard",
    featured: false,
    new: false,
    trending: true,
    source: "Makone · MIT",
    licence: "MIT",
  },
];

export function getGameById(id) {
  return games.find((g) => g.id === id) ?? null;
}

export function getFeaturedGames() {
  return games.filter((g) => g.featured);
}

export function getTrendingGames() {
  return games.filter((g) => g.trending);
}

export function getNewGames() {
  return games.filter((g) => g.new);
}

export function filterGames({ category = "All", search = "", tags = [] } = {}) {
  return games.filter((g) => {
    if (category !== "All" && g.category !== category) return false;
    if (tags.length > 0 && !tags.some((t) => g.tags.includes(t))) return false;
    if (search) {
      const haystack = `${g.title} ${g.category} ${g.description} ${g.tags.join(" ")}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });
}

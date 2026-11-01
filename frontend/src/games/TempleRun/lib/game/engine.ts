// ─────────────────────────────────────────────────────────────────────────────
// lib/game/engine.ts  –  Mutable game-state + per-frame update logic
// ─────────────────────────────────────────────────────────────────────────────

import {
  INITIAL_SPEED, MAX_SPEED, SPEED_INCREASE, INITIAL_LIVES,
  INVINCIBLE_FRAMES, JUMP_HEIGHT, JUMP_FRAMES, SLIDE_FRAMES,
  STUMBLE_FRAMES, LANE_CHANGE_FRAMES, PLAYER_Z, COIN_VALUE,
  SCORE_PER_FRAME, DIST_SCALE, COIN_CLUSTER_SIZE, COIN_SPACING_Z,
  SPAWN_Z, MIN_GAP, TURN_SPACING, TURN_WARNING_FRAMES,

} from '../constants';
import { pick, randInt } from '../utils';
import type {
  GameState, Player,
  InputState, Difficulty, Lane, ObstacleType,
} from '../../types/game';

// ── Obstacle templates per difficulty ────────────────────────────────────────

/** Lane patterns:  each element is [obstacleType, lane (-1 = all)]  */
type Pattern = Array<[ObstacleType, Lane | -1]>;

const EASY_PATTERNS: Pattern[] = [
  [['WALL', 0]],
  [['WALL', 2]],
  [['LOW_WALL', 1]],
  [['HIGH_BAR', 0]],
  [['HIGH_BAR', 2]],
  [['WALL', 0], ['WALL', 2]],
];

const MEDIUM_PATTERNS: Pattern[] = [
  [['WALL', 0], ['LOW_WALL', 1]],
  [['LOW_WALL', 0], ['WALL', 2]],
  [['HIGH_BAR', 0], ['WALL', 2]],
  [['WALL', 0], ['HIGH_BAR', 1]],
  [['LOW_WALL', 0], ['HIGH_BAR', 2]],
  [['HIGH_BAR', 1], ['WALL', 0]],
  [['WALL', 1]],
  [['LOW_WALL', 0], ['LOW_WALL', 2]],
];

const HARD_PATTERNS: Pattern[] = [
  [['WALL', 0], ['HIGH_BAR', 1], ['WALL', 2]],   // must be in correct lane & slide/jump — tricky intentionally
  [['LOW_WALL', 0], ['WALL', 1], ['LOW_WALL', 2]],
  [['HIGH_BAR', 0], ['HIGH_BAR', 2]],
  [['WALL', 0], ['LOW_WALL', 1]],
  [['LOW_WALL', 0], ['WALL', 1], ['HIGH_BAR', 2]],
  [['WALL', 1], ['HIGH_BAR', 0]],
  [['HIGH_BAR', 0], ['LOW_WALL', 1]],
  [['WALL', 0], ['HIGH_BAR', 1]],
];

const PATTERNS: Record<Difficulty, Pattern[]> = {
  easy: EASY_PATTERNS,
  medium: MEDIUM_PATTERNS,
  hard: HARD_PATTERNS,
};

// ── Factory helpers ───────────────────────────────────────────────────────────

function makePlayer(): Player {
  return {
    lane: 1, targetLane: 1, laneT: 1,
    action: 'running', actionT: 0, actionDuration: 1,
    worldY: 0,
    isInvincible: false, invincibleTimer: 0,
    animFrame: 0, animTimer: 0,
  };
}

export function initGameState(difficulty: Difficulty, highScore: number): GameState {
  const state: GameState = {
    status: 'starting',
    difficulty,
    score: 0,
    distance: 0,
    coins: 0,
    lives: INITIAL_LIVES,
    speed: INITIAL_SPEED,
    cameraZ: 0,
    player: makePlayer(),
    obstacles: [],
    coinItems: [],
    particles: [],
    highScore,
    scoreMultiplier: 1,
    nextObstacleZ: SPAWN_Z * 0.4,
    nextCoinZ: SPAWN_Z * 0.2,
    nextTurnZ: TURN_SPACING[difficulty],
    frameCount: 0,
    turnWarning: null,
    idCounter: 0,
  };
  return state;
}

// ── Main update (called every frame) ─────────────────────────────────────────

export function updateGame(state: GameState, input: InputState): void {
  if (state.status !== 'playing') return;

  state.frameCount++;

  // Speed ramp-up
  state.speed = Math.min(MAX_SPEED, state.speed + SPEED_INCREASE);

  // Advance camera
  state.cameraZ += state.speed;
  state.distance = state.cameraZ * DIST_SCALE;

  // Score (proportional to speed)
  state.score += SCORE_PER_FRAME * (state.speed / INITIAL_SPEED) * state.scoreMultiplier;

  updatePlayer(state, input);
  handleTurnWarning(state, input);
  spawnWorld(state);
  checkCollisions(state);
  updateParticles(state);
  pruneOld(state);
}

// ── Player update ─────────────────────────────────────────────────────────────

function updatePlayer(state: GameState, input: InputState): void {
  const p = state.player;

  // ── Lane transition ──────────────────────────────────────────────────────
  if (p.laneT < 1) {
    p.laneT = Math.min(1, p.laneT + 1 / LANE_CHANGE_FRAMES);
    if (p.laneT >= 1) p.lane = p.targetLane;
  }

  // ── State machine ────────────────────────────────────────────────────────
  if (p.action !== 'running') {
    p.actionT += 1 / p.actionDuration;
    if (p.actionT >= 1) {
      p.actionT = 1;
      p.action = 'running';
      p.worldY = 0;
    } else if (p.action === 'jumping') {
      // Sine arc: up and back down
      p.worldY = JUMP_HEIGHT * Math.sin(p.actionT * Math.PI);
    } else {
      p.worldY = 0; // sliding / stumbling stay on ground
    }
  }

  // ── Input ────────────────────────────────────────────────────────────────
  // Lane changes are allowed even mid-jump/slide
  const canChangeLane = p.laneT >= 1 || p.targetLane !== p.lane;

  if (input.left && p.targetLane > 0) {
    if (canChangeLane) {
      p.targetLane = (p.targetLane - 1) as Lane;
      p.lane = (p.targetLane + 1) as Lane; // start transition from current visual
      p.laneT = 0;
    }
  }
  if (input.right && p.targetLane < 2) {
    if (canChangeLane) {
      p.targetLane = (p.targetLane + 1) as Lane;
      p.lane = (p.targetLane - 1) as Lane;
      p.laneT = 0;
    }
  }
  if (input.up && p.action === 'running') {
    p.action = 'jumping';
    p.actionT = 0;
    p.actionDuration = JUMP_FRAMES;
  }
  if (input.down && p.action === 'running') {
    p.action = 'sliding';
    p.actionT = 0;
    p.actionDuration = SLIDE_FRAMES;
  }

  // ── Invincibility countdown ──────────────────────────────────────────────
  if (p.isInvincible) {
    p.invincibleTimer--;
    if (p.invincibleTimer <= 0) p.isInvincible = false;
  }

  // ── Walk animation ───────────────────────────────────────────────────────
  p.animTimer++;
  const fps = p.action === 'running' ? 6 : 10;
  if (p.animTimer >= fps) {
    p.animTimer = 0;
    p.animFrame = (p.animFrame + 1) % 4;
  }
}

// ── Turn warning logic ────────────────────────────────────────────────────────

function handleTurnWarning(state: GameState, input: InputState): void {
  const tw = state.turnWarning;
  if (!tw) return;

  const depth = tw.worldZ - state.cameraZ;

  // Activate the countdown when the gate enters the visible warning zone
  if (depth < 700 && !tw.completed) {
    tw.timer--;

    const wantedDir = tw.direction;
    const pressed = wantedDir === 'left' ? input.left : input.right;

    if (pressed) {
      // Success – clear warning, award bonus
      tw.completed = true;
      state.score += 200;
      state.scoreMultiplier = Math.min(state.scoreMultiplier + 0.5, 4);
      spawnParticlesBurst(state, 240, 400, 18, '#00ff99');
    } else if (tw.timer <= 0) {
      // Failed to turn in time – stumble
      tw.completed = true;
      state.scoreMultiplier = 1;
    }
  }

  // Remove completed warning
  if (tw.completed && depth < PLAYER_Z) {
    state.turnWarning = null;
  }
}

// ── World spawning ────────────────────────────────────────────────────────────

function spawnWorld(state: GameState): void {
  const frontZ = state.cameraZ + SPAWN_Z;

  // Spawn obstacles
  if (frontZ >= state.nextObstacleZ) {
    spawnObstacleCluster(state, frontZ);
    state.nextObstacleZ = frontZ + MIN_GAP[state.difficulty] + randInt(0, 200);
  }

  // Spawn coins
  if (frontZ >= state.nextCoinZ) {
    spawnCoinCluster(state, frontZ);
    state.nextCoinZ = frontZ + randInt(180, 400);
  }

  // Spawn turn event
  if (frontZ >= state.nextTurnZ) {
    spawnTurn(state, frontZ);
    state.nextTurnZ = frontZ + TURN_SPACING[state.difficulty] + randInt(0, 600);
  }
}

function spawnObstacleCluster(state: GameState, atZ: number): void {
  const patterns = PATTERNS[state.difficulty];
  const chosen = pick(patterns);
  for (const [type, lane] of chosen) {
    state.obstacles.push({
      id: ++state.idCounter,
      type,
      lane,
      worldZ: atZ + randInt(-40, 40),
      passed: false,
    });
  }
}

function spawnCoinCluster(state: GameState, atZ: number): void {
  const lane = randInt(0, 2) as Lane;
  for (let i = 0; i < COIN_CLUSTER_SIZE; i++) {
    state.coinItems.push({
      id: ++state.idCounter,
      lane,
      worldZ: atZ + i * COIN_SPACING_Z,
      collected: false,
    });
  }
}

function spawnTurn(state: GameState, atZ: number): void {
  if (state.turnWarning) return; // only one at a time
  state.turnWarning = {
    direction: Math.random() < 0.5 ? 'left' : 'right',
    timer: TURN_WARNING_FRAMES,
    maxTimer: TURN_WARNING_FRAMES,
    worldZ: atZ,
    completed: false,
  };
}

// ── Collision detection ───────────────────────────────────────────────────────

function checkCollisions(state: GameState): void {
  const p = state.player;
  if (p.isInvincible) return;

  // Current effective lane (interpolated during transition)
  const effectiveLane = p.laneT < 1
    ? (p.laneT < 0.5 ? p.lane : p.targetLane)
    : p.lane;

  const camZ = state.cameraZ;

  // ── Obstacles ────────────────────────────────────────────────────────────
  for (const obs of state.obstacles) {
    if (obs.passed) continue;
    const depth = obs.worldZ - camZ;
    if (depth > PLAYER_Z + 60 || depth < PLAYER_Z - 40) continue; // fair collision window

    // Lane check
    const laneHit = obs.lane === -1 || obs.lane === effectiveLane;
    if (!laneHit) continue;

    // Vertical check
    let hit = false;
    if (obs.type === 'WALL') {
      hit = true; // always blocks
    } else if (obs.type === 'LOW_WALL') {
      hit = !(p.action === 'jumping' && p.worldY > 40); // safe if jumping high enough
    } else if (obs.type === 'HIGH_BAR') {
      hit = p.action !== 'sliding'; // safe if sliding
    }

    if (hit) {
      obs.passed = true;
      hitPlayer(state, 240, 580);
      return; // one hit per frame
    } else {
      // Cleared the obstacle
      if (depth < PLAYER_Z) obs.passed = true;
    }
  }

  // ── Coins ────────────────────────────────────────────────────────────────
  for (const coin of state.coinItems) {
    if (coin.collected) continue;
    const depth = coin.worldZ - camZ;
    if (Math.abs(depth - PLAYER_Z) > 80) continue;
    if (coin.lane !== effectiveLane) continue;

    coin.collected = true;
    state.coins++;
    state.score += COIN_VALUE;
    const cx = laneScreenX(coin.lane);
    spawnParticlesBurst(state, cx, 500, 8, '#ffe600');
  }
}

// ── Hit / life loss ───────────────────────────────────────────────────────────

function hitPlayer(state: GameState, px: number, py: number): void {
  state.lives--;
  spawnParticlesBurst(state, px, py, 16, '#ff3355');

  if (state.lives <= 0) {
    state.status = 'gameover';
    if (state.score > state.highScore) state.highScore = Math.floor(state.score);
    return;
  }

  const p = state.player;
  p.isInvincible = true;
  p.invincibleTimer = INVINCIBLE_FRAMES;
  p.action = 'stumbling';
  p.actionT = 0;
  p.actionDuration = STUMBLE_FRAMES;
  state.scoreMultiplier = 1;
}

// ── Particles ──────────────────────────────────────────────────────────────────

function spawnParticlesBurst(
  state: GameState, cx: number, cy: number, count: number, color: string
): void {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const spd = 2 + Math.random() * 4;
    const life = 20 + Math.floor(Math.random() * 20);
    state.particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 1,
      life, maxLife: life,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function updateParticles(state: GameState): void {
  for (const p of state.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // gravity
    p.life--;
  }
}

function pruneOld(state: GameState): void {
  state.particles  = state.particles.filter(p => p.life > 0);
  state.obstacles  = state.obstacles.filter(o => o.worldZ > state.cameraZ - 200);
  state.coinItems  = state.coinItems.filter(c => c.worldZ > state.cameraZ - 200);
}

// ── Utility ───────────────────────────────────────────────────────────────────

/** Screen-X of a lane's centre at the player depth (PLAYER_Z) */
function laneScreenX(lane: Lane): number {
  // Inline constants to avoid circular deps
  // LANE_WORLD_X = [-72, 0, 72], FOCAL = 444, PLAYER_Z = 200, CENTER_X = 240
  const lx = [-72, 0, 72] as const;
  return 240 + lx[lane] * 444 / 200;
}

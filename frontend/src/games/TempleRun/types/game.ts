// ─────────────────────────────────────────────────────────────────────────────
// types/game.ts  –  All shared TypeScript interfaces for the Temple Run game
// ─────────────────────────────────────────────────────────────────────────────

export type GameStatus = 'menu' | 'starting' | 'playing' | 'paused' | 'gameover';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type PlayerAction = 'running' | 'jumping' | 'sliding' | 'stumbling';
export type Lane = 0 | 1 | 2;
export type ObstacleType = 'WALL' | 'LOW_WALL' | 'HIGH_BAR' | 'TURN_LEFT' | 'TURN_RIGHT';

// ── Player ────────────────────────────────────────────────────────────────────
export interface Player {
  lane: Lane;           // current (from) lane
  targetLane: Lane;     // destination lane
  laneT: number;        // 0→1  progress of lane change
  action: PlayerAction;
  actionT: number;      // 0→1  progress through current action
  actionDuration: number; // total frames for current action
  worldY: number;       // height above ground (world units); 0 = on ground
  isInvincible: boolean;
  invincibleTimer: number;
  animFrame: number;    // 0-3 running leg animation
  animTimer: number;
}

// ── Obstacles ─────────────────────────────────────────────────────────────────
export interface Obstacle {
  id: number;
  type: ObstacleType;
  lane: Lane | -1;   // -1 means all lanes (turn wall or full barrier)
  worldZ: number;    // absolute world-Z position
  passed: boolean;   // already behind the player
}

// ── Collectibles ──────────────────────────────────────────────────────────────
export interface CoinItem {
  id: number;
  lane: Lane;
  worldZ: number;
  collected: boolean;
}

// ── VFX ───────────────────────────────────────────────────────────────────────
export interface Particle {
  x: number;   // screen coordinates
  y: number;
  vx: number;
  vy: number;
  life: number;     // frames remaining
  maxLife: number;
  color: string;
  size: number;
}

// ── Turn warning ──────────────────────────────────────────────────────────────
export interface TurnWarning {
  direction: 'left' | 'right';
  timer: number;    // frames remaining to react
  maxTimer: number;
  worldZ: number;   // absolute Z of the turn gate
  completed: boolean;
}

// ── Full game state ───────────────────────────────────────────────────────────
export interface GameState {
  status: GameStatus;
  difficulty: Difficulty;
  score: number;
  distance: number;   // meters
  coins: number;
  lives: number;
  speed: number;      // world-Z units per frame
  cameraZ: number;    // how far we have traveled
  player: Player;
  obstacles: Obstacle[];
  coinItems: CoinItem[];
  particles: Particle[];
  highScore: number;
  scoreMultiplier: number;
  nextObstacleZ: number;  // world-Z at which to spawn next obstacle cluster
  nextCoinZ: number;
  nextTurnZ: number;
  frameCount: number;
  turnWarning: TurnWarning | null;
  idCounter: number;
}

// ── Input (one frame snapshot) ────────────────────────────────────────────────
export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  pause: boolean;
}

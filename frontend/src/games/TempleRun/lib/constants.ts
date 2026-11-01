// ─────────────────────────────────────────────────────────────────────────────
// lib/constants.ts  –  All tunable game constants in one place
// ─────────────────────────────────────────────────────────────────────────────

// ── Canvas logical resolution ──────────────────────────────────────────────
export const CANVAS_W = 480;
export const CANVAS_H = 800;

// ── 3-D Perspective projection ─────────────────────────────────────────────
//
//  Screen-Y formula for a world point at depth relZ above ground (worldY):
//    screenY = HORIZON_Y + (CAMERA_HEIGHT - worldY) * FOCAL / relZ
//
//  Derived constants so that the ground appears at PLAYER_SCREEN_Y
//  when an object is exactly PLAYER_Z world-units in front of camera:
//    CAMERA_HEIGHT * FOCAL / PLAYER_Z  =  PLAYER_SCREEN_Y - HORIZON_Y
//    200 × 444 / 200  =  444   →  256 + 444 = 700 ✓
//
export const HORIZON_Y = 256;         // screen-Y of the vanishing point
export const CENTER_X = 240;         // screen-X centre
export const FOCAL = 444;            // focal length  (world units)
export const CAMERA_HEIGHT = 200;    // camera height above the ground plane

export const PLAYER_Z = 200;         // depth at which collision is checked
export const PLAYER_SCREEN_Y = 700;  // screen-Y of the player's feet

// ── Lane layout ────────────────────────────────────────────────────────────
//  At depth PLAYER_Z the three lane centres project to screen-X:
//    240 ± 72 × 444/200  =  240 ± 160  →  [80, 240, 400]
export const LANE_WORLD_X: readonly [number, number, number] = [-72, 0, 72];
export const TRACK_HALF_W = 160;     // world-X of track outer edges

// ── Render depths ──────────────────────────────────────────────────────────
export const FAR_Z   = 2200;          // far-clip (render nothing beyond this)
export const NEAR_Z  = 80;            // near-clip (stop drawing below this)
export const SPAWN_Z = 2000;          // how far ahead new obstacles are placed

// ── Gameplay ────────────────────────────────────────────────────────────────
export const INITIAL_SPEED   = 8;      // world-Z units per frame  @ 60 fps
export const MAX_SPEED        = 30;
export const SPEED_INCREASE   = 0.0025; // added to speed every frame
export const INITIAL_LIVES    = 3;
export const INVINCIBLE_FRAMES = 120;   // after a hit

// ── Player physics (world-unit heights) ────────────────────────────────────
export const PLAYER_WORLD_HEIGHT = 160; // standing height
export const JUMP_HEIGHT         = 130; // peak height during jump
export const JUMP_FRAMES         = 34;
export const SLIDE_HEIGHT        = 60;  // effective hitbox height while sliding
export const SLIDE_FRAMES        = 30;
export const STUMBLE_FRAMES      = 40;
export const LANE_CHANGE_FRAMES  = 12;

// ── Obstacle world heights ──────────────────────────────────────────────────
export const WALL_HEIGHT       = 220;   // full wall – must change lane
export const LOW_WALL_HEIGHT   = 95;    // jump over  (< JUMP_HEIGHT)
export const HIGH_BAR_BOTTOM   = 95;    // slide under (> SLIDE_HEIGHT, < PLAYER_WORLD_HEIGHT)
export const HIGH_BAR_THICKNESS = 40;

// Minimum Z-gap between consecutive obstacle clusters per difficulty
export const MIN_GAP: Record<string, number> = {
  easy:   600,
  medium: 400,
  hard:   260,
};

// ── Turn events ────────────────────────────────────────────────────────────
export const TURN_WARNING_FRAMES = 90;
export const TURN_SPACING: Record<string, number> = {
  easy:   3500,
  medium: 2400,
  hard:   1600,
};

// ── Coins ─────────────────────────────────────────────────────────────────
export const COIN_VALUE         = 50;
export const COIN_CLUSTER_SIZE  = 6;
export const COIN_SPACING_Z     = 90;   // Z gap between coins in a cluster

// ── Scoring ────────────────────────────────────────────────────────────────
export const SCORE_PER_FRAME = 0.12;    // base score per frame at full speed
export const DIST_SCALE      = 0.008;   // cameraZ → displayed metres

// ── Visual theme colours ────────────────────────────────────────────────────
export const C = {
  // Background / sky
  skyTop:        '#060014',
  skyMid:        '#0d0030',
  skyBottom:     '#18005c',
  horizon:       '#3300ff',
  // Track
  trackDark:     '#120030',
  trackLight:    '#1c0048',
  laneDiv:       '#6600ff',
  laneDivBright: '#aa44ff',
  trackEdge:     '#cc00ff',
  trackEdgeGlow: 'rgba(180,0,255,0.6)',
  // Side tunnel walls
  tunnelLeft:    '#220055',
  tunnelRight:   '#220055',
  // Player
  playerBody:    '#00e5ff',
  playerAccent:  '#0066ff',
  playerGlow:    '#00e5ff',
  // Obstacles
  wallFill:      '#ff1a4a',
  wallGlow:      '#ff0033',
  lowWallFill:   '#ff6600',
  lowWallGlow:   '#ff4400',
  highBarFill:   '#ffaa00',
  highBarGlow:   '#ff7700',
  // Turn
  turnArrow:     '#00ff99',
  turnGlow:      '#00ff66',
  // Coins
  coin:          '#ffe600',
  coinGlow:      '#ffaa00',
  // HUD
  hudText:       '#ffffff',
  hudGlow:       '#00e5ff',
  hudDim:        'rgba(255,255,255,0.55)',
  // Particles
  hitSpark:      '#ff3355',
  coinSpark:     '#ffe600',
  speedLine:     'rgba(0,200,255,0.25)',
} as const;

/**
 * Block Drop (Tetris-inspired) — CloudPlay Original
 * Built with Phaser 3 (MIT licence)
 *
 * Features:
 * - 7 standard tetrominoes
 * - Ghost piece (shows where piece will land)
 * - Line clear effects
 * - Progressive speed scaling
 * - Hold piece
 * - Next piece preview
 * - Touch swipe controls
 * - Score / level / lines display
 *
 * All graphics procedural — no external assets.
 * LICENCE: Proprietary · CloudPlay
 */

import Phaser from "phaser";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLS = 10;
const ROWS = 20;
const CELL = 30;  // px per cell (scales with screen)
const BOARD_X = 40;
const BOARD_Y = 20;

const COLORS = {
  bg:      0x060810,
  board:   0x0d1020,
  grid:    0x1a2040,
  I: 0x00e5ff,
  O: 0xffdd00,
  T: 0xbb44ff,
  S: 0x44ee88,
  Z: 0xff4444,
  J: 0x4488ff,
  L: 0xff8844,
  ghost: 0x3344aa,
  ui: 0xc0b0ff,
};

const PIECES = {
  I: { cells: [[0,1],[1,1],[2,1],[3,1]], color: COLORS.I },
  O: { cells: [[0,0],[1,0],[0,1],[1,1]], color: COLORS.O },
  T: { cells: [[0,1],[1,1],[2,1],[1,0]], color: COLORS.T },
  S: { cells: [[1,0],[2,0],[0,1],[1,1]], color: COLORS.S },
  Z: { cells: [[0,0],[1,0],[1,1],[2,1]], color: COLORS.Z },
  J: { cells: [[0,0],[0,1],[1,1],[2,1]], color: COLORS.J },
  L: { cells: [[2,0],[0,1],[1,1],[2,1]], color: COLORS.L },
};
const PIECE_KEYS = Object.keys(PIECES);

const GRAVITY_BASE = 800; // ms per row at level 1

function gravityMs(level) {
  return Math.max(80, GRAVITY_BASE - (level - 1) * 65);
}

// ─── Rotation ─────────────────────────────────────────────────────────────────

function rotateCells(cells) {
  // SRS-style rotation: transpose + reverse columns
  const maxX = Math.max(...cells.map((c) => c[0]));
  return cells.map(([x, y]) => [y, maxX - x]);
}

// ─── Scene ────────────────────────────────────────────────────────────────────

class BlockScene extends Phaser.Scene {
  constructor() { super("BlockScene"); }

  create() {
    // ── State ──
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.gravityTimer = 0;
    this.gravityInterval = gravityMs(1);
    this.holdPiece = null;
    this.holdUsed = false;
    this.bag = [];
    this.nextPieces = [this.drawPiece(), this.drawPiece(), this.drawPiece()];
    this.currentPiece = this.spawnPiece();
    this.clearAnim = null;

    // ── Graphics ──
    this.boardGfx = this.add.graphics();
    this.pieceGfx = this.add.graphics();

    // ── UI text ──
    const tx = BOARD_X + COLS * CELL + 24;
    const textStyle = { fontSize: "13px", color: "#c0b0ff", fontStyle: "bold" };
    const valStyle = { fontSize: "22px", color: "#ffffff", fontStyle: "bold" };
    const labelStyle = { fontSize: "11px", color: "#6677aa" };

    this.add.text(tx, BOARD_Y + 10, "SCORE", textStyle);
    this.scoreText = this.add.text(tx, BOARD_Y + 28, "0", valStyle);

    this.add.text(tx, BOARD_Y + 70, "LEVEL", textStyle);
    this.levelText = this.add.text(tx, BOARD_Y + 88, "1", valStyle);

    this.add.text(tx, BOARD_Y + 130, "LINES", textStyle);
    this.linesText = this.add.text(tx, BOARD_Y + 148, "0", valStyle);

    this.add.text(tx, BOARD_Y + 200, "NEXT", textStyle);
    this.nextGfx = this.add.graphics();

    this.add.text(tx, BOARD_Y + 360, "HOLD", textStyle);
    this.holdGfx = this.add.graphics();

    // ── Controls ──
    this.keys = this.input.keyboard.addKeys({
      left:   Phaser.Input.Keyboard.KeyCodes.LEFT,
      right:  Phaser.Input.Keyboard.KeyCodes.RIGHT,
      down:   Phaser.Input.Keyboard.KeyCodes.DOWN,
      up:     Phaser.Input.Keyboard.KeyCodes.UP,
      space:  Phaser.Input.Keyboard.KeyCodes.SPACE,
      hold:   Phaser.Input.Keyboard.KeyCodes.C,
      leftA:  Phaser.Input.Keyboard.KeyCodes.A,
      rightD: Phaser.Input.Keyboard.KeyCodes.D,
      downS:  Phaser.Input.Keyboard.KeyCodes.S,
      rotate: Phaser.Input.Keyboard.KeyCodes.Z,
    });

    this.repeatLeft  = 0; this.repeatRight = 0; this.repeatDown = 0;
    this.DAS = 160; this.ARR = 50;

    // ── Touch / swipe ──
    this.input.on("pointerdown", (p) => { this.touchStart = { x: p.x, y: p.y }; });
    this.input.on("pointerup", (p) => {
      if (!this.touchStart) return;
      const dx = p.x - this.touchStart.x;
      const dy = p.y - this.touchStart.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 20) this.tryMove(Math.sign(dx), 0);
      } else {
        if (dy > 30) this.softDrop();
        else if (dy < -30) this.hardDrop();
        else this.tryRotate();
      }
      this.touchStart = null;
    });

    // ── High score ──
    this.highScore = parseInt(localStorage.getItem("cloudplay.blockDrop.hs") || "0", 10);
    this.add.text(tx, BOARD_Y + 430, `BEST: ${this.highScore}`, labelStyle);

    // ── Instructions ──
    const iStyle = { fontSize: "10px", color: "#445566" };
    this.add.text(BOARD_X, BOARD_Y + ROWS * CELL + 8, "← → Move  ↑/Z Rotate  ↓ Soft  Space Hard  C Hold", iStyle);
  }

  // ── Bag / piece draw ──────────────────────────────────────────────────────

  drawPiece() {
    if (this.bag.length === 0) {
      this.bag = [...PIECE_KEYS].sort(() => Math.random() - 0.5);
    }
    return this.bag.pop();
  }

  spawnPiece() {
    const key = this.nextPieces.shift();
    this.nextPieces.push(this.drawPiece());
    const p = PIECES[key];
    return {
      key,
      cells: p.cells.map((c) => [...c]),
      color: p.color,
      x: 3,
      y: 0,
    };
  }

  // ── Movement ─────────────────────────────────────────────────────────────

  tryMove(dx, dy) {
    const p = this.currentPiece;
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (this.collides(p.cells, nx, ny)) return false;
    p.x = nx; p.y = ny;
    return true;
  }

  tryRotate() {
    const p = this.currentPiece;
    const rotated = rotateCells(p.cells);
    // Basic wall kick
    for (const [ox, oy] of [[0,0],[1,0],[-1,0],[2,0],[-2,0],[0,-1]]) {
      if (!this.collides(rotated, p.x + ox, p.y + oy)) {
        p.cells = rotated;
        p.x += ox; p.y += oy;
        return;
      }
    }
  }

  softDrop() { this.tryMove(0, 1); }

  hardDrop() {
    const ghost = this.getGhostY();
    this.score += (ghost - this.currentPiece.y) * 2;
    this.currentPiece.y = ghost;
    this.lockPiece();
  }

  holdCurrentPiece() {
    if (this.holdUsed) return;
    this.holdUsed = true;
    const key = this.currentPiece.key;
    if (this.holdPiece) {
      const p = PIECES[this.holdPiece];
      this.currentPiece = { key: this.holdPiece, cells: p.cells.map((c) => [...c]), color: p.color, x: 3, y: 0 };
    } else {
      this.currentPiece = this.spawnPiece();
    }
    this.holdPiece = key;
  }

  // ── Collision & locking ───────────────────────────────────────────────────

  collides(cells, ox, oy) {
    for (const [cx, cy] of cells) {
      const bx = ox + cx, by = oy + cy;
      if (bx < 0 || bx >= COLS || by >= ROWS) return true;
      if (by >= 0 && this.board[by][bx]) return true;
    }
    return false;
  }

  getGhostY() {
    let gy = this.currentPiece.y;
    while (!this.collides(this.currentPiece.cells, this.currentPiece.x, gy + 1)) gy++;
    return gy;
  }

  lockPiece() {
    const p = this.currentPiece;
    for (const [cx, cy] of p.cells) {
      const bx = p.x + cx, by = p.y + cy;
      if (by < 0) { this.triggerGameOver(); return; }
      this.board[by][bx] = p.color;
    }
    this.clearLines();
    this.holdUsed = false;
    this.currentPiece = this.spawnPiece();
    if (this.collides(this.currentPiece.cells, this.currentPiece.x, this.currentPiece.y)) {
      this.triggerGameOver();
    }
  }

  clearLines() {
    const full = [];
    for (let r = 0; r < ROWS; r++) {
      if (this.board[r].every((c) => c !== null)) full.push(r);
    }
    if (full.length === 0) return;

    const points = [0, 100, 300, 500, 800];
    this.score += (points[full.length] || 800) * this.level;
    this.lines += full.length;
    this.level = Math.floor(this.lines / 10) + 1;
    this.gravityInterval = gravityMs(this.level);

    for (const r of full) {
      this.board.splice(r, 1);
      this.board.unshift(Array(COLS).fill(null));
    }
    this.updateUI();
  }

  triggerGameOver() {
    this.gameOver = true;
    const hs = Math.max(this.highScore, this.score);
    localStorage.setItem("cloudplay.blockDrop.hs", String(hs));
    this.scene.start("BlockGameOver", { score: this.score, level: this.level, lines: this.lines, highScore: hs });
  }

  updateUI() {
    this.scoreText.setText(this.score.toLocaleString());
    this.levelText.setText(String(this.level));
    this.linesText.setText(String(this.lines));
  }

  // ── Draw helpers ──────────────────────────────────────────────────────────

  drawCell(gfx, bx, by, color, alpha = 1) {
    const x = BOARD_X + bx * CELL;
    const y = BOARD_Y + by * CELL;
    gfx.fillStyle(color, alpha);
    gfx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
    gfx.fillStyle(0xffffff, 0.12 * alpha);
    gfx.fillRect(x + 1, y + 1, CELL - 2, 4);
    gfx.fillStyle(0x000000, 0.18 * alpha);
    gfx.fillRect(x + 1, y + CELL - 5, CELL - 2, 4);
  }

  drawMiniPiece(gfx, key, ox, oy) {
    const p = PIECES[key];
    const s = 12;
    gfx.fillStyle(p.color, 0.9);
    for (const [cx, cy] of p.cells) {
      gfx.fillRect(ox + cx * s, oy + cy * s, s - 1, s - 1);
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(time, delta) {
    if (this.gameOver) return;

    // ── Auto-repeat ──
    const left  = this.keys.left.isDown  || this.keys.leftA.isDown;
    const right = this.keys.right.isDown || this.keys.rightD.isDown;
    const down  = this.keys.down.isDown  || this.keys.downS.isDown;

    if (left) {
      if (this.repeatLeft === 0 || (this.repeatLeft > this.DAS && (time - this._leftTime) > this.ARR)) {
        this.tryMove(-1, 0);
        this._leftTime = time;
        this.repeatLeft++;
      } else { this.repeatLeft++; }
    } else { this.repeatLeft = 0; }

    if (right) {
      if (this.repeatRight === 0 || (this.repeatRight > this.DAS && (time - this._rightTime) > this.ARR)) {
        this.tryMove(1, 0);
        this._rightTime = time;
        this.repeatRight++;
      } else { this.repeatRight++; }
    } else { this.repeatRight = 0; }

    if (Phaser.Input.Keyboard.JustDown(this.keys.up) || Phaser.Input.Keyboard.JustDown(this.keys.rotate)) this.tryRotate();
    if (Phaser.Input.Keyboard.JustDown(this.keys.space)) this.hardDrop();
    if (Phaser.Input.Keyboard.JustDown(this.keys.hold)) this.holdCurrentPiece();

    if (down) {
      this.gravityTimer += delta * 4;
    } else {
      this.gravityTimer += delta;
    }

    if (this.gravityTimer >= this.gravityInterval) {
      this.gravityTimer = 0;
      if (!this.tryMove(0, 1)) this.lockPiece();
    }

    // ── Render ──
    const g = this.boardGfx;
    g.clear();

    // Board background
    g.fillStyle(COLORS.board, 1);
    g.fillRect(BOARD_X - 2, BOARD_Y - 2, COLS * CELL + 4, ROWS * CELL + 4);
    g.lineStyle(1, COLORS.grid, 0.3);

    // Grid lines
    for (let r = 0; r <= ROWS; r++) {
      g.strokeLineShape({ x1: BOARD_X, y1: BOARD_Y + r * CELL, x2: BOARD_X + COLS * CELL, y2: BOARD_Y + r * CELL });
    }
    for (let c = 0; c <= COLS; c++) {
      g.strokeLineShape({ x1: BOARD_X + c * CELL, y1: BOARD_Y, x2: BOARD_X + c * CELL, y2: BOARD_Y + ROWS * CELL });
    }

    // Board cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.board[r][c]) this.drawCell(g, c, r, this.board[r][c]);
      }
    }

    // Ghost piece
    const gy = this.getGhostY();
    const p = this.currentPiece;
    for (const [cx, cy] of p.cells) {
      if (gy + cy >= 0) this.drawCell(g, p.x + cx, gy + cy, COLORS.ghost, 0.35);
    }

    // Current piece
    const pg = this.pieceGfx;
    pg.clear();
    for (const [cx, cy] of p.cells) {
      if (p.y + cy >= 0) this.drawCell(pg, p.x + cx, p.y + cy, p.color);
    }

    // Next pieces panel
    this.nextGfx.clear();
    const tx = BOARD_X + COLS * CELL + 24;
    for (let i = 0; i < this.nextPieces.length; i++) {
      this.drawMiniPiece(this.nextGfx, this.nextPieces[i], tx, BOARD_Y + 218 + i * 50);
    }

    // Hold panel
    this.holdGfx.clear();
    if (this.holdPiece) {
      this.drawMiniPiece(this.holdGfx, this.holdPiece, tx, BOARD_Y + 378);
    }
  }
}

// ─── Game Over Scene ─────────────────────────────────────────────────────────

class BlockGameOverScene extends Phaser.Scene {
  constructor() { super("BlockGameOver"); }
  init(data) { this.data2 = data; }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const { score, level, lines, highScore } = this.data2;

    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.75);

    this.add.text(W/2, H*0.28, "GAME OVER", { fontSize: "40px", color: "#ff4466", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(W/2, H*0.42, `Score: ${score.toLocaleString()}`, { fontSize: "22px", color: "#c0b0ff" }).setOrigin(0.5);
    this.add.text(W/2, H*0.50, `Level: ${level}   Lines: ${lines}`, { fontSize: "16px", color: "#8880cc" }).setOrigin(0.5);
    this.add.text(W/2, H*0.58, `Best: ${highScore.toLocaleString()}`, { fontSize: "14px", color: "#6688aa" }).setOrigin(0.5);

    const btn = this.add.text(W/2, H*0.72, "[ PLAY AGAIN ]", {
      fontSize: "20px", color: "#7b68ee", fontStyle: "bold"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setColor("#9b88ff"));
    btn.on("pointerout", () => btn.setColor("#7b68ee"));
    btn.on("pointerdown", () => this.scene.start("BlockScene"));
  }
}

// ─── Export config ────────────────────────────────────────────────────────────

export function createBlockPuzzleConfig(parent) {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: COLORS.bg,
    scene: [BlockScene, BlockGameOverScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 480,
      height: 660,
    },
  };
}

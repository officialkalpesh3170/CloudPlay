/**
 * Asteroid Fury — CloudPlay Original
 * Built with Phaser 3 (MIT licence)
 *
 * A polished arcade space shooter with:
 * - Procedurally spawning asteroids (small/medium/large)
 * - Particle explosion effects using Phaser Graphics
 * - Shield mechanic with cooldown
 * - Progressive difficulty scaling
 * - Touch controls for mobile
 * - High score persistence via localStorage
 *
 * All graphics drawn procedurally — no external assets required.
 * LICENCE: Proprietary · CloudPlay
 */

import Phaser from "phaser";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  bg:          0x05060f,
  shipBody:    0x7b68ee,
  shipGlow:    0x9b88ff,
  thruster:    0xff7040,
  bulletColor: 0x00e5ff,
  asteroidLg:  0x8b7355,
  asteroidMd:  0x9a8060,
  asteroidSm:  0xb09070,
  starDim:     0x4466aa,
  starBright:  0x88aaff,
  shieldColor: 0x40e0ff,
  uiBg:        0x0d1020,
  uiText:      0xffffff,
  scoreColor:  0xc0b0ff,
  healthFull:  0x44dd88,
  healthLow:   0xff4466,
};

const SHIP = {
  maxSpeed:      380,
  acceleration:  640,
  drag:          0.94,
  rotationSpeed: 200,
  fireRate:      180,   // ms between shots
  bulletSpeed:   560,
  bulletLife:    1400,
  shieldDuration: 3000,
  shieldCooldown: 8000,
};

const ASTEROID_SIZES = {
  large:  { r: 38, mass: 3, speed: [30, 75],  score: 20,  splits: 2 },
  medium: { r: 22, mass: 2, speed: [60, 120], score: 50,  splits: 2 },
  small:  { r: 11, mass: 1, speed: [100, 200],score: 100, splits: 0 },
};

// ─── Boot Scene ──────────────────────────────────────────────────────────────

class BootScene extends Phaser.Scene {
  constructor() { super("Boot"); }

  create() {
    this.scene.start("Game");
  }
}

// ─── Main Game Scene ─────────────────────────────────────────────────────────

class GameScene extends Phaser.Scene {
  constructor() { super("Game"); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── State ──
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.shieldCooldownTimer = 0;
    this.lastFire = 0;
    this.invincibleTimer = 0;
    this.gameOver = false;
    this.asteroidCount = 0;

    // ── Stars background ──
    this.stars = this.add.graphics();
    this.starData = Array.from({ length: 160 }, () => ({
      x: Phaser.Math.Between(0, W),
      y: Phaser.Math.Between(0, H),
      r: Math.random() < 0.15 ? 1.5 : 0.8,
      bright: Math.random() < 0.2,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    // ── Groups ──
    this.bullets = this.add.group();
    this.asteroids = this.add.group();
    this.particles = this.add.group();

    // ── Ship ──
    this.ship = {
      x: W / 2, y: H / 2,
      vx: 0, vy: 0,
      angle: -Math.PI / 2,
      alive: true,
      thrusterOn: false,
    };
    this.shipGfx = this.add.graphics();

    // ── Shield visual ──
    this.shieldGfx = this.add.graphics();

    // ── Controls ──
    this.keys = this.input.keyboard.addKeys({
      left:   Phaser.Input.Keyboard.KeyCodes.LEFT,
      right:  Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:     Phaser.Input.Keyboard.KeyCodes.UP,
      fire:   Phaser.Input.Keyboard.KeyCodes.SPACE,
      shieldKey: Phaser.Input.Keyboard.KeyCodes.S,
      leftA:  Phaser.Input.Keyboard.KeyCodes.A,
      rightD: Phaser.Input.Keyboard.KeyCodes.D,
      upW:    Phaser.Input.Keyboard.KeyCodes.W,
    });

    // ── Touch controls ──
    this.touch = { left: false, right: false, thrust: false, fire: false, shield: false };
    this.createTouchControls();

    // ── HUD ──
    this.createHUD();

    // ── Spawn initial wave ──
    this.spawnWave(this.level);

    // ── High score ──
    this.highScore = parseInt(localStorage.getItem("cloudplay.asteroidFury.hs") || "0", 10);
  }

  // ── Touch control overlay ──────────────────────────────────────────────────

  createTouchControls() {
    // Enable multi-touch on mobile devices (steering + firing at the same time)
    if (this.input && this.input.addPointer) {
      this.input.addPointer(2);
    }

    const W = this.scale.width;
    const H = this.scale.height;
    const btnR = 36;
    const alpha = 0.38;

    const makeTouchBtn = (x, y, label, key) => {
      const gfx = this.add.graphics().setDepth(100);
      const drawBtn = (active) => {
        gfx.clear();
        gfx.fillStyle(active ? 0x00e5ff : 0xffffff, active ? 0.65 : alpha);
        gfx.fillCircle(x, y, btnR);
        gfx.lineStyle(2, active ? 0x00e5ff : 0xffffff, active ? 0.9 : 0.5);
        gfx.strokeCircle(x, y, btnR);
      };
      drawBtn(false);

      this.add.text(x, y, label, {
        fontSize: "16px", color: "#fff", fontStyle: "bold"
      }).setOrigin(0.5).setDepth(101);

      const zone = this.add.zone(x, y, btnR * 2.2, btnR * 2.2).setInteractive();
      zone.on("pointerdown", () => {
        this.touch[key] = true;
        drawBtn(true);
      });
      zone.on("pointerup", () => {
        this.touch[key] = false;
        drawBtn(false);
      });
      zone.on("pointerout", () => {
        this.touch[key] = false;
        drawBtn(false);
      });
    };

    const pad = 52;
    makeTouchBtn(pad, H - pad - 20, "◄", "left");
    makeTouchBtn(pad + 82, H - pad - 20, "►", "right");
    makeTouchBtn(pad + 41, H - pad - 84, "▲", "thrust");

    makeTouchBtn(W - pad - 82, H - pad - 20, "🔥", "fire");
    makeTouchBtn(W - pad, H - pad - 84, "🛡", "shield");
  }

  // ── HUD ───────────────────────────────────────────────────────────────────

  createHUD() {
    const W = this.scale.width;
    const style = { fontSize: "15px", color: "#c0b0ff", fontStyle: "bold" };
    const smallStyle = { fontSize: "12px", color: "#8880cc" };

    this.hudScore = this.add.text(16, 14, "SCORE  0", style).setDepth(50);
    this.hudLevel = this.add.text(W / 2, 14, "LEVEL 1", style).setOrigin(0.5, 0).setDepth(50);
    this.hudHiScore = this.add.text(W - 16, 14, "BEST  0", smallStyle).setOrigin(1, 0).setDepth(50);

    // Lives (ship icons)
    this.hudLives = [];
    for (let i = 0; i < 3; i++) {
      const g = this.add.graphics().setDepth(50);
      this.hudLives.push(g);
    }

    // Shield bar
    this.hudShieldBg = this.add.graphics().setDepth(50);
    this.hudShieldFill = this.add.graphics().setDepth(50);
    this.hudShieldLabel = this.add.text(16, this.scale.height - 30, "SHIELD", { fontSize: "10px", color: "#40e0ff" }).setDepth(50);

    this.updateHUD();
  }

  updateHUD() {
    const H = this.scale.height;

    this.hudScore.setText(`SCORE  ${this.score.toLocaleString()}`);
    this.hudLevel.setText(`LEVEL ${this.level}`);
    const hs = Math.max(this.highScore, this.score);
    this.hudHiScore.setText(`BEST  ${hs.toLocaleString()}`);

    // Lives
    for (let i = 0; i < 3; i++) {
      const g = this.hudLives[i];
      g.clear();
      const x = 16 + i * 26;
      const y = 44;
      if (i < this.lives) {
        g.fillStyle(COLORS.shipGlow, 0.9);
        g.fillTriangle(x + 8, y, x, y + 14, x + 16, y + 14);
      } else {
        g.fillStyle(0x333355, 0.5);
        g.fillTriangle(x + 8, y, x, y + 14, x + 16, y + 14);
      }
    }

    // Shield bar
    this.hudShieldBg.clear();
    this.hudShieldFill.clear();
    const barW = 100, barH = 6;
    const bx = 16, by = H - 18;
    this.hudShieldBg.fillStyle(0x222244, 0.7);
    this.hudShieldBg.fillRect(bx, by, barW, barH);

    let fillRatio = 1;
    if (this.shieldActive) {
      fillRatio = this.shieldTimer / SHIP.shieldDuration;
      this.hudShieldFill.fillStyle(COLORS.shieldColor, 0.9);
    } else if (this.shieldCooldownTimer > 0) {
      fillRatio = 1 - (this.shieldCooldownTimer / SHIP.shieldCooldown);
      this.hudShieldFill.fillStyle(0x4455aa, 0.7);
    } else {
      this.hudShieldFill.fillStyle(COLORS.shieldColor, 0.9);
    }
    this.hudShieldFill.fillRect(bx, by, barW * fillRatio, barH);
  }

  // ── Spawning ──────────────────────────────────────────────────────────────

  spawnWave(level) {
    const count = 3 + Math.floor(level * 1.2);
    const W = this.scale.width;
    const H = this.scale.height;

    for (let i = 0; i < count; i++) {
      // Spawn on edges
      let x, y;
      const edge = Phaser.Math.Between(0, 3);
      if (edge === 0) { x = Phaser.Math.Between(0, W); y = -60; }
      else if (edge === 1) { x = W + 60; y = Phaser.Math.Between(0, H); }
      else if (edge === 2) { x = Phaser.Math.Between(0, W); y = H + 60; }
      else { x = -60; y = Phaser.Math.Between(0, H); }

      this.spawnAsteroid("large", x, y);
    }
  }

  spawnAsteroid(size, x, y, inheritVx = null, inheritVy = null) {
    const cfg = ASTEROID_SIZES[size];
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = Phaser.Math.FloatBetween(cfg.speed[0], cfg.speed[1]) * (1 + this.level * 0.05);

    const asteroid = {
      x, y,
      vx: inheritVx !== null ? inheritVx + Math.cos(angle) * speed * 0.5 : Math.cos(angle) * speed,
      vy: inheritVy !== null ? inheritVy + Math.sin(angle) * speed * 0.5 : Math.sin(angle) * speed,
      r: cfg.r,
      size,
      rot: Phaser.Math.FloatBetween(0, Math.PI * 2),
      rotSpeed: Phaser.Math.FloatBetween(-1.5, 1.5),
      // Irregular shape vertices
      verts: Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r = cfg.r * (0.72 + Math.random() * 0.48);
        return { a, r };
      }),
      hp: cfg.mass,
      gfx: this.add.graphics(),
    };
    this.asteroids.add(asteroid.gfx);
    this.asteroidCount++;
    asteroid.id = this.asteroidCount;
    asteroid.splits = cfg.splits;
    asteroid.score = cfg.score;
    this.asteroidList = this.asteroidList || [];
    this.asteroidList.push(asteroid);
  }

  // ── Shooting ──────────────────────────────────────────────────────────────

  fireBullet() {
    const s = this.ship;
    const bullet = {
      x: s.x + Math.cos(s.angle) * 22,
      y: s.y + Math.sin(s.angle) * 22,
      vx: s.vx + Math.cos(s.angle) * SHIP.bulletSpeed,
      vy: s.vy + Math.sin(s.angle) * SHIP.bulletSpeed,
      life: SHIP.bulletLife,
      gfx: this.add.graphics(),
    };
    this.bullets.add(bullet.gfx);
    this.bulletList = this.bulletList || [];
    this.bulletList.push(bullet);
  }

  // ── Particle explosion ────────────────────────────────────────────────────

  explode(x, y, color, count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(40, 180);
      const particle = {
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 600 + Math.random() * 400,
        maxLife: 0,
        r: 1 + Math.random() * 2.5,
        color,
        gfx: this.add.graphics(),
      };
      particle.maxLife = particle.life;
      this.particles.add(particle.gfx);
      this.particleList = this.particleList || [];
      this.particleList.push(particle);
    }
  }

  // ── Ship death ────────────────────────────────────────────────────────────

  killShip() {
    if (this.invincibleTimer > 0 || this.shieldActive) return;
    this.explode(this.ship.x, this.ship.y, COLORS.shipGlow, 30);
    this.lives--;
    this.updateHUD();

    if (this.lives <= 0) {
      this.endGame();
      return;
    }

    // Respawn briefly invincible
    this.ship.x = this.scale.width / 2;
    this.ship.y = this.scale.height / 2;
    this.ship.vx = 0;
    this.ship.vy = 0;
    this.invincibleTimer = 2500;
  }

  endGame() {
    this.gameOver = true;
    const hs = Math.max(this.highScore, this.score);
    localStorage.setItem("cloudplay.asteroidFury.hs", String(hs));
    this.scene.start("GameOver", { score: this.score, level: this.level, highScore: hs });
  }

  // ── Update loop ───────────────────────────────────────────────────────────

  update(time, delta) {
    if (this.gameOver) return;
    const dt = delta / 1000;
    const W = this.scale.width;
    const H = this.scale.height;
    const s = this.ship;

    // ── Timers ──
    if (this.invincibleTimer > 0) this.invincibleTimer -= delta;
    if (this.shieldActive) {
      this.shieldTimer -= delta;
      if (this.shieldTimer <= 0) {
        this.shieldActive = false;
        this.shieldCooldownTimer = SHIP.shieldCooldown;
      }
    } else if (this.shieldCooldownTimer > 0) {
      this.shieldCooldownTimer -= delta;
    }

    // ── Input ──
    const left  = this.keys.left.isDown  || this.keys.leftA.isDown  || this.touch.left;
    const right = this.keys.right.isDown || this.keys.rightD.isDown || this.touch.right;
    const thrust = this.keys.up.isDown   || this.keys.upW.isDown    || this.touch.thrust;
    const firing = Phaser.Input.Keyboard.JustDown(this.keys.fire) || this.touch.fire;
    const shieldKey = Phaser.Input.Keyboard.JustDown(this.keys.shieldKey) || this.touch.shield;

    if (left)  s.angle -= Phaser.Math.DegToRad(SHIP.rotationSpeed * dt);
    if (right) s.angle += Phaser.Math.DegToRad(SHIP.rotationSpeed * dt);

    s.thrusterOn = thrust;
    if (thrust) {
      s.vx += Math.cos(s.angle) * SHIP.acceleration * dt;
      s.vy += Math.sin(s.angle) * SHIP.acceleration * dt;
    }
    s.vx *= Math.pow(SHIP.drag, dt * 60);
    s.vy *= Math.pow(SHIP.drag, dt * 60);

    const spd = Math.hypot(s.vx, s.vy);
    if (spd > SHIP.maxSpeed) {
      s.vx = (s.vx / spd) * SHIP.maxSpeed;
      s.vy = (s.vy / spd) * SHIP.maxSpeed;
    }

    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.x = ((s.x % W) + W) % W;
    s.y = ((s.y % H) + H) % H;

    // Fire
    if (firing && time - this.lastFire > SHIP.fireRate) {
      this.fireBullet();
      this.lastFire = time;
    }

    // Shield
    if (shieldKey && !this.shieldActive && this.shieldCooldownTimer <= 0) {
      this.shieldActive = true;
      this.shieldTimer = SHIP.shieldDuration;
    }

    // ── Update bullets ──
    this.bulletList = (this.bulletList || []).filter((b) => {
      b.life -= delta;
      if (b.life <= 0) { b.gfx.destroy(); return false; }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.x = ((b.x % W) + W) % W;
      b.y = ((b.y % H) + H) % H;
      b.gfx.clear();
      b.gfx.fillStyle(COLORS.bulletColor, 1);
      b.gfx.fillCircle(b.x, b.y, 3);
      b.gfx.fillStyle(COLORS.bulletColor, 0.3);
      b.gfx.fillCircle(b.x, b.y, 7);
      return true;
    });

    // ── Update asteroids ──
    this.asteroidList = (this.asteroidList || []).filter((a) => {
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.x = ((a.x % W) + W) % W;
      a.y = ((a.y % H) + H) % H;
      a.rot += a.rotSpeed * dt;

      // Draw
      a.gfx.clear();
      const color = a.size === "large" ? COLORS.asteroidLg : a.size === "medium" ? COLORS.asteroidMd : COLORS.asteroidSm;
      a.gfx.fillStyle(color, 1);
      a.gfx.beginPath();
      for (let i = 0; i < a.verts.length; i++) {
        const v = a.verts[i];
        const ax = a.x + Math.cos(a.rot + v.a) * v.r;
        const ay = a.y + Math.sin(a.rot + v.a) * v.r;
        if (i === 0) a.gfx.moveTo(ax, ay);
        else a.gfx.lineTo(ax, ay);
      }
      a.gfx.closePath();
      a.gfx.fillPath();
      a.gfx.lineStyle(1.5, 0xffffff, 0.15);
      a.gfx.strokePath();

      // Bullet collision
      for (const b of (this.bulletList || [])) {
        if (Math.hypot(b.x - a.x, b.y - a.y) < a.r + 4) {
          b.life = 0;
          this.score += a.score * this.level;
          this.explode(a.x, a.y, color, a.size === "large" ? 22 : a.size === "medium" ? 14 : 8);
          if (a.splits > 0) {
            const nextSize = a.size === "large" ? "medium" : "small";
            for (let k = 0; k < a.splits; k++) {
              this.spawnAsteroid(nextSize, a.x, a.y, a.vx * 0.5, a.vy * 0.5);
            }
          }
          a.gfx.destroy();
          this.updateHUD();

          // Level up if no asteroids remain
          this.checkWaveClear();
          return false;
        }
      }

      // Ship collision
      const dist = Math.hypot(s.x - a.x, s.y - a.y);
      if (dist < a.r + 14 && this.invincibleTimer <= 0) {
        if (!this.shieldActive) {
          this.killShip();
        } else {
          // Shield absorbs, destroy asteroid
          this.score += a.score;
          this.explode(a.x, a.y, COLORS.shieldColor, 12);
          a.gfx.destroy();
          this.updateHUD();
          this.checkWaveClear();
          return false;
        }
      }

      return true;
    });

    // ── Update particles ──
    this.particleList = (this.particleList || []).filter((p) => {
      p.life -= delta;
      if (p.life <= 0) { p.gfx.destroy(); return false; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.97;
      p.vy *= 0.97;
      const alpha = p.life / p.maxLife;
      p.gfx.clear();
      p.gfx.fillStyle(p.color, alpha);
      p.gfx.fillCircle(p.x, p.y, p.r * alpha);
      return true;
    });

    // ── Draw stars ──
    this.stars.clear();
    for (const st of this.starData) {
      const twinkle = 0.5 + 0.5 * Math.sin(time * 0.001 * st.twinkleSpeed + st.twinkleOffset);
      const alpha = st.bright ? 0.4 + twinkle * 0.6 : 0.2 + twinkle * 0.3;
      this.stars.fillStyle(st.bright ? COLORS.starBright : COLORS.starDim, alpha);
      this.stars.fillCircle(st.x, st.y, st.r);
    }

    // ── Draw ship ──
    this.shipGfx.clear();
    this.shieldGfx.clear();

    if (this.invincibleTimer > 0 && Math.floor(time / 100) % 2 === 0) {
      // Blink when invincible
    } else {
      const sx = s.x, sy = s.y, a = s.angle;
      const cos = Math.cos(a), sin = Math.sin(a);
      const rot = (lx, ly) => ([sx + lx * cos - ly * sin, sy + lx * sin + ly * cos]);

      // Thruster flame
      if (s.thrusterOn) {
        const fl = 14 + Math.random() * 10;
        const [fx, fy] = rot(-fl, 0);
        this.shipGfx.fillStyle(COLORS.thruster, 0.8 + Math.random() * 0.2);
        this.shipGfx.fillTriangle(
          ...rot(-10, -6), ...rot(-10, 6), fx, fy
        );
      }

      // Ship body
      this.shipGfx.fillStyle(COLORS.shipBody, 1);
      const [nx, ny] = rot(20, 0);
      const [ll, lm] = rot(-14, 14);
      const [rl, rm] = rot(-14, -14);
      this.shipGfx.fillTriangle(nx, ny, ll, lm, rl, rm);

      // Ship cockpit highlight
      this.shipGfx.fillStyle(COLORS.shipGlow, 0.6);
      const [hx, hy] = rot(8, 0);
      this.shipGfx.fillCircle(hx, hy, 5);

      // Shield
      if (this.shieldActive) {
        const fade = this.shieldTimer / SHIP.shieldDuration;
        this.shieldGfx.lineStyle(2 + fade * 3, COLORS.shieldColor, 0.4 + fade * 0.6);
        this.shieldGfx.strokeCircle(sx, sy, 28);
        this.shieldGfx.lineStyle(1, COLORS.shieldColor, 0.2);
        this.shieldGfx.strokeCircle(sx, sy, 34);
      }
    }

    this.updateHUD();
  }

  checkWaveClear() {
    // Small delay to let explosions finish
    this.time.delayedCall(400, () => {
      if ((this.asteroidList || []).length === 0) {
        this.level++;
        this.spawnWave(this.level);
      }
    });
  }
}

// ─── Game Over Scene ─────────────────────────────────────────────────────────

class GameOverScene extends Phaser.Scene {
  constructor() { super("GameOver"); }

  init(data) { this.data2 = data; }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const { score, level, highScore } = this.data2;

    this.add.text(W / 2, H * 0.3, "GAME OVER", {
      fontSize: "42px", color: "#ff4466", fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.46, `Score: ${score.toLocaleString()}`, {
      fontSize: "22px", color: "#c0b0ff",
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.54, `Level Reached: ${level}`, {
      fontSize: "16px", color: "#8880cc",
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.62, `Best: ${highScore.toLocaleString()}`, {
      fontSize: "14px", color: "#6688aa",
    }).setOrigin(0.5);

    const btn = this.add.text(W / 2, H * 0.75, "[ PLAY AGAIN ]", {
      fontSize: "20px", color: "#7b68ee", fontStyle: "bold",
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setColor("#9b88ff"));
    btn.on("pointerout", () => btn.setColor("#7b68ee"));
    btn.on("pointerdown", () => this.scene.start("Game"));
  }
}

// ─── Phaser Config ────────────────────────────────────────────────────────────

export function createAsteroidFuryConfig(parent) {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: COLORS.bg,
    input: {
      activePointers: 3,
    },
    scene: [BootScene, GameScene, GameOverScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 560,
    },
    audio: { disableWebAudio: false },
  };
}

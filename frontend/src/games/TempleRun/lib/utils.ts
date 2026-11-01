// ─────────────────────────────────────────────────────────────────────────────
// lib/utils.ts  –  Pure math / projection helpers
// ─────────────────────────────────────────────────────────────────────────────

import { FOCAL, CAMERA_HEIGHT, HORIZON_Y, CENTER_X, NEAR_Z } from './constants';

/** Project a world point to screen coordinates.
 *  relZ  – depth relative to camera (positive = in front)
 *  worldX – lateral offset (world units; lane centres defined in constants)
 *  worldY – height above ground (0 = ground)
 *  Returns null when the point is behind the camera or closer than NEAR_Z.
 */
export function project(
  relZ: number,
  worldX: number,
  worldY = 0
): { x: number; y: number; scale: number } | null {
  if (relZ < NEAR_Z) return null;
  const scale = FOCAL / relZ;
  return {
    x: CENTER_X + worldX * scale,
    y: HORIZON_Y + (CAMERA_HEIGHT - worldY) * scale,
    scale,
  };
}

/** Inverse: given a screen-Y row, return the corresponding world depth. */
export function screenYToRelZ(screenY: number): number {
  const dy = screenY - HORIZON_Y;
  if (dy <= 0) return Infinity;
  return (CAMERA_HEIGHT * FOCAL) / dy;
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp */
export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Smooth-step easing */
export function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Random integer in [lo, hi] */
export function randInt(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

/** Pick a random element */
export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Convert a hex colour to an rgba string with custom alpha */
export function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Draw a glowing line on a canvas 2D context */
export function glowLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
  lineWidth = 2,
  blur = 12
): void {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/** Draw a glowing filled rectangle */
export function glowRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fillColor: string,
  glowColor: string,
  blur = 16
): void {
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = blur;
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

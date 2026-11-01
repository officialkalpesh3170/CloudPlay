// ─────────────────────────────────────────────────────────────────────────────
// hooks/useInput.ts  –  Keyboard + Touch Swipe + Gyroscope Motion Input System
// Supports iOS 13+ permission, screen rotation normalization & tilt latches.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback, useState } from 'react';
import type { InputState } from '../types/game';

const SWIPE_THRESHOLD = 26; // px minimum swipe distance
const TILT_THRESHOLD = 11;  // degrees tilt to trigger lane switch
const DEADZONE = 5;        // degrees deadzone to reset tilt latch

export interface GyroState {
  supported: boolean;
  enabled: boolean;
  permitted: boolean;
  angle: number;
  direction: 'left' | 'right' | 'center';
}

export function useInput(): {
  consumeInput: () => InputState;
  fireInput: (key: keyof InputState) => void;
  gyroState: GyroState;
  toggleGyro: () => void;
  requestGyroPermission: () => Promise<boolean>;
} {
  // Queue of pending one-frame inputs
  const queue = useRef<Partial<InputState>>({});

  const gyroSupported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
  const [gyroEnabled, setGyroEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('cloudplay_tr_gyro');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [gyroPermitted, setGyroPermitted] = useState(true);
  const [gyroAngle, setGyroAngle] = useState(0);
  const [gyroDir, setGyroDir] = useState<'left' | 'right' | 'center'>('center');

  const tiltLatch = useRef<'left' | 'right' | 'center'>('center');
  const lastTiltTime = useRef(0);

  const fire = useCallback((key: keyof InputState) => {
    queue.current[key] = true;
  }, []);

  // ── Keyboard Controls ──────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':  case 'KeyA': fire('left');    break;
        case 'ArrowRight': case 'KeyD': fire('right');   break;
        case 'ArrowUp':    case 'KeyW': case 'Space': fire('up'); break;
        case 'ArrowDown':  case 'KeyS': fire('down');   break;
        case 'KeyP':       case 'Escape':              fire('pause');  break;
      }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [fire]);

  // ── Touch Swipe Controls ───────────────────────────────────────────────────
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let active = false;

    const ts = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      active = true;
    };

    const tm = (e: TouchEvent) => {
      // Prevent browser bounce / pull-down gesture during gameplay swipe
      if (active && e.cancelable) {
        const t = e.touches[0];
        const dist = Math.hypot(t.clientX - startX, t.clientY - startY);
        if (dist > 10) {
          e.preventDefault();
        }
      }
    };

    const te = (e: TouchEvent) => {
      if (!active) return;
      active = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      if (Math.max(adx, ady) < SWIPE_THRESHOLD) return;

      if (adx > ady) {
        fire(dx < 0 ? 'left' : 'right');
      } else {
        fire(dy < 0 ? 'up' : 'down');
      }
    };

    window.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchmove',  tm, { passive: false });
    window.addEventListener('touchend',   te, { passive: true });
    window.addEventListener('touchcancel', te, { passive: true });

    return () => {
      window.removeEventListener('touchstart', ts);
      window.removeEventListener('touchmove',  tm);
      window.removeEventListener('touchend',   te);
      window.removeEventListener('touchcancel', te);
    };
  }, [fire]);

  // ── Gyroscope / Device Orientation Controls ────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return undefined;

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null && e.beta === null) return;

      if (!gyroEnabled) return;

      // Normalize orientation for portrait vs landscape
      let rawAngle = e.gamma || 0;
      const screenAngle = (window.screen?.orientation?.angle ?? (window.orientation as number) ?? 0);

      if (screenAngle === 90) {
        rawAngle = e.beta || 0;
      } else if (screenAngle === -90 || screenAngle === 270) {
        rawAngle = -(e.beta || 0);
      } else if (screenAngle === 180) {
        rawAngle = -rawAngle;
      }

      // Smooth angle representation
      setGyroAngle(Math.round(rawAngle));

      const now = performance.now();
      const currentDir: 'left' | 'right' | 'center' =
        rawAngle < -TILT_THRESHOLD ? 'left' :
        rawAngle > TILT_THRESHOLD  ? 'right' : 'center';

      setGyroDir(currentDir);

      // Handle tilt threshold triggers with deadzone re-arm
      if (rawAngle < -TILT_THRESHOLD) {
        if (tiltLatch.current !== 'left' && now - lastTiltTime.current > 200) {
          fire('left');
          tiltLatch.current = 'left';
          lastTiltTime.current = now;
        }
      } else if (rawAngle > TILT_THRESHOLD) {
        if (tiltLatch.current !== 'right' && now - lastTiltTime.current > 200) {
          fire('right');
          tiltLatch.current = 'right';
          lastTiltTime.current = now;
        }
      } else if (Math.abs(rawAngle) <= DEADZONE) {
        tiltLatch.current = 'center';
      }
    };

    window.addEventListener('deviceorientation', onOrientation, { passive: true });

    return () => {
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [fire, gyroEnabled]);

  // Request iOS 13+ permission
  const requestGyroPermission = useCallback(async (): Promise<boolean> => {
    if (
      typeof window !== 'undefined' &&
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> }).requestPermission === 'function'
    ) {
      try {
        const resp = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<'granted' | 'denied'> }).requestPermission();
        const ok = resp === 'granted';
        setGyroPermitted(ok);
        return ok;
      } catch {
        setGyroPermitted(false);
        return false;
      }
    }
    return true;
  }, []);

  const toggleGyro = useCallback(() => {
    setGyroEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cloudplay_tr_gyro', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // ── Consumer ───────────────────────────────────────────────────────────────
  const consumeInput = useCallback((): InputState => {
    const snap = { ...queue.current } as InputState;
    queue.current = {};
    return snap;
  }, []);

  return {
    consumeInput,
    fireInput: fire,
    gyroState: {
      supported: gyroSupported,
      enabled: gyroEnabled,
      permitted: gyroPermitted,
      angle: gyroAngle,
      direction: gyroDir,
    },
    toggleGyro,
    requestGyroPermission,
  };
}

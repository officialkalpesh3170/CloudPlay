// ─────────────────────────────────────────────────────────────────────────────
// hooks/useGameLoop.ts  –  requestAnimationFrame driver
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';

type LoopCallback = (dt: number) => void;

export function useGameLoop(
  callback: LoopCallback,
  active: boolean
): void {
  const cbRef   = useRef<LoopCallback>(callback);
  const rafRef  = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    lastRef.current = performance.now();

    const loop = (timestamp: number) => {
      const dt = Math.min(timestamp - lastRef.current, 50);
      lastRef.current = timestamp;
      cbRef.current(dt);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);
}

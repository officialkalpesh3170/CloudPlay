'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/game/GameCanvas.tsx  –  Canvas + game loop + Gyro & Touch HUD
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameLoop }   from '../../hooks/useGameLoop';
import { useInput }      from '../../hooks/useInput';
import { initGameState, updateGame } from '../../lib/game/engine';
import { render }        from '../../lib/game/renderer';
import { initAudio, startMusic, stopMusic, playSfx, setMusicVolume, setSfxVolume } from '../../lib/game/audio';
import type { GameState, Difficulty } from '../../types/game';

interface LiveState {
  score: number; distance: number; coins: number;
  lives: number; multiplier: number; speed: number;
}

interface Props {
  difficulty:   Difficulty;
  highScore:    number;
  onGameOver:   (score: number, distance: number, coins: number) => void;
  onPause:      () => void;
  isPaused:     boolean;
  soundOn:      boolean;
  onLiveState:  (s: LiveState) => void;
}

export default function GameCanvas({
  difficulty, highScore, onGameOver, onPause, isPaused, soundOn, onLiveState,
}: Props) {
  const hudTimer = useRef(0);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef<GameState>(initGameState(difficulty, highScore));
  const { consumeInput, fireInput, gyroState, toggleGyro, requestGyroPermission } = useInput();
  const [showButtons, setShowButtons] = useState(true);

  // ── Resize canvas to fill container ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // ── Audio init & sounds on state change ────────────────────────────────────
  useEffect(() => {
    initAudio();
    setMusicVolume(soundOn ? 0.18 : 0);
    setSfxVolume(soundOn ? 0.4 : 0);
  }, [soundOn]);

  // ── Restart / re-init when difficulty changes ───────────────────────────────
  useEffect(() => {
    stateRef.current = initGameState(difficulty, highScore);
    stateRef.current.status = 'playing';
    if (soundOn) startMusic();
  }, [difficulty, highScore]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Main loop ───────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const input = consumeInput();
    const state = stateRef.current;

    if (input.pause) {
      onPause();
      return;
    }

    if (!isPaused && state.status === 'playing') {
      const prevLives = state.lives;
      const prevCoins = state.coins;

      updateGame(state, input);

      if (soundOn) {
        if (state.lives < prevLives) playSfx('hit');
        if (state.coins > prevCoins) playSfx('coin');
      }

      const now = performance.now();
      if (now - hudTimer.current > 100) {
        hudTimer.current = now;
        onLiveState({
          score:      state.score,
          distance:   state.distance,
          coins:      state.coins,
          lives:      state.lives,
          multiplier: state.multiplier,
          speed:      state.speed,
        });
      }
    }

    if (state.status === 'gameover') {
      if (soundOn) {
        stopMusic();
        playSfx('gameover');
      }
      onGameOver(
        Math.floor(state.score),
        Math.floor(state.distance),
        state.coins
      );
      state.status = 'menu' as typeof state.status;
    }

    render(ctx, canvas, state);
  }, [consumeInput, isPaused, onGameOver, onPause, soundOn, onLiveState]);

  useGameLoop(tick, true);

  // ── Mobile on-screen button handlers ────────────────────────────────────────
  const btn = (key: 'left' | 'right' | 'up' | 'down') => () => fireInput(key);

  const handleGyroClick = async () => {
    if (!gyroState.permitted) {
      await requestGyroPermission();
    }
    toggleGyro();
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden touch-none">
      {/* Game canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none', imageRendering: 'pixelated' }}
      />

      {/* ── Mobile & Motion HUD Controls Bar (Below Score) ──────────────── */}
      <div className="absolute top-14 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
        {/* Left: Gyro & D-Pad toggles */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Gyro Tilt Toggle Button */}
          <button
            type="button"
            onClick={handleGyroClick}
            className={`
              px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-bold
              backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 shadow-md
              ${gyroState.enabled
                ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                : 'border-white/20 bg-black/60 text-white/50 hover:text-white/80'}
            `}
            title="Tilt phone left / right to steer"
          >
            <span>📱 TILT {gyroState.enabled ? 'ON' : 'OFF'}</span>
            {gyroState.enabled && (
              <span className="text-[10px] text-cyan-400 font-extrabold tracking-widest">
                {gyroState.direction === 'left' ? '◀◀' : gyroState.direction === 'right' ? '▶▶' : '●'}
              </span>
            )}
          </button>

          {/* Touch D-Pad Toggle */}
          <button
            type="button"
            onClick={() => setShowButtons((v) => !v)}
            className="px-2.5 py-1.5 rounded-lg border border-white/20 bg-black/60 text-white/70 hover:text-white
                       text-[11px] font-mono backdrop-blur-md transition-all active:scale-95 shadow-md"
            title="Toggle on-screen touch buttons"
          >
            {showButtons ? '🎮 PAD ON' : '🎮 PAD OFF'}
          </button>
        </div>

        {/* Right: Pause Button */}
        <button
          type="button"
          onClick={onPause}
          className="pointer-events-auto text-white/80 hover:text-white text-xs font-mono
                     bg-black/60 backdrop-blur-md border border-white/20 rounded-lg px-3 py-1.5
                     transition-all active:scale-95 shadow-md"
        >
          ⏸ PAUSE
        </button>
      </div>

      {/* ── Mobile Touch Control Buttons (Bottom) ─────────────────────────── */}
      {showButtons && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-between items-end px-3 sm:px-6 pointer-events-none z-30">
          {/* Left / Right Steering */}
          <div className="flex gap-2 sm:gap-3 pointer-events-auto">
            <MobileBtn label="◀ LEFT" onPress={btn('left')}  color="cyan" />
            <MobileBtn label="RIGHT ▶" onPress={btn('right')} color="cyan" />
          </div>

          {/* Jump / Slide Actions */}
          <div className="flex flex-col gap-2 sm:gap-2.5 pointer-events-auto">
            <MobileBtn label="▲ JUMP"  onPress={btn('up')}   color="purple" />
            <MobileBtn label="▼ SLIDE" onPress={btn('down')} color="orange" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Touch Control Button with pointer events & instant response ───────────────

function MobileBtn({
  label, onPress, color,
}: {
  label: string;
  onPress: () => void;
  color: 'cyan' | 'purple' | 'orange';
}) {
  const palette = {
    cyan:   'border-cyan-400 text-cyan-300 active:bg-cyan-400/40 shadow-[0_0_14px_rgba(0,229,255,0.3)]',
    purple: 'border-purple-400 text-purple-300 active:bg-purple-400/40 shadow-[0_0_14px_rgba(168,85,247,0.3)]',
    orange: 'border-orange-400 text-orange-300 active:bg-orange-400/40 shadow-[0_0_14px_rgba(249,115,22,0.3)]',
  }[color];

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      className={`
        w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 font-bold text-[11px] sm:text-xs font-mono
        bg-black/70 backdrop-blur-md transition-all active:scale-90
        flex items-center justify-center select-none touch-none
        ${palette}
      `}
    >
      {label}
    </button>
  );
}

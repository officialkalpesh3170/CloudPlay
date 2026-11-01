'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/game/HUD.tsx  –  Score / distance / lives overlay
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  score:      number;
  distance:   number;
  coins:      number;
  lives:      number;
  highScore:  number;
  multiplier: number;
  speed:      number;
}

export default function HUD({ score, distance, coins, lives, highScore, multiplier, speed }: Props) {
  const pct = Math.min(1, (speed - 8) / 22); // 0 = slow, 1 = max speed

  return (
    <div className="absolute inset-0 pointer-events-none font-mono">
      {/* ── Top bar ── */}
      <div className="flex justify-between items-start p-3 gap-2">
        {/* Score */}
        <div className="flex flex-col">
          <span className="text-white/50 text-[10px] uppercase tracking-widest">Score</span>
          <span className="text-white text-xl font-bold drop-shadow-[0_0_8px_#00e5ff]">
            {Math.floor(score).toLocaleString()}
          </span>
          {highScore > 0 && (
            <span className="text-cyan-400/60 text-[10px]">
              Best {highScore.toLocaleString()}
            </span>
          )}
        </div>

        {/* Multiplier badge */}
        <AnimatePresence>
          {multiplier > 1 && (
            <motion.div
              key={multiplier}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-purple-600/70 border border-purple-400 rounded-lg px-2 py-0.5
                         text-purple-200 text-sm font-bold backdrop-blur-sm"
            >
              ×{multiplier.toFixed(1)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Distance */}
        <div className="flex flex-col items-end">
          <span className="text-white/50 text-[10px] uppercase tracking-widest">Distance</span>
          <span className="text-white text-xl font-bold drop-shadow-[0_0_8px_#aa44ff]">
            {distance.toFixed(0)}m
          </span>
        </div>
      </div>

      {/* ── Speed bar ── */}
      <div className="absolute top-20 left-3 right-3">
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* ── Coins ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5
                      bg-black/30 backdrop-blur-sm border border-yellow-400/30
                      rounded-full px-3 py-1">
        <span className="text-yellow-400 drop-shadow-[0_0_6px_#ffe600]">◈</span>
        <span className="text-yellow-200 text-sm font-bold">{coins}</span>
      </div>

      {/* ── Lives ── */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 flex gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.span
            key={i}
            animate={{ scale: i < lives ? 1 : 0.6, opacity: i < lives ? 1 : 0.25 }}
            className="text-red-400 drop-shadow-[0_0_6px_#ff2244]"
            style={{ fontSize: 18 }}
          >
            ♥
          </motion.span>
        ))}
      </div>
    </div>
  );
}

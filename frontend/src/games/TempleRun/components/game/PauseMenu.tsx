'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/game/PauseMenu.tsx  –  Pause overlay
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';

interface Props {
  score:       number;
  distance:    number;
  onResume:    () => void;
  onMenu:      () => void;
  soundOn:     boolean;
  onToggleSound: () => void;
}

export default function PauseMenu({ score, distance, onResume, onMenu, soundOn, onToggleSound }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center
                 bg-black/80 backdrop-blur-md z-20 overflow-y-auto px-4 py-8"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="bg-[#0d0030]/90 border border-purple-500/30 rounded-2xl
                   p-8 w-72 flex flex-col items-center gap-4 font-mono"
      >
        <h2 className="text-3xl font-black text-white tracking-widest
                       drop-shadow-[0_0_16px_#aa44ff]">PAUSED</h2>

        {/* Mini stats */}
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <p className="text-white/40 text-[10px] uppercase">Score</p>
            <p className="text-cyan-300 font-bold">{Math.floor(score).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-white/40 text-[10px] uppercase">Distance</p>
            <p className="text-purple-300 font-bold">{distance.toFixed(0)}m</p>
          </div>
        </div>

        <div className="w-full border-t border-white/10" />

        <button
          onClick={onResume}
          className="w-full py-3.5 rounded-xl font-black text-white text-base
                     bg-gradient-to-r from-cyan-500 to-purple-600
                     hover:shadow-[0_0_24px_rgba(0,200,255,0.4)]
                     active:scale-95 transition-all tracking-wider"
        >
          ▶ RESUME
        </button>

        <button
          onClick={onToggleSound}
          className="w-full py-2.5 rounded-xl font-bold text-white/60 text-sm
                     bg-white/5 border border-white/10
                     hover:bg-white/10 hover:text-white
                     active:scale-95 transition-all"
        >
          {soundOn ? '🔊 Sound ON' : '🔇 Sound OFF'}
        </button>

        <button
          onClick={onMenu}
          className="w-full py-2.5 rounded-xl font-bold text-white/50 text-sm
                     bg-white/5 border border-white/10
                     hover:bg-white/10 hover:text-white
                     active:scale-95 transition-all"
        >
          ← MAIN MENU
        </button>

        {/* Controls reminder */}
        <p className="text-white/25 text-[10px] text-center leading-relaxed mt-1">
          ← → lane &nbsp;·&nbsp; ↑/Space jump &nbsp;·&nbsp; ↓ slide<br/>
          Swipe on mobile &nbsp;·&nbsp; P/Esc pause
        </p>
      </motion.div>
    </motion.div>
  );
}

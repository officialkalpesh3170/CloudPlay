'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/game/GameOver.tsx  –  Animated game-over overlay
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import type { Difficulty } from '../../types/game';

interface Props {
  score:      number;
  distance:   number;
  coins:      number;
  highScore:  number;
  isNewHigh:  boolean;
  difficulty: Difficulty;
  onRestart:  () => void;
  onMenu:     () => void;
}

export default function GameOver({
  score, distance, coins, highScore, isNewHigh, difficulty, onRestart, onMenu,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center
                 bg-black/80 backdrop-blur-md z-20 overflow-y-auto px-4 py-8"
    >
      {/* Title */}
      <motion.h2
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 160 }}
        className="text-3xl sm:text-5xl font-black text-red-400
                   drop-shadow-[0_0_30px_rgba(255,0,50,0.8)] mb-2"
      >
        GAME OVER
      </motion.h2>

      {isNewHigh && (
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.4 }}
          className="text-yellow-400 font-bold text-lg tracking-widest mb-2
                     drop-shadow-[0_0_12px_#ffe600]"
        >
          ★ NEW HIGH SCORE ★
        </motion.p>
      )}

      {/* Stats card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white/5 border border-white/15 rounded-2xl p-6 mb-6
                   backdrop-blur-sm w-64 font-mono"
      >
        <StatRow label="Score"      value={score.toLocaleString()}  color="text-cyan-300"   glow />
        <StatRow label="Distance"   value={`${distance}m`}          color="text-purple-300" />
        <StatRow label="Coins"      value={String(coins)}           color="text-yellow-400" />
        <div className="border-t border-white/10 my-3" />
        <StatRow label="Best"       value={highScore.toLocaleString()} color="text-white/60" />
        <StatRow label="Difficulty" value={difficulty.toUpperCase()}   color="text-white/40" small />
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex flex-col gap-3 w-56"
      >
        <button
          onClick={onRestart}
          className="py-3.5 rounded-xl font-black text-white text-lg tracking-wider
                     bg-gradient-to-r from-cyan-500 to-purple-600
                     hover:shadow-[0_0_30px_rgba(0,200,255,0.5)]
                     active:scale-95 transition-all"
        >
          ↺ PLAY AGAIN
        </button>
        <button
          onClick={onMenu}
          className="py-3 rounded-xl font-bold text-white/70 text-sm tracking-widest
                     bg-white/5 border border-white/15
                     hover:bg-white/10 hover:text-white
                     active:scale-95 transition-all"
        >
          ← MAIN MENU
        </button>
      </motion.div>
    </motion.div>
  );
}

function StatRow({
  label, value, color, glow, small,
}: {
  label: string; value: string; color: string; glow?: boolean; small?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline mb-1.5">
      <span className="text-white/40 text-xs uppercase tracking-widest">{label}</span>
      <span className={`font-bold ${small ? 'text-xs' : 'text-base'} ${color}
                        ${glow ? 'drop-shadow-[0_0_8px_#00e5ff]' : ''}`}>
        {value}
      </span>
    </div>
  );
}

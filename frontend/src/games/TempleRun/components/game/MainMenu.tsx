'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/game/MainMenu.tsx  –  Animated start screen (Fully Responsive)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getAllHighScores } from '../../hooks/useHighScore';
import type { Difficulty } from '../../types/game';

interface Props {
  onStart: (difficulty: Difficulty) => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

const DIFFICULTIES: { id: Difficulty; label: string; desc: string; color: string }[] = [
  { id: 'easy',   label: 'EASY',   desc: 'Comfortable pace',   color: 'from-green-500  to-cyan-500'  },
  { id: 'medium', label: 'MEDIUM', desc: 'Ramped-up speed',    color: 'from-yellow-500 to-orange-500' },
  { id: 'hard',   label: 'HARD',   desc: 'Maximum intensity',  color: 'from-red-500    to-pink-500'  },
];

export default function MainMenu({ onStart, soundOn, onToggleSound }: Props) {
  const [selected, setSelected] = useState<Difficulty>('medium');
  const scores = getAllHighScores();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center
                    bg-gradient-to-b from-[#060014] via-[#0d0030] to-[#18005c]
                    overflow-y-auto px-4 py-4 sm:py-8">

      {/* Animated neon grid lines */}
      <NeonGrid />

      {/* Title */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="relative z-10 text-center mb-3 sm:mb-7 mt-1 sm:mt-2"
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight
                       text-transparent bg-clip-text
                       bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400
                       drop-shadow-[0_0_30px_rgba(120,0,255,0.8)]">
          TEMPLE RUN
        </h1>
        <p className="text-cyan-300/80 text-xs sm:text-sm tracking-[0.25em] uppercase mt-1 font-mono">
          Neon Endless Runner
        </p>
      </motion.div>

      {/* Mobile & Desktop Controls Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 mb-3 sm:mb-5 max-w-sm w-full text-center font-mono"
      >
        <div className="bg-cyan-950/40 border border-cyan-400/20 rounded-xl p-2 sm:p-2.5 mb-2 backdrop-blur-sm">
          <p className="text-[11px] text-cyan-300 font-bold mb-0.5">
            📱 MOBILE CONTROLS
          </p>
          <p className="text-[10px] text-white/70">
            Tilt Phone (Gyro) · Swipe Up/Down · On-Screen Touch Buttons
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 text-[10px] text-white/50">
          <span className="bg-white/5 border border-white/10 rounded px-2 py-0.5">
            ← → / A D : Lane
          </span>
          <span className="bg-white/5 border border-white/10 rounded px-2 py-0.5">
            ↑ / Space : Jump
          </span>
          <span className="bg-white/5 border border-white/10 rounded px-2 py-0.5">
            ↓ / S : Slide
          </span>
          <span className="bg-white/5 border border-white/10 rounded px-2 py-0.5">
            P / Esc : Pause
          </span>
        </div>
      </motion.div>

      {/* Difficulty selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 flex flex-col gap-2 sm:gap-2.5 w-full max-w-xs mb-4 sm:mb-6"
      >
        {DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelected(d.id)}
            className={`
              relative rounded-xl border-2 px-3.5 py-2.5 font-mono text-left
              transition-all duration-200 overflow-hidden
              ${selected === d.id
                ? 'border-white/80 bg-white/15 scale-[1.02] shadow-[0_0_20px_rgba(120,0,255,0.5)]'
                : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10'}
            `}
          >
            {selected === d.id && (
              <div className={`absolute inset-0 bg-gradient-to-r ${d.color} opacity-15`} />
            )}
            <div className="flex justify-between items-center">
              <span className={`font-bold text-xs sm:text-sm ${selected === d.id ? 'text-white' : 'text-white/60'}`}>
                {d.label}
              </span>
              {scores[d.id] > 0 && (
                <span className="text-yellow-400 text-[11px]">
                  ◈ {scores[d.id].toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-white/40 text-[10px] mt-0.5">{d.desc}</p>
          </button>
        ))}
      </motion.div>

      {/* Start button */}
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onStart(selected)}
        className="relative z-10 w-full max-w-xs py-3.5 rounded-xl font-mono font-black text-white text-base sm:text-lg
                   bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500
                   shadow-[0_0_25px_rgba(0,229,255,0.4)]
                   hover:shadow-[0_0_35px_rgba(0,229,255,0.7)]
                   transition-all tracking-wider mb-3"
      >
        ▶ PLAY NOW
      </motion.button>

      {/* Sound toggle button */}
      <button
        type="button"
        onClick={onToggleSound}
        className="relative z-10 text-white/50 hover:text-white text-xs font-mono
                   bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
      >
        {soundOn ? '🔊 Sound: ON' : '🔇 Sound: OFF'}
      </button>
    </div>
  );
}

// ── Retro Neon Background Grid ───────────────────────────────────────────────

function NeonGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-25"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        transform: 'perspective(400px) rotateX(45deg) translateY(-50px) scale(2)',
        transformOrigin: 'top center',
      }}
    />
  );
}

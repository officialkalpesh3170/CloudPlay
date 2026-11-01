// ─────────────────────────────────────────────────────────────────────────────
// hooks/useHighScore.ts  –  localStorage-backed high score per difficulty
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import type { Difficulty } from '../types/game';

const KEY = (d: Difficulty) => `tr_highscore_${d}`;

export function useHighScore(difficulty: Difficulty): {
  highScore: number;
  saveHighScore: (score: number) => void;
} {
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(KEY(difficulty)) ?? '0', 10);
  });

  const saveHighScore = useCallback((score: number) => {
    const rounded = Math.floor(score);
    setHighScore(prev => {
      const next = Math.max(prev, rounded);
      if (typeof window !== 'undefined') {
        localStorage.setItem(KEY(difficulty), String(next));
      }
      return next;
    });
  }, [difficulty]);

  return { highScore, saveHighScore };
}

/** Read all three difficulty high scores (for the menu) */
export function getAllHighScores(): Record<Difficulty, number> {
  if (typeof window === 'undefined') return { easy: 0, medium: 0, hard: 0 };
  return {
    easy:   parseInt(localStorage.getItem(KEY('easy'))   ?? '0', 10),
    medium: parseInt(localStorage.getItem(KEY('medium')) ?? '0', 10),
    hard:   parseInt(localStorage.getItem(KEY('hard'))   ?? '0', 10),
  };
}

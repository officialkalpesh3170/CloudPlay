// ─────────────────────────────────────────────────────────────────────────────
// TempleRun.tsx – Main React Component for Temple Run (Neon Endless Runner)
// Fully integrated local game for CloudPlay.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import MainMenu from './components/game/MainMenu';
import HUD from './components/game/HUD';
import GameOver from './components/game/GameOver';
import PauseMenu from './components/game/PauseMenu';
import GameCanvas from './components/game/GameCanvas';
import { getAllHighScores } from './hooks/useHighScore';
import type { Difficulty } from './types/game';
import { usePlayer } from '../../context/usePlayer';
import './TempleRun.css';

type Screen = 'menu' | 'playing' | 'gameover';

interface RunResult {
  score: number;
  distance: number;
  coins: number;
}

interface LiveState {
  score: number;
  distance: number;
  coins: number;
  lives: number;
  multiplier: number;
  speed: number;
}

interface TempleRunProps {
  onExit?: () => void;
}

export default function TempleRun({ onExit }: TempleRunProps) {
  const { profile, updateProfile } = usePlayer();
  const [screen, setScreen] = useState<Screen>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isPaused, setIsPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [result, setResult] = useState<RunResult | null>(null);
  const [highScores, setHighScores] = useState(() => getAllHighScores());
  const [liveState, setLiveState] = useState<LiveState>({
    score: 0,
    distance: 0,
    coins: 0,
    lives: 3,
    multiplier: 1,
    speed: 8,
  });

  const refreshScores = useCallback(() => setHighScores(getAllHighScores()), []);

  const handleStart = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setIsPaused(false);
    setResult(null);
    setScreen('playing');
  }, []);

  const handleGameOver = useCallback((score: number, distance: number, coins: number) => {
    const prev = getAllHighScores()[difficulty];
    if (score > prev && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`tr_highscore_${difficulty}`, String(Math.floor(score)));
      } catch {
        // storage suppressed
      }
    }
    refreshScores();
    setResult({ score, distance, coins });
    setScreen('gameover');

    // Reward CloudPlay XP & Coins based on run performance
    if (updateProfile) {
      const earnedXp = Math.min(250, Math.floor(score / 50) + Math.floor(distance / 20));
      const earnedCoins = Math.min(100, Math.floor(coins * 1.5));
      updateProfile({
        xp: (profile.xp || 0) + earnedXp,
        coins: (profile.coins || 0) + earnedCoins,
      });
    }
  }, [difficulty, refreshScores, profile, updateProfile]);

  const handleRestart = useCallback(() => {
    setIsPaused(false);
    setResult(null);
    setScreen('playing');
  }, []);

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);
  const toggleSound = useCallback(() => setSoundOn((s) => !s), []);

  const isNewHigh = result
    ? Math.floor(result.score) >= (highScores[difficulty] || 0) && result.score > 0
    : false;

  return (
    <div className="temple-run-root">
      {/* Return to CloudPlay button */}
      {onExit && screen === 'menu' && (
        <button className="temple-run-exit-btn" onClick={onExit} title="Exit to CloudPlay">
          <ArrowLeft size={16} /> Exit to CloudPlay
        </button>
      )}

      <AnimatePresence mode="wait">
        {/* ── Main menu ── */}
        {screen === 'menu' && (
          <MainMenu
            key="menu"
            onStart={handleStart}
            soundOn={soundOn}
            onToggleSound={toggleSound}
          />
        )}

        {/* ── Active game ── */}
        {screen === 'playing' && (
          <div key="game" className="absolute inset-0">
            <GameCanvas
              difficulty={difficulty}
              highScore={highScores[difficulty]}
              onGameOver={handleGameOver}
              onPause={togglePause}
              isPaused={isPaused}
              soundOn={soundOn}
              onLiveState={setLiveState}
            />

            <HUD
              score={liveState.score}
              distance={Math.floor(liveState.distance)}
              coins={liveState.coins}
              lives={liveState.lives}
              highScore={highScores[difficulty]}
              multiplier={liveState.multiplier}
              speed={liveState.speed}
            />

            <AnimatePresence>
              {isPaused && (
                <PauseMenu
                  key="pause"
                  score={liveState.score}
                  distance={Math.floor(liveState.distance)}
                  onResume={togglePause}
                  onMenu={() => {
                    setScreen('menu');
                    setIsPaused(false);
                  }}
                  soundOn={soundOn}
                  onToggleSound={toggleSound}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Game over ── */}
        {screen === 'gameover' && result && (
          <div key="gameover" className="absolute inset-0">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <GameCanvas
                difficulty={difficulty}
                highScore={highScores[difficulty]}
                onGameOver={() => {}}
                onPause={() => {}}
                isPaused={true}
                soundOn={false}
                onLiveState={() => {}}
              />
            </div>
            <GameOver
              score={result.score}
              distance={result.distance}
              coins={result.coins}
              highScore={highScores[difficulty]}
              isNewHigh={isNewHigh}
              difficulty={difficulty}
              onRestart={handleRestart}
              onMenu={() => {
                refreshScores();
                setScreen('menu');
              }}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Cyber 2048 - React Game Component
 *
 * Based on the open-source puzzle game 2048 by Gabriele Cirulli (MIT License).
 * Features neon cyberpunk visuals, procedural Web Audio effects, undo system,
 * touch swipe support, and multi-size board selection.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  RotateCcw,
  Undo2,
  Volume2,
  VolumeX,
  Trophy,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import {
  initializeBoard,
  moveBoard,
  spawnRandomTile,
  canMove,
  hasReachedTarget,
  getHighestTile,
  BOARD_SIZES,
} from "./cyber2048Logic";
import { sound } from "./cyber2048Audio";
import { usePlayer } from "../../context/usePlayer";
import "./Cyber2048.css";

const getSavedBest = (size) => {
  try {
    return Number(localStorage.getItem(`cloudplay_2048_best_${size}`)) || 0;
  } catch {
    return 0;
  }
};

export default function Cyber2048({ onExit }) {
  const { profile, updateProfile } = usePlayer();
  const [boardSize, setBoardSize] = useState(4);
  const [board, setBoard] = useState(() => initializeBoard(4));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => getSavedBest(4));

  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const touchStartRef = useRef(null);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [gyroDir, setGyroDir] = useState("center");

  // Restart game for selected size
  const startNewGame = useCallback((size = boardSize) => {
    const newBoard = initializeBoard(size);
    setBoard(newBoard);
    setScore(0);
    setHistory([]);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
  }, [boardSize]);

  // Handle board size switch
  const handleSizeChange = (newSize) => {
    if (newSize === boardSize) return;
    setBoardSize(newSize);
    setBestScore(getSavedBest(newSize));
    startNewGame(newSize);
  };

  // Undo move
  const handleUndo = useCallback(() => {
    if (history.length === 0 || gameOver) return;
    const previous = history[history.length - 1];
    setBoard(previous.board);
    setScore(previous.score);
    setHistory((prev) => prev.slice(0, -1));
    setWon(false);
    sound.playSlide();
  }, [history, gameOver]);

  // Handle Movement
  const handleMove = useCallback((direction) => {
    if (gameOver) return;

    const result = moveBoard(board, direction);
    if (!result.moved) return;

    // Save undo snapshot
    setHistory((prev) => [...prev.slice(-15), { board, score }]);

    // Spawn new tile after move
    const nextBoard = spawnRandomTile(result.board);
    const newScore = score + result.scoreGained;
    setBoard(nextBoard);
    setScore(newScore);

    // Update best score
    if (newScore > bestScore) {
      setBestScore(newScore);
      try {
        localStorage.setItem(`cloudplay_2048_best_${boardSize}`, String(newScore));
      } catch {
        // localStorage disabled
      }
    }

    // Audio effects
    if (result.mergedCount > 0) {
      sound.playMerge(result.maxTile);
    } else {
      sound.playSlide();
    }

    // Win condition check
    const target = BOARD_SIZES[boardSize]?.winTarget || 2048;
    if (!won && !keepPlaying && hasReachedTarget(nextBoard, target)) {
      setWon(true);
      sound.playWin();
      if (updateProfile) {
        updateProfile({
          xp: (profile.xp || 0) + 150,
          coins: (profile.coins || 0) + 50,
        });
      }
      return;
    }

    // Game Over check
    if (!canMove(nextBoard)) {
      setGameOver(true);
      sound.playGameOver();
      if (updateProfile && newScore > 100) {
        const earnedXp = Math.min(200, Math.floor(newScore / 20));
        const earnedCoins = Math.min(60, Math.floor(newScore / 50));
        updateProfile({
          xp: (profile.xp || 0) + earnedXp,
          coins: (profile.coins || 0) + earnedCoins,
        });
      }
    }
  }, [board, score, bestScore, boardSize, gameOver, won, keepPlaying, profile, updateProfile]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture when user interacts with inputs
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          handleMove("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          handleMove("right");
          break;
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          handleMove("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          handleMove("down");
          break;
        case "u":
        case "U":
          e.preventDefault();
          handleUndo();
          break;
        case "r":
        case "R":
          e.preventDefault();
          startNewGame();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove, handleUndo, startNewGame]);

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipeDistance = 35;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < minSwipeDistance) return;

    if (absX > absY) {
      handleMove(deltaX > 0 ? "right" : "left");
    } else {
      handleMove(deltaY > 0 ? "down" : "up");
    }
  };

  // Gyroscope tilt move support
  useEffect(() => {
    if (typeof window === "undefined" || !gyroEnabled) return undefined;

    let latch = "center";
    let lastTime = 0;

    const onOrientation = (e) => {
      if (e.gamma === null) return;
      const now = performance.now();
      if (now - lastTime < 320) return;

      const gamma = e.gamma || 0;
      const beta = (e.beta || 0) - 45;

      const THRESH = 15;
      const absG = Math.abs(gamma);
      const absB = Math.abs(beta);

      if (Math.max(absG, absB) > THRESH) {
        if (latch === "center") {
          if (absG > absB) {
            handleMove(gamma < 0 ? "left" : "right");
            latch = gamma < 0 ? "left" : "right";
          } else {
            handleMove(beta < 0 ? "up" : "down");
            latch = beta < 0 ? "up" : "down";
          }
          setGyroDir(latch);
          lastTime = now;
        }
      } else if (absG < 7 && absB < 7) {
        latch = "center";
        setGyroDir("center");
      }
    };

    window.addEventListener("deviceorientation", onOrientation, { passive: true });
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, [gyroEnabled, handleMove]);

  const toggleGyro = async () => {
    if (
      typeof window !== "undefined" &&
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        await DeviceOrientationEvent.requestPermission();
      } catch {
        // ignore
      }
    }
    setGyroEnabled((g) => !g);
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const getTileClassName = (val) => {
    if (!val) return "";
    let cls = `c2048-tile c2048-tile-${val > 2048 ? "super" : val}`;
    if (val >= 1000) cls += " digits-4";
    return cls;
  };

  const highestTile = getHighestTile(board);

  return (
    <div
      className="c2048-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="c2048-wrapper">
        {/* ── Header ── */}
        <header className="c2048-header">
          <div className="c2048-title-group">
            <h1>CYBER 2048</h1>
            <div className="c2048-subtitle">Open-Source Cybernetic Edition</div>
          </div>

          <div className="c2048-scores">
            <div className="c2048-score-box">
              <span className="c2048-score-label">Score</span>
              <span className="c2048-score-value">{score}</span>
            </div>
            <div className="c2048-score-box best">
              <span className="c2048-score-label">Best</span>
              <span className="c2048-score-value">{bestScore}</span>
            </div>
          </div>
        </header>

        {/* ── Toolbar ── */}
        <div className="c2048-toolbar">
          <div className="c2048-sizes">
            {Object.entries(BOARD_SIZES).map(([sizeKey, config]) => (
              <button
                key={sizeKey}
                className={`c2048-size-btn ${boardSize === Number(sizeKey) ? "active" : ""}`}
                onClick={() => handleSizeChange(Number(sizeKey))}
              >
                {config.label}
              </button>
            ))}
          </div>

          <div className="c2048-actions">
            <button
              className={`c2048-btn ${gyroEnabled ? "c2048-btn--active" : ""}`}
              onClick={toggleGyro}
              title="Toggle Phone Tilt Control"
            >
              📱 {gyroEnabled ? `TILT [${gyroDir}]` : "TILT"}
            </button>
            <button
              className="c2048-btn"
              onClick={handleUndo}
              disabled={history.length === 0 || gameOver}
              title="Undo Move (U)"
            >
              <Undo2 size={15} /> Undo
            </button>
            <button
              className="c2048-btn"
              onClick={toggleSound}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <button
              className="c2048-btn c2048-btn--primary"
              onClick={() => startNewGame()}
              title="New Game (R)"
            >
              <RotateCcw size={15} /> Reset
            </button>
            {onExit && (
              <button className="c2048-btn" onClick={onExit} title="Back to CloudPlay">
                <ArrowLeft size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ── Grid Board ── */}
        <div className="c2048-board" data-size={boardSize}>
          {board.map((row, r) =>
            row.map((val, c) => (
              <div key={`${r}-${c}`} className="c2048-cell">
                {val > 0 && (
                  <div className={getTileClassName(val)}>
                    {val}
                  </div>
                )}
              </div>
            ))
          )}

          {/* ── Win Overlay ── */}
          {won && !keepPlaying && (
            <div className="c2048-overlay win">
              <Sparkles size={40} color="#facc15" style={{ marginBottom: 12 }} />
              <h2>MISSION COMPLETE!</h2>
              <p>You forged the legendary {BOARD_SIZES[boardSize]?.winTarget || 2048} tile!</p>
              <div className="c2048-overlay-actions">
                <button
                  className="c2048-btn c2048-btn--primary"
                  onClick={() => setKeepPlaying(true)}
                >
                  Keep Going
                </button>
                <button
                  className="c2048-btn"
                  onClick={() => startNewGame()}
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* ── Game Over Overlay ── */}
          {gameOver && (
            <div className="c2048-overlay game-over">
              <Trophy size={40} color="#f87171" style={{ marginBottom: 12 }} />
              <h2>GRID LOCKED</h2>
              <p>Final Score: <strong>{score}</strong> · Peak Tile: <strong>{highestTile}</strong></p>
              <div className="c2048-overlay-actions">
                <button
                  className="c2048-btn c2048-btn--primary"
                  onClick={() => startNewGame()}
                >
                  Try Again
                </button>
                {history.length > 0 && (
                  <button
                    className="c2048-btn"
                    onClick={() => {
                      setGameOver(false);
                      handleUndo();
                    }}
                  >
                    Undo Last Move
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile Touch Controls ── */}
        <div className="c2048-mobile-dpad">
          <button
            type="button"
            className="c2048-pad-btn"
            onPointerDown={(e) => { e.preventDefault(); handleMove("up"); }}
            title="Slide Up"
            aria-label="Slide Up"
          >
            ▲
          </button>
          <div className="c2048-pad-row">
            <button
              type="button"
              className="c2048-pad-btn"
              onPointerDown={(e) => { e.preventDefault(); handleMove("left"); }}
              title="Slide Left"
              aria-label="Slide Left"
            >
              ◀
            </button>
            <button
              type="button"
              className="c2048-pad-btn"
              onPointerDown={(e) => { e.preventDefault(); handleMove("down"); }}
              title="Slide Down"
              aria-label="Slide Down"
            >
              ▼
            </button>
            <button
              type="button"
              className="c2048-pad-btn"
              onPointerDown={(e) => { e.preventDefault(); handleMove("right"); }}
              title="Slide Right"
              aria-label="Slide Right"
            >
              ▶
            </button>
          </div>
        </div>

        {/* ── Controls info note ── */}
        <div className="c2048-footer-note">
          <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> or <kbd>W A S D</kbd> to slide tiles · Swipe on touch · <kbd>U</kbd> Undo · <kbd>R</kbd> Restart
        </div>
      </div>
    </div>
  );
}

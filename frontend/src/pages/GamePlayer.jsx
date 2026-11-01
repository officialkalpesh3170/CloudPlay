/**
 * GamePlayer — full-screen game experience.
 * Handles both local (React component) games and embed (iframe) games.
 * Includes universal Mobile Virtual Gamepad & Gyroscope Steering Bridge.
 */

import { useEffect, useRef, useState, lazy, Suspense, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Maximize2, Info, X, Keyboard, Gamepad2, Compass, ExternalLink
} from "lucide-react";
import { getGameById } from "../lib/catalog";
import { usePlayer } from "../context/usePlayer";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/gameplayer.css";

// Lazy-load all game components
const GAME_COMPONENTS = {
  Cyber2048:    lazy(() => import("../games/Cyber2048/Cyber2048")),
  TempleRun:    lazy(() => import("../games/TempleRun/TempleRun")),
  HillClimb:    lazy(() => import("../games/HillClimb")),
  AsteroidFury: lazy(() => import("../games/AsteroidFury")),
  BlockPuzzle:  lazy(() => import("../games/BlockPuzzle")),
  LudoGame:     lazy(() => import("../games/Ludo")),
};

export default function GamePlayer() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { onGameStart, onGameEnd } = usePlayer();
  const iframeRef = useRef(null);

  const [showInfo, setShowInfo] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showTouchPad, setShowTouchPad] = useState(true);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [gyroDir, setGyroDir] = useState("center");

  const game = getGameById(gameId);

  useEffect(() => {
    if (!game) return undefined;
    onGameStart(game.id);
    return () => onGameEnd();
  }, [game, onGameStart, onGameEnd]);

  // Synthetic key dispatcher for embed and local games
  const sendKey = useCallback((code, type) => {
    const keyMap = {
      ArrowLeft: "ArrowLeft",
      ArrowRight: "ArrowRight",
      ArrowUp: "ArrowUp",
      ArrowDown: "ArrowDown",
      Space: " ",
    };
    const key = keyMap[code] || code;
    const keyCode = code === "ArrowLeft" ? 37 : code === "ArrowUp" ? 38 : code === "ArrowRight" ? 39 : code === "ArrowDown" ? 40 : 32;

    const event = new KeyboardEvent(type, {
      key,
      code,
      keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    try {
      iframeRef.current?.contentWindow?.dispatchEvent(event);
      iframeRef.current?.contentWindow?.postMessage({ type, code }, "*");
    } catch {
      // Cross-origin iframe event dispatch handled gracefully
    }
  }, []);

  // Universal Gyroscope Steering Listener for Mobile
  useEffect(() => {
    if (typeof window === "undefined" || !gyroEnabled) return undefined;

    let latch = "center";
    const onOrientation = (e) => {
      if (e.gamma === null) return;
      let angle = e.gamma || 0;
      const screenAngle = window.screen?.orientation?.angle ?? (window.orientation || 0);
      if (screenAngle === 90) angle = e.beta || 0;
      else if (screenAngle === -90 || screenAngle === 270) angle = -(e.beta || 0);

      const THRESH = 11;
      if (angle < -THRESH) {
        if (latch !== "left") {
          sendKey("ArrowLeft", "keydown");
          sendKey("ArrowRight", "keyup");
          latch = "left";
          setGyroDir("left");
        }
      } else if (angle > THRESH) {
        if (latch !== "right") {
          sendKey("ArrowRight", "keydown");
          sendKey("ArrowLeft", "keyup");
          latch = "right";
          setGyroDir("right");
        }
      } else if (Math.abs(angle) < 5) {
        if (latch !== "center") {
          sendKey("ArrowLeft", "keyup");
          sendKey("ArrowRight", "keyup");
          latch = "center";
          setGyroDir("center");
        }
      }
    };

    window.addEventListener("deviceorientation", onOrientation, { passive: true });
    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      sendKey("ArrowLeft", "keyup");
      sendKey("ArrowRight", "keyup");
    };
  }, [gyroEnabled, sendKey]);

  const toggleGyro = async () => {
    if (
      typeof window !== "undefined" &&
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        await DeviceOrientationEvent.requestPermission();
      } catch {
        // iOS permission handled
      }
    }
    setGyroEnabled((g) => !g);
  };

  if (!game) {
    return (
      <div className="gp-error">
        <h2>Game not found</h2>
        <p>The game "<code>{gameId}</code>" doesn't exist in the catalog.</p>
        <button onClick={() => navigate("/")} className="gp-back-btn">
          <ArrowLeft size={16} /> Return Home
        </button>
      </div>
    );
  }

  const handleFullscreen = () => {
    const el = document.fullscreenElement
      ? document
      : (iframeRef.current || document.querySelector(".gp-game-area"));
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      el?.requestFullscreen?.().catch(() => {});
    }
  };

  const GameComponent = game.mode === "local" ? GAME_COMPONENTS[game.component] : null;

  return (
    <div className="gp">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="gp-bar">
        <button className="gp-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={18} />
          <span className="gp-btn-label">Back</span>
        </button>

        <div className="gp-title">
          <strong>{game.title}</strong>
          <span>{game.category} · {game.players} · {game.source}</span>
        </div>

        <div className="gp-bar-actions">
          {/* Gyro Steering Button */}
          <button
            type="button"
            className={`gp-btn gp-gyro-btn ${gyroEnabled ? "gp-gyro-btn--active" : ""}`}
            onClick={toggleGyro}
            title="Toggle Tilt / Gyroscope Control"
          >
            <Compass size={16} />
            <span className="gp-btn-label">
              TILT {gyroEnabled ? `[${gyroDir === "left" ? "◀" : gyroDir === "right" ? "▶" : "●"}]` : "OFF"}
            </span>
          </button>

          {/* Touch Pad Toggle */}
          <button
            type="button"
            className={`gp-btn ${showTouchPad ? "gp-btn--active" : ""}`}
            onClick={() => setShowTouchPad((v) => !v)}
            title="Toggle On-Screen Touch Controls"
          >
            <Gamepad2 size={16} />
            <span className="gp-btn-label">{showTouchPad ? "Pad ON" : "Pad OFF"}</span>
          </button>

          {game.controls && (
            <button
              className="gp-btn"
              onClick={() => setShowControls((s) => !s)}
              aria-label="Controls"
            >
              <Keyboard size={17} />
              <span className="gp-btn-label">Controls</span>
            </button>
          )}

          <button
            className="gp-btn"
            onClick={() => setShowInfo((s) => !s)}
            aria-label="Game info"
          >
            <Info size={17} />
          </button>

          {game.mode === "embed" && game.url && (
            <a
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gp-btn gp-open-btn"
              title="Open directly in fullscreen browser tab (Bypasses iframe restrictions)"
            >
              <ExternalLink size={16} />
              <span className="gp-btn-label">Open Fullscreen</span>
            </a>
          )}

          <button
            className="gp-btn"
            onClick={handleFullscreen}
            aria-label="Fullscreen"
          >
            <Maximize2 size={17} />
          </button>
        </div>
      </header>

      {/* ── Game area ───────────────────────────────────────────────────── */}
      <div className="gp-game-area">
        <Suspense fallback={<LoadingSpinner fullscreen />}>
          {game.mode === "local" && GameComponent ? (
            <div className="gp-local-wrapper">
              <GameComponent onExit={() => navigate("/")} />
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className="gp-iframe"
              src={game.url}
              title={game.title}
              allow="accelerometer; gyroscope; autoplay; fullscreen; gamepad; clipboard-write; orientation-lock"
              sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-presentation allow-modals allow-popups allow-downloads"
              referrerPolicy="no-referrer-when-downgrade"
              loading="eager"
            />
          )}
        </Suspense>

        {/* ── Universal On-Screen Touch Controller Overlay for Embed Games ── */}
        {game.mode === "embed" && (
          <button
            type="button"
            className="gp-pad-toggle-floating"
            onClick={() => setShowTouchPad((v) => !v)}
            title="Toggle on-screen touch pedals"
          >
            <Gamepad2 size={13} />
            <span>{showTouchPad ? "Hide Pedals" : "Touch Pedals"}</span>
          </button>
        )}

        {game.mode === "embed" && showTouchPad && (
          <div className="gp-mobile-pad">
            {/* Left Steering Pedals */}
            <div className="gp-mobile-pad__left">
              <button
                type="button"
                className="gp-pad-btn"
                onPointerDown={() => sendKey("ArrowLeft", "keydown")}
                onPointerUp={() => sendKey("ArrowLeft", "keyup")}
                onPointerCancel={() => sendKey("ArrowLeft", "keyup")}
              >
                ◀ STEER
              </button>
              <button
                type="button"
                className="gp-pad-btn"
                onPointerDown={() => sendKey("ArrowRight", "keydown")}
                onPointerUp={() => sendKey("ArrowRight", "keyup")}
                onPointerCancel={() => sendKey("ArrowRight", "keyup")}
              >
                STEER ▶
              </button>
            </div>

            {/* Right Throttle & Action Pedals */}
            <div className="gp-mobile-pad__right">
              <div className="gp-pad-col">
                <button
                  type="button"
                  className="gp-pad-btn gp-pad-btn--accent"
                  onPointerDown={() => sendKey("ArrowUp", "keydown")}
                  onPointerUp={() => sendKey("ArrowUp", "keyup")}
                  onPointerCancel={() => sendKey("ArrowUp", "keyup")}
                >
                  ▲ GAS
                </button>
                <button
                  type="button"
                  className="gp-pad-btn gp-pad-btn--danger"
                  onPointerDown={() => sendKey("ArrowDown", "keydown")}
                  onPointerUp={() => sendKey("ArrowDown", "keyup")}
                  onPointerCancel={() => sendKey("ArrowDown", "keyup")}
                >
                  ▼ BRAKE
                </button>
              </div>
              <button
                type="button"
                className="gp-pad-btn gp-pad-btn--action"
                onPointerDown={() => sendKey("Space", "keydown")}
                onPointerUp={() => sendKey("Space", "keyup")}
                onPointerCancel={() => sendKey("Space", "keyup")}
              >
                ⚡ ACTION
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Info sidebar ────────────────────────────────────────────────── */}
      {showInfo && (
        <div className="gp-info-panel">
          <button className="gp-info-close" onClick={() => setShowInfo(false)}>
            <X size={18} />
          </button>
          <h3>{game.title}</h3>
          <p className="gp-info-category">{game.category} · {game.players}</p>
          <p className="gp-info-desc">{game.description}</p>
          <div className="gp-info-tags">
            {game.tags.map((t) => <span key={t} className="gp-tag">{t}</span>)}
          </div>
          <div className="gp-info-attr">
            <strong>Source:</strong> {game.source}<br />
            <strong>Licence:</strong> {game.licence}
          </div>
        </div>
      )}

      {/* ── Controls popup ──────────────────────────────────────────────── */}
      {showControls && (
        <div className="gp-controls-popup">
          <button className="gp-info-close" onClick={() => setShowControls(false)}>
            <X size={16} />
          </button>
          <h4>Controls</h4>
          <p>{game.controls}</p>
          <ul>
            <li><kbd>📱 TILT</kbd> Steer with Device Gyroscope</li>
            <li><kbd>🎮 PAD</kbd> On-screen touch pedals for mobile</li>
            <li><kbd>← → ↑ ↓</kbd> Arrow keys / WASD</li>
            <li><kbd>Space</kbd> Action / Nitro / Jump / Brake</li>
          </ul>
        </div>
      )}

      {/* ── Footer strip ────────────────────────────────────────────────── */}
      <footer className="gp-footer">
        <span>{game.source}</span>
        {game.repo && (
          <a href={game.repo} target="_blank" rel="noopener noreferrer" className="gp-repo-link">
            View source repository ↗
          </a>
        )}
        <span className="gp-licence">Licence: {game.licence}</span>
      </footer>
    </div>
  );
}

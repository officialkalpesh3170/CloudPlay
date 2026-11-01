import { useEffect, useRef, useCallback, useState } from "react";
import Phaser from "phaser";
import { createBlockPuzzleConfig } from "./blockScene";
import { RotateCw, ArrowLeft, ArrowRight, ArrowDown, ChevronsDown, RefreshCw } from "lucide-react";

const btnStyle = {
  background: "rgba(15, 23, 42, 0.88)",
  border: "1.5px solid rgba(255, 255, 255, 0.25)",
  borderRadius: "12px",
  color: "#f1f5f9",
  padding: "12px 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backdropFilter: "blur(8px)",
  touchAction: "manipulation",
  userSelect: "none",
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.5)",
  minWidth: "46px",
  minHeight: "46px",
  transition: "transform 0.08s ease, background 0.12s ease",
};

export default function BlockPuzzle() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [showTouchPad] = useState(true);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    const config = createBlockPuzzleConfig(containerRef.current);
    gameRef.current = new Phaser.Game(config);
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const sendKey = useCallback((code, type = "keydown") => {
    const keyMap = {
      ArrowLeft: "ArrowLeft",
      ArrowRight: "ArrowRight",
      ArrowUp: "ArrowUp",
      ArrowDown: "ArrowDown",
      Space: " ",
      KeyC: "c",
    };
    const key = keyMap[code] || code;
    const keyCode = code === "ArrowLeft" ? 37 : code === "ArrowUp" ? 38 : code === "ArrowRight" ? 39 : code === "ArrowDown" ? 40 : code === "Space" ? 32 : 67;

    window.dispatchEvent(new KeyboardEvent(type, {
      key,
      code,
      keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
    }));
  }, []);

  // Instant trigger for mobile touches
  const triggerKey = (code) => {
    sendKey(code, "keydown");
    setTimeout(() => sendKey(code, "keyup"), 60);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#060810", overflow: "hidden" }}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
      />

      {/* ── On-Screen Mobile Controller ── */}
      {showTouchPad && (
        <div style={{
          position: "absolute",
          bottom: "12px",
          left: "10px",
          right: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          pointerEvents: "none",
          zIndex: 50,
          touchAction: "manipulation",
        }}>
          {/* Left D-pad (Move & Soft Drop) */}
          <div style={{ display: "flex", gap: "6px", pointerEvents: "auto" }}>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); triggerKey("ArrowLeft"); }}
              style={btnStyle}
              title="Move Left"
              aria-label="Move Left"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); triggerKey("ArrowDown"); }}
              style={btnStyle}
              title="Soft Drop"
              aria-label="Soft Drop"
            >
              <ArrowDown size={18} />
            </button>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); triggerKey("ArrowRight"); }}
              style={btnStyle}
              title="Move Right"
              aria-label="Move Right"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Right Action buttons (Rotate, Hold, Hard Drop) */}
          <div style={{ display: "flex", gap: "6px", pointerEvents: "auto" }}>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); triggerKey("KeyC"); }}
              style={{ ...btnStyle, borderColor: "rgba(168, 85, 247, 0.5)", color: "#c084fc" }}
              title="Hold Piece (C)"
              aria-label="Hold Piece"
            >
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); triggerKey("ArrowUp"); }}
              style={{ ...btnStyle, borderColor: "rgba(0, 229, 255, 0.6)", color: "#38bdf8" }}
              title="Rotate (Up)"
              aria-label="Rotate"
            >
              <RotateCw size={18} />
            </button>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); triggerKey("Space"); }}
              style={{ ...btnStyle, borderColor: "rgba(239, 68, 68, 0.6)", color: "#fca5a5", background: "rgba(239, 68, 68, 0.25)" }}
              title="Hard Drop (Space)"
              aria-label="Hard Drop"
            >
              <ChevronsDown size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

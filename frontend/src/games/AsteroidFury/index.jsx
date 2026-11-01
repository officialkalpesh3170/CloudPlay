/**
 * AsteroidFury React wrapper
 * Mounts the Phaser game inside a fixed full-screen game player.
 */

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { createAsteroidFuryConfig } from "./asteroidFuryScene";

export default function AsteroidFury() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createAsteroidFuryConfig(containerRef.current);
    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", background: "#05060f" }}
    />
  );
}

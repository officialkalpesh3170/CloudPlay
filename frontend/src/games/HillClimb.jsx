import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Pause,
  Play,
  Fuel,
  Coins,
  Gauge,
  Trophy,
  Volume2,
  VolumeX,
  Wrench,
} from "lucide-react";

import "./HillClimb.css";
import { stepVehiclePhysics, VEHICLE_PHYSICS } from "./hillClimbPhysics";

const SAVE_KEY = "cloudplay-hillclimb-save-v3";

const DEFAULT_SAVE = {
  coins: 0,
  bestDistance: 0,
  engineLevel: 1,
  tireLevel: 1,
  ownedVehicles: ["jeep"],
  unlockedAchievements: [],
};

const VEHICLES = [
  {
    id: "jeep",
    name: "Hill Climber (Red Jeep)",
    description: "Iconic red 4x4 with Bill Newton",
    cost: 0,
    physics: VEHICLE_PHYSICS.jeep,
  },
  {
    id: "buggy",
    name: "Dune Buggy",
    description: "Lightweight and fast",
    cost: 900,
    physics: VEHICLE_PHYSICS.buggy,
  },
  {
    id: "truck",
    name: "Monster 4x4 Truck",
    description: "Heavy vehicle with steady traction",
    cost: 1800,
    physics: VEHICLE_PHYSICS.truck,
  },
];

const ACHIEVEMENT_TITLES = {
  "first-flip": "First Flip",
  "front-flip": "Front Flip",
  "back-flip": "Back Flip",
  "long-run": "Long Haul · 500 m",
  "coin-haul": "Coin Haul · 25 coins",
};

function readSave() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");

    return {
      ...DEFAULT_SAVE,
      ...saved,
      ownedVehicles: saved.ownedVehicles || ["jeep"],
      unlockedAchievements: Array.isArray(saved.unlockedAchievements)
        ? saved.unlockedAchievements
        : [],
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

function terrainHeight(x) {
  return (
    405 +
    Math.sin(x * 0.0017) * 74 +
    Math.sin(x * 0.0052 + 1.2) * 34 +
    Math.sin(x * 0.011 + 0.4) * 10 +
    Math.sin(x * 0.00043) * 35 +
    Math.sin(x * 0.00082 + 2.4) * 24
  );
}

function makeWorld() {
  const coins = [];
  const fuels = [];

  for (let section = 0; section < 180; section++) {
    const start = 550 + section * 430;
    const count = section % 4 === 0 ? 4 : 3;

    for (let i = 0; i < count; i++) {
      const x = start + i * 39;

      coins.push({
        x,
        y: terrainHeight(x) - 74,
        taken: false,
      });
    }

    if (section % 5 === 2) {
      const x = start + 190;

      fuels.push({
        x,
        y: terrainHeight(x) - 74,
        taken: false,
      });
    }
  }

  return { coins, fuels };
}

function makeInitialRun() {
  const x = 110;

  const rear = terrainHeight(x - 28);
  const front = terrainHeight(x + 28);

  return {
    x,
    y: (rear + front) / 2 - 42,
    vx: 0,
    vy: 0,
    angle: Math.atan2(front - rear, 56),
    angularVelocity: 0,
    wheelSpin: 0,
    rearWheelOffset: 24,
    frontWheelOffset: 24,
    rearCompression: 0,
    frontCompression: 0,
    rearCompressionVelocity: 0,
    frontCompressionVelocity: 0,
    airRotation: 0,
    flipCount: 0,
    frontFlips: 0,
    backFlips: 0,
    fuel: 100,
    distance: 0,
    runCoins: 0,
    grounded: true,
    crashed: false,
    cameraX: 0,
    cameraY: 0,
    world: makeWorld(),
  };
}

export default function HillClimb({ onExit }) {
  const canvasRef = useRef(null);
  const [initialRun] = useState(makeInitialRun);
  const gameRef = useRef(initialRun);
  const audioRef = useRef(null);
  const crashSoundPlayedRef = useRef(false);
  const keysRef = useRef({ gas: false, brake: false, rotateLeft: false, rotateRight: false });
  const lastTimeRef = useRef(0);
  const lastHudRef = useRef(0);
  const gameOverSavedRef = useRef(false);

  const [save, setSave] = useState(readSave);
  const [gyroEnabled, setGyroEnabled] = useState(true);
  const [gyroDir, setGyroDir] = useState("center");

  const [hud, setHud] = useState({
    fuel: 100,
    distance: 0,
    coins: 0,
    speed: 0,
    frontFlips: 0,
    backFlips: 0,
    crashReason: "",
    newAchievements: [],
  });

  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showGarage, setShowGarage] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [vehicleId, setVehicleId] = useState("jeep");
  const [message, setMessage] = useState("Hold accelerate to drive");

  // Keep current React values available to the animation loop.
  const stateRef = useRef({});

  useEffect(() => {
    stateRef.current = { paused, gameOver, showGarage, vehicleId, save, soundOn };
  }, [paused, gameOver, showGarage, vehicleId, save, soundOn]);

  const persist = useCallback((next) => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    setSave(next);
  }, []);


  const startRun = useCallback(() => {
    gameRef.current = makeInitialRun();

    keysRef.current = {
      gas: false,
      brake: false,
      rotateLeft: false,
      rotateRight: false,
    };

    lastTimeRef.current = 0;
    lastHudRef.current = 0;
    gameOverSavedRef.current = false;
    crashSoundPlayedRef.current = false;

    setHud({
      fuel: 100,
      distance: 0,
      coins: 0,
      speed: 0,
      frontFlips: 0,
      backFlips: 0,
      crashReason: "",
      newAchievements: [],
    });

    setGameOver(false);
    setPaused(false);
    setShowGarage(false);
    setMessage("Hold accelerate to drive");
  }, []);


  useEffect(() => {
    if (!soundOn) return undefined;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return undefined;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.value = 65;
    gain.gain.value = 0;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    context.resume().catch(() => {});
    audioRef.current = { context, oscillator, gain };

    return () => {
      audioRef.current = null;
      oscillator.stop();
      context.close().catch(() => {});
    };
  }, [soundOn]);

  // Save completed run exactly once.
  useEffect(() => {
    if (!gameOver) return;

    const g = gameRef.current;

    if (!g || gameOverSavedRef.current) return;

    gameOverSavedRef.current = true;

    const current = readSave();

    const next = {
      ...current,
      coins: current.coins + g.runCoins,
      bestDistance: Math.max(
        current.bestDistance,
        g.distance
      ),
      unlockedAchievements: [...new Set([
        ...(current.unlockedAchievements || []),
        ...(g.newAchievements || []),
      ])],
    };

    persist(next);
    setHud((previous) => ({
      ...previous,
      frontFlips: g.frontFlips,
      backFlips: g.backFlips,
      crashReason: g.crashReason || "The run has ended",
      newAchievements: g.newAchievements || [],
    }));
  }, [gameOver, persist]);

  // Garage upgrades.
  const buyUpgrade = (kind) => {
    const cost =
      kind === "engine"
        ? save.engineLevel * 350
        : save.tireLevel * 300;

    if (save.coins < cost) {
      setMessage("Not enough coins!");
      return;
    }

    const next = {
      ...save,
      coins: save.coins - cost,
      engineLevel:
        kind === "engine"
          ? save.engineLevel + 1
          : save.engineLevel,
      tireLevel:
        kind === "tires"
          ? save.tireLevel + 1
          : save.tireLevel,
    };

    persist(next);
    setMessage("Upgrade purchased!");
  };

  const buyVehicle = (vehicle) => {
    const owned = save.ownedVehicles.includes(vehicle.id);

    if (!owned && save.coins < vehicle.cost) {
      setMessage("Collect more coins!");
      return;
    }

    if (!owned) {
      persist({
        ...save,
        coins: save.coins - vehicle.cost,
        ownedVehicles: [
          ...save.ownedVehicles,
          vehicle.id,
        ],
      });
    }

    setVehicleId(vehicle.id);
    setMessage(`${vehicle.name} selected`);
  };

  // Main canvas engine.
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let width = 900;
    let height = 500;
    let animationId = 0;
    let destroyed = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      width = Math.max(320, rect.width);
      height = Math.max(300, rect.height);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    // Draw sky and background hills.
    const drawBackground = (g) => {
      const sky = ctx.createLinearGradient(0, 0, 0, height);

      sky.addColorStop(0, "#65bce9");
      sky.addColorStop(0.65, "#c5e9f4");
      sky.addColorStop(1, "#f3dcae");

      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Sun.
      ctx.fillStyle = "#fff0a9";
      ctx.beginPath();
      ctx.arc(width * 0.82, height * 0.18, 34, 0, Math.PI * 2);
      ctx.fill();

      // Clouds.
      for (let i = 0; i < 5; i++) {
        const x =
          ((i * 250 - g.cameraX * 0.15) % (width + 280) +
            width +
            280) %
            (width + 280) -
          80;

        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.arc(x, 80 + i % 3 * 35, 20, 0, Math.PI * 2);
        ctx.arc(x + 22, 72 + i % 3 * 35, 25, 0, Math.PI * 2);
        ctx.arc(x + 45, 82 + i % 3 * 35, 19, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant hills.
      for (let layer = 0; layer < 2; layer++) {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 8) {
          const wx = x + g.cameraX * (0.12 + layer * 0.1);

          const y =
            height * (0.64 + layer * 0.1) +
            Math.sin(wx * 0.002 + layer) * 35 +
            Math.sin(wx * 0.006) * 12;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        ctx.fillStyle = layer === 0 ? "#92bd8c" : "#719d76";
        ctx.fill();
      }
    };

    // Draw the ground.
    const drawTerrain = (g) => {
      ctx.beginPath();
      ctx.moveTo(0, height);

      const left = g.cameraX - 30;
      const right = g.cameraX + width + 30;

      for (let x = left; x <= right; x += 5) {
        ctx.lineTo(
          x - g.cameraX,
          terrainHeight(x) - g.cameraY
        );
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const dirt = ctx.createLinearGradient(
        0,
        height * 0.5,
        0,
        height
      );

      dirt.addColorStop(0, "#a96c3d");
      dirt.addColorStop(1, "#5d3828");

      ctx.fillStyle = dirt;
      ctx.fill();

      // Grass surface.
      ctx.beginPath();

      for (let x = left; x <= right; x += 5) {
        const sx = x - g.cameraX;
        const sy = terrainHeight(x) - g.cameraY;

        if (x === left) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }

      ctx.strokeStyle = "#5ba33f";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.strokeStyle = "#a6df62";
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    // Draw vehicle wheels.
    const drawWheel = (x, y, spin, radius = 17) => {
      ctx.save();

      ctx.translate(x, y);
      ctx.rotate(spin);

      ctx.fillStyle = "#20242a";
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#555f69";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#c4cbd2";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.52, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#687481";
      ctx.lineWidth = 2;

      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius * 0.4, 0);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Draw the car.
    const drawVehicle = (g) => {
      const vehicle =
        VEHICLES.find((v) => v.id === stateRef.current.vehicleId) ||
        VEHICLES[0];

      ctx.save();

      ctx.translate(
        g.x - g.cameraX,
        g.y - g.cameraY
      );

      ctx.rotate(g.angle);

      // Body.
      ctx.fillStyle = vehicle.id === "jeep" ? "#dc2626" : vehicle.physics.color;

      ctx.beginPath();
      ctx.moveTo(-43, -27);
      ctx.lineTo(38, -27);
      ctx.lineTo(46, -8);
      ctx.lineTo(-42, -8);
      ctx.closePath();
      ctx.fill();

      // Cabin.
      // Bill Newton Driver & Roll Cage
      if (vehicle.id === "jeep") {
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-24, -27);
        ctx.lineTo(-20, -56);
        ctx.lineTo(-6, -56);
        ctx.stroke();

        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(14, -27);
        ctx.lineTo(24, -50);
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.fillRect(-14, -42, 14, 15);

        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(8, -36, 6, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();

        const bob = Math.sin(Date.now() * 0.015) * 1.5;
        ctx.save();
        ctx.translate(-7, -49 + bob);
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(2, -2, 2, 2.5);
        ctx.beginPath();
        ctx.arc(2, 2, 2.5, 0, Math.PI);
        ctx.stroke();
        ctx.fillStyle = "#2563eb";
        ctx.beginPath();
        ctx.arc(0, -2, 8, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(0, -3, 10, 3);
        ctx.restore();
      }
      ctx.fillStyle = "#d96b2f";
      ctx.beginPath();
      ctx.moveTo(-24, -27);
      ctx.lineTo(-12, -51);
      ctx.lineTo(18, -51);
      ctx.lineTo(34, -27);
      ctx.closePath();
      ctx.fill();

      // Windows.
      ctx.fillStyle = "#a4e1f1";
      ctx.fillRect(-12, -46, 18, 15);
      ctx.fillRect(12, -46, 12, 15);

      // Bumper.
      ctx.fillStyle = "#343b43";
      ctx.fillRect(39, -13, 12, 6);
      ctx.fillRect(-46, -13, 9, 6);

      // Suspension struts.
      ctx.strokeStyle = "#343b43";
      ctx.lineWidth = 5;
      ctx.beginPath();
      const halfWheelBase = vehicle.physics.wheelBase / 2;
      ctx.moveTo(-halfWheelBase, -8);
      ctx.lineTo(-halfWheelBase, g.rearWheelOffset - 5);
      ctx.moveTo(halfWheelBase, -8);
      ctx.lineTo(halfWheelBase, g.frontWheelOffset - 5);
      ctx.stroke();

      // Independently positioned wheels.
      drawWheel(-halfWheelBase, g.rearWheelOffset, g.wheelSpin, vehicle.physics.wheelRadius);
      drawWheel(halfWheelBase, g.frontWheelOffset, g.wheelSpin, vehicle.physics.wheelRadius);

      ctx.restore();
    };

    // Coins and fuel.
    const drawPickups = (g) => {
      for (const coin of g.world.coins) {
        if (coin.taken) continue;

        const x = coin.x - g.cameraX;
        const y = coin.y - g.cameraY;

        if (x < -30 || x > width + 30) continue;

        ctx.fillStyle = "#ffca37";
        ctx.beginPath();
        ctx.ellipse(x, y, 10, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#fff1a6";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#946316";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("$", x, y + 4);
      }

      for (const fuel of g.world.fuels) {
        if (fuel.taken) continue;

        const x = fuel.x - g.cameraX;
        const y = fuel.y - g.cameraY;

        if (x < -30 || x > width + 30) continue;

        ctx.fillStyle = "#d94336";
        ctx.fillRect(x - 10, y - 13, 20, 25);

        ctx.fillStyle = "#fff";
        ctx.fillRect(x - 3, y - 7, 6, 13);
        ctx.fillRect(x - 7, y - 3, 14, 5);
      }
    };

    // Collect objects.
    const collectPickups = (g) => {
      for (const coin of g.world.coins) {
        if (
          !coin.taken &&
          Math.hypot(g.x - coin.x, g.y - coin.y) < 43
        ) {
          coin.taken = true;
          g.runCoins += 1;
        }
      }

      for (const fuel of g.world.fuels) {
        if (
          !fuel.taken &&
          Math.hypot(g.x - fuel.x, g.y - fuel.y) < 48
        ) {
          fuel.taken = true;
          g.fuel = Math.min(100, g.fuel + 32);
        }
      }
    };

    const updateGame = (g, dt) => {
      const currentSave = stateRef.current.save;
      const result = stepVehiclePhysics(g, dt, {
        vehicleId: stateRef.current.vehicleId,
        engineLevel: currentSave.engineLevel,
        tireLevel: currentSave.tireLevel,
        controls: keysRef.current,
        terrainHeight,
      });
      const engineAudio = audioRef.current;
      if (engineAudio) {
        const { context, oscillator, gain } = engineAudio;
        oscillator.frequency.setTargetAtTime(
          55 + Math.abs(g.vx) * 0.32 + (keysRef.current.gas ? 45 : 0),
          context.currentTime,
          0.08,
        );
        gain.gain.setTargetAtTime(keysRef.current.gas && g.fuel > 0 ? 0.025 : 0.006, context.currentTime, 0.12);
      }
      g.distance = Math.max(g.distance, Math.floor((g.x - 110) / 10));
      g.cameraX += (g.x - width * 0.32 - g.cameraX) * 0.08;
      g.cameraY += (g.y - height * 0.59 - g.cameraY) * 0.06;

      collectPickups(g);

      if (result.crashed) {
        const context = audioRef.current?.context;
        if (context && !crashSoundPlayedRef.current) {
          crashSoundPlayedRef.current = true;
          const impact = context.createOscillator();
          const envelope = context.createGain();
          impact.type = "triangle";
          impact.frequency.setValueAtTime(145, context.currentTime);
          impact.frequency.exponentialRampToValueAtTime(42, context.currentTime + 0.28);
          envelope.gain.setValueAtTime(0.12, context.currentTime);
          envelope.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
          impact.connect(envelope);
          envelope.connect(context.destination);
          impact.start();
          impact.stop(context.currentTime + 0.31);
        }

        const candidates = [
          ["first-flip", g.frontFlips + g.backFlips >= 1],
          ["front-flip", g.frontFlips >= 1],
          ["back-flip", g.backFlips >= 1],
          ["long-run", g.distance >= 500],
          ["coin-haul", g.runCoins >= 25],
        ];
        const unlocked = new Set(currentSave.unlockedAchievements || []);
        g.newAchievements = candidates
          .filter(([id, met]) => met && !unlocked.has(id))
          .map(([id]) => id);
        setGameOver(true);
      }
    };

    // Draw everything.
    const drawFrame = (g) => {
      drawBackground(g);
      drawTerrain(g);
      drawPickups(g);
      drawVehicle(g);

      // Start line.
      if (g.cameraX < 300) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px Arial";
        ctx.fillText(
          "START",
          110 - g.cameraX,
          terrainHeight(110) - g.cameraY - 30
        );
      }
    };

    // Animation loop.
    const render = (time) => {
      if (destroyed) return;

      try {
        const g = gameRef.current;

        const delta = lastTimeRef.current
          ? Math.min((time - lastTimeRef.current) / 1000, 0.034)
          : 0.016;

        lastTimeRef.current = time;

        if (g) {
          const current = stateRef.current;

          if (
            !current.paused &&
            !current.gameOver &&
            !current.showGarage &&
            !g.crashed
          ) {
            updateGame(g, Math.max(delta, 0.001));
          }

          drawFrame(g);

          if (time - lastHudRef.current > 100) {
            lastHudRef.current = time;

            setHud({
              fuel: Math.round(g.fuel),
              distance: g.distance,
              coins: g.runCoins,
              speed: Math.round(Math.abs(g.vx) * 0.18),
              frontFlips: g.frontFlips,
              backFlips: g.backFlips,
              crashReason: g.crashReason || "",
            });
          }
        } else {
          // Visible fallback if game state has not initialized.
          ctx.fillStyle = "#72c9f4";
          ctx.fillRect(0, 0, width, height);
        }
      } catch (error) {
        console.error("Trail Rush rendering error:", error);
      } finally {
        if (!destroyed) {
          animationId = requestAnimationFrame(render);
        }
      }
    };

    // Start the animation.
    animationId = requestAnimationFrame(render);

    return () => {
      destroyed = true;
      cancelAnimationFrame(animationId);
      observer.disconnect();
      lastTimeRef.current = 0;
    };
  }, []);


  // Keyboard controls.
  useEffect(() => {
    const down = (event) => {
      if (
        ["ArrowRight", "ArrowLeft", "ArrowUp", " "].includes(
          event.key
        )
      ) {
        event.preventDefault();
      }

      const key = event.key.toLowerCase();

      if (
        key === "d" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp"
      ) {
        keysRef.current.gas = true;
      }

      if (key === "a" || event.key === "ArrowLeft") {
        keysRef.current.brake = true;
      }

      if (key === "w") {
        keysRef.current.rotateLeft = true;
      }
      if (key === "s") {
        keysRef.current.rotateRight = true;
      }

      if (!event.repeat && (key === "p" || event.key === "Escape")) {
        setPaused((v) => !v);
      }
    };

    const up = (event) => {
      const key = event.key.toLowerCase();

      if (
        key === "d" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp"
      ) {
        keysRef.current.gas = false;
      }

      if (key === "a" || event.key === "ArrowLeft") {
        keysRef.current.brake = false;
      }
      if (key === "w") {
        keysRef.current.rotateLeft = false;
      }
      if (key === "s") {
        keysRef.current.rotateRight = false;
      }
    };

    const clearControls = () => {
      keysRef.current = { gas: false, brake: false, rotateLeft: false, rotateRight: false };
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clearControls);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clearControls);
    };
  }, []);

  // Gyroscope tilt controls for mobile devices
  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return undefined;

    const onOrientation = (event) => {
      if (!gyroEnabled || event.gamma === null) return;
      let angle = event.gamma || 0;
      const screenAngle = window.screen?.orientation?.angle ?? (window.orientation || 0);
      if (screenAngle === 90) {
        angle = event.beta || 0;
      } else if (screenAngle === -90 || screenAngle === 270) {
        angle = -(event.beta || 0);
      } else if (screenAngle === 180) {
        angle = -angle;
      }

      const TILT_THRESH = 10;
      if (angle < -TILT_THRESH) {
        keysRef.current.rotateLeft = true;
        keysRef.current.rotateRight = false;
        setGyroDir("left");
      } else if (angle > TILT_THRESH) {
        keysRef.current.rotateRight = true;
        keysRef.current.rotateLeft = false;
        setGyroDir("right");
      } else if (Math.abs(angle) < 5) {
        keysRef.current.rotateLeft = false;
        keysRef.current.rotateRight = false;
        setGyroDir("center");
      }
    };

    window.addEventListener("deviceorientation", onOrientation, { passive: true });
    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, [gyroEnabled]);

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

  const setControl = (key, value, event) => {
    keysRef.current[key] = value;
    if (value && event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handleRestart = () => {
    startRun();
  };

  const vehicle =
    VEHICLES.find((v) => v.id === vehicleId) || VEHICLES[0];

  return (
    <div className="hc-shell">
      <header className="hc-topbar">
        <button className="hc-back" onClick={onExit}>
          <ArrowLeft size={17} />
          CloudPlay
        </button>

        <div className="hc-title">
          <span className="hc-title-mark">CP</span>
          <div>
            <strong>Hill Climb Racing</strong>
            <small>Physics-based off-road racing</small>
          </div>
        </div>

        <div className="hc-top-actions">
          <button
            className="hc-icon-button"
            onClick={() => setSoundOn((v) => !v)}
            title="Toggle sound"
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            className="hc-icon-button"
            onClick={() => setShowGarage((v) => !v)}
            title="Garage"
          >
            <Wrench size={18} />
          </button>

          <button
            className="hc-icon-button"
            onClick={() => setPaused((v) => !v)}
            title="Pause"
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>

          <button
            className={`hc-icon-button hc-gyro-top-btn ${gyroEnabled ? "hc-gyro-btn--on" : ""}`}
            onClick={toggleGyro}
            title="Toggle Gyroscope / Device Tilt Control"
          >
            <span>📱 {gyroEnabled ? "GYRO ON" : "GYRO OFF"}</span>
          </button>

          <button className="hc-restart" onClick={handleRestart}>
            <RotateCcw size={16} />
            Restart
          </button>
        </div>
      </header>

      <main className="hc-main">
        <section className="hc-intro-row">
          <div>
            <span className="hc-kicker">HILL CLIMB RACING</span>
            <h1>Conquer the hills.</h1>
            <p>
              Collect coins, manage fuel and keep your wheels on the trail.
            </p>
          </div>

          <div className="hc-best">
            <Trophy size={18} />
            <div>
              <small>PERSONAL BEST</small>
              <strong>{save.bestDistance} m</strong>
            </div>
          </div>
        </section>

        <section className="hc-hud">
          <div className="hc-hud-item">
            <Gauge />
            <div>
              <small>DISTANCE</small>
              <strong>{hud.distance} <em>m</em></strong>
            </div>
          </div>

          <div className="hc-hud-item">
            <Coins />
            <div>
              <small>RUN COINS</small>
              <strong>{hud.coins}</strong>
            </div>
          </div>

          <div className="hc-hud-item">
            <Fuel />
            <div>
              <small>FUEL</small>
              <strong>{hud.fuel}%</strong>
            </div>
            <div className="hc-fuel-track">
              <span style={{ width: `${hud.fuel}%` }} />
            </div>
          </div>

          <div className="hc-hud-item">
            <Gauge />
            <div>
              <small>SPEED</small>
              <strong>{hud.speed} <em>km/h</em></strong>
            </div>
          </div>
        </section>

        <section className="hc-game-frame">
          <div className="hc-game-label">
            <span className="hc-live-dot" />
            LIVE RUN
            <span className="hc-flip-count">{hud.frontFlips} front · {hud.backFlips} back</span>
            <span>{vehicle.name}</span>
          </div>

          <canvas
            ref={canvasRef}
            className="hc-canvas"
            aria-label="Hill Climb Racing driving game"
          />

          {(paused || gameOver || showGarage) && (
            <div className="hc-overlay">
              {showGarage ? (
                <div className="hc-modal">
                  <div className="hc-modal-head">
                    <div>
                      <small>WORKSHOP</small>
                      <h2>Garage & upgrades</h2>
                    </div>

                    <button onClick={() => setShowGarage(false)}>
                      ✕
                    </button>
                  </div>

                  <p className="hc-wallet">
                    <Coins size={17} />
                    {save.coins} coins available
                  </p>

                  <div className="hc-upgrade-grid">
                    <div className="hc-upgrade">
                      <Wrench />
                      <h3>Engine level {save.engineLevel}</h3>
                      <p>More acceleration and climbing power.</p>
                      <button onClick={() => buyUpgrade("engine")}>
                        Upgrade · {save.engineLevel * 350} coins
                      </button>
                    </div>

                    <div className="hc-upgrade">
                      <Gauge />
                      <h3>Tyres level {save.tireLevel}</h3>
                      <p>Better grip and steadier landings.</p>
                      <button onClick={() => buyUpgrade("tires")}>
                        Upgrade · {save.tireLevel * 300} coins
                      </button>
                    </div>
                  </div>

                  <h3 className="hc-vehicle-heading">Vehicles</h3>

                  <div className="hc-vehicle-list">
                    {VEHICLES.map((v) => {
                      const owned = save.ownedVehicles.includes(v.id);

                      return (
                        <button
                          key={v.id}
                          className={`hc-vehicle ${
                            vehicleId === v.id ? "chosen" : ""
                          }`}
                          onClick={() => buyVehicle(v)}
                        >
                          <strong>{v.name}</strong>
                          <small>{v.description}</small>
                          <span>
                            {vehicleId === v.id
                              ? "Selected"
                              : owned
                                ? "Owned"
                                : `${v.cost} coins`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="hc-message">{message}</p>
                </div>
              ) : gameOver ? (
                <div className="hc-result">
                  <span className="hc-kicker">RUN COMPLETE</span>
                  <h2>Out of the trail!</h2>
                  <p className="hc-crash-reason">{hud.crashReason}</p>
                  <p>
                    You travelled <strong>{hud.distance} m</strong> and
                    collected <strong>{hud.coins} coins</strong>.
                  </p>
                  <p className="hc-flip-summary">
                    {hud.frontFlips} front flips · {hud.backFlips} back flips
                  </p>
                  {hud.newAchievements.length > 0 && (
                    <div className="hc-achievement-list">
                      {hud.newAchievements.map((achievement) => (
                        <span key={achievement}>Achievement unlocked: {ACHIEVEMENT_TITLES[achievement]}</span>
                      ))}
                    </div>
                  )}

                  <div className="hc-result-buttons">
                    <button onClick={handleRestart}>
                      <RotateCcw size={17} />
                      Try again
                    </button>

                    <button
                      className="hc-secondary"
                      onClick={() => setShowGarage(true)}
                    >
                      <Wrench size={17} />
                      Garage
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hc-result">
                  <Pause size={35} />
                  <h2>Game paused</h2>
                  <p>Your run is waiting.</p>
                  <button onClick={() => setPaused(false)}>
                    <Play size={17} />
                    Resume
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="hc-controls-row">
          <div className="hc-instructions">
            <strong>HOW TO DRIVE</strong>
            <span>← / A Brake</span>
            <span>→ / D Accelerate</span>
            <span>W / S Air rotation</span><span>P / Esc Pause</span>
          </div>

          <div className="hc-touch-controls">
            <button
              onPointerDown={(event) => setControl("brake", true, event)}
              onPointerUp={() => setControl("brake", false)}
              onPointerCancel={() => setControl("brake", false)}
              onLostPointerCapture={() => setControl("brake", false)}
            >
              BRAKE
            </button>

            <button
              onPointerDown={(event) => setControl("gas", true, event)}
              onPointerUp={() => setControl("gas", false)}
              onPointerCancel={() => setControl("gas", false)}
              onLostPointerCapture={() => setControl("gas", false)}
            >
              ACCELERATE
            </button>
            <button
              onPointerDown={(event) => setControl("rotateLeft", true, event)}
              onPointerUp={() => setControl("rotateLeft", false)}
              onPointerCancel={() => setControl("rotateLeft", false)}
              onLostPointerCapture={() => setControl("rotateLeft", false)}
            >
              ↶ FLIP
            </button>
            <button
              onPointerDown={(event) => setControl("rotateRight", true, event)}
              onPointerUp={() => setControl("rotateRight", false)}
              onPointerCancel={() => setControl("rotateRight", false)}
              onLostPointerCapture={() => setControl("rotateRight", false)}
            >
              FLIP ↷
            </button>
            <button
              type="button"
              className={`hc-gyro-touch-btn ${gyroEnabled ? "hc-gyro-btn--on" : ""}`}
              onClick={toggleGyro}
              title="Toggle Phone Tilt Control"
            >
              📱 TILT {gyroEnabled ? `ON [${gyroDir === "left" ? "◀" : gyroDir === "right" ? "▶" : "●"}]` : "OFF"}
            </button>
          </div>
        </section>

        <footer className="hc-footer">
          <span>CloudPlay · Hill Climb Racing</span>
          <span>
            Coins saved locally on this device · Best: {save.bestDistance} m
          </span>
        </footer>
      </main>
    </div>
  );
}

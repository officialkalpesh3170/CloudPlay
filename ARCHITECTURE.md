# CloudPlay Architecture Documentation

## 1. System Overview

CloudPlay is architected as a modern, client-rendered web platform with offline-first capabilities for local games and a dedicated authoritative Node.js WebSocket service for real-time multiplayer 3D action.

```mermaid
graph TD
    subgraph Frontend Client
        App[App.jsx Router] --> Layout[Layout.jsx Shell]
        App --> GamePlayer[GamePlayer.jsx Immersive Shell]
        
        GamePlayer --> AS[Arena Strike 3D FPS]
        GamePlayer --> TR[Trail Rush Canvas 2D]
        GamePlayer --> AF[Asteroid Fury Phaser 3]
        GamePlayer --> BD[Block Drop Phaser 3]
        GamePlayer --> LR[Ludo Royale React SVG]
        
        AS --> R3F[React Three Fiber Canvas]
        AS --> SoundSys[Web Audio Synthesizer]
        AS --> GameStore[Zustand useGameStore]
    end

    subgraph Backend Multiplayer Service (Node.js + Socket.IO)
        Server[server.js :4000] --> RM[RoomManager]
        RM --> Room[Room Instance]
        Room --> Match[Match Engine]
        Room --> CV[CombatValidator Anti-Cheat]
        Room --> NetLoop[30Hz Snapshot Broadcast]
    end

    GameStore <-->|WebSocket Events| Server
```

---

## 2. Multiplayer Architecture: CloudPlay Arena Strike

### Network Protocol & Server Authority

The multiplayer engine in `backend/multiplayer/` follows a strict **server-authoritative model**:

| Event | Direction | Payload | Processing / Validation |
|---|---|---|---|
| `room:list` | Client $\rightarrow$ Server | — | Returns array of open public arena rooms |
| `room:create` | Client $\rightarrow$ Server | `{ name, mode, maxPlayers, playerName, avatar }` | Instantiates room, allocates ID/code, assigns host |
| `room:join` | Client $\rightarrow$ Server | `{ roomIdOrCode, playerName, avatar }` | Validates capacity, balances teams (TDM), computes safe spawn |
| `player:move` | Client $\rightarrow$ Server | `{ pos, rot, vel, moving, sprinting, grounded }` | Validates max velocity threshold (anti-speedhack), arena vertical bounds |
| `player:shoot` | Client $\rightarrow$ Server | `{ weaponId, origin, direction, targetHit }` | Validates fire rate interval, active ammo count, distance to target, computes damage, checks lethal kills |
| `player:reload` | Client $\rightarrow$ Server | — | Initiates server-timed reload timer, updates reserve |
| `server:snapshot` | Server $\rightarrow$ Room | 30Hz broadcast: `{ t, state, timer, teamScores, players }` | Client applies smooth interpolation to remote operators |
| `player:damaged` | Server $\rightarrow$ Victim | `{ damage, hp, armor, attackerPos }` | Displays red directional hit flash, plays hurt audio |
| `player:hit_confirmed`| Server $\rightarrow$ Shooter | `{ isHeadshot, damage, remainingHp }` | Triggers dynamic "X" hitmarker and headshot chime |
| `player:killed` | Server $\rightarrow$ Room | `{ killerName, victimName, weapon, isHeadshot }` | Appends event to the real-time kill feed |
| `player:respawn` | Server $\rightarrow$ Room | `{ id, pos, hp, armor }` | Re-enables operator at safe spawn point |

---

## 3. 3D Graphics & Rendering Pipeline

- **Scene Graphs**: The 3D world is constructed with React Three Fiber primitives (`<mesh>`, `<boxGeometry>`, `<cylinderGeometry>`).
- **Materials**: Reusable `THREE.MeshStandardMaterial` instances with PBR roughness and metalness parameters for industrial steel, concrete, and painted shipping containers.
- **Atmospheric Effects**:
  - Distance fog (`#090d18`, near 25m, far 75m).
  - High-precision directional shadow mapping (`shadow-mapSize-width={1024}`).
  - Sodium orange (`#fb923c`) and cyan (`#38bdf8`) industrial accent spotlights.
- **Weapon Viewmodel**: Attached directly as a child of the first-person camera with dynamic procedural bobbing, ADS lerping, and recoil impulse recovery.
- **Zero Asset Dependencies**: All 3D meshes, textures, reticles, and particle effects are generated procedurally, ensuring lightning-fast load times.

---

## 4. Production Cloud Deployment Plan (Google Cloud Platform)

When deploying CloudPlay to production on GCP, the following configuration is recommended:

```
[Users / Browsers]
        │
        ▼
[Cloud Load Balancing (HTTPS / WSS Termination)]
        │
        ├───► [Cloud Storage + Cloud CDN] ─── Static Frontend Assets
        │
        └───► [Google Cloud Run / GKE] ────── Node.js WebSocket Game Server
                • Container: node:22-alpine
                • Resources: 2 vCPU, 2 GiB RAM
                • Session Affinity: Enabled
                • Auto-scaling: 1 to 10 instances based on concurrency
```

### Estimated GCP Monthly Running Costs

- **Cloud Run (1 active instance, 24/7)**: ~\$18 – \$24 / month
- **Cloud Load Balancer (1 forwarding rule)**: ~\$18 / month
- **Cloud Storage & CDN (Static distribution)**: ~\$2 – \$5 / month
- **Total Estimated Operating Cost**: **~\$38 – \$47 / month**

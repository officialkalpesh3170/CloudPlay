# CloudPlay game catalog and Ludo milestone report

**Updated:** 2026-10-31  
**Status:** Implemented locally and checked in the browser. No cloud resources were provisioned.

## Summary

The catalog now has eight games: Trail Rush and Ludo Royale run from this repository, while six independent creator-hosted browser games are displayed inside CloudPlay's own full-screen player. Catalog cards no longer link directly to another site. The external player iframe is sandboxed to prevent it navigating the top-level CloudPlay tab. Creator games remain remote and require internet access; they are not copied into the repository.

The new Ludo game is an original, local pass-and-play implementation for two, three, or four players. It includes a responsive board, turn tracking, dice, legal-move selection, launch-on-six, captures, safe squares, home lanes, exact-finish rules, extra turns, win detection, and quick rules.

## Current catalog

| Game | Genre | Runs from | Launch behavior |
| --- | --- | --- | --- |
| Trail Rush | 2D racing | CloudPlay repository | Local canvas game, with physics, garage, upgrades, coins, fuel, achievements, and save system. |
| Ludo Royale | Board | CloudPlay repository | Local React/SVG board game, pass-and-play for 2–4 players. |
| Super Kart 3D | 3D racing | Creator site | Embedded CloudPlay player; browser main menu confirmed. Upstream source reports MIT. |
| Grapple God: The Ascent | 2D platformer | Creator site | Embedded CloudPlay player; no redistribution license claimed. |
| Creature Quest 3D | Creature RPG | Creator site | Embedded CloudPlay player; game/account behavior remains creator-controlled. |
| Drift | 3D racing | Creator site | Embedded CloudPlay player; Makone lists MIT. |
| Snowdrift | 3D simulation | Creator site | Embedded CloudPlay player; Makone lists MIT. |
| Swarm | 3D action | Creator site | Embedded CloudPlay player; Makone lists MIT. |

## Work record

### Repository and architecture review

- Identified a React 19 / Vite / JavaScript frontend, a canvas-based Trail Rush game, and a FastAPI backend.
- Found a Firestore adapter in `backend/app/database/firestore.py`. Backend registration and user listing currently use Firestore directly; the app sets a fixed project ID. PostgreSQL schema, migrations, authentication, game-progress APIs, achievements, and leaderboard APIs are not implemented.
- Catalogued the existing dashboard, current Trail Rush features, backend limitations, and recommended development sequence in `PROGRESS.md`.

### Trail Rush physics milestone

- Preserved the current canvas, terrain, HUD, garage, vehicles, upgrades, keyboard/mobile controls, and localStorage save flow.
- Added independent front/rear wheel terrain contacts, spring/damping suspension, grip and traction, vehicle mass and chassis torque, air rotation, front/back flip tracking and rewards, distinct Jeep/Buggy/Truck handling, landing/crash handling, sound, achievements, and a richer run summary.
- Kept the physics engine and existing suite in `frontend/src/games/trailRushPhysics.js` and `frontend/src/games/trailRushPhysics.test.js`.

### Catalog and artwork milestone

- Replaced the prior mode-counting issue with six distinct creator-hosted browser games plus Trail Rush.
- Added search, categories, recently played state, a featured card, responsive card layouts, and original per-game SVG covers.
- Changed all creator-hosted entries to open inside the CloudPlay player. Removed direct external links from game cards and removed the player’s “open in new tab” controls. The iframe sandbox disallows top-level navigation.
- Added source/license notes and clearly distinguish original CloudPlay games from remotely hosted games in `frontend/GAME_SOURCES.md`.

### Ludo milestone

- Added a locally executed game, original cover art, responsive board, configurable 2–4 player hot-seat setup, dice, movement selection, safe squares, captures, exact home entry, turn passing, and victory state.
- Added home-base token visibility and keyboard/screen-reader labels for actionable tokens.
- Added board-game genre filtering and player count/progress indicators.

## Files maintained for this work

- `frontend/src/App.jsx` — card launch routing, local Ludo routing, and the embedded CloudPlay player.
- `frontend/src/games/catalog.js` — all eight data-driven game cards and categories.
- `frontend/src/games/Ludo.jsx` and `frontend/src/games/Ludo.css` — playable local board game and responsive layout.
- `frontend/public/game-covers/ludo-royale.svg` — original Ludo cover illustration; earlier local covers remain under `frontend/public/game-covers/`.
- `frontend/GAME_SOURCES.md` — sources, hosting, and license notes.
- `PROGRESS.md` — cumulative development checklist and outstanding work.
- `GAME_CATALOG_REPORT.md` — this milestone history, implementation record, and verification results.

To start the frontend locally, run `npm run dev -- --host 127.0.0.1` from `frontend/`.

## Verification record

- `npm run build` — passed.
- `npm run lint` — passed after removing unused game state declarations.
- `npm test` — passed all 8 existing Trail Rush physics tests.
- Browser: Ludo entered the dashboard as an eighth game and opened inside the same local application.
- Browser: deterministically rolled a six in Ludo, found four legal launch choices, launched a token, and confirmed the extra turn.
- Browser: selected a 2-player match, exercised the no-legal-move/pass flow, and verified the next active player.
- Browser: Ludo fit a 390 px viewport; its board measured 351 px wide and the document had no horizontal overflow.
- Browser: Super Kart opened to its creator-hosted main menu in an iframe while the parent URL remained `http://127.0.0.1:5173/`; no game-card anchors remain.

## Current limits and follow-up

- The six creator games still execute on their creators' sites inside an iframe. They are not bundled or saved in this project. Their owners control uptime, content, progress, account prompts, and embedding policy. If a game blocks iframe embedding, it will not launch here; the current UI intentionally does not redirect away as a fallback.
- Ludo is local pass-and-play only. It has no bot opponent, network multiplayer, saved match state, or server leaderboard.
- Accounts and platform-level user statistics, achievements, and cross-game progress remain unimplemented.
- The backend continues to use its existing fixed Firestore project configuration. No GCP service was created or changed as part of this work.
- Catalog art is original local SVG cover illustration, not screenshots from the creator games.

## Source references

- [Super Kart 3D source](https://github.com/fecolinhares/super-kart-3djs)
- [Makone game gallery](https://www.makone.dev/gallery.html?type=game) and [source repository](https://github.com/wormholeportal/Makone)
- [The Ascent overview](https://kevinlewis.net/projects/the-ascent/) and [playable build](https://ejrossma.github.io/GrappleGod/)
- [Creature Quest 3D](https://creature-quest.kleap.io/)

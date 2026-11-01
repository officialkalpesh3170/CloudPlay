import { useMemo, useState } from "react";
import { ArrowLeft, Dices, RotateCcw, ShieldCheck, Trophy } from "lucide-react";
import "./Ludo.css";

const PLAYERS = [
  { id: "red", name: "Ruby", color: "#ff5e70", start: 49, base: [9, 0], homes: [[10, 1], [10, 4], [13, 1], [13, 4]], lane: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]] },
  { id: "green", name: "Mint", color: "#48d6a0", start: 10, base: [0, 0], homes: [[1, 1], [1, 4], [4, 1], [4, 4]], lane: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]] },
  { id: "yellow", name: "Solar", color: "#ffc34d", start: 24, base: [0, 9], homes: [[1, 10], [1, 13], [4, 10], [4, 13]], lane: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]] },
  { id: "blue", name: "Azure", color: "#5c9aff", start: 36, base: [9, 9], homes: [[10, 10], [10, 13], [13, 10], [13, 13]], lane: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]] },
];

// The 52 public squares form the ring around the four home bases.
const TRACK = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14], [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0],
];

const SAFE_TRACK = new Set(PLAYERS.flatMap((player) => [player.start, (player.start + 8) % TRACK.length]));
const TRACK_CELLS = new Map(TRACK.map(([row, col], index) => [`${row},${col}`, index]));
const HOME_SPOTS = new Set(PLAYERS.flatMap((player) => player.homes.map(([row, col]) => `${row},${col}`)));
const PIP_POSITIONS = {
  1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};

function baseForCell(row, col) {
  if (row <= 5 && col <= 5) return "green";
  if (row <= 5 && col >= 9) return "yellow";
  if (row >= 9 && col <= 5) return "red";
  if (row >= 9 && col >= 9) return "blue";
  return null;
}

function tokenCell(player, token) {
  if (token.steps < 0) return player.homes[token.index];
  if (token.steps >= 58) return [7, 7];
  if (token.steps >= 52) return player.lane[token.steps - 52];
  return TRACK[(player.start + token.steps) % TRACK.length];
}

function createTokens() {
  return Object.fromEntries(PLAYERS.map((player) => [player.id, Array.from({ length: 4 }, (_, index) => ({ index, steps: -1 }))]));
}

function getLegalTokens(tokens, player, roll) {
  if (!roll) return [];
  return tokens[player.id].filter((token) => {
    if (token.steps >= 58) return false;
    if (token.steps === -1) return roll === 6;
    return token.steps + roll <= 57;
  }).map((token) => token.index);
}

function DiceFace({ value }) {
  if (!value) return <div className="ludo-die ludo-die-empty" aria-label="Dice not rolled"><Dices size={27} /></div>;
  return <div className={`ludo-die die-${value}`} role="img" aria-label={`Dice shows ${value}`}>
    {Array.from({ length: 9 }, (_, index) => <i key={index} className={PIP_POSITIONS[value].includes(index) ? "pip visible" : "pip"} />)}
  </div>;
}

function LudoGame({ onExit }) {
  const [playerCount, setPlayerCount] = useState(4);
  const [activeIds, setActiveIds] = useState(["red", "green", "yellow", "blue"]);
  const [tokens, setTokens] = useState(createTokens);
  const [turnIndex, setTurnIndex] = useState(0);
  const [phase, setPhase] = useState("roll");
  const [dice, setDice] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState("Ruby rolls first. Roll a six to bring a token onto the board.");
  const [turnsTaken, setTurnsTaken] = useState(0);

  const activePlayer = PLAYERS.find((player) => player.id === activeIds[turnIndex]);
  const occupiedCells = useMemo(() => {
    const map = new Map();
    PLAYERS.forEach((player) => tokens[player.id].forEach((token) => {
      if (token.steps >= 58) return;
      const [row, col] = tokenCell(player, token);
      const key = `${row},${col}`;
      map.set(key, [...(map.get(key) || []), { player, token }]);
    }));
    return map;
  }, [tokens]);

  const finishedCount = activeIds.reduce((sum, id) => sum + tokens[id].filter((token) => token.steps >= 58).length, 0);

  const startMatch = (count = playerCount) => {
    const ids = count === 2 ? ["red", "yellow"] : count === 3 ? ["red", "green", "blue"] : PLAYERS.map((player) => player.id);
    setPlayerCount(count);
    setActiveIds(ids);
    setTokens(createTokens());
    setTurnIndex(0);
    setPhase("roll");
    setDice(null);
    setLegalMoves([]);
    setWinner(null);
    setTurnsTaken(0);
    setMessage(`${PLAYERS.find((player) => player.id === ids[0]).name} rolls first. Roll a six to bring a token onto the board.`);
  };

  const rollDice = () => {
    if (phase !== "roll" || winner) return;
    const result = Math.floor(Math.random() * 6) + 1;
    const moves = getLegalTokens(tokens, activePlayer, result);
    setDice(result);
    setTurnsTaken((count) => count + 1);
    if (!moves.length) {
      setLegalMoves([]);
      setPhase("skip");
      setMessage(`${activePlayer.name} rolled ${result}. No token can move, so pass the dice.`);
      return;
    }
    setLegalMoves(moves);
    setPhase("move");
    setMessage(result === 6 ? `${activePlayer.name} rolled a six! Choose a token to launch or move.` : `${activePlayer.name} rolled ${result}. Choose a glowing token.`);
  };

  const passTurn = () => {
    if (phase !== "skip") return;
    const nextIndex = (turnIndex + 1) % activeIds.length;
    setTurnIndex(nextIndex);
    setPhase("roll");
    setDice(null);
    setLegalMoves([]);
    setMessage(`${PLAYERS.find((player) => player.id === activeIds[nextIndex]).name}'s turn. Pass the device and roll.`);
  };

  const moveToken = (tokenIndex) => {
    if (phase !== "move" || !legalMoves.includes(tokenIndex)) return;
    const movingToken = tokens[activePlayer.id][tokenIndex];
    const nextSteps = movingToken.steps < 0 ? 0 : movingToken.steps + dice;
    const finished = nextSteps === 57;
    let captured = false;
    const updated = Object.fromEntries(Object.entries(tokens).map(([id, pieces]) => [id, pieces.map((piece) => ({ ...piece }))]));
    updated[activePlayer.id][tokenIndex].steps = finished ? 58 : nextSteps;

    if (nextSteps <= 51) {
      const landingIndex = (activePlayer.start + nextSteps) % TRACK.length;
      if (!SAFE_TRACK.has(landingIndex)) {
        activeIds.filter((id) => id !== activePlayer.id).forEach((id) => {
          updated[id] = updated[id].map((piece) => {
            if (piece.steps < 0 || piece.steps > 51) return piece;
            const opponent = PLAYERS.find((player) => player.id === id);
            const opponentIndex = (opponent.start + piece.steps) % TRACK.length;
            if (opponentIndex !== landingIndex) return piece;
            captured = true;
            return { ...piece, steps: -1 };
          });
        });
      }
    }

    const hasWon = updated[activePlayer.id].every((piece) => piece.steps >= 58);
    setTokens(updated);
    setLegalMoves([]);
    setDice(dice);

    if (hasWon) {
      setWinner(activePlayer.id);
      setPhase("won");
      setMessage(`${activePlayer.name} brought all four tokens home and wins the match!`);
      return;
    }

    const extraTurn = dice === 6 || captured;
    if (captured) setMessage(`${activePlayer.name} captured a rival token${dice === 6 ? " and rolled a six" : ""}! Roll again.`);
    else if (finished) setMessage(`${activePlayer.name} finished a token${dice === 6 ? " and rolled a six" : ""}! Roll again.`);
    else if (dice === 6) setMessage(`${activePlayer.name} rolled a six! Take another turn.`);
    else setMessage(`${activePlayer.name} moved ${dice} spaces. Pass the device to the next player.`);

    if (extraTurn) {
      setPhase("roll");
    } else {
      const nextIndex = (turnIndex + 1) % activeIds.length;
      setTurnIndex(nextIndex);
      setPhase("roll");
      setDice(null);
      setMessage(captured
        ? `${activePlayer.name} captured a token and earns another roll.`
        : `${PLAYERS.find((player) => player.id === activeIds[nextIndex]).name}'s turn. Pass the device and roll.`);
    }
  };

  const cells = [];
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      const key = `${row},${col}`;
      const trackIndex = TRACK_CELLS.get(key);
      const laneOwner = PLAYERS.find((player) => player.lane.some(([r, c]) => r === row && c === col));
      const baseOwner = baseForCell(row, col);
      const playersHere = occupiedCells.get(key) || [];
      const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;
      const isHomeSpot = HOME_SPOTS.has(key);

      const movableToken = playersHere.find(
        ({ player, token }) => player.id === activePlayer.id && legalMoves.includes(token.index) && phase === "move"
      );

      const cellClass = [
        "ludo-square",
        trackIndex !== undefined ? "is-track" : "",
        laneOwner ? `lane-${laneOwner.id}` : "",
        baseOwner ? `base-${baseOwner}` : "",
        isHomeSpot ? "home-spot" : "",
        isCenter ? "center-underlay" : "",
        trackIndex !== undefined && SAFE_TRACK.has(trackIndex) ? "safe-square" : "",
        movableToken ? "is-movable-square" : "",
      ].filter(Boolean).join(" ");

      cells.push(<div
        key={key}
        className={cellClass}
        style={{ gridRow: row + 1, gridColumn: col + 1 }}
        onClick={movableToken ? () => moveToken(movableToken.token.index) : undefined}
        role={movableToken ? "button" : undefined}
        tabIndex={movableToken ? 0 : undefined}
        aria-label={movableToken ? `Move ${activePlayer.name} token ${movableToken.token.index + 1}` : undefined}
      >
        {trackIndex !== undefined && SAFE_TRACK.has(trackIndex) && <span className="safe-star" aria-hidden="true">✦</span>}
        {isHomeSpot && <span className="home-pad" />}
        {(trackIndex !== undefined || laneOwner || isHomeSpot || isCenter) && playersHere.length > 0 && <div className={`ludo-token-pile ${playersHere.length > 1 ? "pile-many" : ""}`}>
          {playersHere.map(({ player, token }) => {
            const isCurrent = player.id === activePlayer.id;
            const canMove = isCurrent && legalMoves.includes(token.index) && phase === "move";
            const isFinished = token.steps >= 58;
            return <button
              type="button"
              key={`${player.id}-${token.index}`}
              className={`ludo-token token-${player.id} ${canMove ? "token-legal" : ""} ${isFinished ? "token-finished" : ""}`}
              disabled={!canMove}
              onClick={(e) => {
                e.stopPropagation();
                moveToken(token.index);
              }}
              aria-label={`${player.name}, token ${token.index + 1}${canMove ? ", move this token" : ""}`}
              title={`${player.name} token ${token.index + 1}`}
            >{isFinished ? "★" : token.index + 1}</button>;
          })}
        </div>}
      </div>);
    }
  }

  return <main className="ludo-screen">
    <header className="ludo-header">
      <button className="ludo-back" type="button" onClick={onExit}><ArrowLeft size={18} /> CloudPlay</button>
      <div className="ludo-brand"><span className="ludo-brand-mark">L</span><div><strong>Ludo Royale</strong><small>CloudPlay local multiplayer</small></div></div>
      <div className="ludo-match-count"><span>{turnsTaken}</span><small>ROLLS</small></div>
    </header>

    <div className="ludo-layout">
      <section className="ludo-board-wrap" aria-label="Ludo game board">
        {/* Mobile Quick Action HUD: visible on mobile so players never need to scroll */}
        <div className="ludo-mobile-hud">
          <div className={`ludo-mobile-turn active-${activePlayer.id}`}>
            <span className="active-player-dot" />
            <div className="ludo-mobile-turn-info">
              <small>{winner ? "CHAMPION" : "TURN"}</small>
              <strong>{PLAYERS.find((player) => player.id === winner)?.name || activePlayer.name}</strong>
            </div>
            <span className="ludo-mobile-home-stat">
              {winner ? <Trophy size={16} /> : `${tokens[activePlayer.id].filter((t) => t.steps >= 58).length}/4`}
            </span>
          </div>

          <div className="ludo-mobile-action-group">
            <div
              className={`ludo-mobile-die ${phase === "roll" && !winner ? "can-tap" : ""}`}
              onClick={phase === "roll" && !winner ? rollDice : undefined}
              role={phase === "roll" && !winner ? "button" : undefined}
              title={phase === "roll" && !winner ? "Tap to roll dice" : undefined}
            >
              <DiceFace value={dice} />
            </div>

            <div className="ludo-mobile-buttons">
              {phase === "roll" && !winner && (
                <button type="button" className="ludo-roll ludo-roll--mobile" onClick={rollDice}>
                  <Dices size={16} /> Roll
                </button>
              )}
              {phase === "skip" && (
                <button type="button" className="ludo-roll ludo-roll--mobile" onClick={passTurn}>
                  Pass ⏭
                </button>
              )}
              {phase === "move" && (
                legalMoves.length === 1 ? (
                  <button
                    type="button"
                    className="ludo-roll ludo-roll--mobile ludo-roll--move"
                    onClick={() => moveToken(legalMoves[0])}
                  >
                    Move #{legalMoves[0] + 1}
                  </button>
                ) : (
                  <span className="ludo-mobile-hint">Tap piece</span>
                )
              )}
              {winner && (
                <button type="button" className="ludo-roll ludo-roll--mobile" onClick={() => startMatch(playerCount)}>
                  <RotateCcw size={15} /> Again
                </button>
              )}
            </div>
          </div>
          <p className="ludo-mobile-message" aria-live="polite">{message}</p>
        </div>

        <div className="ludo-board" role="group" aria-label="Ludo board with red, green, yellow and blue paths">
          {cells}
          <div className="ludo-center"><span>HOME</span>{winner && <Trophy size={17} />}</div>
        </div>
        <div className="ludo-board-legend"><span><i className="legend-safe" /> Safe square</span><span><i className="legend-finish" /> Home lane</span><span>{finishedCount} tokens home</span></div>
      </section>

      <aside className="ludo-panel">
        <div className="ludo-panel-top"><span className="ludo-eyebrow">LOCAL PASS & PLAY</span><h1>Roll. Race. <em>Reign.</em></h1><p>One screen, four colors, and a little bit of luck.</p></div>

        <div className={`ludo-active-player active-${activePlayer.id}`}>
          <span className="active-player-dot" />
          <div><small>{winner ? "MATCH CHAMPION" : "UP NEXT"}</small><strong>{PLAYERS.find((player) => player.id === winner)?.name || activePlayer.name}</strong></div>
          <span className="active-token-count">{winner ? <Trophy size={18} /> : `${tokens[activePlayer.id].filter((token) => token.steps >= 58).length}/4 HOME`}</span>
        </div>

        <div className="ludo-dice-area">
          <DiceFace value={dice} />
          {phase === "roll" && !winner && <button type="button" className="ludo-roll" onClick={rollDice}><Dices size={18} /> Roll dice</button>}
          {phase === "skip" && <button type="button" className="ludo-roll" onClick={passTurn}>No move · Continue</button>}
          {phase === "move" && <p className="ludo-choose-hint">Choose a glowing token on the board</p>}
          {winner && <button type="button" className="ludo-roll" onClick={() => startMatch(playerCount)}><RotateCcw size={16} /> Play again</button>}
          <p className="ludo-message" aria-live="polite">{message}</p>
        </div>

        <div className="ludo-player-list">
          <div className="ludo-list-heading"><h2>Players</h2><span>{activeIds.length} playing</span></div>
          {activeIds.map((id) => {
            const player = PLAYERS.find((item) => item.id === id);
            const isActive = !winner && activePlayer.id === id;
            return <div key={id} className={`ludo-player-row ${isActive ? "is-turn" : ""}`}>
              <span className={`player-chip chip-${id}`} />
              <strong>{player.name}</strong>
              <span className="player-progress">{tokens[id].filter((token) => token.steps >= 58).length} / 4 home</span>
              {isActive && <span className="turn-pill">TURN</span>}
            </div>;
          })}
        </div>

        <div className="ludo-setup">
          <div className="ludo-list-heading"><h2>Match setup</h2><span>Same-device play</span></div>
          <label htmlFor="ludo-player-count">Number of players</label>
          <div className="ludo-setup-row"><select id="ludo-player-count" value={playerCount} onChange={(event) => setPlayerCount(Number(event.target.value))}><option value={2}>2 players</option><option value={3}>3 players</option><option value={4}>4 players</option></select><button type="button" onClick={() => startMatch(playerCount)}>New match</button></div>
        </div>

        <div className="ludo-rules"><div><ShieldCheck size={16} /><strong>Quick rules</strong></div><p>Roll a 6 to leave base. A 6 or a capture earns another roll. Click a highlighted token to move; reach the center with an exact roll. Safe stars protect tokens from capture.</p></div>
      </aside>
    </div>
    <footer className="ludo-footer">All players share this device. Pass it after each turn. <span>Original CloudPlay board game</span></footer>
  </main>;
}

export default LudoGame;

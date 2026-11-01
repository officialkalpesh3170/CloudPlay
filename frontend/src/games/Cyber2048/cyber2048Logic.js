/**
 * Cyber 2048 Game Logic
 *
 * Based on the classic open-source 2048 puzzle game by Gabriele Cirulli (MIT License).
 * Pure functional game matrix operations with zero side effects.
 */

export const BOARD_SIZES = {
  3: { label: "Blitz (3x3)", size: 3, winTarget: 1024 },
  4: { label: "Classic (4x4)", size: 4, winTarget: 2048 },
  5: { label: "Expanded (5x5)", size: 5, winTarget: 4096 },
};

/**
 * Creates an empty square board of given size (default 4x4).
 * @param {number} size
 * @returns {number[][]}
 */
export function createEmptyBoard(size = 4) {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

/**
 * Finds all empty [row, col] coordinates on the board.
 * @param {number[][]} board
 * @returns {Array<[number, number]>}
 */
export function getEmptyCells(board) {
  const empty = [];
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) {
        empty.push([r, c]);
      }
    }
  }
  return empty;
}

/**
 * Spawns a new tile (90% chance of 2, 10% chance of 4) in an empty cell.
 * Returns a new board copy, or the same board if no empty cells exist.
 * @param {number[][]} board
 * @param {number} [tileValue] - optional override for testing
 * @returns {number[][]}
 */
export function spawnRandomTile(board, tileValue = null) {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return board;

  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = tileValue !== null ? tileValue : Math.random() < 0.9 ? 2 : 4;

  const nextBoard = board.map((r) => [...r]);
  nextBoard[row][col] = value;
  return nextBoard;
}

/**
 * Initializes a new board with 2 random tiles spawned.
 * @param {number} size
 * @returns {number[][]}
 */
export function initializeBoard(size = 4) {
  let board = createEmptyBoard(size);
  board = spawnRandomTile(board);
  board = spawnRandomTile(board);
  return board;
}

/**
 * Compresses and merges a single line (array of numbers) to the left.
 * Follows standard 2048 rules:
 * - Slide all non-zero numbers to the left.
 * - Merge adjacent identical numbers once per move.
 * - Returns the new line, score gained, and whether any tiles moved/merged.
 *
 * Example: [2, 2, 4, 8] -> line: [4, 4, 8, 0], score: 4
 * Example: [2, 2, 2, 0] -> line: [4, 2, 0, 0], score: 4
 * Example: [4, 4, 4, 4] -> line: [8, 8, 0, 0], score: 16
 *
 * @param {number[]} line
 * @returns {{ line: number[], score: number, moved: boolean, mergedCount: number }}
 */
export function slideAndMergeLine(line) {
  const size = line.length;
  const filtered = line.filter((val) => val !== 0);
  const newLine = [];
  let score = 0;
  let mergedCount = 0;

  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const mergedVal = filtered[i] * 2;
      newLine.push(mergedVal);
      score += mergedVal;
      mergedCount++;
      i += 2;
    } else {
      newLine.push(filtered[i]);
      i += 1;
    }
  }

  while (newLine.length < size) {
    newLine.push(0);
  }

  const moved = !line.every((val, idx) => val === newLine[idx]);

  return { line: newLine, score, moved, mergedCount };
}

/**
 * Rotates a 2D matrix 90 degrees clockwise.
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
export function rotateClockwise(matrix) {
  const size = matrix.length;
  const result = createEmptyBoard(size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      result[c][size - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

/**
 * Rotates a 2D matrix 90 degrees counter-clockwise.
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
export function rotateCounterClockwise(matrix) {
  const size = matrix.length;
  const result = createEmptyBoard(size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      result[size - 1 - c][r] = matrix[r][c];
    }
  }
  return result;
}

/**
 * Rotates a 2D matrix 180 degrees.
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
export function rotate180(matrix) {
  const size = matrix.length;
  const result = createEmptyBoard(size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      result[size - 1 - r][size - 1 - c] = matrix[r][c];
    }
  }
  return result;
}

/**
 * Executes a move in the given direction ("left", "right", "up", "down").
 *
 * @param {number[][]} board
 * @param {"left"|"right"|"up"|"down"} direction
 * @returns {{
 *   board: number[][],
 *   scoreGained: number,
 *   moved: boolean,
 *   mergedCount: number,
 *   maxTile: number
 * }}
 */
export function moveBoard(board, direction) {
  let transformed;
  let rotations = 0;

  // Orient matrix so that the movement corresponds to sliding left
  if (direction === "left") {
    transformed = board.map((r) => [...r]);
    rotations = 0;
  } else if (direction === "right") {
    transformed = rotate180(board);
    rotations = 2;
  } else if (direction === "up") {
    transformed = rotateCounterClockwise(board);
    rotations = 3;
  } else if (direction === "down") {
    transformed = rotateClockwise(board);
    rotations = 1;
  } else {
    throw new Error(`Invalid direction: ${direction}`);
  }

  let totalScoreGained = 0;
  let anyMoved = false;
  let totalMergedCount = 0;
  const size = transformed.length;
  const processedRows = [];

  for (let r = 0; r < size; r++) {
    const { line, score, moved, mergedCount } = slideAndMergeLine(transformed[r]);
    processedRows.push(line);
    totalScoreGained += score;
    if (moved) anyMoved = true;
    totalMergedCount += mergedCount;
  }

  // Restore original orientation
  let resultBoard = processedRows;
  if (rotations === 2) {
    resultBoard = rotate180(resultBoard);
  } else if (rotations === 3) {
    resultBoard = rotateClockwise(resultBoard);
  } else if (rotations === 1) {
    resultBoard = rotateCounterClockwise(resultBoard);
  }

  let maxTile = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (resultBoard[r][c] > maxTile) {
        maxTile = resultBoard[r][c];
      }
    }
  }

  return {
    board: resultBoard,
    scoreGained: totalScoreGained,
    moved: anyMoved,
    mergedCount: totalMergedCount,
    maxTile,
  };
}

/**
 * Checks if any valid moves remain on the board.
 * A move is valid if there are empty cells or adjacent matching tiles.
 * @param {number[][]} board
 * @returns {boolean}
 */
export function canMove(board) {
  const size = board.length;

  // Check for any empty cell
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) return true;
    }
  }

  // Check for adjacent matches horizontally and vertically
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const current = board[r][c];
      // Check right neighbor
      if (c + 1 < size && current === board[r][c + 1]) return true;
      // Check down neighbor
      if (r + 1 < size && current === board[r + 1][c]) return true;
    }
  }

  return false;
}

/**
 * Checks if the board contains a tile that has reached the target value.
 * @param {number[][]} board
 * @param {number} [target=2048]
 * @returns {boolean}
 */
export function hasReachedTarget(board, target = 2048) {
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] >= target) return true;
    }
  }
  return false;
}

/**
 * Finds the highest tile value currently on the board.
 * @param {number[][]} board
 * @returns {number}
 */
export function getHighestTile(board) {
  let highest = 0;
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] > highest) {
        highest = board[r][c];
      }
    }
  }
  return highest;
}

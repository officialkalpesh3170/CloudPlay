import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createEmptyBoard,
  getEmptyCells,
  spawnRandomTile,
  slideAndMergeLine,
  moveBoard,
  canMove,
  hasReachedTarget,
  getHighestTile,
} from "./Cyber2048/cyber2048Logic.js";

describe("Cyber 2048 Game Logic", () => {
  it("creates an empty board of default 4x4", () => {
    const board = createEmptyBoard(4);
    assert.equal(board.length, 4);
    assert.equal(board[0].length, 4);
    const emptyCells = getEmptyCells(board);
    assert.equal(emptyCells.length, 16);
  });

  it("spawns a random tile in an empty cell", () => {
    const board = createEmptyBoard(4);
    const nextBoard = spawnRandomTile(board, 2);
    const emptyCells = getEmptyCells(nextBoard);
    assert.equal(emptyCells.length, 15);
  });

  describe("slideAndMergeLine", () => {
    it("slides numbers left when zeroes are present", () => {
      const res = slideAndMergeLine([0, 2, 0, 4]);
      assert.deepEqual(res.line, [2, 4, 0, 0]);
      assert.equal(res.score, 0);
      assert.equal(res.moved, true);
    });

    it("merges adjacent identical tiles", () => {
      const res = slideAndMergeLine([2, 2, 4, 8]);
      assert.deepEqual(res.line, [4, 4, 8, 0]);
      assert.equal(res.score, 4);
      assert.equal(res.moved, true);
    });

    it("does not cascade merge triple identical tiles", () => {
      // In 2048, [2, 2, 2, 0] merges only the first pair: -> [4, 2, 0, 0]
      const res = slideAndMergeLine([2, 2, 2, 0]);
      assert.deepEqual(res.line, [4, 2, 0, 0]);
      assert.equal(res.score, 4);
    });

    it("merges two distinct pairs in one line", () => {
      const res = slideAndMergeLine([4, 4, 4, 4]);
      assert.deepEqual(res.line, [8, 8, 0, 0]);
      assert.equal(res.score, 16);
    });

    it("reports moved: false if no movement or merge occurs", () => {
      const res = slideAndMergeLine([2, 4, 8, 16]);
      assert.deepEqual(res.line, [2, 4, 8, 16]);
      assert.equal(res.score, 0);
      assert.equal(res.moved, false);
    });
  });

  describe("moveBoard in all directions", () => {
    it("moves left correctly", () => {
      const board = [
        [2, 2, 0, 0],
        [4, 0, 4, 0],
        [0, 0, 0, 0],
        [2, 4, 8, 16],
      ];
      const result = moveBoard(board, "left");
      assert.equal(result.moved, true);
      assert.deepEqual(result.board[0], [4, 0, 0, 0]);
      assert.deepEqual(result.board[1], [8, 0, 0, 0]);
      assert.deepEqual(result.board[2], [0, 0, 0, 0]);
      assert.deepEqual(result.board[3], [2, 4, 8, 16]);
      assert.equal(result.scoreGained, 4 + 8);
    });

    it("moves right correctly", () => {
      const board = [
        [2, 2, 0, 0],
        [4, 0, 4, 0],
        [0, 0, 0, 0],
        [2, 4, 8, 16],
      ];
      const result = moveBoard(board, "right");
      assert.equal(result.moved, true);
      assert.deepEqual(result.board[0], [0, 0, 0, 4]);
      assert.deepEqual(result.board[1], [0, 0, 0, 8]);
    });

    it("moves up correctly", () => {
      const board = [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [4, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const result = moveBoard(board, "up");
      assert.equal(result.moved, true);
      assert.equal(result.board[0][0], 4);
      assert.equal(result.board[1][0], 4);
      assert.equal(result.board[2][0], 0);
      assert.equal(result.board[3][0], 0);
    });

    it("moves down correctly", () => {
      const board = [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [4, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const result = moveBoard(board, "down");
      assert.equal(result.moved, true);
      assert.equal(result.board[2][0], 4);
      assert.equal(result.board[3][0], 4);
    });
  });

  describe("canMove and Game Over detection", () => {
    it("returns true when empty cells exist", () => {
      const board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 0], // one empty cell
      ];
      assert.equal(canMove(board), true);
    });

    it("returns true when board is full but adjacent match exists horizontally", () => {
      const board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 32], // adjacent 32, 32
      ];
      assert.equal(canMove(board), true);
    });

    it("returns true when board is full but adjacent match exists vertically", () => {
      const board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [512, 16, 32, 64], // column 0 has 512, 512
      ];
      assert.equal(canMove(board), true);
    });

    it("returns false (Game Over) when board is completely blocked", () => {
      const board = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
      ];
      assert.equal(canMove(board), false);
    });
  });

  describe("Win condition and max tile", () => {
    it("detects win condition at target 2048", () => {
      const board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4],
        [2, 4, 8, 16],
      ];
      assert.equal(hasReachedTarget(board, 2048), true);
      assert.equal(getHighestTile(board), 2048);
    });

    it("does not trigger win if highest tile is below target", () => {
      const board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 1024, 4],
        [2, 4, 8, 16],
      ];
      assert.equal(hasReachedTarget(board, 2048), false);
      assert.equal(getHighestTile(board), 1024);
    });
  });
});

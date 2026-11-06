import assert from "node:assert/strict";
import test from "node:test";
import { createScoreboard, memoryStorage } from "../js/scores.js";
import { scoreShot } from "../js/scoring.js";

function entry(name, score, extra = {}) {
  return {
    name,
    score,
    bestStreak: extra.bestStreak ?? 1,
    made: extra.made ?? 1,
    attempts: extra.attempts ?? 2,
    at: extra.at ?? "2026-01-01T00:00:00.000Z",
    id: extra.id,
  };
}

test("scores sort, cap at 10, and reject junk", () => {
  const board = createScoreboard(memoryStorage());
  assert.equal(board.best(), 0);
  assert.equal(board.qualifies(0), false);
  assert.equal(board.submit({ name: "!!!", score: 5, bestStreak: 0, made: 0, attempts: 1 }).saved, false);

  for (let i = 1; i <= 10; i += 1) {
    const saved = board.submit(entry(`P${i}`, i * 2, { id: `id-${i}`, at: `2026-01-${String(i).padStart(2, "0")}T00:00:00.000Z` }));
    assert.equal(saved.saved, true);
  }
  assert.equal(board.list().length, 10);
  assert.equal(board.list()[0].score, 20);
  assert.equal(board.qualifies(2), false);
  assert.equal(board.qualifies(3), true);
  const bumped = board.submit(entry("ace", 6, { id: "new" }));
  assert.equal(bumped.saved, true);
  assert.equal(board.list().some((item) => item.score === 2), false);
  assert.equal(board.list().some((item) => item.name === "ACE"), true);
});

test("corrupt storage comes back as an empty board", () => {
  const storage = memoryStorage({ "hoopflick.scores.v1": "{not json" });
  const board = createScoreboard(storage);
  assert.deepEqual(board.list(), []);
  const saved = board.submit(entry("mo", 8));
  assert.equal(saved.saved, true);
  assert.equal(saved.persisted, true);
  assert.equal(JSON.parse(storage.getItem("hoopflick.scores.v1")).length, 1);
});

test("a full board of equal scores is not displaced by a tie", () => {
  const board = createScoreboard(memoryStorage());
  for (let i = 0; i < 10; i += 1) {
    board.submit(entry("AA", 10, { id: `tie-${i}`, at: `2026-02-${String(i + 1).padStart(2, "0")}T00:00:00.000Z` }));
  }
  assert.equal(board.qualifies(10), false);
  assert.equal(board.qualifies(11), true);
});

test("storage failures keep the score in memory", () => {
  const storage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error("quota");
    },
  };
  const board = createScoreboard(storage);
  const saved = board.submit(entry("bo", 9));
  assert.equal(saved.saved, true);
  assert.equal(saved.persisted, false);
  assert.equal(board.best(), 9);
});

test("streak bonuses grow and then cap", () => {
  const first = scoreShot(2, { swish: true, bank: false, streakBefore: 0 });
  assert.deepEqual({ total: first.total, label: first.label, streak: first.streak }, {
    total: 3,
    label: "SWISH",
    streak: 1,
  });
  const third = scoreShot(3, { swish: false, bank: true, streakBefore: 2 });
  assert.equal(third.label, "BANK");
  assert.equal(third.total, 5);
  const long = scoreShot(2, { swish: false, bank: false, streakBefore: 8 });
  assert.equal(long.total, 5);
});

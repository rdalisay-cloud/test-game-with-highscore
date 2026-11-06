import { MAX_SCORES, SCORE_KEY } from "./constants.js";

const NAME_PATTERN = /^[A-Z0-9]{1,3}$/;

export function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
  };
}

function compareEntries(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
  return a.at.localeCompare(b.at);
}

function sanitize(raw) {
  if (!raw || typeof raw !== "object") return null;
  const name = String(raw.name ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3);
  const score = raw.score;
  const bestStreak = raw.bestStreak ?? 0;
  const made = raw.made ?? 0;
  const attempts = raw.attempts ?? 0;
  if (!NAME_PATTERN.test(name)) return null;
  if (!Number.isInteger(score) || score < 1 || score > 99999) return null;
  if (!Number.isInteger(bestStreak) || bestStreak < 0 || bestStreak > 999) return null;
  if (!Number.isInteger(made) || made < 0 || made > 9999) return null;
  if (!Number.isInteger(attempts) || attempts < 0 || attempts > 9999) return null;
  const parsedAt = typeof raw.at === "string" ? Date.parse(raw.at) : Number.NaN;
  const at = Number.isNaN(parsedAt) ? new Date().toISOString() : new Date(parsedAt).toISOString();
  const id = typeof raw.id === "string" && raw.id.length > 0 && raw.id.length <= 48
    ? raw.id
    : crypto.randomUUID();
  return { id, name, score, bestStreak, made, attempts, at };
}

function readEntries(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitize).filter(Boolean).sort(compareEntries).slice(0, MAX_SCORES);
  } catch {
    return [];
  }
}

export function createScoreboard(storage, key = SCORE_KEY) {
  let entries = readEntries(storage, key);

  function persist() {
    try {
      storage.setItem(key, JSON.stringify(entries));
      return true;
    } catch {
      return false;
    }
  }

  return {
    list() {
      return entries.map((entry) => ({ ...entry }));
    },
    best() {
      return entries.reduce((max, entry) => Math.max(max, entry.score), 0);
    },
    qualifies(score) {
      if (!Number.isInteger(score) || score <= 0) return false;
      if (entries.length < MAX_SCORES) return true;
      return score > entries[entries.length - 1].score;
    },
    submit(raw) {
      const entry = sanitize(raw);
      if (!entry || !this.qualifies(entry.score)) {
        return { saved: false, persisted: true, rank: null, entries: this.list() };
      }
      entries = [...entries, entry].sort(compareEntries).slice(0, MAX_SCORES);
      const persisted = persist();
      const rank = entries.findIndex((item) => item.id === entry.id) + 1;
      return {
        saved: rank > 0,
        persisted,
        rank: rank > 0 ? rank : null,
        entries: this.list(),
      };
    },
    clear() {
      entries = [];
      return { persisted: persist() };
    },
  };
}

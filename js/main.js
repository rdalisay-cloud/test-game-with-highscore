import { NAME_KEY, ROUND_SECONDS } from "./constants.js";
import { createAudio } from "./audio.js";
import { createGame } from "./game.js";
import { createScoreboard } from "./scores.js";
import { displaySeconds } from "./scoring.js";

const board = createScoreboard(window.localStorage);
const audio = createAudio(window.localStorage);

const stage = document.querySelector("#stage");
const hud = document.querySelector("#hud");
const scoreEl = document.querySelector("#score");
const streakEl = document.querySelector("#streak");
const timeEl = document.querySelector("#time");
const bestEl = document.querySelector("#best");
const menu = document.querySelector("#menu");
const result = document.querySelector("#result");
const resultHeading = document.querySelector("#result-heading");
const resultScore = document.querySelector("#result-score");
const resultDetail = document.querySelector("#result-detail");
const saveForm = document.querySelector("#save-form");
const initials = document.querySelector("#initials");
const saveError = document.querySelector("#save-error");
const saveNote = document.querySelector("#save-note");
const menuScores = document.querySelector("#menu-scores");
const resultScores = document.querySelector("#result-scores");
const clearScores = document.querySelector("#clear-scores");
const play = document.querySelector("#play");
const again = document.querySelector("#again");
const menuBack = document.querySelector("#menu-back");
const quit = document.querySelector("#quit");
const mute = document.querySelector("#mute");
const hint = document.querySelector("#hint");
const live = document.querySelector("#live");
const canvas = document.querySelector("#court");

let pending = null;
let clearTimer = 0;

function rememberedName() {
  try {
    return window.localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}

function rememberName(name) {
  try {
    window.localStorage.setItem(NAME_KEY, name);
  } catch {
    // Initials still save with the score when storage for the board works.
  }
}

function fillScores(list, entries) {
  const limit = Number(list.dataset.limit || 5);
  list.replaceChildren();
  const shown = entries.slice(0, limit);
  if (shown.length === 0) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = "No scores yet.";
    list.append(item);
    return;
  }
  shown.forEach((entry, index) => {
    const item = document.createElement("li");
    const rank = document.createElement("span");
    rank.textContent = String(index + 1);
    const name = document.createElement("span");
    name.textContent = entry.name;
    const meta = document.createElement("span");
    meta.textContent = entry.bestStreak > 1 ? `streak ${entry.bestStreak}` : "";
    const value = document.createElement("span");
    value.textContent = String(entry.score);
    item.append(rank, name, meta, value);
    list.append(item);
  });
}

function refreshScores() {
  const entries = board.list();
  fillScores(menuScores, entries);
  fillScores(resultScores, entries);
  clearScores.hidden = entries.length === 0;
  bestEl.textContent = String(board.best());
}

function setMuteLabel() {
  mute.textContent = audio.muted ? "Sound off" : "Sound on";
  mute.setAttribute("aria-pressed", String(audio.muted));
}

function show(phase) {
  menu.hidden = phase !== "menu";
  result.hidden = phase !== "over";
  quit.hidden = phase !== "play";
  hud.hidden = phase === "menu";
  stage.classList.toggle("covered", phase !== "play");
  if (phase === "menu") hint.textContent = "Drag the ball toward the hoop, then release.";
  if (phase === "play") hint.textContent = "Drag the ball toward the hoop, then release. The dots show the arc.";
  if (phase === "over") hint.textContent = "High scores stay in this browser.";
}

function start() {
  audio.resume();
  audio.play("click");
  pending = null;
  saveNote.hidden = true;
  saveError.hidden = true;
  game.startRound(ROUND_SECONDS);
}

const game = createGame(canvas, {
  audio,
  getBest: () => board.best(),
  onAnnounce(text) {
    live.textContent = text;
  },
  onHud(hudState) {
    scoreEl.textContent = String(hudState.score);
    streakEl.textContent = String(hudState.streak);
    timeEl.textContent = String(displaySeconds(hudState.timeLeft));
    bestEl.textContent = String(hudState.best);
    scoreEl.classList.toggle("hot", hudState.isNewBest);
    timeEl.classList.toggle("danger", hudState.timeLeft > 0 && displaySeconds(hudState.timeLeft) <= 5);
  },
  onPhase: show,
  onRoundEnd(summary) {
    pending = summary;
    const qualifies = board.qualifies(summary.score);
    resultHeading.textContent = qualifies ? "New high score" : "Round over";
    resultScore.textContent = String(summary.score);
    if (summary.attempts === 0) {
      resultDetail.textContent = "Time ran out before the first flick.";
    } else if (summary.made === 0) {
      resultDetail.textContent = `${summary.attempts} ${summary.attempts === 1 ? "shot" : "shots"}, none dropped.`;
    } else {
      resultDetail.textContent = `${summary.made} of ${summary.attempts} shots. Best streak ${summary.bestStreak}.`;
    }
    saveForm.hidden = !qualifies;
    saveNote.hidden = true;
    saveError.hidden = true;
    initials.value = rememberedName();
    refreshScores();
    live.textContent = qualifies
      ? `Round over. ${summary.score} points. New high score.`
      : `Round over. ${summary.score} points.`;
    window.setTimeout(() => {
      if (qualifies) initials.focus();
      else again.focus();
    }, 0);
  },
});

play.addEventListener("click", start);
again.addEventListener("click", start);
menuBack.addEventListener("click", () => {
  audio.play("click");
  game.abandon();
  refreshScores();
  play.focus();
});
quit.addEventListener("click", () => {
  audio.play("click");
  game.abandon();
  play.focus();
});
mute.addEventListener("click", () => {
  audio.toggle();
  setMuteLabel();
  if (!audio.muted) {
    audio.resume();
    audio.play("click");
  }
});

initials.addEventListener("input", () => {
  const clean = initials.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
  if (clean !== initials.value) initials.value = clean;
  saveError.hidden = true;
});

saveForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!pending) return;
  const saved = board.submit({
    name: initials.value,
    score: pending.score,
    bestStreak: pending.bestStreak,
    made: pending.made,
    attempts: pending.attempts,
    at: pending.at,
  });
  if (!saved.saved) {
    saveError.hidden = false;
    saveError.textContent = "Use 1 to 3 letters or numbers.";
    initials.focus();
    return;
  }
  rememberName(initials.value.toUpperCase());
  saveForm.hidden = true;
  saveNote.hidden = false;
  saveNote.textContent = saved.persisted
    ? `Saved as #${saved.rank}.`
    : "Saved for this session. This browser blocked storage.";
  refreshScores();
  again.focus();
});

clearScores.addEventListener("click", () => {
  if (clearScores.dataset.armed !== "true") {
    clearScores.dataset.armed = "true";
    clearScores.textContent = "Confirm clear";
    window.clearTimeout(clearTimer);
    clearTimer = window.setTimeout(() => {
      clearScores.dataset.armed = "false";
      clearScores.textContent = "Clear scores";
    }, 2500);
    return;
  }
  window.clearTimeout(clearTimer);
  clearScores.dataset.armed = "false";
  clearScores.textContent = "Clear scores";
  board.clear();
  refreshScores();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !quit.hidden) {
    game.abandon();
    play.focus();
  }
});

setMuteLabel();
refreshScores();
show("menu");

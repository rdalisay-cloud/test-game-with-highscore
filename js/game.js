import { BALL_R, FLOOR_Y, GRAVITY, ROUND_SECONDS, STATIONS, VIEW } from "./constants.js";
import {
  createBall,
  createHoop,
  isResting,
  previewArc,
  simulate,
  velocityFromDrag,
} from "./physics.js";
import { render } from "./render.js";
import { scoreShot } from "./scoring.js";

const GRAB_PADDING = 42;

function pickStation(currentId) {
  const pool = STATIONS.filter((station) => station.id !== currentId);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function createGame(canvas, options) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let scaleX = 1;
  let scaleY = 1;
  let phase = "menu";
  let station = STATIONS[1];
  let hoop = createHoop(station);
  let ball = createBall(station.ballX, FLOOR_Y - BALL_R);
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let made = 0;
  let attempts = 0;
  let timeLeft = ROUND_SECONDS;
  let roundSeconds = ROUND_SECONDS;
  let ended = false;
  let pointerId = null;
  let dragX = 0;
  let dragY = 0;
  let popups = [];
  let particles = [];
  let shake = 0;
  let netSway = 0.12;
  let showGuide = true;
  let anim = 0;
  let shotRim = false;
  let shotBoard = false;
  let shotScored = false;
  let flightTime = 0;
  let resetTimer = 0;
  let soundLock = 0;
  let raf = 0;
  let last = 0;

  function placeBall(next) {
    station = next;
    hoop = createHoop(next);
    ball = createBall(next.ballX, FLOOR_Y - BALL_R);
  }

  function publish() {
    canvas.dataset.phase = phase;
    options.onHud({
      score,
      streak,
      timeLeft: Math.max(0, timeLeft),
      best: options.getBest(),
      isNewBest: score > 0 && score > options.getBest(),
      visible: phase === "ready" || phase === "aiming" || phase === "flight" || phase === "reset" || phase === "over",
    });
  }

  function announce(text) {
    options.onAnnounce(text);
  }

  function finishRound() {
    if (ended) return;
    ended = true;
    phase = "over";
    pointerId = null;
    options.audio.play("buzzer");
    publish();
    options.onPhase("over");
    options.onRoundEnd({
      score,
      made,
      attempts,
      bestStreak,
      at: new Date().toISOString(),
    });
  }

  function launch(vx, vy) {
    ball.vx = vx;
    ball.vy = vy;
    phase = "flight";
    attempts += 1;
    showGuide = false;
    shotRim = false;
    shotBoard = false;
    shotScored = false;
    flightTime = 0;
    options.audio.play("shoot");
    publish();
  }

  function burst(x, y) {
    for (let i = 0; i < 12; i += 1) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 50 + Math.random() * 150;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35 + Math.random() * 0.35,
        max: 0.7,
        r: 1.6 + Math.random() * 2.1,
      });
    }
    if (particles.length > 48) particles.splice(0, particles.length - 48);
  }

  function eventToWorld(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW.w,
      y: ((event.clientY - rect.top) / rect.height) * VIEW.h,
    };
  }

  function onDown(event) {
    if (phase !== "ready" || event.button !== 0) return;
    const point = eventToWorld(event);
    const dx = point.x - ball.x;
    const dy = point.y - ball.y;
    if (dx * dx + dy * dy > (ball.r + GRAB_PADDING) ** 2) return;
    pointerId = event.pointerId;
    dragX = 0;
    dragY = 0;
    phase = "aiming";
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Capture can fail if the pointer already ended.
    }
    options.audio.resume();
    event.preventDefault();
  }

  const origins = new Map();

  function onMove(event) {
    if (phase !== "aiming" || event.pointerId !== pointerId) return;
    const origin = origins.get(event.pointerId);
    if (!origin) return;
    const point = eventToWorld(event);
    dragX = point.x - origin.x;
    dragY = point.y - origin.y;
    event.preventDefault();
  }

  function onDownCapture(event) {
    if (phase !== "ready" || event.button !== 0) return;
    origins.set(event.pointerId, eventToWorld(event));
  }

  function onUp(event) {
    origins.delete(event.pointerId);
    if (pointerId === null || event.pointerId !== pointerId) return;
    const velocity = phase === "aiming" ? velocityFromDrag(dragX, dragY) : null;
    pointerId = null;
    dragX = 0;
    dragY = 0;
    if (phase !== "aiming") return;
    if (!velocity) {
      phase = "ready";
      return;
    }
    launch(velocity.vx, velocity.vy);
  }

  function onCancel(event) {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    origins.delete(event.pointerId);
    dragX = 0;
    dragY = 0;
    if (phase === "aiming") phase = "ready";
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    scaleX = canvas.width / VIEW.w;
    scaleY = canvas.height / VIEW.h;
  }

  function startRound(seconds = ROUND_SECONDS) {
    ended = false;
    roundSeconds = seconds;
    timeLeft = seconds;
    score = 0;
    streak = 0;
    bestStreak = 0;
    made = 0;
    attempts = 0;
    popups = [];
    particles = [];
    shake = 0;
    showGuide = true;
    pointerId = null;
    dragX = 0;
    dragY = 0;
    placeBall(STATIONS[1]);
    phase = "ready";
    options.audio.resume();
    options.onPhase("play");
    publish();
  }

  function abandon() {
    pointerId = null;
    ended = true;
    phase = "menu";
    placeBall(STATIONS[1]);
    ball.vx = 0;
    ball.vy = 0;
    options.onPhase("menu");
    publish();
  }

  function tickClock(dt) {
    if (phase === "ready" || phase === "aiming" || phase === "flight" || phase === "reset") {
      timeLeft -= dt;
    }
  }

  function updateFlight(dt) {
    flightTime += dt;
    const events = simulate(ball, hoop, FLOOR_Y, dt, { ignoreRim: shotScored });
    if (events.rimHit) {
      shotRim = true;
      if (soundLock <= 0) {
        options.audio.play("rim");
        soundLock = 0.12;
      }
    }
    if (events.boardHit) {
      shotBoard = true;
      if (soundLock <= 0) {
        options.audio.play("board");
        soundLock = 0.12;
        if (!reduceMotion) shake = Math.max(shake, 4);
      }
    }
    if (events.floorHit && ball.vy < -70 && soundLock <= 0) {
      options.audio.play("bounce");
      soundLock = 0.1;
    }
    if (events.scored && !shotScored) {
      shotScored = true;
      made += 1;
      const swish = !shotRim && !shotBoard;
      const result = scoreShot(hoop.points, { swish, bank: shotBoard, streakBefore: streak });
      streak = result.streak;
      bestStreak = Math.max(bestStreak, streak);
      score += result.total;
      netSway = 1;
      if (!reduceMotion) shake = swish ? 8 : 5;
      popups.push({
        text: `${result.label} +${result.total}`,
        x: hoop.x,
        y: hoop.y - 64,
        life: 1.05,
        vy: -32,
      });
      burst(hoop.x, hoop.y + 16);
      options.audio.play(swish ? "swish" : "make");
      const spoken = `${result.label.charAt(0)}${result.label.slice(1).toLowerCase()}`;
      announce(`${spoken}. ${score} points.`);
      publish();
    }

    const throughNet = shotScored && flightTime > 0.18 && ball.y > hoop.y + 72;
    const rested = !shotScored && flightTime > 0.4 && isResting(ball);
    const left = ball.x < -90 || ball.x > VIEW.w + 90 || ball.y > VIEW.h + 40;
    if (throughNet || rested || left || flightTime > 3.3) {
      if (!shotScored) streak = 0;
      if (timeLeft <= 0) finishRound();
      else {
        phase = "reset";
        resetTimer = shotScored ? 0.22 : 0.38;
        publish();
      }
    }
  }

  function update(dt) {
    anim += dt;
    soundLock = Math.max(0, soundLock - dt);
    shake = Math.max(0, shake - dt * 22);
    netSway += ((0.08 + Math.sin(anim * 1.5) * 0.035) - netSway) * Math.min(1, dt * 3);
    popups = popups.filter((popup) => {
      popup.life -= dt;
      popup.y += popup.vy * dt;
      return popup.life > 0;
    });
    particles = particles.filter((particle) => {
      particle.life -= dt;
      particle.vy += GRAVITY * 0.25 * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      return particle.life > 0;
    });

    if (phase === "menu" || phase === "over") {
      ball.spin += dt * (reduceMotion ? 0 : 0.35);
      return;
    }

    tickClock(dt);
    if (timeLeft <= 0 && (phase === "ready" || phase === "aiming")) {
      pointerId = null;
      finishRound();
      return;
    }
    if (phase === "flight") updateFlight(dt);
    if (phase === "reset") {
      resetTimer -= dt;
      if (timeLeft <= 0) finishRound();
      else if (resetTimer <= 0) {
        placeBall(pickStation(hoop.id));
        phase = "ready";
        publish();
      }
    }
  }

  function aimVector() {
    if (phase === "aiming") return { x: dragX, y: dragY, armed: Boolean(velocityFromDrag(dragX, dragY)) };
    if (phase === "ready" && showGuide) {
      const wave = reduceMotion ? 0.7 : (Math.sin(anim * 3) + 1) / 2;
      return { x: 64 + wave * 48, y: -128 - wave * 64, armed: false };
    }
    return null;
  }

  function frame(now) {
    const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
    last = now;
    update(dt);
    const aim = aimVector();
    const velocity = aim && phase === "aiming" ? velocityFromDrag(aim.x, aim.y) : null;
    const arc = velocity ? previewArc(ball.x, ball.y, velocity.vx, velocity.vy, GRAVITY, FLOOR_Y, hoop) : [];
    const shakeX = reduceMotion ? 0 : Math.sin(anim * 46) * shake;
    const shakeY = reduceMotion ? 0 : Math.cos(anim * 38) * shake * 0.55;
    render(ctx, {
      scaleX,
      scaleY,
      phase,
      ball,
      hoop,
      arc,
      aim,
      popups,
      particles,
      netSway,
      squish: phase === "aiming" ? 0.9 : 1,
      shakeX,
      shakeY,
      timeLeft: Math.max(0, timeLeft),
      roundSeconds,
    });
    raf = requestAnimationFrame(frame);
  }

  canvas.addEventListener("pointerdown", onDownCapture);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  publish();
  raf = requestAnimationFrame(frame);

  const api = {
    startRound,
    abandon,
    destroy() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDownCapture);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    },
  };

  return api;
}

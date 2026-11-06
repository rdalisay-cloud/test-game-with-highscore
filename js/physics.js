import { BALL_R, FLOOR_Y, GRAVITY, MAX_DRAG, MIN_DRAG, FLICK_SCALE, RIM } from "./constants.js";

export function createBall(x, y) {
  return { x, y, vx: 0, vy: 0, r: BALL_R, spin: 0 };
}

export function createHoop(station) {
  return {
    id: station.id,
    name: station.name,
    points: station.points,
    x: station.hoopX,
    y: station.hoopY,
    halfGap: RIM.halfGap,
    rimR: RIM.rimR,
    backboard: {
      x: station.hoopX + RIM.halfGap + RIM.rimR + 14,
      y: station.hoopY - 118,
      w: 12,
      h: 136,
    },
  };
}

export function velocityFromDrag(dx, dy) {
  const mag = Math.hypot(dx, dy);
  if (mag < MIN_DRAG) return null;
  const clamped = Math.min(mag, MAX_DRAG);
  const scale = (FLICK_SCALE * clamped) / mag;
  return { vx: dx * scale, vy: dy * scale };
}

export function velocityToReach(from, to, gravity, flightTime) {
  const vx = (to.x - from.x) / flightTime;
  const vy = (to.y - from.y - 0.5 * gravity * flightTime * flightTime) / flightTime;
  return { vx, vy };
}

function openingHalf(hoop) {
  return hoop.halfGap - hoop.rimR;
}

export function previewArc(x, y, vx, vy, gravity = GRAVITY, floorY = FLOOR_Y, hoop = null) {
  const points = [];
  let px = x;
  let py = y;
  let pvy = vy;
  const step = 1 / 36;
  for (let i = 0; i < 60; i += 1) {
    const prevX = px;
    const prevY = py;
    pvy += gravity * step;
    px += vx * step;
    py += pvy * step;
    if (hoop && prevY < hoop.y && py >= hoop.y && pvy > 0) {
      const dy = py - prevY;
      const t = dy === 0 ? 0 : (hoop.y - prevY) / dy;
      const crossX = prevX + (px - prevX) * t;
      const half = openingHalf(hoop) - 2;
      if (crossX > hoop.x - half && crossX < hoop.x + half) {
        points.push({ x: crossX, y: hoop.y + 20 });
        break;
      }
    }
    if (i % 2 === 0) points.push({ x: px, y: py });
    if (py > floorY) break;
  }
  return points;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resolveCircle(ball, cx, cy, radius, restitution, friction, ballRadius = ball.r) {
  let dx = ball.x - cx;
  let dy = ball.y - cy;
  let dist = Math.hypot(dx, dy);
  const minDist = ballRadius + radius;
  if (dist >= minDist) return false;
  if (dist < 1e-6) {
    ball.x = cx + minDist;
    dx = minDist;
    dy = 0;
    dist = minDist;
  }
  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = minDist - dist;
  ball.x += nx * overlap;
  ball.y += ny * overlap;
  const vn = ball.vx * nx + ball.vy * ny;
  if (vn < 0) {
    ball.vx -= (1 + restitution) * vn * nx;
    ball.vy -= (1 + restitution) * vn * ny;
    const tx = -ny;
    const ty = nx;
    const vt = ball.vx * tx + ball.vy * ty;
    ball.vx -= vt * friction * tx;
    ball.vy -= vt * friction * ty;
  }
  return true;
}

function resolveBoard(ball, board, restitution) {
  const left = board.x;
  const right = board.x + board.w;
  const top = board.y;
  const bottom = board.y + board.h;
  let nearestX = clamp(ball.x, left, right);
  let nearestY = clamp(ball.y, top, bottom);
  let dx = ball.x - nearestX;
  let dy = ball.y - nearestY;
  let dist = Math.hypot(dx, dy);

  if (dist < 1e-6) {
    if (ball.x - left < right - ball.x) {
      ball.x = left - ball.r;
      dx = -1;
    } else {
      ball.x = right + ball.r;
      dx = 1;
    }
    dy = 0;
    dist = 1;
  } else if (dist < ball.r) {
    const push = ball.r - dist;
    ball.x += (dx / dist) * push;
    ball.y += (dy / dist) * push;
    dx /= dist;
    dy /= dist;
    dist = 1;
  } else {
    return false;
  }

  const nx = dx / dist;
  const ny = dy / dist;
  const vn = ball.vx * nx + ball.vy * ny;
  if (vn < 0) {
    ball.vx -= (1 + restitution) * vn * nx;
    ball.vy -= (1 + restitution) * vn * ny;
  }
  return true;
}

function resolveFloor(ball, floorY, restitution) {
  if (ball.y + ball.r < floorY) return false;
  ball.y = floorY - ball.r;
  if (ball.vy > 0) {
    ball.vy = -ball.vy * restitution;
    if (Math.abs(ball.vy) < 55) ball.vy = 0;
  }
  ball.vx *= 0.84;
  if (Math.abs(ball.vx) < 14) ball.vx = 0;
  return true;
}

function centerInOpening(ball, hoop) {
  return Math.abs(ball.x - hoop.x) < openingHalf(hoop);
}

function crossedRim(prevX, prevY, ball, hoop) {
  if (!(prevY < hoop.y && ball.y >= hoop.y)) return false;
  if (ball.vy <= 0) return false;
  const dy = ball.y - prevY;
  const t = dy === 0 ? 0 : (hoop.y - prevY) / dy;
  const crossX = prevX + (ball.x - prevX) * t;
  const halfWindow = openingHalf(hoop) - 2;
  return crossX > hoop.x - halfWindow && crossX < hoop.x + halfWindow;
}

export function simulate(ball, hoop, floorY, dt, { gravity = GRAVITY, ignoreRim = false } = {}) {
  const steps = 8;
  const h = dt / steps;
  const events = { rimHit: false, boardHit: false, floorHit: false, scored: false };
  let scored = false;
  for (let i = 0; i < steps; i += 1) {
    const prevX = ball.x;
    const prevY = ball.y;
    ball.vy += gravity * h;
    ball.x += ball.vx * h;
    ball.y += ball.vy * h;
    ball.spin += ball.vx * h * 0.01;
    const crossing = crossedRim(prevX, prevY, ball, hoop);
    if (crossing) scored = true;
    // A ball whose center is already in the opening falls through. Posts only reject shots outside it.
    const throughGap = centerInOpening(ball, hoop) && ball.vy > 0;
    if (!ignoreRim && !scored && !throughGap) {
      const posts = [hoop.x - hoop.halfGap, hoop.x + hoop.halfGap];
      for (const postX of posts) {
        const dx = ball.x - postX;
        const dy = ball.y - hoop.y;
        const dist = Math.hypot(dx, dy);
        if (dist < ball.r + hoop.rimR) events.rimHit = true;
        // Only the core of the ball bounces. A light graze still drops through.
        resolveCircle(ball, postX, hoop.y, hoop.rimR, 0.68, 0.14, ball.r * 0.5);
      }
    }
    if (resolveBoard(ball, hoop.backboard, 0.58)) events.boardHit = true;
    if (resolveFloor(ball, floorY, 0.46)) events.floorHit = true;
  }
  events.scored = scored;
  return events;
}

export function isResting(ball, floorY = FLOOR_Y) {
  const onFloor = ball.y + ball.r >= floorY - 0.75;
  return onFloor && Math.hypot(ball.vx, ball.vy) < 28;
}

export function flightOutcome(ball, hoop, floorY = FLOOR_Y) {
  let rimHit = false;
  let boardHit = false;
  let scored = false;
  const dt = 1 / 120;
  for (let t = 0; t < 4.5; t += dt) {
    const events = simulate(ball, hoop, floorY, dt, { ignoreRim: scored });
    if (!scored && events.rimHit) rimHit = true;
    if (!scored && events.boardHit) boardHit = true;
    if (events.scored) scored = true;
    if (scored && ball.y > hoop.y + 48) break;
    if (!scored && isResting(ball, floorY) && t > 0.45) break;
  }
  return { scored, rimHit, boardHit, x: ball.x, y: ball.y };
}

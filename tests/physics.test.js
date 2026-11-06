import assert from "node:assert/strict";
import test from "node:test";
import {
  BALL_R,
  FLICK_SCALE,
  FLOOR_Y,
  GRAVITY,
  MAX_DRAG,
  STATIONS,
  VIEW,
} from "../js/constants.js";
import {
  createBall,
  createHoop,
  flightOutcome,
  previewArc,
  simulate,
  velocityFromDrag,
  velocityToReach,
} from "../js/physics.js";

const MAX_SPEED = MAX_DRAG * FLICK_SCALE;

function planShot(from, hoop) {
  for (let flightTime = 0.75; flightTime <= 1.7; flightTime += 0.02) {
    const velocity = velocityToReach(from, { x: hoop.x, y: hoop.y }, GRAVITY, flightTime);
    const speed = Math.hypot(velocity.vx, velocity.vy);
    if (speed > MAX_SPEED || velocity.vy >= -40) continue;
    const apexY = from.y - (velocity.vy * velocity.vy) / (2 * GRAVITY);
    if (apexY < 20 || apexY > hoop.y - 28) continue;
    const ball = createBall(from.x, from.y);
    ball.vx = velocity.vx;
    ball.vy = velocity.vy;
    const outcome = flightOutcome(ball, hoop);
    if (outcome.scored && !outcome.rimHit && !outcome.boardHit) {
      return { ...velocity, flightTime, speed, apexY };
    }
  }
  return null;
}

test("tiny flicks do not launch and long flicks are capped", () => {
  assert.equal(velocityFromDrag(8, -10), null);
  const shot = velocityFromDrag(600, -800);
  assert.ok(shot);
  const speed = Math.hypot(shot.vx, shot.vy);
  assert.ok(speed <= MAX_SPEED + 0.001);
  assert.ok(speed > MAX_SPEED - 1);
});

test("a downward center crossing scores and an upward one does not", () => {
  const hoop = createHoop(STATIONS[1]);
  const made = createBall(hoop.x, hoop.y - 6);
  made.vy = 420;
  let scored = false;
  for (let i = 0; i < 6 && !scored; i += 1) {
    scored = simulate(made, hoop, FLOOR_Y, 1 / 120).scored;
  }
  assert.equal(scored, true);

  const rising = createBall(hoop.x, hoop.y + 8);
  rising.vy = -420;
  let risingScored = false;
  for (let i = 0; i < 6; i += 1) {
    risingScored = risingScored || simulate(rising, hoop, FLOOR_Y, 1 / 120).scored;
  }
  assert.equal(risingScored, false);
});

test("a shot wide of the rim does not score", () => {
  const hoop = createHoop(STATIONS[1]);
  const ball = createBall(hoop.x + hoop.halfGap + 30, hoop.y - 20);
  ball.vy = 360;
  const events = simulate(ball, hoop, FLOOR_Y, 1 / 50);
  assert.equal(events.scored, false);
});

test("the backboard sends the ball back toward the court", () => {
  const hoop = createHoop(STATIONS[0]);
  const ball = createBall(hoop.backboard.x - BALL_R - 4, hoop.backboard.y + 48);
  ball.vx = 420;
  let rebound = null;
  for (let i = 0; i < 30; i += 1) {
    const events = simulate(ball, hoop, FLOOR_Y, 1 / 120);
    if (events.boardHit) {
      rebound = ball.vx;
      break;
    }
  }
  assert.ok(rebound !== null, "backboard was not hit");
  assert.ok(rebound < 0, `expected rebound, vx=${rebound}`);
});

test("the aim arc stops in the net when the flick is on line", () => {
  const station = STATIONS[1];
  const hoop = createHoop(station);
  const from = { x: station.ballX, y: FLOOR_Y - BALL_R };
  const planned = planShot(from, hoop);
  assert.ok(planned);
  const points = previewArc(from.x, from.y, planned.vx, planned.vy, GRAVITY, FLOOR_Y, hoop);
  const last = points[points.length - 1];
  assert.ok(last.y < hoop.y + 40, `arc ran to ${last.y}`);
  assert.ok(Math.abs(last.x - hoop.x) < hoop.halfGap);
});

test("every station has a legal flick that swishes", () => {
  for (const station of STATIONS) {
    const hoop = createHoop(station);
    assert.ok(hoop.backboard.x + hoop.backboard.w < VIEW.w - 8, `${station.id} backboard off court`);
    const from = { x: station.ballX, y: FLOOR_Y - BALL_R };
    const planned = planShot(from, hoop);
    assert.ok(planned, `${station.id} has no in-range swish`);
    assert.ok(planned.apexY < hoop.y, `${station.id} arc should crest above the rim`);
  }
});

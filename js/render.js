import { FLOOR_Y, VIEW } from "./constants.js";

function drawBanners(ctx) {
  const banners = [
    { x: 22, color: "#7d2e2a", text: "HOME" },
    { x: 108, color: "#1e3d5c", text: "1974" },
    { x: 194, color: "#2c4a34", text: "CITY" },
  ];
  ctx.save();
  ctx.font = "18px Anton, Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const banner of banners) {
    ctx.fillStyle = banner.color;
    ctx.fillRect(banner.x, 18, 78, 32);
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.fillRect(banner.x, 50, 78, 5);
    ctx.fillStyle = "#f6efe4";
    ctx.fillText(banner.text, banner.x + 39, 35);
  }
  ctx.restore();
}

function drawWall(ctx, hoop) {
  const wall = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
  wall.addColorStop(0, "#4a3324");
  wall.addColorStop(0.55, "#2c1d13");
  wall.addColorStop(1, "#23160f");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, VIEW.w, FLOOR_Y);

  const glow = ctx.createRadialGradient(hoop.x, hoop.y - 30, 24, hoop.x - 20, hoop.y, 320);
  glow.addColorStop(0, "rgba(255, 186, 96, 0.28)");
  glow.addColorStop(1, "rgba(255, 186, 96, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, VIEW.w, FLOOR_Y);
  drawBanners(ctx);

  ctx.strokeStyle = "rgba(246, 239, 228, 0.12)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, FLOOR_Y - 18);
  ctx.lineTo(VIEW.w, FLOOR_Y - 18);
  ctx.stroke();
}

function drawFloor(ctx) {
  ctx.fillStyle = "#d08a3d";
  ctx.fillRect(0, FLOOR_Y, VIEW.w, VIEW.h - FLOOR_Y);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, FLOOR_Y, VIEW.w, VIEW.h - FLOOR_Y);
  ctx.clip();
  for (let i = 0; i < 9; i += 1) {
    const y = FLOOR_Y + 6 + i * 13;
    ctx.strokeStyle = i % 2 === 0 ? "rgba(112, 58, 16, 0.28)" : "rgba(255, 228, 186, 0.16)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW.w, y);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(255, 244, 224, 0.72)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(28, FLOOR_Y);
  ctx.lineTo(VIEW.w - 22, FLOOR_Y);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(168, FLOOR_Y);
  ctx.lineTo(168, FLOOR_Y + 26);
  ctx.moveTo(VIEW.w - 70, FLOOR_Y);
  ctx.lineTo(VIEW.w - 70, FLOOR_Y + 18);
  ctx.stroke();
}

function drawSupport(ctx, hoop) {
  const board = hoop.backboard;
  const poleX = board.x + board.w + 4;
  ctx.fillStyle = "#8e969c";
  ctx.fillRect(poleX, board.y + 36, 8, FLOOR_Y - (board.y + 36));
  ctx.fillStyle = "#6e767c";
  ctx.fillRect(poleX - 12, FLOOR_Y - 8, 32, 8);

  ctx.fillStyle = "#c5bfb4";
  ctx.fillRect(board.x + board.w, board.y + 6, 5, board.h - 8);
  ctx.fillStyle = "#f4f0e6";
  ctx.fillRect(board.x, board.y, board.w, board.h);
  ctx.strokeStyle = "#2a2118";
  ctx.lineWidth = 2;
  ctx.strokeRect(board.x + 1, board.y + 1, board.w - 2, board.h - 2);
  ctx.strokeStyle = "#e23b2f";
  ctx.lineWidth = 2;
  ctx.strokeRect(board.x + 3, board.y + 28, board.w - 6, 34);

  ctx.strokeStyle = "#d7d1c6";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(hoop.x + hoop.halfGap, hoop.y);
  ctx.lineTo(board.x, hoop.y);
  ctx.stroke();
}

function drawNet(ctx, hoop, sway, alpha = 1) {
  const left = hoop.x - hoop.halfGap + 6;
  const right = hoop.x + hoop.halfGap - 6;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "rgba(246, 239, 228, 0.78)";
  ctx.lineWidth = 1.4;
  const strands = 8;
  for (let i = 0; i <= strands; i += 1) {
    const t = i / strands;
    const x = left + (right - left) * t;
    const droop = 38 + Math.sin(t * Math.PI) * 18;
    const wave = Math.sin(t * 5.2 + sway * 9) * sway * 12 * Math.sin(Math.max(0.2, t * Math.PI));
    ctx.beginPath();
    ctx.moveTo(x, hoop.y + 2);
    ctx.quadraticCurveTo(x + wave, hoop.y + droop * 0.55, x + wave * 0.45, hoop.y + droop);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRim(ctx, hoop, half) {
  ctx.save();
  ctx.lineCap = "butt";
  ctx.strokeStyle = "#ff3d1f";
  ctx.lineWidth = 6;
  ctx.beginPath();
  if (half === "back") ctx.ellipse(hoop.x, hoop.y, hoop.halfGap, 15, 0, Math.PI, Math.PI * 2);
  else ctx.ellipse(hoop.x, hoop.y, hoop.halfGap, 15, 0, 0, Math.PI);
  ctx.stroke();
  if (half === "front") {
    ctx.strokeStyle = "rgba(255, 214, 196, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(hoop.x, hoop.y + 1, hoop.halfGap - 8, 8, 0, 0.25, Math.PI - 0.25);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBall(ctx, ball, squish) {
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.scale(1 + (1 - squish) * 0.65, squish);
  ctx.rotate(ball.spin);
  const body = ctx.createRadialGradient(-8, -10, 4, 2, 2, ball.r);
  body.addColorStop(0, "#ffb56a");
  body.addColorStop(0.42, "#f27016");
  body.addColorStop(1, "#b8430c");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2a160c";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, ball.r - 0.6, 0, Math.PI * 2);
  ctx.moveTo(-ball.r + 1, 0);
  ctx.lineTo(ball.r - 1, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, ball.r * 0.46, ball.r - 1, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(ball.x - 7, ball.y - 9);
  ctx.rotate(-0.5);
  ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawShadow(ctx, ball) {
  const lift = Math.max(0, FLOOR_Y - (ball.y + ball.r));
  const scale = Math.max(0.35, 1 - lift / 460);
  ctx.fillStyle = `rgba(58, 24, 8, ${0.28 * scale + 0.08})`;
  ctx.beginPath();
  ctx.ellipse(ball.x, FLOOR_Y + 5, ball.r * 1.05 * scale, 7 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawAim(ctx, ball, dx, dy, armed) {
  const mag = Math.hypot(dx, dy);
  if (mag < 8) return;
  const len = Math.min(mag, 150);
  const nx = dx / mag;
  const ny = dy / mag;
  const start = ball.r + 10;
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.strokeStyle = armed ? "rgba(255, 244, 230, 0.95)" : "rgba(255, 244, 230, 0.4)";
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(nx * start, ny * start);
  ctx.lineTo(nx * (start + len), ny * (start + len));
  ctx.stroke();
  const hx = nx * (start + len);
  const hy = ny * (start + len);
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx - nx * 14 - ny * 8, hy - ny * 14 + nx * 8);
  ctx.lineTo(hx - nx * 14 + ny * 8, hy - ny * 14 - nx * 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawArc(ctx, points) {
  points.forEach((point, index) => {
    const fade = 0.9 - (index / points.length) * 0.72;
    ctx.fillStyle = `rgba(255, 244, 230, ${fade})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, index % 3 === 0 ? 3.4 : 2.4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawParticles(ctx, particles) {
  for (const particle of particles) {
    ctx.globalAlpha = Math.max(0, particle.life / particle.max);
    ctx.fillStyle = "#ffe0b8";
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPopups(ctx, popups) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "34px Anton, Impact, sans-serif";
  for (const popup of popups) {
    ctx.globalAlpha = Math.max(0, Math.min(1, popup.life));
    ctx.fillStyle = "#fff8ee";
    ctx.fillText(popup.text, popup.x, popup.y);
  }
  ctx.restore();
}

function drawLabels(ctx, state) {
  if (state.phase === "menu" || state.phase === "over") return;
  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = "#f6efe4";
  ctx.font = "22px Anton, Impact, sans-serif";
  ctx.fillText(state.hoop.name.toUpperCase(), 22, 78);
  ctx.font = "16px Anton, Impact, sans-serif";
  ctx.fillStyle = "#f0b56a";
  ctx.fillText(`${state.hoop.points} PTS`, 22, 98);
  ctx.restore();
}

function drawClock(ctx, state) {
  if (state.phase === "menu") return;
  const fraction = Math.max(0, Math.min(1, state.timeLeft / state.roundSeconds));
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(0, 0, VIEW.w, 8);
  ctx.fillStyle = fraction <= 5 / state.roundSeconds ? "#ff4d3a" : "#ef7a1a";
  ctx.fillRect(0, 0, VIEW.w * fraction, 8);
}

export function render(ctx, state) {
  if (!state.scaleX || !state.scaleY) return;
  ctx.setTransform(state.scaleX, 0, 0, state.scaleY, 0, 0);
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  drawWall(ctx, state.hoop);
  drawFloor(ctx);

  ctx.save();
  ctx.translate(state.shakeX, state.shakeY);
  drawSupport(ctx, state.hoop);
  drawShadow(ctx, state.ball);
  if (state.aim) drawAim(ctx, state.ball, state.aim.x, state.aim.y, state.aim.armed);
  if (state.arc.length) drawArc(ctx, state.arc);
  const inNet = state.ball.y > state.hoop.y
    && Math.abs(state.ball.x - state.hoop.x) < state.hoop.halfGap - 6
    && state.ball.y < state.hoop.y + 86;
  drawRim(ctx, state.hoop, "back");
  drawNet(ctx, state.hoop, state.netSway);
  drawBall(ctx, state.ball, state.squish);
  if (inNet) drawNet(ctx, state.hoop, state.netSway, 0.9);
  drawRim(ctx, state.hoop, "front");
  drawParticles(ctx, state.particles);
  drawPopups(ctx, state.popups);
  ctx.restore();

  drawLabels(ctx, state);
  drawClock(ctx, state);

  const vignette = ctx.createRadialGradient(VIEW.w / 2, VIEW.h / 2, VIEW.h * 0.35, VIEW.w / 2, VIEW.h / 2, VIEW.h * 0.72);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.28)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
}

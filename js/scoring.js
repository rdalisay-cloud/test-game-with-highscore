export function scoreShot(basePoints, { swish, bank, streakBefore }) {
  const streak = streakBefore + 1;
  const bonus = Math.min(3, Math.max(0, streak - 1));
  const total = basePoints + (swish ? 1 : 0) + bonus;
  const label = swish ? "SWISH" : bank ? "BANK" : "MAKE";
  return { streak, total, label, bonus };
}

export function displaySeconds(timeLeft) {
  if (timeLeft <= 0) return 0;
  return Math.ceil(timeLeft);
}

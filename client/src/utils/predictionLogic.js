export function predictCrowdTrend(history) {
  if (!history || history.length < 2) {
    return { rising: false, nextDensity: history?.at(-1) ?? 0 };
  }

  const last = history.at(-1);
  const previous = history.at(-2);
  const delta = last - previous;

  return {
    rising: delta > 0,
    nextDensity: Math.max(0, Math.min(100, Math.round(last + delta))),
  };
}

export function predictTrend(history = []) {
  if (history.length < 2) return 'stable';

  const diff = history[history.length - 1] - history[0];

  if (diff > 20) return 'increasing';
  if (diff < -20) return 'decreasing';
  return 'stable';
}


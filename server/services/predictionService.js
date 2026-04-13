function predictCrowdTrend(history = []) {
  if (history.length < 2) {
    return { rising: false, nextDensity: history.at(-1) || 0 };
  }

  const last = history.at(-1);
  const previous = history.at(-2);
  const delta = last - previous;

  return {
    rising: delta > 0,
    nextDensity: Math.max(0, Math.min(100, last + delta)),
  };
}

module.exports = { predictCrowdTrend };

export function getDensityLevel(density) {
  if (density >= 75) {
    return 'high';
  }

  if (density >= 40) {
    return 'medium';
  }

  return 'low';
}

export function getDensityLabel(density) {
  const level = getDensityLevel(density);

  if (level === 'high') return 'Crowded';
  if (level === 'medium') return 'Moderate';
  return 'Clear';
}

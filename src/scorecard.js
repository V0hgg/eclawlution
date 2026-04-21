export function clampScore(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(10, num));
}

export function computeWorkflowScorecard(input) {
  const dimensions = {
    usefulness: clampScore(input.usefulness),
    noise: clampScore(input.noise),
    timingFit: clampScore(input.timingFit),
    userFit: clampScore(input.userFit),
    maintainability: clampScore(input.maintainability),
    surpriseCost: clampScore(input.surpriseCost)
  };

  const positive = dimensions.usefulness + dimensions.timingFit + dimensions.userFit + dimensions.maintainability;
  const drag = dimensions.noise + dimensions.surpriseCost;
  const overall = Number(((positive - drag + 20) / 6).toFixed(2));

  const recommendations = [];
  if (dimensions.timingFit <= 4) recommendations.push('consider changing schedule or cadence');
  if (dimensions.noise >= 7) recommendations.push('reduce report verbosity or frequency');
  if (dimensions.userFit <= 5) recommendations.push('tighten prompt scope toward the user’s actual preferences');
  if (dimensions.maintainability <= 5) recommendations.push('simplify workflow boundaries or merge overlapping jobs');
  if (dimensions.surpriseCost >= 6) recommendations.push('add approval boundaries or reduce autonomous scope');
  if (recommendations.length === 0) recommendations.push('keep current workflow shape and re-evaluate later');

  return {
    name: input.name ?? 'unnamed-workflow',
    dimensions,
    overall,
    recommendations,
    notes: input.notes ?? []
  };
}

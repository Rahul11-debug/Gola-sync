/**
 * Calculate goal progress score (0–100) based on UoM type.
 *
 * @param {string} uom_type  - 'numeric' | 'percentage' | 'max_type' | 'timeline' | 'zero_based'
 * @param {number} target    - set when goal was created
 * @param {number} actual    - employee's reported achievement
 * @param {Date}   deadline  - goal deadline (for timeline type)
 * @param {Date}   completedAt - when employee marked complete (for timeline type)
 * @returns {number} score 0–100
 */
function calcProgress(uom_type, target, actual, deadline = null, completedAt = null) {
  if (target === 0) return 0;

  switch (uom_type) {
    case 'numeric':
    case 'percentage':
      // Higher actual = better
      return Math.min(Math.round((actual / target) * 100), 100);

    case 'max_type':
      // Lower actual = better (e.g. response time, defect count)
      if (actual === 0) return 100;
      return Math.min(Math.round((target / actual) * 100), 100);

    case 'timeline':
      // Completed before or on deadline = 100%, otherwise 0%
      if (!deadline || !completedAt) return 0;
      return new Date(completedAt) <= new Date(deadline) ? 100 : 0;

    case 'zero_based':
      // Target is zero incidents/defects
      return actual === 0 ? 100 : 0;

    default:
      return 0;
  }
}

/**
 * Calculate weighted overall score for an employee across all goals.
 *
 * @param {Array} goalScores - [{ weightage, progress_score }]
 * @returns {number} overall score 0–100
 */
function calcOverallScore(goalScores) {
  if (!goalScores.length) return 0;
  const totalWeight = goalScores.reduce((sum, g) => sum + g.weightage, 0);
  const weightedSum = goalScores.reduce(
    (sum, g) => sum + (g.progress_score * g.weightage),
    0
  );
  return Math.round(weightedSum / totalWeight);
}

module.exports = { calcProgress, calcOverallScore };

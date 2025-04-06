export function calculateInformation(assessments, goal) {
  let currentGradeTotal = 0; // total grading of completed assessments (weighted)
  let currentWeightTotal = 0; // total weighting of completed assessments
  let weightTotal = 0; // total weighting of all assessments
  let completedAssessmentCount = 0; // number of completed assessments/subtasks
  let totalAssessmentCount = 0; // total number of assessments/subtasks
  let markAverage = 0; // sum of grades from completed assessments/subtasks

  assessments.forEach((a) => {
    weightTotal += a.weighting;
    // Check if the assessment uses subtasks mode
    if (Array.isArray(a.subtasks) && a.subtasks.length > 0) {
      a.subtasks.forEach((s) => {
        totalAssessmentCount += 1;
        // Each subtask gets an equal fraction of the assessment's weighting
        const subtaskWeight = a.weighting / a.subtasks.length;
        // Only count if the subtask is completed
        if (!s.completed) return;
        currentWeightTotal += subtaskWeight;
        currentGradeTotal += (s.grade * subtaskWeight) / 100;
        completedAssessmentCount += 1;
        markAverage += s.grade;
      });
    } else {
      // normal assessment mode
      totalAssessmentCount += 1;
      // If the assessment hasn't been completed (using a.due as flag), skip processing
      if (a.due) return;
      currentWeightTotal += a.weighting;
      currentGradeTotal += (a.grading * a.weighting) / 100;
      completedAssessmentCount += 1;
      markAverage += a.grading;
    }
  });

  // Avoid division by zero.
  markAverage =
    completedAssessmentCount > 0 ? markAverage / completedAssessmentCount : 0;
  const unallocatedWeight = 100 - weightTotal; // may be negative if weightTotal > 100

  const currentGrade =
    currentWeightTotal > 0 ? (currentGradeTotal / currentWeightTotal) * 100 : 0;
  // Calculate minimumGrade only if there's remaining weighting to complete
  const remainingWeight = weightTotal - currentWeightTotal;
  const minimumGrade =
    remainingWeight > 0
      ? (((goal / 100) * (weightTotal - unallocatedWeight) -
          currentGradeTotal) /
          remainingWeight) *
        100
      : currentGrade;
  const maximumGrade =
    weightTotal > 0
      ? ((currentGradeTotal + remainingWeight) / weightTotal) * 100
      : 0;

  return {
    currentGradeTotal,
    currentWeightTotal,
    weightTotal,
    completedAssessmentCount,
    totalAssessmentCount,
    unallocatedWeight,
    currentGrade,
    minimumGrade,
    markAverage,
    maximumGrade,
  };
}

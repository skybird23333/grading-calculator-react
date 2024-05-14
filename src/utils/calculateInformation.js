export function calculateInformation(assessments, goal) {
    let currentGradeTotal = 0; //total grading of all assessments, scaled by their weighting
    let currentWeightTotal = 0; //total weighting of all assessments completed
    let weightTotal = 0; //total weighting of all assessments regardless of completion
    let completedAssessmentCount = 0; //amount of assessments completed
    let totalAssessmentCount = 0; //total amount of assessments
    let markAverage = 0

    assessments.forEach((a, i) => {
        weightTotal += a.weighting;
        totalAssessmentCount += 1;
        if (a.due) return;
        currentWeightTotal += a.weighting;
        currentGradeTotal += (a.grading * a.weighting) / 100;
        completedAssessmentCount += 1;
        markAverage += a.grading
    });

    markAverage /= completedAssessmentCount

    const unallocatedWeight = 100 - weightTotal; //weighting unallocated for, if negative means overall weighting is over 100%
    const currentGrade =
        ((currentGradeTotal / currentWeightTotal) * 100).toFixed(2); //the current grade, considering only completed assessments.

    const minimumGrade =
        (((goal / 100) * (weightTotal - unallocatedWeight) -
                currentGradeTotal) /
            (weightTotal - currentWeightTotal)) *
        100;

    return {
        currentGradeTotal,
        currentWeightTotal,
        weightTotal,
        completedAssessmentCount,
        totalAssessmentCount,
        unallocatedWeight,
        currentGrade,
        minimumGrade,
        markAverage
    }
}
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Button } from "../components/Button";
import { Assessment } from "../components/Assessment";
import { Input } from "../components/Input";
import { FaBook } from "react-icons/fa";
import { getSubject, updateSubject } from "../utils/storagehelper";
import { calculateInformation } from "../utils/calculateInformation";
// Removed GradeOverview usage; inline labels are rendered above the progress bar now
import { useParams } from "react-router-dom";
import { getSetting } from "../utils/settingsManager";
import { ar } from "date-fns/locale";
import MarkDisplay from "../components/MarkDisplay";
import calculateColorFromGrade from "../utils/calculateColorFromGrade";

const subjectInformation = {
  name: "NULL Subject",
  goal: 75,
  assessments: [
    { name: "IF YOU SEE THIS SUBJECT", due: false, grading: 75, weighting: 50 },
    {
      name: "THERE IS A BUG WITH THIS THING",
      due: false,
      grading: 57,
      weighting: 20,
    },
    {
      name: "YOUR DATA IS SAFE(PROBABLY)",
      due: false,
      grading: 83,
      weighting: 15,
    },
    { name: "Example Assessment 4", due: true, weighting: 15 },
  ],
};

export function Subject() {
  const [info, setInfo] = useState(subjectInformation);
  const [editing, setEditing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(-1);
  const { subjectId } = useParams();
  const barRef = useRef(null);
  const [barWidth, setBarWidth] = useState(0);

  // Measure the inner progress bar width to align labels (Minimum/Goal/Maximum)
  useLayoutEffect(() => {
    const el = barRef.current;
    const update = () => setBarWidth(el ? el.clientWidth : 0);

    // Immediate + microtask + next frame
    update();
    Promise.resolve().then(update);
    const raf = requestAnimationFrame(update);

    window.addEventListener("resize", update);

    let ro;
    if (window.ResizeObserver && el) {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    }

    return () => {
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
    // Re-bind when ref element changes or when the underlying grey width percentage changes
  }, [barRef.current]);

  useEffect(() => {
    if (subjectId) {
      const subject = getSubject(subjectId);
      if (JSON.stringify(subject) !== "{}") {
        updateInfoState(subject);
      }
    }
  }, [subjectId]);

  const handleEdit = () => setEditing(true);

  const handleEditSave = () => {
    setEditing(false);
    if (subjectId) {
      updateSubject(subjectId, info);
    }
    updateInfoState({});
  };

  const handleAssessmentChange = (change) => {
    const newAssessmentArray = info.assessments;
    newAssessmentArray[change.key] = {
      ...newAssessmentArray[change.key],
      ...change,
    };
    updateInfoState({ assessments: newAssessmentArray });
  };

  const handleAddAssessment = () => {
    const newAssessmentArray = [
      ...info.assessments,
      {
        name: `Assessment ${info.assessments.length}`,
        grading: 0,
        weighting: 0,
      },
    ];
    updateInfoState({ assessments: newAssessmentArray });
  };

  const handleDeleteAssessment = (i) => {
    const newAssessmentArray = info.assessments.filter(
      (_, index) => index !== i
    );
    updateInfoState({ assessments: newAssessmentArray });
  };

  const handleGoalUpdate = (e) => {
    const goal = parseInt(e.target.value) || 0;
    if (goal >= 0 && goal <= 100) {
      updateInfoState({ goal });
    }
  };

  const handleNameUpdate = (e) => updateInfoState({ name: e.target.value });

  const handleDragStart = (e, index) => setDraggedIndex(index);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== index) {
      const newItems = [...info.assessments];
      const draggedItem = newItems[draggedIndex];
      newItems.splice(draggedIndex, 1);
      newItems.splice(index, 0, draggedItem);
      setDraggedIndex(index);
      updateInfoState({ assessments: newItems });
    }
  };

  const updateInfoState = (data) => {
    const newData = { ...info, ...data };
    newData.assessments = recalculateChangeToTotalMark(newData.assessments);
    setInfo(newData);
  };

  const recalculateChangeToTotalMark = (assessments) => {
    const newAssessments = assessments.map((a, i) => {
      if (i > 0) {
        const currentGrade = calculateInformation(
          assessments.slice(0, i)
        ).currentGrade;
        if (!a.due) {
          // If marks exist
          a.changeToTotalMark =
            calculateInformation(assessments.slice(0, i + 1)).currentGrade -
            currentGrade;
        } else {
          // Marks don't exist, calculate possibility

          const markPossibilityUpper = getSetting(
            "interface.possibilityhighscoreusehighest"
          )
            ? Math.max(...assessments.slice(0, i).map((a) => a.grading))
            : parseFloat(getSetting("interface.possibilityhighscore"));
          const markPossibiliyLower = getSetting(
            "interface.possibilitylowscoreuselowest"
          )
            ? Math.min(...assessments.slice(0, i).map((a) => a.grading))
            : parseFloat(getSetting("interface.possibilitylowscore"));

          console.log(markPossibiliyLower, markPossibilityUpper);

          a.gradePossibilities = [
            calculateInformation(
              assessments
                .slice(0, i)
                .concat({ ...a, grading: markPossibiliyLower, due: false })
            ).currentGrade - currentGrade,
            calculateInformation(
              assessments
                .slice(0, i)
                .concat({ ...a, grading: markPossibilityUpper, due: false })
            ).currentGrade - currentGrade,
          ];
          a.gradePossibilitiesScores = [
            markPossibiliyLower,
            markPossibilityUpper,
          ];
        }
      }
      return a;
    });
    return newAssessments;
  };

  const {
    currentGrade,
    currentGradeTotal,
    weightTotal,
    currentWeightTotal,
    completedAssessmentCount,
    totalAssessmentCount,
    unallocatedWeight,
    minimumGrade,
    maximumGrade,
  } = calculateInformation(info.assessments, info.goal);

  const color = (() => {
    if (currentGrade >= getSetting("interface.greenmark")) return "green";
    if (currentGrade === 0) return "none";
    return currentGrade >= getSetting("interface.orangemark")
      ? "orange"
      : "red";
  })();

  const assessments = info.assessments.map((m, i) => (
    <div
      key={i}
      draggable={editing}
      onDragStart={(e) => handleDragStart(e, i)}
      onDragOver={(e) => handleDragOver(e, i)}
    >
      <Assessment
        keyy={i}
        g={m}
        mode={editing ? "edit" : null}
        onAssessmentChange={handleAssessmentChange}
        onAssessmentDelete={handleDeleteAssessment}
      />
    </div>
  ));

  const underAllocationWarning =
    unallocatedWeight > 0 ? (
      <div className="error">
        <p>
          There are <b>{unallocatedWeight}%</b> of the total weighting left
          unallocated for. Check that you have filled in all assessments.
        </p>
      </div>
    ) : null;

  const overAllocationWarning =
    unallocatedWeight < 0 ? (
      <div className="error">
        <p>
          Looks like you allocated <b>{-unallocatedWeight}%</b> too much for the
          weighting! Check that your weightings are correct.
        </p>
      </div>
    ) : null;

  let minimumScore = (
    <div className="info">
      <p>
        Score a minimum of <b>{Math.ceil(minimumGrade)}%</b> in the remaining
        assessments to stay on the {info.goal}% line.
      </p>
    </div>
  );

  if (minimumGrade >= 100) {
    minimumScore = (
      <div className="warn">
        <p>
          You won't be able to reach {info.goal}%. Scoring <b>full</b> marks in
          remaining assessments will give you {maximumGrade.toFixed(2)}%.
        </p>
      </div>
    );
  }

  if (minimumGrade <= 0) {
    minimumScore = (
      <div className="success">
        <p>
          The goal of {info.goal}% can be achieved even if remaining assessments
          are skipped, giving you {currentGradeTotal.toFixed(2)}%.
        </p>
      </div>
    );
  }

  if (!(weightTotal - currentWeightTotal)) minimumScore = null;

  // Pre-compute aligned label boxes for Minimum, Goal, Maximum
  const labelWidthPx = 80;
  const labelItems = (() => {
    if (!barWidth) return [];
    // Clamp a percentage to [0, 100]
    const clampPct = (v) => Math.max(0, Math.min(100, isNaN(v) ? 0 : v));
    const toX = (pct) => (clampPct(pct) / 100) * barWidth;

    const items = [
      {
        key: "min",
        label: "Minimum",
        value: currentGradeTotal,
        color: "rgb(255, 100, 100)",
        x: toX(currentGradeTotal), // desired center x
      },
      {
        key: "goal",
        label: "Goal",
        value: info.goal,
        color: "rgba(0, 153, 255, 1)",
        x: toX(info.goal),
      },
      {
        key: "max",
        label: "Maximum",
        value: maximumGrade,
        color: "yellow",
        x: toX(maximumGrade),
      },
    ];

    // Sort by numeric value (leftmost in scale first)
    items.sort((a, b) => a.value - b.value);

    // Place boxes centered when possible; if overlapping, stack to the right of the previous one
    let prevRight = 0;
    return items.map((it) => {
      // initial left to center the box
      let left = it.x - labelWidthPx / 2;
      if (left < 0) left = 0; // keep within left bound
      if (left < prevRight) left = prevRight; // stack right after previous
      prevRight = left + labelWidthPx;
      return { ...it, left };
    });
  })();

  const scoreProgressBar = (
    <div className="prog-container" style={{ marginTop: 36 }}>
      <div
        className="prog-content-large"
        style={{
          width: 100 - weightTotal + "%",
          background: "red",
          float: "right",
        }}
      ></div>
      <div
        className="prog-content-large"
        style={{
          width: currentWeightTotal + "%",
          background: "var(--foreground-border)",
          position: "relative",
            overflow: "visible",
        }}
        ref={barRef}
      >
        {/* Aligned labels (Minimum/Goal/Maximum) positioned above the bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: -36,
            width: "100%",
            height: 0,
            pointerEvents: "none",
          }}
        >
          {labelItems.map(({ key, label, value, color, left }) => (
            <div
              key={key}
              style={{
                position: "absolute",
                left: left + "px",
                width: labelWidthPx + "px",
                textAlign: "center",
              }}
            >
              <div className="secondary-label">{label}</div>
              <div style={{ color }}>{MarkDisplay(value)}</div>
            </div>
          ))}
        </div>
        <div
          className="prog-content"
          style={{
            position: "absolute",
            width: "3px",
            height: "25px",
            bottom: "-5px",
            background: "rgba(255, 100, 100, 0.5)",
            left: currentGradeTotal.toFixed() + "%",
          }}
        ></div>
        <div
          className="prog-content"
          style={{
            position: "absolute",
            width: "3px",
            height: "25px",
            bottom: "-5px",
            background: "rgba(0, 153, 255, 0.5)",
            left: info.goal + "%",
          }}
        ></div>
        <div
          className="prog-content"
          style={{
            position: "absolute",
            width: "3px",
            height: "25px",
            bottom: "-5px",
            background: "rgba(255, 255, 0, 0.5)",
            left: maximumGrade.toFixed() + "%",
          }}
        ></div>
        <div
          className="prog-content-large"
          style={{ width: currentGrade + "%" }}
        ></div>
      </div>
    </div>
  );

  // recentChange and totalChange were only used by GradeOverview; removed for now

  const totalScoreRanges = Array.from({ length: 19 }, (_, i) => (i + 1) * 5);
  const calculatedResults = totalScoreRanges.map((goal) => ({
    goal,
    minGrade: calculateInformation(info.assessments, goal).minimumGrade,
  }));

    const goalRanges = Array.from({ length: 19 }, (_, i) => info.goal - 9 + i);
    const calculatedGoalResults = goalRanges.map((goal) => ({
        goal,
        minGrade: calculateInformation(info.assessments, goal).minimumGrade,
    }));

  const getStatusElement = (minGrade) => {
    if (minGrade < 0) return <span title="Goal already achieved">✅</span>;
    if (minGrade >= 100) return <span title="Goal not achievable">❌</span>;
    return (
      <span title={`Minimum ${Math.round(minGrade)}% required`}>
        {Math.round(minGrade)}
      </span>
    );
  };

  function blendColor(color1, color2, t) {
    const lerp = (a, b) => Math.round(a + (b - a) * t);
    return `rgba(${lerp(color1[0], color2[0])}, ${lerp(
      color1[1],
      color2[1]
    )}, ${lerp(color1[2], color2[2])}, 0.25)`;
  }

  const getScoreRangeBackground = (minGrade, start = 50, end = 100) => {
    const green = [0, 255, 0];
    const red = [255, 0, 0];
    if (minGrade <= start) return `rgba(${green.join(",")}, 0.25)`;
    if (minGrade >= end) return `rgba(${red.join(",")}, 0.25)`;
    const t = (minGrade - start) / (end - start);
    return blendColor(green, red, t);
  };

let scoreRangeTable =
    completedAssessmentCount !== totalAssessmentCount ? (
        <><table className="table">
            <tr>
                <th style={{ textAlign: "right" }}>To achieve</th>
                {calculatedResults.map(({ goal }) => (
                    <td key={goal}
                            style={{ background: goal >= info.goal && goal < info.goal + 5 ? "var(--blue)" : "transparent" }}
                    >{goal}</td>
                ))}
            </tr>
            <tr>
                <th style={{ textAlign: "right" }}>Min required</th>
                {calculatedResults.map(({ goal, minGrade }) => (
                    <td
                        key={goal}
                        style={{ background: getScoreRangeBackground(minGrade) }}
                    >
                        {getStatusElement(minGrade)}
                    </td>
                ))}
            </tr>
            <tr>
                <th style={{ textAlign: "right" }}>To achieve</th>
                {calculatedGoalResults.map(({ goal }) => (
                    <td key={goal}
                            style={{ background: goal == info.goal ? "var(--blue)" : "transparent" }}
                    >{goal}</td>
                ))}
            </tr>
            <tr>
                <th style={{ textAlign: "right" }}>Min required</th>
                {calculatedGoalResults.map(({ goal, minGrade }) => (
                    <td
                        key={goal}
                        style={{ background: getScoreRangeBackground(minGrade) }}
                    >
                        {getStatusElement(minGrade)}
                    </td>
                ))}
            </tr>
        </table>
        </>
    ) : null;

  let scoreInformation = (
    <div>
      <h2 style={{ width: "100%" }}>
        <FaBook /> {info.name} <span
            style={{
                color: "var(--" + calculateColorFromGrade(currentGrade) + ")",
                filter: "brightness(150%)",
            }}
        >
            { MarkDisplay(currentGrade) }
        </span>
        <Button style={{ float: "right" }} onClick={handleEdit}>
          Edit
        </Button>
      </h2>
      {scoreProgressBar}
      {minimumScore}
      {scoreRangeTable}
      <h3>
        {completedAssessmentCount}/{totalAssessmentCount} Assessments Completed
      </h3>
    </div>
  );

  let editInformation = (
    <div>
      <div style={{ display: "block" }}>
        <h2>
          <Input
            style={{ fontSize: "x-large", fontWeight: "bold" }}
            value={info.name}
            onChange={handleNameUpdate}
          />
          Goal:{" "}
          <Input
            style={{ width: 30 }}
            value={info.goal}
            onChange={handleGoalUpdate}
            type="number"
          />{" "}
          %
          <Button
            style={{ float: "right", background: "green" }}
            onClick={handleEditSave}
          >
            Save
          </Button>
        </h2>
      </div>
      {scoreProgressBar}
      {minimumScore}
      {underAllocationWarning}
      {overAllocationWarning}
      {scoreRangeTable}
      Drag and drop to reorder assessments. TIP: Use tab and shift + tab to
      cycle through inputs!
    </div>
  );

  let editButton = (
    <div>
      <Button style={{ width: "100%" }} onClick={handleAddAssessment}>
        Add Assessment
      </Button>
    </div>
  );

  if (editing) {
    scoreInformation = null;
  } else {
    editInformation = null;
    editButton = null;
  }

  let emptyAssessmentsInfo = (
    <div className="info">
      <p>There's nothing here! Click "Edit" to start adding assessments.</p>
    </div>
  );

  if (info.assessments.length || editing) emptyAssessmentsInfo = null;

  return (
    <div>
      <div style={{ background: "var(--background-secondary)" }}>
        <div className={`${color}-header-bg content-header`}>
          {scoreInformation}
          {editInformation}
        </div>
      </div>
      {assessments}
      {emptyAssessmentsInfo}
      {editButton}
    </div>
  );
}

export default Subject;

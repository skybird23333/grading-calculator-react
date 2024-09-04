import React, { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { Assessment } from "../components/Assessment";
import { Input } from "../components/Input";
import { FaBook } from "react-icons/fa";
import { getSubject, updateSubject } from "../utils/storagehelper";
import { calculateInformation } from "../utils/calculateInformation";
import gradeOverview from "../components/GradeOverview";
import { useParams } from "react-router-dom";

const subjectInformation = {
    name: "NULL Subject",
    goal: 75,
    assessments: [
        { name: 'IF YOU SEE THIS SUBJECT', due: false, grading: 75, weighting: 50 },
        { name: 'THERE IS A BUG WITH THIS THING', due: false, grading: 57, weighting: 20 },
        { name: 'YOUR DATA IS SAFE(PROBABLY)', due: false, grading: 83, weighting: 15 },
        { name: 'Example Assessment 4', due: true, weighting: 15 },
    ],
};

export function Subject() {
    const [info, setInfo] = useState(subjectInformation);
    const [editing, setEditing] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(-1);
    const { subjectId } = useParams();

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
        newAssessmentArray[change.key] = { ...newAssessmentArray[change.key], ...change };
        updateInfoState({ assessments: newAssessmentArray });
    };

    const handleAddAssessment = () => {
        const newAssessmentArray = [...info.assessments, { name: `Assessment ${info.assessments.length}`, grading: 0, weighting: 0 }];
        updateInfoState({ assessments: newAssessmentArray });
    };

    const handleDeleteAssessment = (i) => {
        const newAssessmentArray = info.assessments.filter((_, index) => index !== i);
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
        return assessments.map((a, i) => {
            if (i > 0 && a.grading) {
                a.changeToTotalMark = calculateInformation(assessments.slice(0, i + 1)).currentGrade
                    - calculateInformation(assessments.slice(0, i)).currentGrade;
            }
            return a;
        });
    };

    const { currentGrade, currentGradeTotal, weightTotal, currentWeightTotal, completedAssessmentCount, totalAssessmentCount, unallocatedWeight, minimumGrade, maximumGrade } = calculateInformation(info.assessments, info.goal);

    const color = (() => {
        if (currentGrade >= 80) return "green";
        if (currentGrade === 0) return "none";
        return currentGrade >= 50 ? "orange" : "red";
    })();

    const assessments = info.assessments.map((m, i) => (
        <div key={i} draggable={editing} onDragStart={(e) => handleDragStart(e, i)} onDragOver={(e) => handleDragOver(e, i)}>
            <Assessment keyy={i} g={m} mode={editing ? "edit" : null} onAssessmentChange={handleAssessmentChange} onAssessmentDelete={handleDeleteAssessment} />
        </div>
    ));

    const underAllocationWarning = unallocatedWeight > 0 ? (
        <div className="error">
            <p>There are <b>{unallocatedWeight}%</b> of the total weighting left unallocated for. Check that you have filled in all assessments.</p>
        </div>
    ) : null;

    const overAllocationWarning = unallocatedWeight < 0 ? (
        <div className="error">
            <p>Looks like you allocated <b>{-unallocatedWeight}%</b> too much for the weighting! Check that your weightings are correct.</p>
        </div>
    ) : null;

    let minimumScore = (
        <div className="info">
            <p>Score a minimum of <b>{Math.ceil(minimumGrade)}%</b> in the remaining assessments to stay on the {info.goal}% line.</p>
        </div>
    );

    if (minimumGrade >= 100) {
        minimumScore = (
            <div className="warn">
                <p>You won't be able to reach {info.goal}%. Scoring <b>full</b> marks in remaining assessments will give you {maximumGrade.toFixed(2)}%.</p>
            </div>
        );
    }

    if (minimumGrade <= 0) {
        minimumScore = (
            <div className="success">
                <p>The goal of {info.goal}% can be achieved even if remaining assessments are skipped, giving you {currentGradeTotal.toFixed(2)}%.</p>
            </div>
        );
    }

    if (!(weightTotal - currentWeightTotal)) minimumScore = null;

    const scoreProgressBar = (
        <div className="prog-container">
            <div className="prog-content-large" style={{ width: 100 - weightTotal + "%", background: "red", float: "right" }}></div>
            <div className="prog-content-large" style={{ width: currentWeightTotal + "%", background: "var(--foreground-border)", position: 'relative' }}>
                <div className="prog-content" style={{ position: "absolute", width: "3px", height: '25px', bottom: '-5px', background: "rgba(255, 100, 100, 0.5)", left: currentGradeTotal.toFixed() + "%" }}></div>
                <div className="prog-content" style={{ position: "absolute", width: "3px", height: '25px', bottom: '-5px', background: "rgba(0, 153, 255, 0.5)", left: info.goal + "%" }}></div>
                <div className="prog-content" style={{ position: "absolute", width: "3px", height: '25px', bottom: '-5px', background: "rgba(255, 255, 0, 0.5)", left: maximumGrade.toFixed() + "%" }}></div>
                <div className="prog-content-large" style={{ width: currentGrade + "%" }}></div>
            </div>
        </div>
    );

    const recentChange = info.assessments.filter(a => a.changeToTotalMark).pop()?.changeToTotalMark.toFixed(2);
    const totalChange = info.assessments.filter(a => a.changeToTotalMark).map(a => a.changeToTotalMark).reduce((prev, cur) => prev + cur, 0).toFixed(2);

    let scoreInformation = (
        <div>
            <h2 style={{ width: "100%" }}>
                <FaBook /> {info.name}
                <Button style={{ float: "right" }} onClick={handleEdit}>Edit</Button>
            </h2>
            {gradeOverview({ currentGrade, currentGradeTotal, goal: info.goal, maximumGrade, recentChange, totalChange }, true)}
            {scoreProgressBar}
            {minimumScore}
            <h3>{completedAssessmentCount}/{totalAssessmentCount} Assessments Completed</h3>
        </div>
    );

    let editInformation = (
        <div>
            <div style={{ display: "block" }}>
                <h2>
                    <Input style={{ fontSize: "x-large", fontWeight: "bold" }} value={info.name} onChange={handleNameUpdate} />
                    Goal: <Input style={{ width: 30 }} value={info.goal} onChange={handleGoalUpdate} type="number" /> %
                    <Button style={{ float: "right", background: "green" }} onClick={handleEditSave}>Save</Button>
                </h2>
            </div>
            {gradeOverview({ currentGrade, currentGradeTotal, goal: info.goal, maximumGrade, recentChange, totalChange }, true)}
            {scoreProgressBar}
            {minimumScore}
            Drag and drop to reorder assessments. TIP: Use tab and shift + tab to cycle through inputs!
        </div>
    );

    let editButton = (
        <div>
            <Button style={{ width: "100%" }} onClick={handleAddAssessment}>Add Assessment</Button>
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
            <div style={{  background: 'var(--background-secondary)' }}>
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
};

export default Subject;
import React from "react";
import {Button} from "../components/Button";
import {Assessment} from "../components/Assessment";
import {Input} from "../components/Input";
import {
    FaBook,
} from "react-icons/fa";
import {getSubject, updateSubject} from "../utils/storagehelper";
import {calculateInformation} from "../utils/calculateInformation";
import gradeOverview from "../components/GradeOverview"

var subjectInformation = {
    name: "Example Subject", goal: 75, assessments: [{
        name: 'Example Assessment 1', due: false, grading: 75, weighting: 50,
    }, {
        name: 'Example Assessment 2', due: false, grading: 57, weighting: 20,
    }, {
        name: 'Example Assessment 3', due: false, grading: 83, weighting: 15,
    }, {
        name: 'Example Assessment 4', due: true, weighting: 15,
    }],
};

export class Subject extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.state.editing = false;
        if (this.props.router.params.subjectId) {
            console.log(JSON.stringify(getSubject(this.props.router.params.subjectId)) === "{}")

            this.state.info = getSubject(this.props.router.params.subjectId)
        } else {
            this.state.info = subjectInformation
        }

        this.calculateInformation();
        this.handleEdit = this.handleEdit.bind(this);
        this.handleEditSave = this.handleEditSave.bind(this);
        this.handleAssessmentChange = this.handleAssessmentChange.bind(this);
        this.handleAddAssessment = this.handleAddAssessment.bind(this);
        this.handleDeleteAssessment = this.handleDeleteAssessment.bind(this)
        this.handleGoalUpdate = this.handleGoalUpdate.bind(this)
        this.handleNameUpdate = this.handleNameUpdate.bind(this)
        this.calculateInformation = this.calculateInformation.bind(this);
    }

    calculateInformation() {
        this.currentGradeTotal = 0; //total grading of all assessments, scaled by their weighting
        this.currentWeightTotal = 0; //total weighting of all assessments completed
        this.weightTotal = 0; //total weighting of all assessments regardless of completion
        this.completedAssessmentCount = 0; //amount of assessments completed
        this.totalAssessmentCount = 0; //total amount of assessments

        this.state.info.assessments.forEach((a) => {
            this.weightTotal += a.weighting;
            this.totalAssessmentCount += 1;
            if (a.due) return;
            this.currentWeightTotal += a.weighting;
            this.currentGradeTotal += (a.grading * a.weighting) / 100;
            this.completedAssessmentCount += 1;
        });

        this.unallocatedWeight = 100 - this.weightTotal; //weighting unallocated for, if negative means overall weighting is over 100%
        this.currentGrade = (this.currentGradeTotal / this.currentWeightTotal) * 100; //the current grade, considering only completed assessments.

        this.minimumGrade = (((this.state.info.goal / 100) * (this.weightTotal - this.unallocatedWeight) - this.currentGradeTotal) / (this.weightTotal - this.currentWeightTotal)) * 100;
        //the minimum amount of marks required to reach the goal.
        //a variation of the following formula: (cGT + mG(wT-cWT)/10)wT = Goal /10

        this.maximumGrade = ((this.currentGradeTotal + (this.weightTotal - this.currentWeightTotal)) / this.weightTotal) * 100
    }

    handleEdit() {
        this.setState({editing: true});
    }

    handleEditSave() {
        this.setState({editing: false});
        if (this.props.router.params.subjectId) {
            updateSubject(this.props.router.params.subjectId, this.state.info)
        }
        this.calculateInformation()
        this.updateInfoState({})
    }

    handleAssessmentChange(change) {
        const newAssessmentArray = this.state.info.assessments;
        newAssessmentArray[change.key] = Object.assign(newAssessmentArray[change.key], change)
        this.updateInfoState({assessments: newAssessmentArray});
    }

    recalculateChangeToTotalMark(assessments) {
        return assessments.map((a, i) => {
            if (i > 0 && a.grading) {
                a.changeToTotalMark = calculateInformation(assessments.slice(0, i + 1), 0).currentGrade //Only pick ones up to the current one
                    - calculateInformation(assessments.slice(0, i), 0).currentGrade //Only pick ones up to the current one(excl current one)
            }
            return a
        })
    }

    updateInfoState(data) {
        const info = this.state.info

        const newData = Object.assign(info, data)
        //this is poopy code iknow
        newData.assessments = this.recalculateChangeToTotalMark(newData.assessments)

        this.setState({
            info: newData
        })
    }

    handleAddAssessment() {
        const newAssessmentArray = this.state.info.assessments;
        newAssessmentArray.push({name: `Assessment ${newAssessmentArray.length}`, grading: 0, weighting: 0});
        this.updateInfoState({assessments: newAssessmentArray})
    }

    handleDeleteAssessment(i) {
        const newAssessmentArray = this.state.info.assessments
        newAssessmentArray.splice(i, 1)
        console.log(newAssessmentArray.map(e => e.name))
        this.updateInfoState({assessments: newAssessmentArray})
    }

    handleGoalUpdate(e) {
        if (parseInt(e.target.value) > 100 || parseInt(e.target.value) < 0) return;
        this.updateInfoState({goal: parseInt(e.target.value) || 0});
    }

    handleNameUpdate(e) {
        this.updateInfoState({name: e.target.value})
    }

    handleDragStart(e, index) {
        this.setState({draggedIndex: index})
    };

    handleDragOver(e, index) {
        e.preventDefault();
        console.log(this.state.draggedIndex, index)
        if (this.state.draggedIndex !== index) {
            const newItems = [...this.state.info.assessments];
            const draggedItem = newItems[this.state.draggedIndex];
            // Remove the item from the original position
            newItems.splice(this.state.draggedIndex, 1);
            // Insert the item at the new position
            newItems.splice(index, 0, draggedItem);
            this.setState({draggedIndex: index})
            this.updateInfoState({assessments: newItems})
        }
    };

    componentDidMount() {
        //this is poopy code iknow
        this.updateInfoState({
            assessments: this.state.info.assessments.map((a, i) => {
                if (i > 0 && a.grading) {
                    a.changeToTotalMark = calculateInformation(this.state.info.assessments.slice(0, i + 1), 0).currentGrade //Only pick ones up to the current one
                        - calculateInformation(this.state.info.assessments.slice(0, i), 0).currentGrade //Only pick ones up to the current one(excl current one)
                }
                return a
            })
        })
    }

    render() {
        this.calculateInformation();

        this.color = (() => {
            if (this.currentGrade >= 80) return "green";
            if (this.currentGrade === 0) return "none";
            return this.currentGrade >= 50 ? "orange" : "red";
        })();

        const assessments = this.state.info.assessments.map((m, i) => {
            return (
                <div
                    key={i}
                    draggable={this.state.editing}
                    onDragStart={(e) => this.handleDragStart(e, i)}
                    onDragOver={(e) => this.handleDragOver(e, i)}
                >
                    <Assessment
                        keyy={i}
                        g={m}
                        mode={this.state.editing ? "edit" : null}
                        onAssessmentChange={this.handleAssessmentChange}
                        onAssessmentDelete={this.handleDeleteAssessment}
                    />
                </div>
            );
        });

        const underAllocationWarning = (this.unallocatedWeight > 0) ? (<div className="error">
            <p>
                There are <b>{this.unallocatedWeight}%</b> of the total weighting left
                unallocated for. Check that you have filled in all assessments.
            </p>
        </div>) : null;

        const overAllocationWarning = (this.unallocatedWeight < 0) ? (<div className="error">
            <p>
                Looks like you allocated <b>{-this.unallocatedWeight}%</b> too much for
                the weighting! Check that your weightings are correct.
            </p>
        </div>) : null;

        let minimumScore = (<div className="info">
            <p>
                Score a minimum of <b>{Math.ceil(this.minimumGrade)}%</b> in the
                remaining assessments to stay on the {this.state.info.goal}% line.
            </p>
        </div>);

        if (this.minimumGrade >= 100) {
            minimumScore = (<div className="warn">
                <p>
                    You won't able to reach {this.state.info.goal}%. Scoring <b>full</b>{" "}
                    marks in remaining assessments will give you{" "}
                    {Math.roundTwoDigits(this.maximumGrade)}
                    %.
                </p>
            </div>);
        }

        if (this.minimumGrade <= 0) {
            minimumScore = (<div className="success">
                <p>
                    The goal of {this.state.info.goal}% can be achieved even if
                    remaining assessments are skipped.
                </p>
            </div>);
        }

        if (!(this.weightTotal - this.currentWeightTotal)) minimumScore = null;

        const scoreProgressBar = (<div className="prog-container">
            <div
                className="prog-content-large"
                style={{
                    width: 100 - this.weightTotal + "%", background: "red", float: "right",
                }}
            ></div>
            {/*Weights that weren't allocated for*/}

            <div
                className="prog-content-large"
                style={{
                    width: this.currentWeightTotal + "%", background: "var(--foreground-border)", position: 'relative'
                }}
            >
                <div
                    className="prog-content"
                    style={{
                        position: "absolute",
                        width: 3 + "px",
                        height: '25px',
                        bottom: '-5px',
                        background: "rgba(255, 100, 100, 0.5)",
                        left: this.currentGradeTotal.toFixed() + "%"
                    }}
                ></div>
                <div
                    className="prog-content"
                    style={{
                        position: "absolute",
                        width: 3 + "px",
                        height: '25px',
                        bottom: '-5px',
                        background: "rgba(0, 153, 255, 0.5)",
                        left: this.state.info.goal + "%"
                    }}
                ></div>
                <div
                    className="prog-content"
                    style={{
                        position: "absolute",
                        width: 3 + "px",
                        height: '25px',
                        bottom: '-5px',
                        background: "rgba(255, 255, 0, 0.5)",
                        left: this.maximumGrade.toFixed() + "%"
                    }}
                ></div>
                {/*Weighting for assessments done*/}
                <div
                    className="prog-content-large"
                    style={{width: this.currentGrade + "%"}}
                >
                    {/*Grading*/}
                </div>
            </div>
        </div>)


        const recentChange = this.state.info.assessments.filter(a => a.changeToTotalMark).pop()?.changeToTotalMark.toFixed(2)
        const totalChange = this.state.info.assessments.filter(a => a.changeToTotalMark).map(a => a.changeToTotalMark)
            .reduce((prev, cur) => prev + cur, 0).toFixed(2)

        let scoreInformation = (<div>
            <h2 style={{width: "100%"}}>
                <FaBook/> {this.state.info.name}
                <Button style={{float: "right"}} onClick={this.handleEdit}>
                    Edit
                </Button>
            </h2>
            {gradeOverview({
                currentGrade: this.currentGrade,
                currentGradeTotal: this.currentGradeTotal,
                goal: this.state.info.goal,
                maximumGrade: this.maximumGrade,
                recentChange,
                totalChange
            }, true)}
            {scoreProgressBar}
            {minimumScore}
            {underAllocationWarning}
            {overAllocationWarning}
            <h3>{this.completedAssessmentCount}/{this.totalAssessmentCount} Assessments Completed</h3>
        </div>);

        let editInformation = (<div>
            <div style={{display: "block"}}>
                <h2>
                    <Input
                        style={{fontSize: "x-large", fontWeight: "bold"}}
                        value={this.state.info.name}
                        onChange={this.handleNameUpdate}
                    />
                    Goal: <Input
                    style={{width: 30}}
                    value={this.state.info.goal}
                    onChange={this.handleGoalUpdate}
                    type="number"
                /> %
                    <Button style={{float: "right", background: "green"}} onClick={this.handleEditSave}>
                        Save
                    </Button>
                </h2>
            </div>
            {gradeOverview({
                currentGrade: this.currentGrade,
                currentGradeTotal: this.currentGradeTotal,
                goal: this.state.info.goal,
                maximumGrade: this.maximumGrade,
                recentChange,
                totalChange
            }, true)}
            {scoreProgressBar}
            {minimumScore}
            {underAllocationWarning}
            {overAllocationWarning}
            Drag and drop to reorder assessments.
            TIP: Use tab and shift + tab to cycle through inputs!
        </div>);

        let editButton = (<div>
            <Button style={{width: "100%"}} onClick={this.handleAddAssessment}>
                Add Assessment
            </Button>
        </div>);

        if (this.state.editing) scoreInformation = null; else {
            editInformation = null;
            editButton = null;
        }

        let emptyAssessmentsInfo = (<div className="info">
            <p>There's nothing here! Click "Edit" to start adding assessments.</p>
        </div>);
        if (this.state.info.assessments.length || this.state.editing) emptyAssessmentsInfo = null;

        return (<div>
            <div style={{position: "sticky", top: 0, background: 'var(--background-secondary)'}}>
                <div className={`${this.color}-header-bg content-header`}>
                    {scoreInformation}
                    {editInformation}
                </div>
            </div>


            {assessments}
            {emptyAssessmentsInfo}

            {editButton}
        </div>);
    }
}


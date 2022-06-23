import React from "react";
import { Button } from "../components/Button";
import { Assessment } from "../components/Assessment";
import { Input } from "../components/Input";

var subjectInformation = {
  editing: false,
  name: "Example Subject",
  goal: 90,
  assessments: [],
};

export class Subject extends React.Component {
  constructor(props) {
    super(props);
    this.state = subjectInformation;

    this.calculateInformation();

    if (!this.state.assessments.length) this.state.editing = true;

    this.handleEdit = this.handleEdit.bind(this);
    this.handleEditSave = this.handleEditSave.bind(this);
    this.handleAssessmentChange = this.handleAssessmentChange.bind(this);
    this.handleAddAssessment = this.handleAddAssessment.bind(this);
    this.calculateInformation = this.calculateInformation.bind(this);
  }

  calculateInformation() {
    this.currentGradeTotal = 0; //total grading of all assessments, scaled by their weighting
    this.currentWeightTotal = 0; //total weighting of all assessments completed
    this.weightTotal = 0; //total weighting of all assessments regardless of completion
    this.completedAssessmentCount = 0; //amount of assessments completed
    this.totalAssessmentCount = 0; //total amount of assessments

    this.state.assessments.forEach((a) => {
      this.weightTotal += a.weighting;
      this.totalAssessmentCount += 1;
      if (a.due) return;
      this.currentWeightTotal += a.weighting;
      this.currentGradeTotal += (a.grading * a.weighting) / 100;
      this.completedAssessmentCount += 1;
    });

    this.unallocatedWeight = 100 - this.weightTotal; //weighting unallocated for, if negative means overall weighting is over 100%
    this.currentGrade =
      (this.currentGradeTotal / this.currentWeightTotal) * 100; //the current grade, considering only completed assessments.

    this.minimumGrade =
      (((this.state.goal / 100) * (this.weightTotal - this.unallocatedWeight) -
        this.currentGradeTotal) /
        (this.weightTotal - this.currentWeightTotal)) *
      100;
    //the minimum amount of marks required to reach the goal.
    //a variation of the following formula: (cGT + mG(wT-cWT)/10)wT = Goal /10
  }

  handleEdit() {
    this.setState({ editing: true });
  }

  handleEditSave() {
    this.setState({ editing: false });
  }

  handleAssessmentChange(change) {
    const newAssessmentArray = this.state.assessments;
    newAssessmentArray[change.key] = change;
    this.setState({ assessments: newAssessmentArray });
  }

  handleAddAssessment() {
    const newAssessmentArray = this.state.assessments;
    newAssessmentArray.push({ name: "Assessment", grading: 0, weighting: 0 });
    this.setState({ assessments: newAssessmentArray });
  }

  render() {
    this.calculateInformation();

    const assessments = this.state.assessments.map((m, i) => {
      return (
        <Assessment
          key={i}
          keyy={i}
          g={m}
          mode={this.state.editing ? "edit" : null}
          onAssessmentChange={this.handleAssessmentChange}
        />
      );
    });

    const allocationWarning = this.unallocatedWeight ? (
      <div className="error">
        <p>
          There are <b>{this.unallocatedWeight}%</b> of the total weighting left
          unallocated for. Check that you have filled in all assessments.
        </p>
      </div>
    ) : null;

    let minimumScore = (
      <div className="info">
        <p>
          Score a minimum of <b>{Math.ceil(this.minimumGrade)}%</b> in the
          remaining assessments to stay on the {this.state.goal}% line.
        </p>
      </div>
    );

    if (this.minimumGrade >= 100) {
      minimumScore = (
        <div className="warn">
          <p>
            You won't able to reach {this.state.goal}%. Scoring <b>full</b>{" "}
            marks in remaining assessments will give you{" "}
            {Math.roundTwoDigits(
              ((this.currentGradeTotal +
                (this.weightTotal - this.currentWeightTotal)) /
                this.weightTotal) *
                100
            )}
            %.
          </p>
        </div>
      );
    }

    if (!(this.weightTotal - this.currentWeightTotal)) minimumScore = null;

    let scoreInformation = (
      <div className="card background">
        <h1 style={{ width: "100%" }}>
          Grading Calculator
          <Button style={{ float: "right" }} onClick={this.handleEdit}>
            Edit
          </Button>
        </h1>
        Currently {Math.roundTwoDigits(this.currentGrade)}% (
        {Math.roundTwoDigits(this.currentGradeTotal)}% out of the{" "}
        {Math.roundTwoDigits(this.currentWeightTotal)}% available)
        <div className="prog-container">
          <div
            className="prog-content-large"
            style={{
              width: 100 - this.weightTotal + "%",
              background: "red",
              float: "right",
            }}
          ></div>
          {/*Weights that weren't allocated for*/}

          <div
            className="prog-content-large"
            style={{
              width: this.currentWeightTotal + "%",
              background: "var(--foreground-border)",
            }}
          >
            {/*Weighting for assessments done*/}
            <div
              className="prog-content-large"
              style={{ width: this.currentGrade + "%" }}
            >
              {/*Grading*/}
            </div>
          </div>
        </div>
        {minimumScore}
        {allocationWarning}
        <h3>{this.completedAssessmentCount} Assessments Completed</h3>
      </div>
    );

    let editInformation = (
      <div className="card">
        <div style={{ display: "block" }}>
          <h1>
            Editing assessments
            <Button style={{ float: "right" }} onClick={this.handleEditSave}>
              Save
            </Button>
          </h1>
        </div>
        <div style={{ display: "block" }}>
          Goal: <Input style={{ width: 30 }} /> %
        </div>
        TIP: Use tab and shift + tab to cycle through inputs!
      </div>
    );

    let editButton = (
      <div>
        <Button style={{ width: "100%" }} onClick={this.handleAddAssessment}>
          Add Assessment
        </Button>
      </div>
    );

    if (this.state.editing) scoreInformation = null;
    else {
      editInformation = null;
      editButton = null;
    }

    let emptyAssessmentsInfo = (
      <div className="info">
        <p>There's nothing here! Click "Edit" to start adding assessments</p>
      </div>
    );
    if (this.state.assessments.length || this.state.editing)
      emptyAssessmentsInfo = null;

    return (
      <div>
        {scoreInformation}

        {editInformation}

        {assessments}
        {emptyAssessmentsInfo}

        {editButton}
      </div>
    );
  }
}

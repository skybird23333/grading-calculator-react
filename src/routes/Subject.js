import React from "react";
import { Button } from "../components/Button";
import { Assessment } from "../components/Assessment";
import { Input } from "../components/Input";

var subjectInformation = {
  editing: false,
  name: "Example Subject",
  goal: 90,
  assessments: [
    {
      name: "Task 1",
      grading: 86,
      weighting: 20,
      due: false,
    },
    {
      name: "Task 2",
      grading: 88.8,
      weighting: 15,
      due: false,
    },
    {
      name: "Task 3",
      grading: 80,
      weighting: 15,
      due: false,
    },
    {
      name: "Exam",
      grading: 80,
      weighting: 30,
      due: false,
    },
  ],
};

export class Subject extends React.Component {
  constructor(props) {
    super(props);
    this.state = subjectInformation;

    this.calculateInformation();

    this.handleEdit = this.handleEdit.bind(this);
    this.handleEditSave = this.handleEditSave.bind(this);
    this.handleAssessmentChange = this.handleAssessmentChange.bind(this);
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
            {Math.ceil(
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
          {this.state.name}
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
          <Input
            value={this.state.name}
            style={{ fontSize: "xx-large", fontWeight: "bold" }}
          />
          <Button style={{ float: "right" }} onClick={this.handleEditSave}>
            Save
          </Button>
        </div>
        <div style={{ display: "block" }}>
          Goal: <Input style={{ width: 30 }} /> %
        </div>
        TIP: Use tab and shift + tab to cycle through inputs!
      </div>
    );

    if (this.state.editing) scoreInformation = null;
    else editInformation = null;

    return (
      <div>
        {scoreInformation}

        {editInformation}

        {assessments}
      </div>
    );
  }
}

import React from "react";
import { Button } from "../components/Button";
import { Assessment } from "../components/Assessment";
import { Input } from "../components/Input";

var subjectInformation = {
  editing: false,
  name: "Example Subject",
  goal: 80,
  assessments: [
    {
      name: 'Example Assessment 1',
      due: false,
      grading: 86,
      weighting: 30,
    },
    {
      name: 'Example Assessment 2',
      due: false,
      grading: 68,
      weighting: 30,
    },
    {
      name: 'Example Assessment 3',
      due: true,
      weighting: 40,
    }
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
    this.handleAddAssessment = this.handleAddAssessment.bind(this);
    this.handleDeleteAssessment = this.handleDeleteAssessment.bind(this)
    this.handleGoalUpdate = this.handleGoalUpdate.bind(this)
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
    this.calculateInformation()
  }

  handleAssessmentChange(change) {
    const newAssessmentArray = this.state.assessments;
    newAssessmentArray[change.key] = Object.assign(
      newAssessmentArray[change.key],
      change
    )
    this.setState({ assessments: newAssessmentArray });
  }

  handleAddAssessment() {
    const newAssessmentArray = this.state.assessments;
    newAssessmentArray.push({ name: `Assessment ${newAssessmentArray.length}`, grading: 0, weighting: 0 });
    this.setState({ assessments: newAssessmentArray });
  }

  handleDeleteAssessment(i) {
    const newAssessmentArray = this.state.assessments
    newAssessmentArray.splice(i, 1)
    console.log(newAssessmentArray.map(e => e.name))
    this.setState({ assessments: newAssessmentArray })
  }

  handleGoalUpdate(e) {
    if (parseInt(e.target.value) > 100 || parseInt(e.target.value) < 0) return;
    this.setState({ goal: parseInt(e.target.value) || 0 });
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
          onAssessmentDelete={this.handleDeleteAssessment}
        />
      );
    });

    const underAllocationWarning = (this.unallocatedWeight > 0) ? (
      <div className="error">
        <p>
          There are <b>{this.unallocatedWeight}%</b> of the total weighting left
          unallocated for. Check that you have filled in all assessments.
        </p>
      </div>
    ) : null;

    const overAllocationWarning = (this.unallocatedWeight < 0) ? (
      <div className="error">
        <p>
          Looks like you allocated <b>{-this.unallocatedWeight}%</b> too much for
          the weighting! Check that your weightings are correct.
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
      <div>
        <h2 style={{ width: "100%" }}>
          Grading Calculator
          <Button style={{ float: "right" }} onClick={this.handleEdit}>
            Edit
          </Button>
        </h2>
        Your current grade is {Math.roundTwoDigits(this.currentGrade)}% (
        {Math.roundTwoDigits(this.currentGradeTotal)}% scored out of {" "}
        {Math.roundTwoDigits(this.currentWeightTotal)}% from completed assessments)
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
        {underAllocationWarning}
        {overAllocationWarning}
        <h3>{this.completedAssessmentCount}/{this.totalAssessmentCount} Assessments Completed</h3>
      </div>
    );

    let editInformation = (
      <div>
        <div style={{ display: "block" }}>
          <h2>
            Editing assessments
            <Button style={{ float: "right", background: "green" }} onClick={this.handleEditSave}>
              Save
            </Button>
          </h2>
        </div>
        <div style={{ display: "block" }}>
          Goal: <Input
            style={{ width: 30 }}
            value={this.state.goal}
            onChange={this.handleGoalUpdate}
          /> %
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
        <p>There's nothing here! Click "Edit" to start adding assessments.</p>
      </div>
    );
    if (this.state.assessments.length || this.state.editing)
      emptyAssessmentsInfo = null;

    return (
      <div>

        <div className="content-header">
          {scoreInformation}
          {editInformation}

        </div>


        {assessments}
        {emptyAssessmentsInfo}

        {editButton}
      </div>
    );
  }
}

import React from "react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaArrowDown,
  FaArrowUp,
  FaCalendar,
  FaWeightHanging,
} from "react-icons/fa";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
import { Progress } from "./Progress";
import { Select } from "./SingleSelect";
import MarkDisplay from "./MarkDisplay";
import { getSetting } from "../utils/settingsManager";
import calculateColorFromGrade from "../utils/calculateColorFromGrade";

export class Assessment extends React.Component {
  /**
   * @param props {Object}
   * @param props.g {Object}
   * @param props.g.name {String}
   * @param props.g.weighting {Number}
   * @param props.g.grading {Number}
   * @param props.g.changeToTotalMark {Number}
   * @param props.g.gradePossibilities {[Number, Number]}
   * @param props.g.gradePossibilitiesScores {[Number, Number]}
   * @param props.keyy {Number}
   * @param props.mode {String}
   * @param props.onAssessmentChange {Function}
   * @param props.onAssessmentDelete {Function}
   * @param props.g.subtasks {[{grade: Number, completed?: boolean}]}
   */
  constructor(props) {
    super(props);

    this.state = {
      ...this.props.g,
      key: this.props.keyy,
      mode: undefined,
      due: !!this.props.g.due,
      showSubtaskPopup: false,
      subtaskCount: 1,
    };

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleWeightChange = this.handleWeightChange.bind(this);
    this.handleGradingChange = this.handleGradingChange.bind(this);
    this.handleToggleSubtasks = this.handleToggleSubtasks.bind(this);
    this.handleSubtaskGradeChange = this.handleSubtaskGradeChange.bind(this);
    this.handleAddSubtask = this.handleAddSubtask.bind(this);
    this.handleDeleteSubtask = this.handleDeleteSubtask.bind(this);
    this.handleSubtaskCompletedChange =
      this.handleSubtaskCompletedChange.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.handleSubtaskCountChange = this.handleSubtaskCountChange.bind(this);
    this.handleCreateSubtasks = this.handleCreateSubtasks.bind(this);
    this.handleCancelSubtasks = this.handleCancelSubtasks.bind(this);
  }

  componentDidUpdate() {
    if (this.props.mode !== this.state.mode) {
      if (!this.state.grading) this.setState({ grading: 0 });
      if (!this.state.weighting) this.setState({ weighting: 0 });
      this.setState({ mode: this.props.mode });
    }
  }

  handleNameChange(e) {
    this.props.onAssessmentChange({
      name: e.target.value,
      key: this.state.key,
    });
  }

  handleWeightChange(e) {
    const targetValue = this.sanitizeNumberInput(e.target.value);
    if (targetValue === -1) return;
    this.props.onAssessmentChange({
      weighting: targetValue,
      key: this.state.key,
    });
  }

  handleGradingChange(e) {
    // if subtasks exist, grading is computed automatically.
    if (this.props.g.subtasks) {
      return;
    }
    const targetValue = this.sanitizeNumberInput(e.target.value);
    if (targetValue === -1) return;
    this.props.onAssessmentChange({
      grading: targetValue,
      key: this.state.key,
    });
  }

  sanitizeNumberInput(n) {
    if (parseFloat(n) > 100 || parseFloat(n) < 0) return -1;
    return parseFloat(n);
  }

  recalculateSubtaskGrading(newSubtasks = this.props.g.subtasks || []) {
    const completedSubtasks = newSubtasks.filter((sub) => sub.completed);
    const total = completedSubtasks.reduce((acc, sub) => acc + sub.grade, 0);
    const avg =
      completedSubtasks.length > 0 ? total / completedSubtasks.length : 0;
    this.props.onAssessmentChange({
      grading: parseFloat(avg.toFixed(2)),
      key: this.state.key,
    });
  }

  handleStatusChange(i) {
    console.log(i.target.checked);
    this.props.onAssessmentChange({
      // eslint-disable-next-line
      due: !i.target.checked,
      //i hate eslint
      key: this.state.key,
    });
  }

  // Toggle assessment to subtask mode by adding a subtasks array if not already present.
  handleToggleSubtasks() {
    if (!this.props.g.subtasks) {
      this.setState({ showSubtaskPopup: true });
    }
  }

  // Called when editing a subtask's grade.
  // Called when editing a subtask's grade.
  handleSubtaskGradeChange(index, e) {
    const newGrade = this.sanitizeNumberInput(e.target.value);
    if (newGrade === -1) return;
    const newSubtasks = [...(this.props.g.subtasks || [])];
    newSubtasks[index] = {
      ...newSubtasks[index],
      grade: newGrade,
      completed: true,
    };
    this.props.onAssessmentChange({
      subtasks: newSubtasks,
      key: this.state.key,
    });
    this.recalculateSubtaskGrading(newSubtasks);
  }
  // Adds a new subtask.
  // Adds a new subtask.
  handleAddSubtask() {
    const newSubtasks = [
      ...(this.props.g.subtasks || []),
      { grade: 0, completed: false },
    ];
    this.props.onAssessmentChange({
      subtasks: newSubtasks,
      key: this.state.key,
    });
    this.recalculateSubtaskGrading(newSubtasks);
  }
  // Deletes a subtask.
  // Deletes a subtask.
  handleDeleteSubtask(index) {
    const newSubtasks = [...(this.props.g.subtasks || [])];
    newSubtasks.splice(index, 1);
    if (newSubtasks.length === 0) {
      // Return to normal mode by removing subtasks.
      this.props.onAssessmentChange({
        subtasks: undefined,
        key: this.state.key,
      });
    } else {
      this.props.onAssessmentChange({
        subtasks: newSubtasks,
        key: this.state.key,
      });
      this.recalculateSubtaskGrading(newSubtasks);
    }
  }
  // Called when toggling a subtask's completed status.
  // Called when toggling a subtask's completed status.
  handleSubtaskCompletedChange(index, e) {
    const newSubtasks = [...(this.props.g.subtasks || [])];
    newSubtasks[index] = { ...newSubtasks[index], completed: e.target.checked };
    this.props.onAssessmentChange({
      subtasks: newSubtasks,
      key: this.state.key,
    });
    this.recalculateSubtaskGrading(newSubtasks);
  }

  // Handle subtask count input change
  handleSubtaskCountChange(e) {
    const count = parseInt(e.target.value);
    if (count > 0 && count <= 20) { // Reasonable limit
      this.setState({ subtaskCount: count });
    }
  }

  // Create subtasks based on the specified count
  handleCreateSubtasks() {
    const { subtaskCount } = this.state;
    const newSubtasks = Array(subtaskCount).fill(null).map(() => ({
      grade: 0,
      completed: false
    }));
    
    this.props.onAssessmentChange({
      subtasks: newSubtasks,
      grading: 0,
      key: this.state.key,
    });
    
    this.setState({ showSubtaskPopup: false, subtaskCount: 1 });
  }

  // Cancel subtask creation
  handleCancelSubtasks() {
    this.setState({ showSubtaskPopup: false, subtaskCount: 1 });
  }

  render() {
    this.color = (() => {
      if (this.props.g.due && !this.props.g.subtasks) return "#05b3f2";
      if (this.props.g.grading >= getSetting("interface.greenmark"))
        return "green";
      if (this.props.g.grading === 0) return "none";
      return this.props.g.grading >= getSetting("interface.orangemark")
        ? "orange"
        : "red";
    })();

    const changeElement =
      !this.props.g.subtasks &&
      (this.props.g.changeToTotalMark && this.props.g.grading ? (
        <span
          style={{
            color: this.props.g.changeToTotalMark >= 0 ? "lightgreen" : "red",
          }}
          title="This indicates how much this assessment has affected your total mark."
        >
          {this.props.g.changeToTotalMark >= 0 ? FaArrowUp() : FaArrowDown()}{" "}
          {MarkDisplay(this.props.g.changeToTotalMark)}
        </span>
      ) : this.props.g.gradePossibilities ? (
        <>
          {this.props.g?.gradePossibilitiesScores &&
            this.props.g?.gradePossibilitiesScores[0].toFixed(2)}
          %:{" "}
          <span
            style={{ color: "indianred" }}
            title="How your mark will be affected if you get 50%."
          >
            <b>{MarkDisplay(this.props.g.gradePossibilities[0])}</b>
          </span>{" "}
          {this.props.g?.gradePossibilitiesScores &&
            this.props.g?.gradePossibilitiesScores[1].toFixed(2)}
          %:
          <span
            style={{ color: "forestgreen" }}
            title="How your mark will be affected if you get 100%."
          >
            <b>{MarkDisplay(this.props.g.gradePossibilities[1])}</b>
          </span>
        </>
      ) : null);

    switch (this.props.mode) {
      case "edit":
        return (
          <>
            <div
              className="card background"
              style={{ borderLeft: `5px solid grey` }}
            >
              <div style={{ display: "block" }}>
                <Input
                  value={this.props.g.name}
                  style={{ fontSize: "large", fontWeight: "bold" }}
                  onChange={this.handleNameChange}
                />

                {changeElement}
                <div style={{ float: "right" }}>
                  <Button
                    onClick={() => {
                      this.props.onAssessmentDelete(this.props.keyy);
                    }}
                  >
                    Delete
                  </Button>
                  {!this.props.g.subtasks && !this.state.showSubtaskPopup && (
                    <Button onClick={this.handleToggleSubtasks}>
                      Subtask Mode
                    </Button>
                  )}
                {/* Inline Subtask Creation UI */}
                {this.state.showSubtaskPopup && (
                  <div
                    style={{
                      display: "inline-block",
                      background: "var(--background-secondary)",
                      padding: '0 10px',
                    }}
                  >
                    <span style={{ margin: '15px 0' }}>
                      <label style={{ display: 'inline-block', marginBottom: '8px' }}>
                        Number of subtasks:
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={this.state.subtaskCount}
                        onChange={this.handleSubtaskCountChange}
                        style={{ width: '80px', textAlign: 'center', margin: '0 auto' }}
                      />
                    </span>
                      <Button onClick={this.handleCancelSubtasks}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={this.handleCreateSubtasks}
                        style={{ backgroundColor: 'var(--green-dark)'}}
                      >
                        Create
                      </Button>
                  </div>
                )}
                </div>

                <div className="assessment-input-grid">
                  <div>
                    <FaWeightHanging /> Weighting
                    <Input
                      value={this.props.g.weighting}
                      style={{ width: 60 }}
                      onChange={this.handleWeightChange}
                      min="1"
                      max="100"
                      type="number"
                    />
                    %
                  </div>
                  <div style={{ display: "block" }}>
                    {!this.props.g.subtasks && (
                      <label>
                        Completed
                        <input
                          type={"checkbox"}
                          checked={!this.props.g.due}
                          onChange={this.handleStatusChange}
                        ></input>
                        <span className="checkbox"></span>
                      </label>
                    )}
                  </div>
                  <div>
                    {this.props.g.subtasks ? (
                      <div style={{ display: "grid", gridTemplateColumns: "auto auto" }}>
                        <div><h3>{this.props.g.grading}%</h3>Average</div>
                        <div><h3>
                        {
                          this.props.g.subtasks.filter((t) => t.completed)
                            .length
                        }
                        /{this.props.g.subtasks.length}</h3> Tasks</div>
                        </div>
                        
                    ) : (
                      <>
                        Grading:
                        <Input
                          value={this.props.g.grading}
                          style={{ width: 60 }}
                          onChange={this.handleGradingChange}
                          min="1"
                          max="100"
                          type="number"
                        />
                        %
                      </>
                    )}
                  </div>
                </div>
                {/* Render subtask UI if in subtask mode */}
                {this.props.g.subtasks && (
                  <div
                    style={{
                      padding: "10px",
                      background: "var(--background-secondary)",
                    }}
                  >
                    Subtasks:
                    {this.props.g.subtasks.map((subtask, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: "5px",
                          gridTemplateColumns: "auto auto auto auto auto",
                          display: "grid",
                          background: subtask.completed
                            ? `linear-gradient(to right, var(--foreground-border) ${subtask.grade}%, rgba(26,26,26,0.5) ${subtask.grade}%)`
                            : "var(--background-primary)",
                        }}
                        className="card subtask"
                      >
                        <label>
                          #{index + 1} (Weighting:{" "}
                          {(
                            this.props.g.weighting /
                            this.props.g.subtasks.length
                          ).toFixed(2)}
                          %):
                        </label>
                        <span>
                          <Input
                            value={subtask.grade}
                            style={{ width: 60, marginLeft: "5px" }}
                            onChange={(e) =>
                              this.handleSubtaskGradeChange(index, e)
                            }
                            min="1"
                            max="100"
                            type="number"
                          />
                          %
                        </span>
                        <label style={{ marginLeft: "10px" }}>
                          Completed
                          <input
                            type="checkbox"
                            checked={subtask.completed || false}
                            onChange={(e) =>
                              this.handleSubtaskCompletedChange(index, e)
                            }
                            style={{ marginLeft: "5px" }}
                          />
                          <span className="checkbox"></span>
                        </label>
                        <Button
                          onClick={() => this.handleDeleteSubtask(index)}
                          style={{ marginLeft: "10px" }}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                    <Button onClick={this.handleAddSubtask}>Add Subtask</Button>
                  </div>
                )}
              </div>
            </div>
          </>
        );
      default:
        let actualWeighting = `${(
          (this.props.g.grading * this.props.g.subtasks
            ? this.props.g.weighting / this.props.g.subtasks.length
            : this.props.g.weighting) / 100
        ).toFixed(2)}%/${
          this.props.g.subtasks
            ? (this.props.g.weighting / this.props.g.subtasks.length).toFixed(
                2
              ) + " - "
            : ""
        }`;

        const progressbar =
          this.props.g.due && !this.props.g.subtasks ? null : (
            <Progress max={100} val={this.props.g.grading} color={this.color}>
              <div
                className="prog-content"
                style={{
                  position: "absolute",
                  width: "3px",
                  height: "25px",
                  bottom: "-5px",
                  background: "rgba(255, 255, 0, 0.5)",
                  left: "25%",
                }}
              ></div>
            </Progress>
          );

        if (this.props.g.due && !this.props.g.subtasks) {
          actualWeighting = null;
        }

        // Calculate potential change if all remaining subtasks are completed with 100 or 0
        const potentialSubtaskMarks =
          this.props.g.subtasks && this.props.g.subtasks.length > 0
            ? (() => {
                const subtasks = this.props.g.subtasks;
                const completed = subtasks.filter((sub) => sub.completed);
                const completedTotal = completed.reduce(
                  (acc, sub) => acc + sub.grade,
                  0
                );
                const numIncomplete = subtasks.length - completed.length;
                // Potential average grade if remaining subtasks score 100 or 0
                const potentialUp = subtasks.length
                  ? (completedTotal + numIncomplete * 100) / subtasks.length
                  : 0;
                const potentialDown = subtasks.length
                  ? (completedTotal + numIncomplete * 0) / subtasks.length
                  : 0;
                // Calculate the change from the current grading value
                return {
                  up: parseFloat(potentialUp),
                  down: parseFloat(potentialDown),
                };
              })()
            : { up: 0, down: 0 };

        return (
          <>
            <div
              className="card background"
              style={{
                borderLeft: `5px solid ${this.color}`,
                margin: "10px 0px 0px 0px",
              }}
            >
              <div
                style={{ background: "grey", width: "95%", height: "100%" }}
              ></div>
              <h3>
                <FaCalendar />
                {this.props.g.name}{" "}
                {this.props.g.subtasks && (
                   <span style={{ fontSize: "small", color: 'var(--foreground-secondary)' }}>{this.props.g.subtasks.length} tasks</span>
                )}
              </h3>
              {progressbar}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto max-content",
                }}
              >
                <span>
                  <Label>
                    <FaWeightHanging /> {actualWeighting}
                    {this.props.g.weighting}%
                  </Label>
                  {changeElement && <Label>{changeElement}</Label>}
                  {this.props.g.subtasks && (
                    <>
                      <Label style={{ fontSize: "small" }}>
                        {
                          this.props.g.subtasks.filter((t) => t.completed)
                            .length
                        }
                        /{this.props.g.subtasks.length} completed
                      </Label>
                    </>
                  )}
                  {this.props.g.subtasks && (
                    <>
                      <Label>
                        <span
                          title={`You will currently achieve a minimum of ${potentialSubtaskMarks.down.toFixed(
                            2
                          )}`}
                          style={{ color: "rgb(255, 100, 100)" }}
                        >
                          <FaAngleLeft />{" "}
                          {MarkDisplay(potentialSubtaskMarks.down)}
                        </span>
                      </Label>

                      <Label>
                        <span
                          title={`You will currently achieve a maximum of ${potentialSubtaskMarks.up.toFixed(
                            2
                          )}`}
                          style={{ color: "yellow" }}
                        >
                          <FaAngleRight />{" "}
                          {MarkDisplay(potentialSubtaskMarks.up)}
                        </span>
                      </Label>
                    </>
                  )}
                </span>
                <div>
                  <div style={{ fontSize: "x-large" }}>
                    {this.props.g.subtasks ? (
                      <>
                        {MarkDisplay(this.props.g.grading)}
                        <span
                          style={{
                            fontSize: "small",
                            verticalAlign: "bottom",
                          }}
                        >
                          {this.props.g.subtasks.length ==
                          this.props.g.subtasks.filter((t) => t.completed)
                            .length
                            ? ""
                            : ` on avg`}
                        </span>
                      </>
                    ) : this.props.g.due ? (
                      "Due"
                    ) : (
                      MarkDisplay(this.props.g.grading)
                    )}
                  </div>
                </div>
              </div>
            </div>

            {this.props.g.subtasks && (
              <>
                <div
                  style={{
                    background: "var(--background-secondary)",
                    padding: "10px",
                    borderRadius: "0 0 5px 5px",
                  }}
                >
                  {this.props.g.subtasks
                    .filter((a) => a.completed)
                    .map((subtask, index) => (
                      <span
                        title={`Task ${index + 1} (${
                          subtask.completed ? `${subtask.grade}%` : "Due"
                        })`}
                        className="label"
                        style={{
                          color: subtask.completed
                            ? "inherit"
                            : "var(--foreground-secondary)",
                          background: subtask.completed
                            ? //progress background question mark?
                              //`linear-gradient(to top, var(--foreground-border) ${subtask.grade}%, var(--background-secondary) ${subtask.grade}%)`
                              `var(--background-secondary)`
                            : "var(--background-primary)",
                          borderBottom: `1px solid ${
                            subtask.completed
                              ? calculateColorFromGrade(subtask.grade)
                              : "var(--blue)"
                          }`,
                        }}
                      >
                        {MarkDisplay(subtask.grade)}
                      </span>
                    ))}

                  {this.props.g.subtasks.length -
                    this.props.g.subtasks.filter((t) => t.completed).length >
                    0 && (
                    <span
                      className="label"
                      style={{ borderBottom: "1px solid var(--blue)" }}
                    >
                      +
                      {this.props.g.subtasks.length -
                        this.props.g.subtasks.filter((t) => t.completed)
                          .length}{" "}
                      Due
                    </span>
                  )}
                </div>
              </>
            )}
          </>
        );
    }
  }
}

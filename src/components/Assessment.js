import React from "react";
import { FaCalendar, FaWeightHanging } from "react-icons/fa";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
import { Progress } from "./Progress";
import { Select } from "./SingleSelect";

export class Assessment extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.props.g
    this.state.key = this.props.keyy;
    this.state.mode = undefined
    this.state.due = this.props.g.due || false

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleWeightChange = this.handleWeightChange.bind(this);
    this.handleGradingChange = this.handleGradingChange.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  componentDidUpdate() {
    if (this.props.mode !== this.state.mode) {
      if (!this.state.grading) this.setState({ grading: 0 })
      if (!this.state.weighting) this.setState({ weighting: 0 })
      this.setState({ mode: this.props.mode })
    }
  }

  handleNameChange(e) {
    this.props.onAssessmentChange({
      name: e.target.value,
      key: this.state.key
    });
  }
  handleWeightChange(e) {
    const targetValue = this.sanitizeNumberInput(e.target.value)
    if (targetValue === -1) return
    this.props.onAssessmentChange({
      weighting: targetValue,
      key: this.state.key
    });
  }
  handleGradingChange(e) {
    const targetValue = this.sanitizeNumberInput(e.target.value)
    if (targetValue === -1) return
    this.props.onAssessmentChange({
      grading: targetValue,
      key: this.state.key
    });
  }
  sanitizeNumberInput(n) {
    if (parseFloat(n) > 100 || parseFloat(n) < 0) return -1;
    return parseFloat(n)
  }
  handleStatusChange(i) {
    console.log(i)
    this.props.onAssessmentChange({
      // eslint-disable-next-line
      due: (i == 1),
      //i hate eslint
      key: this.state.key
    });
  }

  render() {
    this.color = (() => {
      if (this.props.g.due) return "#05b3f2";
      if (this.props.g.grading >= 80) return "green";
      if (this.props.g.grading === 0) return "none";
      return this.props.g.grading >= 50 ? "orange" : "red";
    })();


    switch (this.props.mode) {
      case "edit":
        return (
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
              <div style={{ float: "right" }}>
                <Button
                  onClick={() => { this.props.onAssessmentDelete(this.props.keyy) }}
                >Delete</Button>
              </div>
              <div
                className="assessment-input-grid"
              >
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
                  Status:
                  <Select
                    options={[
                      { name: 'Due', value: 1 },
                      { name: 'Complete', value: 0 }
                    ]}

                    onChange={this.handleStatusChange}

                    value={this.props.g.due ? 1 : 0}
                  >
                  </Select>
                </div>
                <div>
                  Grading:
                  <Input
                    value={this.props.g.grading}
                    style={{ width: 60 }}
                    onChange={this.handleGradingChange}
                    min="1"
                    max="100"
                    type="number"
                    disabled={this.props.g.due}
                  />
                  %
                </div>
              </div>
            </div>
          </div>
        );
      default:
        let actualWeighting = `${Math.roundTwoDigits(this.props.g.grading * this.props.g.weighting) / 100
          }%/`;

        const marks = this.props.g.due
          ? "Due assessment"
          : `${this.props.g.grading}%`;

        const progressbar = this.props.g.due ? null : (
          <Progress max={100} val={this.props.g.grading} color={this.color}></Progress>
        );

        if (this.props.g.due) {
          actualWeighting = null;
        }

        return (
          <div
            className="card background"
            style={{ borderLeft: `5px solid ${this.color}` }}
          >
            <div
              style={{ background: "grey", width: "95%", height: "100%" }}
            ></div>

            <h3><FaCalendar />{this.props.g.name} </h3>

            {progressbar}

            <div style={{ float: "right", fontSize: "x-large" }}>{marks}</div>

            <span style={{ textAlign: "center" }}>
              <Label>
                <FaWeightHanging /> {actualWeighting}
                {this.props.g.weighting}%
              </Label>
            </span>
          </div>
        );
    }
  }
}

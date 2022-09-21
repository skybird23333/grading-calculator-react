import React from "react";
import { FaWeightHanging } from "react-icons/fa";
import { Input } from "./Input";
import { Label } from "./Label";
import { Progress } from "./Progress";
import { Select } from "./SingleSelect";

export class Assessment extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.g;
    this.state.key = this.props.keyy;
    this.state.mode = undefined

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleWeightChange = this.handleWeightChange.bind(this);
    this.handleGradingChange = this.handleGradingChange.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value }, () => {
      this.props.onAssessmentChange(this.state);
    });
  }
  handleWeightChange(e) {
    const targetValue = this.sanitizeNumberInput(e.target.value)
    if (targetValue == -1 ) return
    this.setState({ weighting: targetValue }, () => {
      this.props.onAssessmentChange(this.state);
    });
  }
  handleGradingChange(e) {
    const targetValue = this.sanitizeNumberInput(e.target.value)
    if (targetValue == -1 ) return
    this.setState({ grading: targetValue }, () => {
      this.props.onAssessmentChange(this.state);
    });
  }
  sanitizeNumberInput(n) {
    if (parseInt(n) > 100 || parseInt(n) < 0) return -1;
    return n
  }
  handleStatusChange(i) {
    console.log(i)
    // eslint-disable-next-line
    this.setState({ due: (i == 1) })
    this.props.onAssessmentChange(this.state);
  }

  render() {
    this.color = (() => {
      if (this.state.due) return "#05b3f2";
      if (this.state.grading >= 80) return "green";
      if (this.state.grading === 0) return "none";
      return this.state.grading >= 50 ? "orange" : "red";
    })();

    if(this.props.mode != this.state.mode) {
      if(!this.state.grading) this.state.grading = 0
      if(!this.state.weighting) this.state.weighting = 0
      this.setState({mode: this.props.mode})
    }


    switch (this.props.mode) {
      case "edit":
        return (
          <div
            className="card background"
            style={{ borderLeft: `5px solid grey` }}
          >
            <div style={{ display: "block" }}>
              <Input
                value={this.state.name}
                style={{ fontSize: "large", fontWeight: "bold" }}
                onChange={this.handleNameChange}
              />
              <div
                style={{ display: 'grid', gridTemplateColumns: 'auto auto auto' }}
              >
                <div>
                  <FaWeightHanging /> Weighting
                  <Input
                    value={this.state.weighting}
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

                    value={this.state.due ? 1 : 0}
                  >
                  </Select>
                </div>
                <div>
                  Grading:
                  <Input
                    value={this.state.grading}
                    style={{ width: 60 }}
                    onChange={this.handleGradingChange}
                    min="1"
                    max="100"
                    type="number"
                    disabled={this.state.due}
                  />
                  %
                </div>
              </div>
            </div>
          </div>
        );
      default:
        let actualWeighting = `${Math.roundTwoDigits(this.state.grading * this.state.weighting) / 100
          }%/`;

        const marks = this.state.due
          ? "Due assessment"
          : `${this.state.grading}%`;

        const progressbar = this.state.due ? null : (
          <Progress max={100} val={this.state.grading} color={this.color}></Progress>
        );

        if (this.state.due) {
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

            <h3>{this.state.name} </h3>

            {progressbar}

            <div style={{ float: "right", fontSize: "x-large" }}>{marks}</div>

            <span style={{ textAlign: "center" }}>
              <Label>
                <FaWeightHanging /> {actualWeighting}
                {this.state.weighting}%
              </Label>
            </span>
          </div>
        );
    }
  }
}

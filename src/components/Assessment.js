import React from "react";
import {FaArrowDown, FaArrowUp, FaCalendar, FaWeightHanging} from "react-icons/fa";
import {Button} from "./Button";
import {Input} from "./Input";
import {Label} from "./Label";
import {Progress} from "./Progress";
import {Select} from "./SingleSelect";
import MarkDisplay from "./MarkDisplay";
import {getSetting} from "../utils/settingsManager";

export class Assessment extends React.Component {
    /**
     * @param props {Object}
     * @param props.g {Object}
     * @param props.g.name {String}
     * @param props.g.weighting {Number}
     * @param props.g.grading {Number}
     * @param props.g.due {Boolean}
     * @param props.g.changeToTotalMark {Number}
     * @param props.g.gradePossibilities {[Number, Number]}
     * @param props.g.gradePossibilitiesScores {[Number, Number]}
     * @param props.keyy {Number}
     * @param props.mode {String}
     * @param props.onAssessmentChange {Function}
     * @param props.onAssessmentDelete {Function}
     */
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
            if (!this.state.grading) this.setState({grading: 0})
            if (!this.state.weighting) this.setState({weighting: 0})
            this.setState({mode: this.props.mode})
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
        console.log(i.target.checked)
        this.props.onAssessmentChange({
            // eslint-disable-next-line
            due: (!i.target.checked),
            //i hate eslint
            key: this.state.key
        });
    }

    render() {
        console.log(this.gradePossibilitiesScores)

        this.color = (() => {
            if (this.props.g.due) return "#05b3f2";
            if (this.props.g.grading >= getSetting("interface.greenmark")) return "green";
            if (this.props.g.grading === 0) return "none";
            return this.props.g.grading >= getSetting("interface.orangemark") ? "orange" : "red";
        })();


        const changeElement =
            (this.props.g.changeToTotalMark && this.props.g.grading) ?
                <span
                    style={{color: this.props.g.changeToTotalMark >= 0 ? "lightgreen" : "red"}}
                    title="This indicates how much this assessment has affected your total mark."
                >
              {this.props.g.changeToTotalMark >= 0 ? FaArrowUp() : FaArrowDown()} {MarkDisplay(this.props.g.changeToTotalMark)}
            </span> :
                this.props.g.gradePossibilities ?
                    <>
                        {this.props.g?.gradePossibilitiesScores && this.props.g?.gradePossibilitiesScores[0].toFixed(2)}%: <span
                        style={{color: "indianred"}}
                        title="How your mark will be affected if you get 50%."
                    ><b>{MarkDisplay(this.props.g.gradePossibilities[0])}</b></span> {" "}{this.props.g?.gradePossibilitiesScores && this.props.g?.gradePossibilitiesScores[1].toFixed(2)}%:
                        <span
                            style={{color: "forestgreen"}}
                            title="How your mark will be affected if you get 100%."
                        ><b>{MarkDisplay(this.props.g.gradePossibilities[1])}</b></span>
                    </>
                    : null;
        switch (this.props.mode) {
            case "edit":
                return (
                    <div
                        className="card background"
                        style={{borderLeft: `5px solid grey`}}
                    >
                        <div style={{display: "block"}}>
                            <Input
                                value={this.props.g.name}
                                style={{fontSize: "large", fontWeight: "bold"}}
                                onChange={this.handleNameChange}
                            />

                            {changeElement}
                            <div style={{float: "right"}}>
                                <Button
                                    onClick={() => {
                                        this.props.onAssessmentDelete(this.props.keyy)
                                    }}
                                >Delete</Button>
                            </div>
                            <div
                                className="assessment-input-grid"
                            >
                                <div>
                                    <FaWeightHanging/> Weighting
                                    <Input
                                        value={this.props.g.weighting}
                                        style={{width: 60}}
                                        onChange={this.handleWeightChange}
                                        min="1"
                                        max="100"
                                        type="number"
                                    />
                                    %
                                </div>
                                <div style={{display: "block"}}>
                                    <label>
                                        Completed
                                        <input type={"checkbox"} checked={!this.props.g.due}
                                               onChange={this.handleStatusChange}></input>
                                        <span className="checkbox"></span>
                                    </label>
                                </div>
                                <div>
                                    Grading:
                                    <Input
                                        value={this.props.g.grading}
                                        style={{width: 60}}
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
                let actualWeighting = `${((this.props.g.grading * this.props.g.weighting) / 100).toFixed(2)
                }%/`;

                const progressbar = this.props.g.due ? null : (
                    <Progress max={100} val={this.props.g.grading} color={this.color}>
                        <div
                            className="prog-content"
                            style={{
                                position: "absolute",
                                width: 3 + "px",
                                height: '25px',
                                bottom: '-5px',
                                background: "rgba(255, 255, 0, 0.5)",
                                left: 25 + "%"
                            }}
                        ></div>
                    </Progress>
                );

                if (this.props.g.due) {
                    actualWeighting = null;
                }

                return (
                    <div
                        className="card background"
                        style={{borderLeft: `5px solid ${this.color}`, margin: '10px 0px 0px 0px'}}
                    >
                        <div
                            style={{background: "grey", width: "95%", height: "100%"}}
                        ></div>

                        <h3><FaCalendar/>{this.props.g.name} </h3>

                        {progressbar}

                        <div style={{float: "right", fontSize: "x-large"}}>
                            {this.props.g.due
                                ? "Due"
                                : MarkDisplay(this.props.g.grading)}</div>

                        <span style={{textAlign: "center"}}>
              <Label>
                <FaWeightHanging/> {actualWeighting}
                  {this.props.g.weighting}%
              </Label>
              <Label>
                  {changeElement}
              </Label>
            </span>
                    </div>
                );
        }
    }
}

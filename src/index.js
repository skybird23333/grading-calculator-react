import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { FaClock, FaWeightHanging } from 'react-icons/fa'

class Label extends React.Component {
    render() {
        return (
            <span className='label'>
                {this.props.children}
            </span>
        )
    }
}

class Assessment extends React.Component {
    constructor(props) {
        super(props)
        this.color = (() => {
            if (this.props.g.due) return '#05b3f2'
            if (this.props.g.grading >= 80) return 'green'
            if (this.props.g.grading === 0) return 'black'
            return this.props.g.grading >= 50 ? 'orange' : 'red'
        })()

    }

    render() {

        let actualWeighting = `${Math.round(this.props.g.grading * this.props.g.weighting) / 100}%/`

        const marks = this.props.g.due ? 'Due assessment' : `${this.props.g.grading}%`

        const progressbar = this.props.g.due ? null :
            <div className="prog-container">
                <div className="prog-content" style={{ width: this.props.g.grading + '%', background: this.color }}></div>
            </div>

        if (this.props.g.due) {
            actualWeighting = null
        }

        return (
            <div className='card background' style={{ borderLeft: `5px solid ${this.color}` }}>

                <div style={{ background: 'grey', width: '95%', height: '100%' }}></div>

                <h3>{this.props.g.name} </h3>


                {progressbar}

                <div style={{ float: 'right', fontSize: 'x-large' }}>
                    {marks}
                </div>

                <span style={{ textAlign: 'center' }}>


                    <Label><FaWeightHanging /> {actualWeighting}{this.props.g.weighting}%</Label>

                    <Label><FaClock /> Jun 3</Label>

                </span>

            </div>
        )
    }
}

class Button extends React.Component {
    render() {
        return (
            <button className='button' style={this.props.style}>
                {this.props.children}
            </button>
        )
    }
}
class Subject extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Example Subject',
            passing: 0.5,
            assessments: [
                {
                    name: "Task 1",
                    grading: 73,
                    weighting: 20,
                    due: false
                },
                {
                    name: "Task 2",
                    grading: 84,
                    weighting: 25,
                    due: false
                },
                {
                    name: "Task 3",
                    grading: 96.25,
                    weighting: 25,
                    due: false
                },
                {
                    name: "Exam",
                    grading: 68,
                    weighting: 30,
                    due: true
                },
            ]
        }

        this.currentGradeTotal = 0 //total grading of all assessments, scaled by their weighting
        this.currentWeightTotal = 0 //total weighting of all assessments completed
        this.weightTotal = 0 //total weighting of all assessments regardless of completion
        this.completedAssessmentCount = 0
        this.totalAssessmentCount = 0

        this.state.assessments.forEach(a => {
            this.weightTotal += a.weighting
            this.totalAssessmentCount += 1
            if (a.due) return
            this.currentWeightTotal += a.weighting
            this.currentGradeTotal += a.grading * a.weighting / 100
            this.completedAssessmentCount += 1
        })

        this.unallocatedMarks = Math.round(100 - this.weightTotal)
        this.currentGrade = this.currentGradeTotal / this.currentWeightTotal * 100

        this.minimumGrade = ((.8 * (this.weightTotal - this.unallocatedMarks) - this.currentGradeTotal) / (this.weightTotal - this.currentWeightTotal)) * 100
    }

    render() {

        const assessments = this.state.assessments.map((m, i) => {
            return (
                <Assessment key={i} g={m} />
            )
        })

        const allocationWarning = this.unallocatedMarks ? <div className='error'>
            <p>
                There are {this.unallocatedMarks}% of the total weighting left unallocated. Check that you have filled in all assessments.
            </p>
        </div> : null

        return (
            <div>
                <h1 style={{ width: '100%' }}>
                    {this.state.name}
                    <Button style={{ float: 'right' }}>Edit</Button>
                </h1>

                <div className='card background'>
                    Currently {Math.round(this.currentGrade)}% ({Math.round(this.currentGradeTotal)}% out of the {Math.round(this.currentWeightTotal)}% available)


                    <div className='prog-container'>

                        <div className="prog-content-large" style={{ width: (100 - this.weightTotal) + '%', background: 'red', float: 'right' }}></div>
                        {/*Weights that weren't allocated for*/}

                        <div className="prog-content-large" style={{ width: this.currentWeightTotal + "%", background: 'var(--foreground-border)' }}>
                            {/*Weighting for assessments done*/}
                            <div className="prog-content-large" style={{ width: this.currentGrade + '%' }}>
                                {/*Grading*/}
                            </div>
                        </div>
                    </div>
                    Score {Math.ceil(this.minimumGrade)}% minimum in the remaining exams to stay on the 80% line.
                </div>


                {allocationWarning}

                <h3>
                    {this.completedAssessmentCount} Assessments Completed
                </h3>
                {assessments}
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <div className='content'>
        <div className="content-content">
            <Subject />
        </div>
    </div>
);

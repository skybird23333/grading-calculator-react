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
            return this.props.g.grading >= 70 ? 'orange' : 'red'
        })()

    }

    render() {

        let actualWeighting = `${Math.round(this.props.g.grading * this.props.g.weighting)/100}%/`

        const marks = this.props.g.due ? 'Due assessment' : `${this.props.g.grading}%`

        const progressbar = this.props.g.due ? null :
            <div className="prog-container">
                <div className="prog-content" style={{ width: this.props.g.grading + '%', background: this.color }}></div>
            </div>

        if (this.props.g.due) {
            actualWeighting = null
        }

        return (
            <div className='card' style={{ borderLeft: `5px solid ${this.color}` }}>

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
    //TODO: Fix button and other interactable components as root covers the entire thing
    constructor(props) {
        super(props)
        this.className = 'button'
    }

    handleMouseEnter() {
        this.className = 'button-hover'
    }

    handleMouseLeave() {
        this.className = 'button'
    }

    //FIXME: Uncaught TypeError: can't access property "className", this is undefined in both functions

    render() {
        return(
            <button className={this.className} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
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
                    name: "RSP: Task 1",
                    grading: 65,
                    weighting: 10,
                    due: false
                },
                {
                    name: "RSP: Task 2",
                    grading: 83,
                    weighting: 12,
                    due: false
                },
                {
                    name: "CRE: Task 3",
                    grading: 73.3,
                    weighting: 24,
                    due: false
                },
                {
                    name: "RSP: Task 4",
                    grading: 63.3,
                    weighting: 16,
                    due: false
                },
                {
                    name: "EXM: Examination",
                    grading: null,
                    weighting: 30,
                    due: true
                }
            ]
        }

        this.currentGradeTotal = 0 //total grading of all assessments, scaled by their weighting
        this.currentWeightTotal = 0 //total weighting of all assessments completed
        this.weightTotal = 0 //total weighting of all assessments regardless of completion

        this.state.assessments.forEach(a => {
            this.weightTotal += a.weighting
            if (a.due) return
            this.currentWeightTotal += a.weighting
            this.currentGradeTotal += a.grading * a.weighting / 100
        })

        this.currentGrade = this.currentGradeTotal / this.currentWeightTotal * 100
    }

    render() {

        const assessments = this.state.assessments.map((m, i) => {
            return (
                <Assessment key={i} g={m} />
            )
        })

        const allocationWarning = (100 - this.weightTotal) ? <div className='error'>
            <p>
                There are {Math.round((100 - this.weightTotal))}% of the total weighting left unallocated. Check that you have filled in all assessments.
            </p>
        </div> : null

        return (
            <div>
                <h1>{this.state.name}</h1>

                {Math.round(this.currentGrade)}% ({Math.round(this.currentGradeTotal)}% out of the {Math.round(this.currentWeightTotal)}% completed)


                <div className='prog-container'>

                    <div className="prog-content" style={{ width: (100 - this.weightTotal) + '%', background: 'red', float: 'right' }}></div>
                    {/*Weights that weren't allocated for*/}

                    <div className="prog-content" style={{ width: this.currentWeightTotal + "%", background: 'var(--foreground-border)' }}>
                        {/*Weighting for assessments done*/}
                        <div className="prog-content" style={{ width: this.currentGrade + '%' }}>
                            {/*Grading*/}
                        </div>
                    </div>
                </div>
                {allocationWarning}

                {assessments}
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <div>
        <div className='content'>
            <div className="content-content">
                <Subject />
            </div>
        </div>
    </div>
);

import React from 'react';
import { Button } from '../components/Button';
import { Assessment } from '../components/Assessment';

var subjectInformation = {
    editing: false,
    name: 'Example Subject',
    passing: 0.5,
    assessments: [
        {
            name: "Task 1",
            grading: 65,
            weighting: 10,
            due: false
        },
        {
            name: "Task 2",
            grading: 83,
            weighting: 12,
            due: false
        },
        {
            name: "Task 3",
            grading: 73.3,
            weighting: 24,
            due: false
        },
        {
            name: "Task 4",
            grading: 50,
            weighting: 16,
            due: false
        },
        {
            name: "Exam",
            grading: 50,
            weighting: 30,
            due: true
        },
    ]
};

export class Subject extends React.Component {
    constructor(props) {
        super(props);
        this.state = subjectInformation;

        this.currentGradeTotal = 0; //total grading of all assessments, scaled by their weighting
        this.currentWeightTotal = 0; //total weighting of all assessments completed
        this.weightTotal = 0; //total weighting of all assessments regardless of completion
        this.completedAssessmentCount = 0;
        this.totalAssessmentCount = 0;

        this.state.assessments.forEach(a => {
            this.weightTotal += a.weighting;
            this.totalAssessmentCount += 1;
            if (a.due)
                return;
            this.currentWeightTotal += a.weighting;
            this.currentGradeTotal += a.grading * a.weighting / 100;
            this.completedAssessmentCount += 1;
        });

        this.unallocatedMarks = Math.round(100 - this.weightTotal);
        this.currentGrade = this.currentGradeTotal / this.currentWeightTotal * 100;

        this.minimumGrade = ((.8 * (this.weightTotal - this.unallocatedMarks) - this.currentGradeTotal) / (this.weightTotal - this.currentWeightTotal)) * 100;

        this.handleEdit = this.handleEdit.bind(this);
        this.handleEditSave = this.handleEditSave.bind(this);
    }

    handleEdit() {
        this.setState({ editing: true })
    }

    handleEditSave() {
        this.setState({ editing: false })
    }

    render() {

        const assessments = this.state.assessments.map((m, i) => {
            return (
                <Assessment key={i} g={m} mode={this.state.editing ? 'edit' : null} />
            );
        });

        const allocationWarning = this.unallocatedMarks ? <div className='error'>
            <p>
                There are {this.unallocatedMarks}% of the total weighting left unallocated. Check that you have filled in all assessments.
            </p>
        </div> : null;

        let minimumScore =
            <div className="info">
                <p>
                    Score {Math.ceil(this.minimumGrade)}% minimum in the remaining assessments to stay on the 80% line.

                </p>
            </div>

        if (this.minimumGrade >= 100) {
            minimumScore = <div className="warn">
                <p>
                    You won't able to reach your goal. Scoring full marks in remaining assessments will give
                    you {Math.ceil((this.currentGradeTotal + (this.weightTotal - this.currentWeightTotal)) / this.weightTotal * 100)}%.
                </p>
            </div>
        }

        if (!(this.weightTotal - this.currentWeightTotal)) minimumScore = null

        const editButton = this.state.editing ?
            <Button style={{ float: 'right' }} onClick={this.handleEditSave}>Save</Button> :
            <Button style={{ float: 'right' }} onClick={this.handleEdit}>Edit</Button>

        let scoreInformation = <div className='card background'>
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
            {minimumScore}


            {allocationWarning}
            <h3>
                {this.completedAssessmentCount} Assessments Completed
            </h3>
        </div>

        if (this.state.editing) scoreInformation = null

        return (
            <div>
                <h1 style={{ width: '100%' }}>
                    {this.state.name}
                    {editButton}
                </h1>

                {scoreInformation}

                {assessments}
            </div>
        );
    }
}

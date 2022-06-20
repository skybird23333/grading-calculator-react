import React from 'react';
import { FaClock, FaStar, FaWeightHanging } from 'react-icons/fa';
import { Label } from './Label';

export class Assessment extends React.Component {
    constructor(props) {
        super(props);
        this.color = (() => {
            if (this.props.g.due)
                return '#05b3f2';
            if (this.props.g.grading >= 80)
                return 'green';
            if (this.props.g.grading === 0)
                return 'black';
            return this.props.g.grading >= 50 ? 'orange' : 'red';
        })();


    }

    render() {

        switch (this.props.mode) {
            case 'edit':
                return (
                    <div className='card background'>
                        <input value={this.props.g.name}
                            style={{ fontSize: 'large', display: 'block', fontWeight: 'bold' }}
                            className='input' />
                        <FaWeightHanging />
                        <input value={this.props.g.weighting}
                            className='input' />%
                        <FaStar />
                        <input value={this.props.g.grading}
                            className='input' />%
                    </div>
                );
            default:

                let actualWeighting = `${Math.round(this.props.g.grading * this.props.g.weighting) / 100}%/`;

                const marks = this.props.g.due ? 'Due assessment' : `${this.props.g.grading}%`;

                const progressbar = this.props.g.due ? null :
                    <div className="prog-container">
                        <div className="prog-content" style={{ width: this.props.g.grading + '%', background: this.color }}></div>
                    </div>;

                if (this.props.g.due) {
                    actualWeighting = null;
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
                );
        }
    }
}

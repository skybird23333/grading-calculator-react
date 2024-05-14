import {FaBook, FaCalendar, FaWeightHanging} from "react-icons/fa";
import {useNavigate} from "react-router-dom"
import {removeSubject} from "../utils/storagehelper";
import {Button} from "./Button";
import {calculateInformation} from "../utils/calculateInformation";

export function SubjectComponent({ subject, id }) {
    const navigate = useNavigate()

    if ((!subject.name && !subject.goal) || subject === {}) {
        console.log(`UNABLE TO LOAD SUBJECT ${id}. DATA HAS BEEN LOGGED BELOW.`)
        console.log(subject)

        const handleDeleteSubject = () => {
            removeSubject(id)
        }

        return (
            <div className="card color-red">
                Unable to load subject {id}. See logs for more details.
                <Button style={{ background: 'var(--red)' }} onClick={handleDeleteSubject}>
                    Delete
                </Button>
            </div>
        )
    }
    const info = calculateInformation(subject.assessments, subject.goal)

    const color = (() => {
        if (isNaN(info.currentGrade)) return "none"
        if (info.currentGrade >= 80) return "green";
        if (info.currentGrade === 0) return "none";
        return info.currentGrade >= 50 ? "yellow" : "red";
    })();

    let minimumScore = (
        <div>
            Score a minimum of <b>{Math.ceil(info.minimumGrade)}%</b> to stay above your goal.
        </div>
    );

    if (info.minimumGrade >= 100) {
        minimumScore = (
            <div className="warn">
                You won't able to reach {subject.goal}%.
            </div>
        );
    }

    if (info.minimumGrade <= 0) {
        minimumScore = (
            <div className="success">
                You have aced the goal of {subject.goal}%.
            </div>
        );
    }

    if (isNaN(info.currentGrade)) {
        minimumScore = (<></>)
    }

    return (
        <div className={`card color-${color} card-clickable`} style={{
            borderLeftWidth: '10px',
            background: 'var(--background-tertiary)',
            filter: 'drop-shadow(1px 1px 8px black)'
        }}
            onClick={() => { navigate(`/subjects/${id}`) }}
        >
            <div className="card-header">
                <FaBook /> {subject.name}
                {" "}
                <span style={{ color: `var(--${color})`, filter: 'brightness(150%)' }}>
                    {info.currentGrade}% {" "}
                </span>
                <span style={{ fontWeight: 'normal' }}>
                    <span style={{ color: 'var(--foreground-secondary)' }}>
                        Avg {info.markAverage}% {" "}
                    </span>
                    <span style={{ color: 'rgb(150, 213, 255)' }}>
                        Goal {subject.goal}%
                    </span>
                </span>
            </div>


            <div className="prog-container">
                <div
                    className="prog-content"
                    style={{
                        width: 100 - info.weightTotal + "%",
                        background: "red",
                        float: "right",
                    }}
                ></div>
                {/*Weights that weren't allocated for*/}


                <div
                    className="prog-content"
                    style={{
                        width: info.currentWeightTotal + "%",
                        background: "var(--foreground-border)",
                        position: 'relative'
                    }}
                > {/* Already done assessments */}

                    <div
                        className="prog-content"
                        style={{
                            position: "absolute",
                            width: 5 + "px",
                            height: '15px',
                            bottom: '-5px',
                            background: "rgba(0, 153, 255, 0.5)",
                            left: subject.goal + "%"
                        }}
                    >
                    </div>
                    {/*Weighting for assessments done*/}
                    <div
                        className="prog-content"
                        style={{ width: info.currentGrade + "%" }}
                    >
                        {/*Grading*/}
                    </div>
                </div>
            </div>


            <div className="card-footer">
                {minimumScore}
                {info.completedAssessmentCount}/{info.totalAssessmentCount} <FaCalendar /> | {info.currentGradeTotal}%/{info.currentWeightTotal}% <FaWeightHanging />
            </div>
        </div>
    )
}


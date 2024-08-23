import {FaBook, FaCalendar, FaWeightHanging} from "react-icons/fa";
import {useNavigate} from "react-router-dom"
import {removeSubject} from "../utils/storagehelper";
import {Button} from "./Button";
import {calculateInformation} from "../utils/calculateInformation";
import gradeOverview from "./GradeOverview";
import calculateColorFromGrade from "../utils/calculateColorFromGrade";

// this is a copy paste of SubjectComponent with a few features removed.
export function SubjectComponentCompact({subject, id}) {
    const navigate = useNavigate()

    if ((!subject?.name && !subject?.goal) || subject === {}) {
        console.log(`UNABLE TO LOAD SUBJECT ${id}. DATA HAS BEEN LOGGED BELOW.`)
        console.log(subject)

        const handleDeleteSubject = () => {
            removeSubject(id)
        }

        return (
            <div className="card color-red">
                Unable to load subject {id}. See logs for more details.
                <Button style={{background: 'var(--red)'}} onClick={handleDeleteSubject}>
                    Delete
                </Button>
            </div>
        )
    }
    const info = calculateInformation(subject.assessments, subject.goal)

    const color = calculateColorFromGrade(info.currentGrade)

    let minimumScore = (
        <span>
            🎯 {Math.ceil(info.minimumGrade)}%
        </span>
    );

    if (info.minimumGrade >= 100) {
        minimumScore = (
            <span>
                ❌{subject.goal}%.
            </span>
        );
    }

    if (info.minimumGrade <= 0) {
        minimumScore = (
            <span>
                🥳 {subject.goal}%.
            </span>
        );
    }

    if (isNaN(info.currentGrade) || info.currentWeightTotal === 100) {
        minimumScore = (<></>)
    }

    subject.assessments.map((a, i) => {
        if (i > 0 && a.grading) {
            a.changeToTotalMark = calculateInformation(subject.assessments.slice(0, i + 1), 0).currentGrade //Only pick ones up to the current one
                - calculateInformation(subject.assessments.slice(0, i), 0).currentGrade //Only pick ones up to the current one(excl current one)
        }
        return a
    })

    const recentChange = subject.assessments.filter(a => a.changeToTotalMark).pop()?.changeToTotalMark.toFixed(2)
    const totalChange = subject.assessments.filter(a => a.changeToTotalMark).map(a => a.changeToTotalMark)
        .reduce((prev, cur) => prev + cur, 0).toFixed(2)

    return (
        <div className={`card color-${color} card-clickable`} style={{
            borderLeftWidth: '10px',
            background: 'var(--background-tertiary)',
            margin: 0
        }}
             onClick={() => {
                 navigate(`/subjects/${id}`)
             }}
        >
            <span>
                <b>{subject.name} <span style={{color: `var(--${color})`, filter: 'brightness(200%)'}}>{info.currentGrade.toFixed(1)}%</span></b> {minimumScore}
            </span>

            <div className="prog-container">
                <div
                    className="prog-content"
                    style={{
                        width: "100%",
                        background: "var(--foreground-border)",
                        position: 'relative'
                    }}
                > {/* Already done assessments */}
                    <div
                        className="prog-content"
                        style={{
                            position: "absolute",
                            width: 3 + "px",
                            height: '15px',
                            bottom: '-5px',
                            background: "rgba(255, 0, 0, 0.5)",
                            left: info.currentGrade / (info.currentWeightTotal) * 10 + "%"
                        }}
                    ></div>
                    <div
                        className="prog-content"
                        style={{
                            position: "absolute",
                            width: 3 + "px",
                            height: '15px',
                            bottom: '-5px',
                            background: "rgba(0, 153, 255, 0.5)",
                            left: subject.goal + "%"
                        }}
                    ></div>
                    <div
                        className="prog-content"
                        style={{
                            position: "absolute",
                            width: 3 + "px",
                            height: '15px',
                            bottom: '-5px',
                            background: "rgba(255, 255, 0, 0.5)",
                            left: info.maximumGrade.toFixed() + "%"
                        }}
                    ></div>

                    <div
                        className="prog-content"
                        style={{width: info.currentGrade + "%"}}
                    >
                        {/*Grading*/}
                    </div>

                </div>
                {/*Weighting for assessments done*/}
            </div>
        </div>
    )
}


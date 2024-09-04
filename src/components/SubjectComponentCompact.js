import {FaBook, FaCalendar, FaWeightHanging} from "react-icons/fa";
import {useNavigate} from "react-router-dom"
import {removeSubject} from "../utils/storagehelper";
import {Button} from "./Button";
import {calculateInformation} from "../utils/calculateInformation";
import gradeOverview from "./GradeOverview";
import calculateColorFromGrade from "../utils/calculateColorFromGrade";

// this is a copy paste of SubjectComponent with a few features removed.
export function SubjectComponentCompact({subject, id, isActive, onClick}) {
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
                ❌{info.maximumGrade.toFixed(2)}%.
            </span>
        );
    }

    if (info.minimumGrade <= 0) {
        minimumScore = (
            <span>
                🥳 {info.currentGradeTotal.toFixed(2)}%.
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
            background: `linear-gradient(to right, var(--foreground-border) ${info.currentGrade}%, rgba(26,26,26,0.5) ${info.currentGrade}%)`,
            margin: 0
        }}
             onClick={() => {
                 navigate(`/subjects/${id}`)
                    onClick()
             }}
        >
            <span>
                <b>{subject.name} <span style={{
                    color: `var(--${color})`,
                    filter: 'brightness(200%)'
                }}>{info.currentGrade.toFixed(1)}%</span></b> {minimumScore}
            </span>

        </div>
    )
}


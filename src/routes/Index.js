import React, {useEffect, useState} from "react";
import {Button} from "../components/Button";
import {SubjectComponent} from '../components/SubjectComponent'
import {createSubject, getAllSubjects, onStorageChanged, setSubjectIndex} from "../utils/storagehelper";
import {Link} from "react-router-dom";
import {FaBook, FaCloud, FaStar} from "react-icons/fa";

export function IndexRoute() {
    const [subjects, setSubjects] = useState(getAllSubjects());
    const [draggedIndex, setDraggedIndex] = useState(-1)
    onStorageChanged(() => {
        setSubjects(getAllSubjects())
    })

    const handleAddSubject = () => {
        const newSubject = {
            name: 'New Subject',
            goal: 100,
            assessments: []
        };

        const id = createSubject(newSubject);
        setSubjects([...subjects, [newSubject, id]]); // Update subjects after adding
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        console.log(draggedIndex, index)
        if (draggedIndex !== index) {
            const newItems = [...subjects];
            const draggedItem = newItems[draggedIndex];
            // Remove the item from the original position
            newItems.splice(draggedIndex, 1);
            // Insert the item at the new position
            newItems.splice(index, 0, draggedItem);
            setDraggedIndex(index)
            setSubjects(newItems);
        }
    };

    const handleDragEnd = () => {
        setSubjectIndex(subjects.map(s => s[1]))
    }

    //fetch github for latest release notes
    const [latestRelease, setLatestRelease] = useState(null)
    useEffect(() => {
        fetch("https://api.github.com/repos/skybird23333/grading-calculator-react/releases/latest")
            .then(response => response.json())
            .then(data => {
                setLatestRelease(data)
                console.log(latestRelease)
            })
            .catch((error) => {
                console.error('Error:', error);
            })
    }, [])

    return (
        <div>
            <div className="content-header">
                <h2>Home</h2>
                {
                    latestRelease && (
                        <a href={latestRelease?.html_url} target="_blank" rel="noreferrer" className={"link"}
                        >
                            <FaBook/> Latest release notes - <b>{latestRelease?.name}</b> - {new Date(latestRelease?.published_at).toLocaleDateString()}
                        </a>
                    )
                }
                <div>
                    <b>Like it? <a href={"https://github.com/skybird23333/grading-calculator-react"} target="_blank" rel="noreferrer"><FaStar/>Star it!</a></b> - This will mean a lot to me!
                </div>
            </div>
            <div className="content-content">
                {subjects.map((subject, index) => (
                    <div
                        key={index} // Use unique key for each draggable item
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                    >
                        {subject && (
                            <SubjectComponent
                                subject={subject[0]}
                                id={subject[1]} // Assuming subject has a unique identifier
                            />
                        )}
                    </div>
                ))}
                <div>
                    <Button style={{width: "100%"}} onClick={handleAddSubject}>
                        Add Subject
                    </Button>
                </div>
            </div>
        </div>
    );
}

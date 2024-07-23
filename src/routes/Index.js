import React, { useState } from "react";
import { Button } from "../components/Button";
import { SubjectComponent } from '../components/SubjectComponent'
import {createSubject, getAllSubjects, setSubjectIndex} from "../utils/storagehelper";
import {Link} from "react-router-dom";
import {FaCloud} from "react-icons/fa";

export function IndexRoute() {
  const [subjects, setSubjects] = useState(getAllSubjects());
  const [draggedIndex, setDraggedIndex] = useState(-1)

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

  return (
      <div>
        <div className="content-header">
          <h2>All Subjects</h2>
        </div>
        <div className={"content-content"} style={{
          background: "linear-gradient(to right, rgba(70, 70, 70, 0.5) 5%, var(--background-primary) 100%)",
          border: "var(--foreground-border) 1px solid",
          marginBottom: "10px"
        }}>
          <h3>[NEW] Save your data to the cloud thing<FaCloud></FaCloud>®️™️ beta</h3>
          Are you sick of this thing only storing on one device?
          I kind of am by now, so now you can sync it across devices! <br></br>
          <Link to={"/login"} className={"link"}>> Manage your data</Link>
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
            <Button style={{ width: "100%" }} onClick={handleAddSubject}>
              Add Subject
            </Button>
          </div>
        </div>
      </div>
  );
}

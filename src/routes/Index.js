import React, { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { SubjectComponent } from '../components/SubjectComponent'
import {createSubject, getAllSubjects, setSubjectIndex} from "../utils/storagehelper";

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

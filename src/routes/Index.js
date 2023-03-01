import React, { useState } from "react";
import { v4 } from "uuid";
import { Button } from "../components/Button";
import { SubjectComponent } from '../components/SubjectComponent'
import { createSubject, getAllSubjects } from "../utils/storagehelper";

export function IndexRoute() {

  const [subjects, setSubjects] = useState(getAllSubjects())

  const handleAddSubject = () => {
    createSubject({
      name: 'New Subject',
      goal: 100,
      assessments: []
    })

    setSubjects(getAllSubjects())
  }

  return (
    <div>
      <div className="content-header">
        <h2>All Subjects</h2>
      </div>
      <div className="content-content">
        {
          subjects.map(s => {
              return <SubjectComponent subject={s[0]} id={s[1]} key={v4()}></SubjectComponent>
            }
          )
        }
        <div>
          <Button style={{ width: "100%" }} onClick={handleAddSubject}>
            Add Subject
          </Button>
        </div>
      </div>
    </div>
  );
}

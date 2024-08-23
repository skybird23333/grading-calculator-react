//i dont know how to use react please spare me

import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {HashRouter, Routes, Route, Link} from "react-router-dom";

import {Subject} from "./routes/SubjectPage";
import {IndexRoute} from "./routes/Index";
import {ComponentTest} from "./routes/ComponentTest";
import withRouter from "./utils/withRouterProp";
import NotFound from "./routes/NotFound"
import {Button} from "./components/Button";
import {createClient} from '@supabase/supabase-js'
import {Auth} from '@supabase/auth-ui-react'
import {ThemeSupa} from '@supabase/auth-ui-shared'
import Login from "./routes/Login";
import {
    createSubject,
    getAllSubjects,
    onStorageChanged,
    setSubjectIndex,
    useCloudUpdatePending
} from "./utils/storagehelper";
import {SubjectComponent} from "./components/SubjectComponent";
import {FaCloud, FaHome} from "react-icons/fa";
import {SubjectComponentCompact} from "./components/SubjectComponentCompact";

const supabase = createClient("https://zgvdgrpwnfpdiwuhgqhk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndmRncnB3bmZwZGl3dWhncWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE2MjY2NTQsImV4cCI6MjAzNzIwMjY1NH0.0OSGVCEpDUS8jDp2foTh9xC_VVkDTak69QhWWZnzErw")

//TODO: Export to a separate util file instead of attaching onto math
Math.roundTwoDigits = function (num) {
    return this.round((num + Number.EPSILON) * 100) / 100;
};

const root = ReactDOM.createRoot(document.getElementById("root"));

const SubjectWithRouter = withRouter(Subject)

const App = () => {

    //SUPABASE
    const [session, setSession] = useState(null)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session)
        })

        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const isCloudUpdatePending = useCloudUpdatePending()

    useEffect(() => {
        setSaved(!isCloudUpdatePending)
    }, [isCloudUpdatePending])


    //SIDEBAR

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

    return (<div style={{height: 0}}>
        <HashRouter basename="/">
            <div className={"navbar"}>
                <div className={"navbar-content"}>
                <span className="site-name">
                    <Link to="/">
                      Grading calculator
                    </Link>
                </span>
                    <div className={"button selected"} style={{margin: 0, padding: "5 5"}}>Assessments</div>
                    <div className={"button"} style={{margin: 0, padding: "5 5"}} disabled>Calendar</div>
                    <span style={{float: "right"}}>
                        Made with 💻 by <a className={"link"} href={"https://github.com/skybird23333"}>me</a>
                    </span>
                </div>
            </div>
            <div className="side-contents">
                <Link to={"/"} style={{margin: 0, padding: 0}}>
                    <Button style={{width: "100%", marginBottom: "10px"}}> <FaHome /> Home</Button>
                </Link>
                <div className={"warn mobile-warning"}>
                    <p>
                        <b>Hi there, mobile user!</b><br/>
                        Sorry, the mobile layout is messed up right now. You can attempt to use it or use a computer.
                    </p>
                </div>
                <Link to={"/login"} style={{margin: 0, padding: 0}}>
                    <Button style={{width: "100%", marginBottom: "10px"}}> <FaCloud/> Cloud {" "}
                        <span style={{color: "var(--foreground-secondary)"}}>
                            {session ? (<>
                                <span>Logged in</span>
                            </>) : <span>Not logged in</span>}
                        </span>
                    </Button>
                </Link>
                {subjects.map((subject, index) => (
                    <div
                        key={index} // Use unique key for each draggable item
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                    >
                        {subject && (
                            <SubjectComponentCompact
                                subject={subject[0]}
                                id={subject[1]} // Assuming subject has a unique identifier
                            />
                        )}
                    </div>
                ))}

                <Button style={{width: "100%"}} onClick={handleAddSubject}>
                    + Add Subject
                </Button>
            </div>
            <div className={"content"}>
                <Routes>
                    <Route path="/" element={<IndexRoute subjects={subjects}/>}/>
                    <Route path="subjects/:subjectId" element={<Subject/>}/>
                    <Route path="test" element={<ComponentTest/>}/>
                    <Route path="notfound" element={withRouter(NotFound)}/>
                    <Route path="login" element={Login(supabase)}/>
                    {/*<div className="content">*/}
                    {/*  <Routes>*/}
                    {/*  </Routes>*/}
                    {/*</div>*/}
                </Routes>
            </div>
        </HashRouter>
    </div>)
}
root.render(<App></App>);

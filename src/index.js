// src/index.js

import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {HashRouter, Routes, Route, Link} from "react-router-dom";

import {Subject} from "./routes/SubjectPage";
import {IndexRoute} from "./routes/Index";
import {ComponentTest} from "./routes/ComponentTest";
import withRouter from "./utils/withRouterProp";
import NotFound from "./routes/NotFound";
import {Button} from "./components/Button";
import {createClient} from '@supabase/supabase-js';
import {Auth} from '@supabase/auth-ui-react';
import {ThemeSupa} from '@supabase/auth-ui-shared';
import Login from "./routes/Login";
import {
    createSubject, getAllSubjects, onStorageChanged, setSubjectIndex, useCloudUpdatePending
} from "./utils/storagehelper";
import {SubjectComponent} from "./components/SubjectComponent";
import {FaCalendar, FaCloud, FaHome, FaBars, FaCross, FaCheck, FaXing, FaLongArrowAltLeft, FaCog} from "react-icons/fa";
import {SubjectComponentCompact} from "./components/SubjectComponentCompact";
import {Calendar} from "./routes/Calendar";
import Settings from "./routes/Settings";

const supabase = createClient("https://zgvdgrpwnfpdiwuhgqhk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndmRncnB3bmZwZGl3dWhncWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE2MjY2NTQsImV4cCI6MjAzNzIwMjY1NH0.0OSGVCEpDUS8jDp2foTh9xC_VVkDTak69QhWWZnzErw");

Math.roundTwoDigits = function (num) {
    return this.round((num + Number.EPSILON) * 100) / 100;
};

const root = ReactDOM.createRoot(document.getElementById("root"));

const SubjectWithRouter = withRouter(Subject);

const App = () => {
    const [session, setSession] = useState(null);
    const [saved, setSaved] = useState(false);
    const [collapsed, setCollapsed] = useState(true);

    useEffect(() => {
        if (window.innerWidth < 1300) return
        setCollapsed(false)
    }, [])

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
        });

        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const isCloudUpdatePending = useCloudUpdatePending();

    useEffect(() => {
        setSaved(!isCloudUpdatePending);
    }, [isCloudUpdatePending]);

    const [subjects, setSubjects] = useState(getAllSubjects());
    const [draggedIndex, setDraggedIndex] = useState(-1);

    onStorageChanged(() => {
        setSubjects(getAllSubjects());
    });

    const handleAddSubject = () => {
        const newSubject = {
            name: 'New Subject', goal: 100, assessments: []
        };

        const id = createSubject(newSubject);
        setSubjects([...subjects, [newSubject, id]]);
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex !== index) {
            const newItems = [...subjects];
            const draggedItem = newItems[draggedIndex];
            newItems.splice(draggedIndex, 1);
            newItems.splice(index, 0, draggedItem);
            setDraggedIndex(index);
            setSubjects(newItems);
        }
    };

    const handleDragEnd = () => {
        setSubjectIndex(subjects.map(s => s[1]));
    };

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    //AUto collapse if tapping outside of sidebar
    useEffect(() => {
        const collapse = (evt) => {
            if (window.innerWidth > 1300) return
            if (evt.target.closest(".side-contents") || evt.target.closest(".navbar-content") || evt.target.closest("svg")) return;
            setCollapsed(true);
        };
        window.addEventListener("click", collapse);
        return () => window.removeEventListener("click", collapse);
    }, [collapsed]);

    const handlePageChange = () => {
        if (window.innerWidth > 1300) return
        setCollapsed(true);
    }


    return (<div style={{height: 0}}>
            <HashRouter basename="/">
                <div className={"navbar"}>
                    <div className={"navbar-content"}>
                        <span className="site-name">
                            <Button onClick={toggleSidebar} className={"borderless"}>
                                { collapsed ? <FaBars/> : <FaLongArrowAltLeft/> }
                            </Button>
                            <Link to="/">
                                Grading calculator
                            </Link>
                        </span>
                        <span style={{float: "right"}}>
                            Made with 💻 by <a className={"link"} href={"https://github.com/skybird23333"}>me</a>
                        </span>
                    </div>
                </div>
                <div className={`side-contents hide-scrollbar ${collapsed ? 'collapsed' : ''}`}>
                    {/*<Link to={"/calendar"} style={{margin: 0, padding: 0}} onClick={handlePageChange}>*/}
                    {/*    <Button style={{width: "100%", marginBottom: "10px"}}> <FaCalendar/> Calendar</Button>*/}
                    {/*</Link>*/}
                    <Link to={"/"} style={{margin: 0, padding: 0}} onClick={handlePageChange}>
                        <Button style={{width: "100%", marginBottom: "10px"}}> <FaHome/> Home</Button>
                    </Link>
                    <Link to={"/settings"} style={{margin: 0, padding: 0}} onClick={handlePageChange}>
                        <Button style={{width: "100%", marginBottom: "10px"}}> <FaCog/> Settings</Button>
                    </Link>
                    <Link to={"/login"} style={{margin: 0, padding: 0}} onClick={handlePageChange}>
                        <Button style={{width: "100%", marginBottom: "10px"}}> <FaCloud/> Cloud {" "}
                            <span style={{color: "var(--foreground-secondary)"}}>
                                {session ? (<>
                                    <span>Logged in</span>
                                </>) : <span>Not logged in</span>}
                            </span>
                        </Button>
                    </Link>
                    {subjects.map((subject, index) => (<div
                            key={index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                        >
                            {subject && (<SubjectComponentCompact
                                    subject={subject[0]}
                                    id={subject[1]}
                                    isActive={false}
                                    onClick={handlePageChange}
                                />)}
                        </div>))}
                    <Button style={{width: "100%"}} onClick={handleAddSubject}>
                        + Add Subject
                    </Button>
                </div>
                <div className={"content"}>
                    <Routes>
                        <Route path="/" element={<IndexRoute subjects={subjects}/>}/>
                        <Route path="calendar" element={<Calendar/>}/>
                        <Route path="subjects/:subjectId" element={<Subject/>}/>
                        <Route path="settings" element={<Settings/>}/>
                        <Route path="test" element={<ComponentTest/>}/>
                        <Route path="notfound" element={withRouter(NotFound)}/>
                        <Route path="login" element={Login(supabase)}/>
                    </Routes>
                </div>
            </HashRouter>
        </div>);
};

root.render(<App/>);
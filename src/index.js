// src/index.js

import React, {  useEffect, useState  } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {  HashRouter, Routes, Route, Link  } from "react-router-dom";

import {  Subject  } from "./routes/SubjectPage";
import {  IndexRoute  } from "./routes/Index";
import {  ComponentTest  } from "./routes/ComponentTest";
import withRouter from "./utils/withRouterProp";
import NotFound from "./routes/NotFound";
import { Button } from "./components/Button";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Button } from "./components/Button";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Login from "./routes/Login";
import {
  createSubject,
  getAllSubjects,
  onStorageChanged,
  setSubjectIndex,
  useCloudUpdatePending,
  setCloudSyncManager,
} from "./utils/storagehelper";
import {  SubjectComponent  } from "./components/SubjectComponent";
import {
  
  FaCalendar,
 
  FaCloud,
 
  FaHome,
 
  FaBars,
 
  FaCross,
 
  FaCheck,
 
  FaXing,
 
  FaLongArrowAltLeft,
 
  FaCog,
,
} from "react-icons/fa";
import {  SubjectComponentCompact  } from "./components/SubjectComponentCompact";
import {  Calendar  } from "./routes/Calendar";
import Settings from "./routes/Settings";
import CloudSyncManager from "./utils/cloudSyncManager";
import { CloudSyncIndicator } from "./components/CloudSyncIndicator";
import { DataConflictModal } from "./components/DataConflictModal";
import { getSetting } from "./utils/settingsManager";
import { calculateInformation } from "./utils/calculateInformation";

const supabase = createClient(
  
  "https://eyivovbhiearpppplrsi.supabase.co",
 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5aXZvdmJoaWVhcnBwcHBscnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzODM2MTAsImV4cCI6MjA1NTk1OTYxMH0.cKKuHJeovtngIQ5Q-ypJGvEtwpJ_6C0SdVio8PSxA8M"

);

Math.roundTwoDigits = function (num) {
  return this.round((num + Number.EPSILON) * 100) / 100;
  return this.round((num + Number.EPSILON) * 100) / 100;
};

const root = ReactDOM.createRoot(document.getElementById("root"));

const SubjectWithRouter = withRouter(Subject);

const App = () => {
  const [session, setSession] = useState(null);
  const [saved, setSaved] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [cloudSyncManager, setCloudSyncManagerState] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ status: "disconnected" });
  const [conflict, setConflict] = useState(null);

  useEffect(() => {
    if (window.innerWidth < 1300) return;
    setCollapsed(false);
  }, []);

  // Initialize cloud sync manager
  useEffect(() => {
    const manager = new CloudSyncManager(supabase);
    setCloudSyncManagerState(manager);
    setCloudSyncManager(manager);

    // Listen for sync status changes
    manager.onSyncStatusChanged(setSyncStatus);

    // Listen for conflicts
    manager.onConflict(setConflict);

    return () => {
      manager.offSyncStatusChanged(setSyncStatus);
      manager.offConflict(setConflict);
      manager.stop();
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      // Initialize cloud sync if auto-sync is enabled
      if (session && getSetting("cloud.enableautosync") && cloudSyncManager) {
        cloudSyncManager.initialize();
      }
    });

    return () => subscription.unsubscribe();
  }, [cloudSyncManager]);

  const isCloudUpdatePending = useCloudUpdatePending();
  const isCloudUpdatePending = useCloudUpdatePending();

  useEffect(() => {
    setSaved(!isCloudUpdatePending);
  }, [isCloudUpdatePending]);
  useEffect(() => {
    setSaved(!isCloudUpdatePending);
  }, [isCloudUpdatePending]);

  const [subjects, setSubjects] = useState(getAllSubjects());
  const [draggedIndex, setDraggedIndex] = useState(-1);
  const [subjects, setSubjects] = useState(getAllSubjects());
  const [draggedIndex, setDraggedIndex] = useState(-1);

  onStorageChanged(() => {
    setSubjects(getAllSubjects());
  });
  onStorageChanged(() => {
    setSubjects(getAllSubjects());
  });

  const handleAddSubject = () => {
    const newSubject = {
      name: "New Subject",
      goal: 100,
      assessments: [],
    };
  const handleAddSubject = () => {
    const newSubject = {
      name: "New Subject",
      goal: 100,
      assessments: [],
    };

    const id = createSubject(newSubject);
    setSubjects([...subjects, [newSubject, id]]);
  };
    const id = createSubject(newSubject);
    setSubjects([...subjects, [newSubject, id]]);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
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
    setSubjectIndex(subjects.map((s) => s[1]));
  };
  const handleDragEnd = () => {
    setSubjectIndex(subjects.map((s) => s[1]));
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleManualSync = async () => {
    if (cloudSyncManager) {
      try {
        await cloudSyncManager.manualSync();
      } catch (error) {
        alert("Sync failed: " + error.message);
      }
    }
  };

  //AUto collapse if tapping outside of sidebar
  useEffect(() => {
    const collapse = (evt) => {
      if (window.innerWidth > 1300) return;
      if (
        evt.target.closest(".side-contents") ||
        evt.target.closest(".navbar-content") ||
        evt.target.closest("svg")
      )
        return;
      setCollapsed(true);
    };
    window.addEventListener("click", collapse);
    return () => window.removeEventListener("click", collapse);
  }, [collapsed]);
  //AUto collapse if tapping outside of sidebar
  useEffect(() => {
    const collapse = (evt) => {
      if (window.innerWidth > 1300) return;
      if (
        evt.target.closest(".side-contents") ||
        evt.target.closest(".navbar-content") ||
        evt.target.closest("svg")
      )
        return;
      setCollapsed(true);
    };
    window.addEventListener("click", collapse);
    return () => window.removeEventListener("click", collapse);
  }, [collapsed]);

  const handlePageChange = () => {
    if (window.innerWidth > 1300) return;
    setCollapsed(true);
  };
  const handlePageChange = () => {
    if (window.innerWidth > 1300) return;
    setCollapsed(true);
  };

  return (
    <div style={{ height: 0 }}>
      <HashRouter basename="/">
        <div className={"navbar"}>
          <div className={"navbar-content"}>
            <span className="site-name">
              <Button onClick={toggleSidebar} className={"borderless"}>
                {collapsed ? <FaBars /> : <FaLongArrowAltLeft />}
              </Button>
              <Link to="/">Grading calculator</Link>
            </span>
            <span style={{ float: "right" }}>
              Made with 💻 by{" "}
              <a className={"link"} href={"https://github.com/skybird23333"}>
                me
              </a>
            </span>
          </div>
        </div>
        <div
          className={`side-contents hide-scrollbar ${
            collapsed ? "collapsed" : ""
          }`}
        >
          {/*<Link to={"/calendar"} style={{margin: 0, padding: 0}} onClick={handlePageChange}>*/}
          {/*    <Button style={{width: "100%", marginBottom: "10px"}}> <FaCalendar/> Calendar</Button>*/}
          {/*</Link>*/}
          <Link
            to={"/"}
            style={{ margin: 0, padding: 0 }}
            onClick={handlePageChange}
          >
            <Button style={{ width: "100%", marginBottom: "10px" }}>
              {" "}
              <FaHome /> Home
            </Button>
          </Link>
          <Link
            to={"/settings"}
            style={{ margin: 0, padding: 0 }}
            onClick={handlePageChange}
          >
            <Button style={{ width: "100%", marginBottom: "10px" }}>
              {" "}
              <FaCog /> Settings
            </Button>
          </Link>
          <Link
            to={"/login"}
            style={{ margin: 0, padding: 0 }}
            onClick={handlePageChange}
          >
            <Button style={{ width: "100%", marginBottom: "10px" }}>
              {" "}
              <FaCloud /> Cloud{" "}
              <span style={{ color: "var(--foreground-secondary)" }}>
                {session ? (
                  <>
                    <span>Logged in</span>
                  </>
                ) : (
                  <span>Not logged in</span>
                )}
              </span>
            </Button>
          </Link>
          {subjects.map((subject, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {subject && (
                <SubjectComponentCompact
                  subject={subject[0]}
                  id={subject[1]}
                  isActive={false}
                  onClick={handlePageChange}
                />
              )}
            </div>
          ))}
          <Button style={{ width: "100%" }} onClick={handleAddSubject}>
            + Add Subject
          </Button>
          <Button disabled style={{ width: "100%" }}>
            All subject average:{" "}
            {subjects?.length > 0
              ? Math.roundTwoDigits(
                  subjects
                    .map(
                      ([s]) =>
                        calculateInformation(s?.assessments || [], 0)
                          .currentGrade
                    )
                    .reduce((a, b) => a + b) / subjects.length
                )
              : 0}
          </Button>
        </div>
        <div className={"content"}>
          <Routes>
            <Route path="/" element={<IndexRoute subjects={subjects} />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="subjects/:subjectId" element={<Subject />} />
            <Route path="settings" element={<Settings />} />
            <Route path="test" element={<ComponentTest />} />
            <Route path="notfound" element={withRouter(NotFound)} />
            <Route path="login" element={<Login supabase={supabase} cloudSyncManager={cloudSyncManager} />} />
          </Routes>
        </div>
      </HashRouter>
    </div>
  );
};

root.render(<App />);
root.render(<App />);

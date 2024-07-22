//i dont know how to use react please spare me

import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { HashRouter, Routes, Route, Link } from "react-router-dom";

import { Subject } from "./routes/SubjectPage";
import { IndexRoute } from "./routes/Index";
import { ComponentTest } from "./routes/ComponentTest";
import withRouter from "./utils/withRouterProp";
import NotFound from "./routes/NotFound"
import {Button} from "./components/Button";
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Login from "./routes/Login";
import {useCloudUpdatePending} from "./utils/storagehelper";

const supabase = createClient("https://zgvdgrpwnfpdiwuhgqhk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndmRncnB3bmZwZGl3dWhncWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE2MjY2NTQsImV4cCI6MjAzNzIwMjY1NH0.0OSGVCEpDUS8jDp2foTh9xC_VVkDTak69QhWWZnzErw")

//TODO: Export to a separate util file instead of attaching onto math
Math.roundTwoDigits = function (num) {
  return this.round((num + Number.EPSILON) * 100) / 100;
};

const root = ReactDOM.createRoot(document.getElementById("root"));

const SubjectWithRouter = withRouter(Subject)

const App = () => {

  const [session, setSession] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isCloudUpdatePending = useCloudUpdatePending()

  useEffect(() => {
    setSaved(!isCloudUpdatePending)
  }, [isCloudUpdatePending])


  return (
      <div style={{height: 0}}>
        <HashRouter basename="/">
          <div className="navbar">
            <div className="navbar-content">
          <span className="site-name">
            <Link to="/">
              Grading calculator
            </Link>
          </span>
              {session ? (<>
                        <span>Logged in</span>
                  </>
              ) :
                  <span>Not logged in</span>}
            </div>
          </div>
          <div className="content">
            <Routes>
              <Route path="" element={<IndexRoute/>}/>
              <Route path="subject" element={<Subject/>}/>
              <Route path="subjects/:subjectId" element={<SubjectWithRouter/>}/>
              <Route path="test" element={<ComponentTest/>}/>
              <Route path="notfound" element={withRouter(NotFound)}/>
              <Route path="login" element={Login(supabase)}/>
            </Routes>
          </div>
        </HashRouter>
      </div>)
}
root.render(<App></App>);

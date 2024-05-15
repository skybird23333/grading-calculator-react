//i dont know how to use react please spare me

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { HashRouter, Routes, Route, Link } from "react-router-dom";

import { Subject } from "./routes/SubjectPage";
import { IndexRoute } from "./routes/Index";
import { ComponentTest } from "./routes/ComponentTest";
import withRouter from "./utils/withRouterProp";
import NotFound from "./routes/NotFound"

//TODO: Export to a separate util file instead of attaching onto math
Math.roundTwoDigits = function (num) {
  return this.round((num + Number.EPSILON) * 100) / 100;
};

const root = ReactDOM.createRoot(document.getElementById("root"));

const SubjectWithRouter = withRouter(Subject)

root.render(
  <div style={{ height: 0 }}>

    <HashRouter basename="/">
      <div className="navbar">
        <div className="navbar-content">
          <span className="site-name">
            <Link to="/">
              gradings-calculator-react
            </Link>
          </span>
        </div>
      </div>
      <div className="content">
        <Routes>
          <Route path="" element={<IndexRoute />} />
          <Route path="subject" element={<Subject />} />
          <Route path="subjects/:subjectId" element={<SubjectWithRouter />} />
          <Route path="test" element={<ComponentTest />} />
          <Route path="notfound" element={withRouter(NotFound)} />
        </Routes>
      </div>
    </HashRouter>
  </div>
);

//i dont know how to use react please spare me

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { HashRouter, Routes, Route, Link } from "react-router-dom";

import { Subject } from "./routes/Subject";
import { IndexRoute } from "./routes/Index";
import { ComponentTest } from "./routes/ComponentTest";

//TODO: Export to a separate util file instead of attaching onto math
Math.roundTwoDigits = function (num) {
  return this.round((num + Number.EPSILON) * 100) / 100;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
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
          <Route path="test" element={<ComponentTest />} />
        </Routes>
      </div>
    </HashRouter>
  </div>
);

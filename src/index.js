import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { HashRouter, Routes, Route } from "react-router-dom";

import { Subject } from "./routes/Subject";
import { IndexRoute } from "./routes/Index";

//TODO: Export to a separate util file instead of attaching onto math
Math.roundTwoDigits = function (num) {
  return this.round((num + Number.EPSILON) * 100) / 100;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <div className="content">
    <div className="content-content">
      <HashRouter basename="/">
        <Routes>
          <Route path="" element={<IndexRoute/>} />
          <Route path="subject" element={<Subject />} />
        </Routes>
      </HashRouter>
    </div>
  </div>
);

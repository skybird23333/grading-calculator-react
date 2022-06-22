import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Subject } from "./routes/Subject";

//TODO: Export to a separate util file instead of attaching onto math
Math.roundTwoDigits = function (num) {
  return this.round((num + Number.EPSILON) * 100) / 100;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <div className="content">
    <div className="content-content">
      <BrowserRouter>
        <Routes>
          <Route path="/subject" element={<Subject />} />
        </Routes>
      </BrowserRouter>
    </div>
  </div>
);

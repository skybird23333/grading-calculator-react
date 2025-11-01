import { Label } from "./Label";
import {
  FaAngleDoubleDown,
  FaAngleDoubleUp,
  FaAngleDown,
  FaAngleLeft,
  FaAngleRight,
  FaAngleUp,
  FaCheckCircle,
  FaDotCircle,
} from "react-icons/fa";
import React from "react";
import calculateColorFromGrade from "../utils/calculateColorFromGrade";
import MarkDisplay from "./MarkDisplay";

/**
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function GradeOverview(
  {
    currentGrade,
    currentGradeTotal,
    goal,
    maximumGrade,
    recentChange,
    totalChange,
  },
  showLabel = false
) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto auto auto",
      }}
    >
      
        <span
          title={`You will currently achieve a minimum of ${currentGradeTotal.toFixed(
            2
          )}`}
          style={{ color: "rgb(255, 100, 100)" }}
        >
          <FaAngleLeft /> {MarkDisplay(currentGradeTotal)}
        </span>
      

      
        <span
          title={`You are aiming for ${goal.toFixed(2)}`}
          style={{ color: "rgba(0, 153, 255, 1)" }}
        >
          <FaDotCircle /> {MarkDisplay(goal)}
        </span>
      

      
        <span
          title={`You will currently achieve a maximum of ${maximumGrade.toFixed(
            2
          )}`}
          style={{ color: "yellow" }}
        >
          <FaAngleRight /> {MarkDisplay(maximumGrade)}
        </span>
      

      
        <span
          title={`Your recent assessment has affected your total mark by ${recentChange}`}
          style={{ color: recentChange > 0 ? "green" : "red" }}
        >
          {
            /* TODO fix poopy code */ recentChange > 0
              ? recentChange > 5
                ? FaAngleDoubleUp()
                : FaAngleUp()
              : recentChange < -5
              ? FaAngleDoubleDown()
              : FaAngleDown()
          }{" "}
          {recentChange}%
        </span>
      

      
        <span
          title={`Your assessment has changed by a total amount of ${totalChange}`}
          style={{ color: totalChange > 0 ? "green" : "red" }}
        >
          {totalChange > 0
            ? totalChange > 5
              ? FaAngleDoubleUp()
              : FaAngleUp()
            : totalChange < -5
            ? FaAngleDoubleDown()
            : FaAngleDown()}{" "}
          {totalChange}%
        </span>
      


      {showLabel ? (
        <>
          <span className="secondary-label">Minimum</span>
          <span className="secondary-label">Goal</span>
          <span className="secondary-label">Maximum</span>
          <span className="secondary-label">Change</span>
          <span className="secondary-label">Total Change</span>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

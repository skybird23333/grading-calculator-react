import React from "react";
/**
 *
 * @param router
 * @returns {JSX.Element}
 * @constructor
 */
export default function ({ router }) {

  return (
      <div>
        <div className="content-header">
          <h2>Not Found</h2>
        </div>
        <div className="content-content">
          Could not load the subject with ID {router.params.subjectId}. Have you deleted it?
      </div>
      </div>
  );
}

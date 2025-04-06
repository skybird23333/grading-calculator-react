import React from "react";

export class Label extends React.Component {
  render(props) {
    return (
      <span className="label" style={props?.style}>
        {this.props.children}
      </span>
    );
  }
}

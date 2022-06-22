import React from "react";

export class Input extends React.Component {
  render() {
    let label = null;

    if (this.props.label) {
      label = <div>{label}</div>;
    }

    return (
      <span>
        {label}
        <input
          type={this.props.type}
          className="input background"
          value={this.props.value}
          style={this.props.style}
          onChange={this.props.onChange || null}
          min={this.props.min}
          max={this.props.max}
        />
      </span>
    );
  }
}

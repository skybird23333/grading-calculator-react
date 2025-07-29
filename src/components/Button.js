import React from "react";

export class Button extends React.Component {
  render() {
    return (
      <button
        className={`button ${this.props.selected ? " selected" : ""} ${
          this.props.className
        }`}
        style={this.props.style}
        onClick={this.props.onClick}
        disabled={this.props.disabled}
      >
        {this.props.children}
      </button>
    );
  }
}

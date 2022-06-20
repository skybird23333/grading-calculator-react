import React from 'react';

export class Button extends React.Component {
    render() {
        return (
            <button className='button' style={this.props.style} onClick={this.props.onClick}>
                {this.props.children}
            </button>
        );
    }
}

import React from 'react';

export class Label extends React.Component {
    render() {
        return (
            <span className='label'>
                {this.props.children}
            </span>
        );
    }
}

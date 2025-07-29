import React from "react";

export class Progress extends React.Component {
    /**
     * 
     * @param {object} props 
     * @param {number} props.max Max value
     * @param {number} props.val Value
     * @param {string} [props.color] Color in CSS format
     * @param {boolean} [props.large] Large progress bar?
     */
    
    render() {
        this.progressContentClassName = this.props.large ? "prog-content-large" : "prog-content"
        this.progressPercentage = (this.props.val / this.props.max) * 100

        return(
            <div className="prog-container" style={{position: "relative"}}>
                <div
                    className={this.progressContentClassName}
                    style={{
                        width: `${this.progressPercentage}%`,
                        background: this.props.color || 'var(--foreground-primary)',
                        position: 'relative'
                    }}
                >
                    {this.props.children}
                </div>
                {/* this is for markers that dont need to be relative to the actual progress */}
                {this.props.children_2}
            </div>
        )
    }
}
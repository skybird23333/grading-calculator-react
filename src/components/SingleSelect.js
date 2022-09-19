import React from "react";

export class Select extends React.Component {
    /**
     * 
     * @param {*} props 
     * @param {function} props.
     * @param {object[]} props.options
     * @param {string} props.options.name
     * @param {string} props.options.value
     */
    constructor(props) {
        super(props)
        this.state = {
            selected: "",
            selectedIndex: null
        }
        this._onChange = this._onChange.bind(this)
    }

    render() {
        const options = this.props.options.map((opt, loopindex) => {
            return (<option value={opt.value} key={loopindex}>{ opt.name }</option>)
        })

        return(
            <select className="select" onChange={this._onChange} value={this.props.value}>
                { options }
            </select>
        )
    }

    _onChange(evt) {
        const selectVal = evt.target.value
        this.setState({selected: selectVal})
        const index = evt.target.selectedIndex
        this.setState({selectedIndex: index})
        this.props.onChange(selectVal)
    }
}
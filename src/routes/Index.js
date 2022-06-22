import React from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/Button"

export class IndexRoute extends React.Component {
    render() {
        return (
            <div>
                <div className="card background">
                    skybird23333
                    <h1>react-grading-calculator</h1>
                    <Link className="link" to="/subject">Go to the app(beta)</Link>
                </div>
            </div>
        )
    }
}
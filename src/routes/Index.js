import React from "react";
import { Link } from "react-router-dom";

export class IndexRoute extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      commits: []
    }

    this.fetchCommitInformation()
  }

  async fetchCommitInformation() {
    const commitData = await fetch('https://api.github.com/repos/skybird23333/grading-calculator-react/commits')
    this.setState({
      commits: (await commitData.json()).slice(0, 6)
    })
  }

  render() {
    const commitInfo = this.state.commits.map(c => {
      return <div className="card" key={c.sha}>
          <a className="link" href={c.html_url}>
            {c.sha.slice(0, 6)}
          </a>
          {" -"} {c.commit.message}
      </div>
    })

    return (
      <div>
        <div className="card background">
          skybird23333
          <h1>react-grading-calculator</h1>
          <Link className="link" to="/subject">
            Go to the app(beta)
          </Link>

        </div>
        <div className="card background">
          <h1>
            Latest Commits
          </h1>
          {commitInfo}
        </div>
      </div>
    );
  }
}

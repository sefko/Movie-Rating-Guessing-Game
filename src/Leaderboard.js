import React, { Component } from "react";
import styles from './Leaderboard.module.css';
 
class Leaderboard extends Component {  
    constructor() {
        super();
        this.state = { leaderboard: [] };
    }

    componentDidMount() {
        fetch('http://localhost:3000/api/leaderboard')
        .then(response => response.json())
        .then(data => {
            this.setState({ leaderboard: data });
        })
    }

    render() {
        let position = 1;

        if (this.state.leaderboard) {
            return (<ol className={styles.leaderboard}>
                <div key='header'>
                    <div>Position</div>
                    <div>Username</div>
                    <div>Result</div>
                </div>
                {this.state.leaderboard.map(obj => <li key={"pos" + position}>
                    <div>{position++}</div>
                    <div>{obj.username}</div>
                    <div>{obj.result}</div>
                </li>)}
            </ol>);
        } 

        return (<div></div>);
    }
}
 
export default Leaderboard;
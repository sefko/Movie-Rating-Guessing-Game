import React, { Component } from "react";
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Home from "./Home";
import Other from "./Other";
import styles from './Main.module.css';
 
class Main extends Component {
    render() {
      return (
        <HashRouter>
          <div className={styles.Main}>
            <header className={styles.header}>
              <h1><NavLink to="/">Movie Rating Guessing Game</NavLink></h1>
              <ul className="header">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="other">Other</NavLink></li>
                <li><NavLink to="login">Login</NavLink></li>
              </ul>
            </header>
            <div className={styles.content}>
                <Route exact path="/" component={Home}/>
                <Route path="/other" component={Other}/>
            </div>
          </div>
        </HashRouter>
      );
    }
}

export default Main;
import React, { Component } from "react";
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register"
import styles from './Main.module.css';
 
class Main extends Component {
    logout() {
        fetch('http://localhost:3000/auth/logout');
    }

    render() {
      return (
        <HashRouter>
          <div className={styles.Main}>
            <header className={styles.header}>
              <h1><NavLink to="/">Movie Rating Guessing Game</NavLink></h1>
              <ul className="header">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="login">Login</NavLink></li>
                <li><NavLink to="register">Register</NavLink></li>
                <li><a onClick={this.logout}>Sign out</a></li>
              </ul>
            </header>
            <div className={styles.content}>
                <Route exact path="/" component={Home}/>
                <Route path="/login" component={Login}/>
                <Route path="/register" component={Register}/>
            </div>
          </div>
        </HashRouter>
      );
    }
}

export default Main;
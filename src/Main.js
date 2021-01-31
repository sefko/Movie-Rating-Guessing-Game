import React, { Component } from "react";
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Home from "./Home";
import Compete from "./Compete";
import Login from "./Login";
import Register from "./Register"
import styles from './Main.module.css';
import Leaderboard from "./Leaderboard";
 
class Main extends Component {
    constructor() {
      super();
      this.state = {};
    }

    logout = () => {
        fetch('http://localhost:3000/auth/logout', { credentials: 'include' }).then(response => {
          window.location.reload();
        });
    }

    checkLoginStatus = () => {
      fetch('http://localhost:3000/auth/logged_in', { credentials: 'include' }).then(response => {
        this.setState({ loggedIn: response.statusText === 'OK'});
        //this.state.loggedIn = response.statusText === 'OK';
      })
    }

    componentDidMount() {
      this.checkLoginStatus();
    }

    renderOnLogin = () => {
      if (this.state.loggedIn) {
        return <ul className={styles.ul}>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/compete">Compete</NavLink></li>
            <li><NavLink to="/leaderboard">Leaderboard</NavLink></li>

            <li className={styles.right}><a onClick={this.logout}>Sign out</a></li>
        </ul>;
      } else {
        return <ul className={styles.ul}>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/leaderboard">Leaderboard</NavLink></li>

            <li className={styles.right}><NavLink to="login">Login</NavLink></li>
            <li><NavLink to="register">Register</NavLink></li>
        </ul>;
      }
    }

    render() {
      return (
        <HashRouter>
          <div className={styles.Main}>
            <header className={styles.header}>
              <h1><NavLink to="/">Movie Rating Guessing Game</NavLink></h1>
              {this.renderOnLogin()}
            </header>
            <div className={styles.content}>
                <Route exact path="/" component={Home}/>
                <Route path="/compete" component={Compete}/>
                <Route path="/login" render={(props) => <Login {...props} checkLoginStatus={this.checkLoginStatus} />}/>
                <Route path="/register" component={Register}/>
                <Route path="/leaderboard" component={Leaderboard}/>
            </div>
          </div>
        </HashRouter>
      );
    }
}

export default Main;
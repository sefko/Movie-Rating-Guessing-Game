import React, { Component } from "react";
import {
  Route,
  NavLink,
  HashRouter,
  Switch
} from "react-router-dom";
import Home from "./Home";
import Compete from "./Compete";
import Login from "./Login";
import Register from "./Register"
import styles from './Main.module.css';
import Leaderboard from "./Leaderboard";
import NotFoundPage from "./NotFoundPage";
 
class Main extends Component {
    constructor() {
      super();
      this.state = {};
    }

    logout = () => {
        return fetch('http://localhost:3000/auth/logout', { credentials: 'include' }).then(response => {
          window.location.reload();
        });
    }

    checkLoginStatus = () => {
      return fetch('http://localhost:3000/auth/logged-in', { credentials: 'include' }).then(response => {
        this.setState({ loggedIn: response.status === 200 });
      })
    }

    componentDidMount() {
        this.checkLoginStatus();
    }

    renderOnLogin = () => {
      if (this.state.loggedIn) {
        return <ul className={styles.ul}>
            <li key='/'><NavLink to="/">Home</NavLink></li>
            <li key='/compete'><NavLink to="/compete">Compete</NavLink></li>
            <li key='/leaderboard'><NavLink to="/leaderboard">Leaderboard</NavLink></li>

            <li className={styles.right}><button onClick={this.logout}>Sign out</button></li>
        </ul>;
      } else {
        return <ul className={styles.ul}>
            <li key='/'><NavLink to="/">Home</NavLink></li>
            <li key='/leaderboard'><NavLink to="/leaderboard">Leaderboard</NavLink></li>

            <li  key='/login' className={styles.right}><NavLink to="login">Login</NavLink></li>
            <li key='/register'><NavLink to="register">Register</NavLink></li>
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
              <Switch>
                <Route exact path="/" component={Home}/>
                <Route path="/compete" render={(props) => <Compete {...props} loginStatus={this.state.loggedIn}/>}/>
                <Route path="/login" render={(props) => <Login {...props} checkLoginStatus={this.checkLoginStatus} loginStatus={this.state.loggedIn}/>}/>
                <Route path="/register" render={(props) => <Register {...props} loginStatus={this.state.loggedIn}/>}/>
                <Route path="/leaderboard" component={Leaderboard}/>
                <Route path="*" component={NotFoundPage} />
              </Switch>
            </div>
          </div>
        </HashRouter>
      );
    }
}

export default Main;
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './LoginRegister.module.css';
 
class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            loggedIn: props.loginStatus
        };
    }
  
    attemptLogin = () => {
        if (this.state.loggedIn) {
            this.setState({ Error: 'Already logged in' });
        } else {
            fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(this.state)
            }).then(response => {
                if (response.status !== 200) {
                    return response.json();
                } else {
                    this.props.checkLoginStatus();
                    this.props.history.push('/');
                }
            }).then(data => {
                if (data) {
                    this.setState(data);
                }
            });
        }
    }

    updateUsername = (event) => {
        this.setState({ username: event.target.value });
    }

    updatePassword = (event) => {
        this.setState({ password: event.target.value });
    }

    render() {
        if (this.state.loggedIn) {
            this.props.history.push('/');
        }

        return (
            <div className={styles.Login}>
                <form>
                    <h2>Login</h2>

                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" onChange={e => this.updateUsername(e)}></input>
                    
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" onChange={e => this.updatePassword(e)}></input>

                    {this.state.Error ? <div className={styles.error}>{this.state.Error}</div> : null}

                    <button onClick={this.attemptLogin}>Sign in</button>

                    <div id={styles.register}>Not registered? <Link to="register">Create an account</Link></div>
                </form>
            </div>
        );
    }
}
 
export default Login;
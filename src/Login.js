import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './LoginRegister.module.css';
 
class Login extends Component {
    
    constructor() {
        super();
        this.state = {
            username: "",
            password: ""
        };
    }
  
    attemptLogin = () => {
        fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(this.state)
            }).then(response => {
                //TODO Check for response
                this.setState({ password: undefined });
                this.props.checkLoginStatus();
                this.props.history.push('/');
            });
    }

    updateUsername = (event) => {
        this.state.username = event.target.value;
    }

    updatePassword = (event) => {
        this.state.password = event.target.value;
    }

    render() {
        return (
            <div className={styles.Login}>
                <form>
                    <h2>Login</h2>

                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" onChange={e => this.updateUsername(e)}></input>
                    
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" onChange={e => this.updatePassword(e)}></input>

                    <button onClick={this.attemptLogin}>Sign in</button>

                    <div id={styles.register}>Not registered? <Link to="register">Create an account</Link></div>
                </form>
            </div>
        );
    }
}
 
export default Login;
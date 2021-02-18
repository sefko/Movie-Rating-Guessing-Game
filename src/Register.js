import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './LoginRegister.module.css';
 
class Register extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            confirmPassword: "",
            loggedIn: this.props.loginStatus
        };
    }
  
    attemptRegister = () => {
        fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state)
            }).then(response => {
                if (response.status !== 200) {
                    return response.json();
                } else {
                    this.props.history.push('/login');
                }
            }).then(data => {
                if (data) {
                    this.setState(data);
                }
            });
    }

    updateUsername = (event) => {
        this.setState({ username: event.target.value });
    }

    updatePassword = (event) => {
        this.setState({ password: event.target.value });
    }

    updateConfirmPassword = (event) => {
        this.setState({ confirmPassword: event.target.value });
    }

    render() {
        if (this.state.loggedIn) {
            this.props.history.push('/');
        }

        return (
            <div className={styles.Login}>
                <form>
                    <h2>Register</h2>

                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" onChange={e => this.updateUsername(e)}></input>
                    
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" onChange={e => this.updatePassword(e)}></input>

                    <label htmlFor="confirm_password">Confirm Password</label>
                    <input id="confirm_password" type="password" onChange={e => this.updateConfirmPassword(e)}></input>

                    {this.state.Error ? <div className={styles.error}>{this.state.Error}</div> : null}

                    <button onClick={this.attemptRegister}>Sign up</button>

                    <div id={styles.register}>Already registered? <Link to="login">Sign in</Link></div>
                </form>
            </div>
        );
    }
}
 
export default Register;
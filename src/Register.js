import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './LoginRegister.module.css';
 
class Register extends Component {
    
    constructor() {
        super();
        this.state = {
            username: "",
            password: "",
            confirmPassword: ""
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
                //See if registered, maybe redirect
            });
    }

    updateUsername = (event) => {
        this.state.username = event.target.value;
    }

    updatePassword = (event) => {
        this.state.password = event.target.value;
    }

    updateConfirmPassword = (event) => {
        this.state.confirmPassword = event.target.value;
    }

    render() {
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

                    <button onClick={this.attemptRegister}>Sign up</button>

                    <div id={styles.register}>Already registered? <Link to="login">Sign in</Link></div>
                </form>
            </div>
        );
    }
}
 
export default Register;
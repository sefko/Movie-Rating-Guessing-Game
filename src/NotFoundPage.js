import React, { Component } from "react";
import styles from './Home.module.css';
 
class NotFoundPage extends Component {  
    render() {
        return (<div className={styles.notFound}>
            404 Not Found
        </div>);
    }
}
 
export default NotFoundPage;
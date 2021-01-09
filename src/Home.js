import React, { Component } from "react";
import styles from './Home.module.css';
 
const initialState = {
    inputValue: "",
    movie: null,
    result: null
};

class Home extends Component {
    constructor() {
        super();
        this.state = initialState;
    }   

    componentDidMount() {
        this.loadRandomMovie();
    }

    updateInputValue(evt) {
        this.setState({
          inputValue: evt.target.value
        });
    }

    getGuessIfGuessed = () => {
        let context = this.state.result;

        if (context) {
            return (
                <div className={styles.guess}>
                    <div>
                        <div>Result: {Home.evaluateGuess(context)}</div>
                        <div>Your guess: {context.guess}/10</div>
                        <div>Rating: {context.realRating.toFixed(1)}/10</div>
                    </div>
                    <button className={styles.newMovie} onClick={this.loadRandomMovie}>Try Other Movie</button>
                </div>
            );
        } else {
            return (
                <div className={styles.guessInput}>
                    <h4>Guess rating: </h4>
                    <div>
                        <div>
                            <input type="number" id="guess" step="0.1" min="0" max="10" maxlength="3" value={this.state.inputValue} onChange={e => this.updateInputValue(e)}></input>
                            <span>/10</span>
                        </div>
                        <button className={styles.submit} onClick={this.guessRating}>Submit</button>
                    </div>
                </div>
            );
        }
    };

    loadRandomMovie = () => {
        this.setState(initialState);
        //fetch(`http://localhost:3000/api/movie?id=tt0472496`).then(response => {
        fetch(`http://localhost:3000/api/randomMovie`).then(response => {
            response.json().then(data => {
                this.setState({movie: data});
            });
        });
    };

    guessRating = () => {
        let guess = parseFloat(this.state.inputValue);
        guess = guess.toFixed(1);

        if (!isNaN(guess) && guess <= 10 && guess >= 0) {
            fetch(`http://localhost:3000/guessRating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ guess: guess, imdbID: this.state.movie.imdbID })
            }).then(response => {
                response.json().then(data => {
                    this.setState({result: data});
                });
            });
        } else {
            //TODO Send error
        }
    };

    render() {
        if (this.state.movie) {
            return (
                <div className={styles.Home}>
                    <object className={styles.poster} data={this.state.movie.Poster}>
                        <img src="http://localhost:3000/no-poster.jpg" alt="No poster"></img>
                    </object>
                    <div className={styles.info}>
                        <div>
                            <h2 className={styles.title}>{this.state.movie.Title} ({this.state.movie.Year})</h2>
                            <div className={styles.movieInfo}>
                                <h4>Released: {this.state.movie.Released !== 'N/A' ? this.state.movie.Released : this.state.movie.Year}</h4>
                                <h4>Genre: {this.state.movie.Genre}</h4>
                                <h4>Country: {this.state.movie.Country}</h4>
                                <h4>Runtime: {this.state.movie.Runtime}</h4>
                                <h4>Summary:</h4>
                            </div>
                            <p className={styles.plot}>{this.state.movie.Plot}</p>
                        </div>
                        {this.getGuessIfGuessed()}
                    </div>
                </div>
            );
        }
        
        return (<div></div>);
    }

    static evaluateGuess(results) {
        let guessResult = results.result;

        if (guessResult === 10) {
            return 'Perfect';
        } else if (guessResult >= 9.7) {
            return 'Close';
        } else if (guessResult >= 9) {
            return 'Good';
        } else if (guessResult >= 8) {
            return 'OK';
        } else if (guessResult >= 7) {
            return 'Bad';
        } else {
            return 'Really bad';
        }
    }
}
 
export default Home;
import React, { Component } from "react";
import styles from './Home.module.css';
 
const initialState = {
    inputValue: '',
    competition: null,
    movie: null,
    result: null
};

const resetState = {
    inputValue: '',
    movie: null,
    result: null
}

class Compete extends Component {
    constructor(props) {
        super(props);
        this.state = {...initialState,
            loggedIn: props.loginStatus};

        document.body.addEventListener('keyup', this.keypress);
    }   

    componentDidMount() {
        if (this.state.loggedIn) {
            this.getCompetition().then(() => this.loadNextMovie());
        } else {
            this.checkLoginStatus().then(() => {
                if (this.state.loggedIn) {
                    this.getCompetition().then(() => this.loadNextMovie()); 
                } else {
                    this.props.history.push('/');
                }
            });
        }
    }

    keypress = (event) => {
        var key = event.keyCode || event.charCode || 0;
        if ([13].indexOf(key) !== -1) {
            if (this.state.result) {
                this.loadNextMovie();
            } else {
                this.guessRating();
            }
        }
    }

    checkLoginStatus = () => {
        return fetch('http://localhost:3000/auth/logged-in', { credentials: 'include' }).then(response => {
          this.setState({ loggedIn: response.status === 200 });
        })
      }

    getCompetition = () => {
        return fetch('http://localhost:3000/api/compete', { 
            method: 'POST',
            credentials: 'include' })
        .then(response => {
            return response.json();
        })
        .then(data => {
            this.setState({ competition: data });
        })
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
                        <div>Result: {Compete.evaluateGuess(context)}</div>
                        <div>Your guess: {context.ratingGuess}/10</div>
                        <div>Rating: {context.realRating.toFixed(1)}/10</div>
                    </div>
                    {!this.state.competition.finished ? <button className={styles.newMovie} onClick={this.loadNextMovie}>Next movie</button> : null}
                </div>
            );
        } else {
            return (
                <div className={styles.guessInput}>
                    <h4>Guess rating: </h4>
                    <div>
                        <div>
                            <input type="number" id="guess" step="0.1" min="0" max="10" autoFocus value={this.state.inputValue} onChange={e => this.updateInputValue(e)}></input>
                            <span>/10</span>
                        </div>
                        <button className={styles.submit} onClick={this.guessRating}>Submit</button>
                    </div>
                </div>
            );
        }
    };

    loadNextMovie = () => {
        this.setState(resetState);
        let competition = this.state.competition;
        let imdbID = null;

        for (let movie of competition.movies) {
            if (!movie.guessed) {
                imdbID = movie.imdbID;
                break;
            }
        }

        if (!imdbID) {
            imdbID = competition.movies[9].imdbID;

            fetch(`http://localhost:3000/api/movie?id=${imdbID}`, {
                credentials: 'include'
            }).then(response => {
                return response.json();
            }).then(data => {
                this.setState({ movie: data, result: competition.movies[9].guess });
            });
        } else {
            fetch(`http://localhost:3000/api/movie?id=${imdbID}`, {
            credentials: 'include'
            }).then(response => {
                return response.json();
            }).then(data => {
                this.setState({ movie: data });
            });
        }
    };

    guessRating = () => {
        let guess = parseFloat(this.state.inputValue);
        guess = guess.toFixed(1);

        if (!isNaN(guess) && guess <= 10 && guess >= 0) {
            this.setState({ Error: undefined });
            fetch(`http://localhost:3000/api/compete-guess`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ guess: guess, imdbID: this.state.movie.imdbID })
            }).then(response => {
                return response.json()
            }).then(data => {
                this.setState({ result: data.ratedGuess,
                                competition: data.competition });
            });
        } else {
            this.setState({ Error: 'Guess must be between 0 and 10' });
        }
    };

    newCompetition = () => {
        this.setState({ Error: undefined });
        return fetch('http://localhost:3000/api/compete', { 
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ new: true })})
        .then(response => {
            return response.json();
        })
        .then(data => {
            this.setState({ competition: data });
            this.loadNextMovie();
        })
    }

    addToLeaderboard = () => {
        let competition = this.state.competition;
        if (!this.state.competition.addedToLeaderboard) {
            return fetch('http://localhost:3000/api/add-to-leaderboard', { 
                method: 'POST',
                credentials: 'include'
            }).then(response => {
                competition.addedToLeaderboard = true;
                this.setState(competition);
                
                this.props.history.push('/leaderboard');
            });
        } else {
            this.setState({ Error: 'Already added to leaderboard' });
        }
    }

    getAddToToLeaderboardButton = () => {
        if (this.state.competition.finished) {
            return (<button className={styles.redButton} onClick={this.addToLeaderboard}>Add to leaderboard</button>);
        }
    }

    render() {
        if (!this.state.loggedIn) {
            return <div>
                Make an account to compete
            </div>
        }
        if (this.state.movie) {
            return (
                <div className={styles.container}>
                    <div className={styles.Home}>
                        <object className={styles.poster} data={this.state.movie.Poster !== 'N/A' ? this.state.movie.Poster : null}>
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
                    {this.state.Error ? <div className={styles.error}>{this.state.Error}</div> : null}
                    <div className={styles.competition}>
                        <div>
                            <h4>Competition stats</h4>
                            <div>Movies guessed: {this.state.competition.guessedMovies}/10</div>
                            <div>Current result: {this.state.competition.currentResult}/10</div>
                            <button className={styles.redButton} onClick={this.newCompetition}>New competition</button>
                            {this.getAddToToLeaderboardButton()}
                        </div>
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
 
export default Compete;
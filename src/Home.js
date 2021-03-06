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
        this.genreList = ['Any', 'Action', 'Adult', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Film-Noir', 'Game-Show', 'History', 'Horror', 'Music', 'Musical', 'Mystery', 'News', 'Reality-TV', 'Romance', 'Sci-Fi', 'Short', 'Sport', 'Talk-Show', 'Thriller', 'War', 'Western'];

        this.state = initialState;
        document.body.addEventListener('keyup', this.keypress);
    }   

    componentDidMount() {
        this.loadRandomMovie();
    }

    keypress = (event) => {
        var key = event.keyCode || event.charCode || 0;
        if ([13].indexOf(key) !== -1) {
            if (this.state.result) {
                this.loadRandomMovie();
            } else {
                this.guessRating();
            }
        }
    };

    updateInputValue(evt) {
        this.setState({
          inputValue: evt.target.value
        });
    }

    selectGenre = (event) => {
        let genre = event.target.value;

        if (this.genreList.includes(genre)) {
            this.setState({ selectedGenre: genre }, () => {
                this.loadRandomMovie();
            });
        }
    }

    getGenres = () => {
        return (<select onChange={this.selectGenre} value={this.state.selectedGenre}>
            {this.genreList.map(genre => <option key={genre} value={genre}>{genre}</option>)}
        </select>)
    }

    getGuessIfGuessed = () => {
        let context = this.state.result;

        if (context) {
            return (
                <div className={styles.guess}>
                    <div>
                        <div>Result: {Home.evaluateGuess(context)}</div>
                        <div>Your guess: {context.ratingGuess}/10</div>
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
                            <input type="number" id="guess" step="0.1" min="0" max="10" autoFocus value={this.state.inputValue} onChange={e => this.updateInputValue(e)}></input>
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
        // fetch(`http://localhost:3000/api/movie?id=tt0317219`, {
        //     credentials: 'include'
        // }).then(response => {
        fetch(`http://localhost:3000/api/random-movie${(this.state.selectedGenre !== 'Any' && this.genreList.includes(this.state.selectedGenre)) ? '?genre=' + this.state.selectedGenre : ''}`)
        .then(response => {
            response.json().then(data => {
                this.setState({movie: data});
            });
        });
    };

    guessRating = () => {
        let guess = parseFloat(this.state.inputValue);
        guess = guess.toFixed(1);

        if (!isNaN(guess) && guess <= 10 && guess >= 0) {
            this.setState({ Error: undefined });
            fetch(`http://localhost:3000/api/guess-rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ guess: guess, imdbID: this.state.movie.imdbID })
            }).then(response => {
                return response.json();
            }).then(data => {
                this.setState({result: data});
            });
        } else {
            this.setState({ Error: 'Guess must be between 0 and 10' });
        }
    };

    render() {
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
                            <h4>Select genre</h4>
                            {this.getGenres()}
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
 
export default Home;
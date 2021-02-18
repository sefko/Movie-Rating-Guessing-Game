const { Router } = require('express');
const { getDb } = require('../db/index.js');
const { apiKey } = require('../config.json');
const fetch = require('node-fetch');
const { auth } = require('../auth/auth.js');

module.exports.connect = function (app, path) {
    const router = Router();

    router.get('/random-movie', function (req, res) {
        getRandomMovie(req, res);
    });

    router.get('/movie', auth, function (req, res) {
        const imdbID = req.query.id;
        if (!imdbID) {
            res.status(404).send({ Error: 'Not found' });
            return;
        }

        findInCollection({ imdbID }, 'movies').then(data => {
            if (data.length != 0) {
                res.send(data[0]);
                throw 'Handled';
            } 
            
            return findInCollection({ imdbID }, 'moviesDB');
        }).then(data => {
            if (data.length == 0) {
                res.status(404).send({ Error: 'Not found' });
                throw 'Invalid ID';
            }

            return fetch(`http://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`)
        }).then(response => {
            return response.json();
        }).then(data => {
            if (data.Error) {
                res.status(404).send({ Error: 'Not found' });
                throw 'Invalid ID at external API';
            } 

            getDb().collection('movies').insertOne(data);
            console.log('Fetched new movie');
            res.send(data);
        }).catch(error => {
            if (typeof error != 'string') {
                throw error;
            }
        });
    });
    
    router.post('/guess-rating', function (req, res) {
        const imdbID = req.body.imdbID;
        let ratingGuess = req.body.guess;
        ratingGuess = processGuess(ratingGuess);

        if (isNaN(ratingGuess) || ratingGuess > 10 || ratingGuess < 0) {
            res.status(400).send({ Error: 'Invalid guess' });
            return;
        }
    
        findInCollection({ imdbID }, 'movies').then(data => {
            if (data.length == 0) {
                res.status(400).send({ Error: 'Unknown Id' }); //Movie not recognized
                return;
            }

            const realRating = parseFloat(data[0].imdbRating); 
            res.send(rateGuess(ratingGuess, realRating));
        });
    });
    
    router.post('/compete', auth, function (req, res) {
        const username = req.user.username;
        const newCompetition = req.body.new;
        
        findInCollection({ username }, 'users').then(data => {
            const userdata = data[0];
    
            if (userdata.competition == undefined || newCompetition) {
                generateCompetition().then(competition => {
                    userdata.competition = competition;
                    getDb().collection('users').updateOne({ username }, { $set: { competition }});
                    res.send(userdata.competition);
                });
            } else {
                res.send(userdata.competition);
            }
        });
    });
    
    router.post('/compete-guess', auth, function (req, res) { 
        const username = req.user.username;
        const imdbID = req.body.imdbID;
        let ratingGuess = req.body.guess;
        ratingGuess = processGuess(ratingGuess);

        if (isNaN(ratingGuess) || ratingGuess > 10 || ratingGuess < 0) {
            res.status(400).send({ Error: 'Invalid guess' });
            return;
        }

        let competition;
        let ratedGuess;

        findInCollection({ username }, 'users').then(data => {
            competition = data[0].competition;
            
            return findInCollection({ imdbID }, 'movies');
        }).then(data => {
            let realRating = parseFloat(data[0].imdbRating);
            let currentResult = 0;
            let guessedMovies = 0;

            competition.movies = competition.movies.map(movie => {
                if (movie.imdbID == imdbID && movie.guessed == false) {
                    movie.guessed = true;
                    ratedGuess = rateGuess(ratingGuess, realRating)
                    movie.guess = ratedGuess;
                } 

                if (movie.guessed) {
                    guessedMovies += 1;
                    currentResult += parseFloat(movie.guess.result);
                }
                
                return movie;
            });

            competition.guessedMovies = guessedMovies;
            competition.finished = guessedMovies == 10;
            competition.currentResult = (currentResult / guessedMovies).toFixed(2);

            getDb().collection('users').updateOne({ username }, { $set: { competition }});
            res.send({ ratedGuess, competition });
        });
    });

    router.post('/add-to-leaderboard', auth, function(req, res) {
        const username = req.user.username;
    
        findInCollection({ username }, 'users').then(data => {
            let competition = data[0].competition;

            if (competition.finished && competition.guessedMovies == 10 && !competition.addedToLeaderboard) {
                getDb().collection('leaderboard').insertOne({ username, result: competition.currentResult });
                
                competition.addedToLeaderboard = true;
                getDb().collection('users').updateOne({ username }, { $set: { competition }});
                res.sendStatus(200);
            } else {
                res.status(403).send({ Error: 'Already added' });
            }
        });
    });

    router.get('/leaderboard', function (req, res) {
        getDb().collection('leaderboard').find().sort({ result: -1 }).toArray().then(data => {
            res.send(data.map(obj => {return { username: obj.username, result: obj.result}}));
        });
    });

    app.use(path, router);
};

function findInCollection(toFind, collection) {
    return getDb().collection(collection).find(toFind).toArray();
}

function getRandomMovie(req, res) {
    let imdbID;

    getRandomMovieId(req.query.genre).then(data => {
        imdbID = data[0].imdbID;

        return findInCollection({ imdbID }, 'movies');
    }).then(data => { 
        if (data.length != 0) { //Check if movie data is already in DB
            res.send(data[0]);
            throw 'Handled';
        }
            
        return fetch(`http://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data.Error) {
            getRandomMovie(req, res);
            throw 'Restart process';
        } 

        getDb().collection('movies').insertOne(data);
        console.log('Fetched new movie');
        res.send(data);
    }).catch(error => {
        if (typeof error != 'string') {
            throw error;
        }
    });
}

function processGuess(ratingGuess) {
    if (typeof ratingGuess == 'string') {
        ratingGuess = parseFloat(ratingGuess);
    }

    if (!isNaN(ratingGuess)) {
        ratingGuess = ratingGuess.toFixed(1);
    }

    return ratingGuess;
}

const genres = ['Action', 'Adult', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Film-Noir', 'Game-Show', 'History', 'Horror', 'Music', 'Musical', 'Mystery', 'News', 'Reality-TV', 'Romance', 'Sci-Fi', 'Short', 'Sport', 'Talk-Show', 'Thriller', 'War', 'Western'];

function getRandomMovieId(genre) {
    if (genre != undefined) {
        genre = genre.charAt(0).toUpperCase() + genre.slice(1);

        if (genres.includes(genre)) {
            return getDb().collection('moviesDB').aggregate([{ $match: { genres: genre } }, { $sample: { size: 1 } }]).toArray();
        }
    }

    return getDb().collection('moviesDB').aggregate([{ $sample: { size: 1 } }]).toArray();
}

function generateCompetition() {
    return getDb().collection('moviesDB').aggregate([{ $sample: { size: 10 } }]).toArray().then(data => {
        data = data.map(movie => {
            return { imdbID: movie.imdbID,
                     guessed: false,
                     guess: null };
        });

        return { finished: false, guessedMovies: 0, currentResult: 0, movies: data, addedToLeaderboard: false };
    });
}

function rateGuess(ratingGuess, realRating) {
    let result = 10 - Math.abs(realRating - ratingGuess);
    result = result.toFixed(2);

    return { ratingGuess, realRating, result };
}
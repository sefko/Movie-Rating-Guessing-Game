const { Router } = require('express');
const { getDb } = require('../db/index.js');
const { apiKey } = require('../config.json');
const fetch = require('node-fetch');
const { auth } = require('../auth.js');

module.exports.connect = function (app, path) {
    const router = Router();

    router.get('/randomMovie', function (req, res) {
        let imdbID;
        
        getRandomMovieId().then(data => {
            imdbID = data[0].imdbID;

            return getDb().collection('movies').find({ imdbID }).toArray()//TODO Add to function
        }).then(data => { 
            if (data.length == 0) {
                return getDb().collection('moviesDB').find({ imdbID }).toArray();
            } else {
                res.send(data[0]);
                throw new Error('handled');
            }
        }).then(data => {
            if (data.length == 0) {
                //TODO Reset whole process
                res.status(404).send('INVALID ID');
                throw new Error('handled');
            }

            return fetch(`http://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
        }).then(response => {
            return response.json()
        }).then(data => {
                if (data.Error) {
                    res.status(404).send({});
                } else {
                    getDb().collection('movies').insertOne(data);
                    console.log('fetched');
                    res.send(data);
                }
        }).catch(error => {
            //TODO Handle errors;
        });
    });

    router.get('/movie', auth, function (req, res) {
        let imdbID = req.query.id;
        if (!imdbID) {
            res.status(404).send('NOT FOUND');
            return;
        }

        getDb().collection('movies').find({ imdbID }).toArray().then(data => {
            if (data.length == 0) {
                return getDb().collection('moviesDB').find({ imdbID }).toArray();
            } 
            
            res.send(data[0]);
            throw new Error('handled');
        }).then(data => {
            if (data.length == 0) {
                res.status(404).send('INVALID ID');
                throw new Error('handled');
            }

            return fetch(`http://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`)
        }).then(response => {
            return response.json();
        }).then(data => {
            getDb().collection('movies').insertOne(data);
            console.log('fetched');
            res.send(data);
        }).catch(error => {
            //TODO Handle errors
        });
    });
    
    router.post('/guessRating', function (req, res) {
        let imdbID = req.body.imdbID;
        let ratingGuess = req.body.guess;
        ratingGuess = processGuess(ratingGuess);
    
        getDb().collection('movies').find({ imdbID }).toArray().then(data => {
            if (data.length == 0) {
                //Not recognized movie
                res.status(404).send('Not recognized');
                return;
            }

            let realRating = parseFloat(data[0].imdbRating);
            
            //Add guess to user
            
            res.send(rateGuess(ratingGuess, realRating));
        });
    });
    
    router.post('/compete', auth, function (req, res) {
        const username = req.user.username;
        
        getDb().collection('users').find({ username }).toArray().then(data => {
            let userdata = data[0];
    
            if (userdata.competition == undefined) {
                generateCompetition().then(competition => {
                    userdata.competition = competition;
                    getDb().collection('users').updateOne({ username }, { $set: { competition }});
                    res.send(userdata.competition);
                });
            } else {
                res.send(userdata.competition);
            }
        })
    });
    
    router.post('/compete_guess', auth, function (req, res) { 
        const username = req.user.username;
        let imdbID = req.body.imdbID;
        let ratingGuess = req.body.guess;
        ratingGuess = processGuess(ratingGuess);

        let competition;
        let ratedGuess;

        getDb().collection('users').find({ username }).toArray().then(data => {
            competition = data[0].competition;
            
            return getDb().collection('movies').find({ imdbID }).toArray();
        }).then(data => {
            let realRating = parseFloat(data[0].imdbRating);

            competition.movies = competition.movies.map(movie => {
                if (movie.imdbID == imdbID) {
                    movie.guessed = true;
                    movie.guess = ratingGuess;
                    ratedGuess = rateGuess(ratingGuess, realRating)
                    movie.points = ratedGuess;
                } 

                return movie;
            });

            getDb().collection('users').updateOne({ username }, { $set: { competition }});
            res.send(ratedGuess);
        });
    });
    

    app.use(path, router);
};

function processGuess(ratingGuess) {
    if (typeof ratingGuess == 'string') {
        ratingGuess = parseFloat(ratingGuess);
    }

    if (isNaN(ratingGuess)) {
        ratingGuess = 0;
    }

    ratingGuess = ratingGuess.toFixed(1);

    if (ratingGuess > 10 || ratingGuess < 0) {
        ratingGuess = 0;
    }

    return ratingGuess;
}

function getRandomMovieId() {
    return getDb().collection('moviesDB').aggregate([{ $sample: { size: 1 } }]).toArray();
}

function rateGuess(guess, realRating) {
    let result = 10 - Math.abs(realRating - guess);
    return { guess, realRating, result };
}

function generateCompetition() {
    return getDb().collection('moviesDB').aggregate([{ $sample: { size: 10 } }]).toArray().then(data => {
        data = data.map(movie => {
            return { imdbID: movie.imdbID,
                     guessed: false,
                     guess: null };
        });

        return { finished: false, endResult: null, movies: data}
    });
}
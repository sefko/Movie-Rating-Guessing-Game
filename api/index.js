const { Router } = require('express');
const { getDb } = require('../db/index.js');
const { apiKey } = require('../config.json');
const fetch = require('node-fetch');
const { auth } = require('../auth.js')

module.exports.connect = function (app, path) {
    const router = Router();

    router.use('/randomMovie', function (req, res) {
        getRandomMovieId().then(data => {
            let imdbID = data[0].imdbID;

            getDb().collection('movies').find({ imdbID }).toArray().then(data => { //TODO Add to function
                if (data.length == 0) {
                    getDb().collection('moviesDB').find({ imdbID }).toArray().then(data => {
                        if (data.length == 0) {
                            res.status(404).send('INVALID ID');
                            return;
                        }
    
                        fetch(`http://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`).then(response => {
                            response.json().then(data => {
                                if (data.Error) {
                                    res.status(404).send({});
                                } else {
                                    getDb().collection('movies').insertOne(data);
                                    console.log('fetched');
                                    res.send(data);
                                }
                            });
                        });
                    });
                    return;
                } 
                
                res.send(data[0]);
            });
        });
    });

    router.use('/movie', auth, function (req, res) {
        let imdbID = req.query.id;
        if (!imdbID) {
            res.status(404).send('NOT FOUND');
            return;
        }

        getDb().collection('movies').find({ imdbID }).toArray().then(data => {
            if (data.length == 0) {
                getDb().collection('moviesDB').find({ imdbID }).toArray().then(data => {
                    if (data.length == 0) {
                        res.status(404).send('INVALID ID');
                        return;
                    }

                    fetch(`http://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`).then(response => {
                        response.json().then(data => {
                            getDb().collection('movies').insertOne(data);
                            console.log('fetched');
                            res.send(data);
                        });
                    });
                });
                return;
            } 
            
            res.send(data[0]);
        });
    });

    app.use(path, router);
};

function getRandomMovieId() {
    return getDb().collection('moviesDB').aggregate([{ $sample: { size: 1 } }]).toArray();
}
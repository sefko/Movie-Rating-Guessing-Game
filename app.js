global.__basedir = __dirname;

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config.json');
const db = require('./db');
const fs = require('fs');
const api = require('./api');
const cors = require('cors');
const auth = require('./auth');
const crypto = require('crypto');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__basedir, '/public')));

api.connect(app, '/api');

app.get('/', function (req, res) {
    res.sendFile(path.join(__basedir, 'public/index.html'));
});

app.post('/guessRating', function (req, res) {
    let imdbID = req.body.imdbID;
    let ratingGuess = req.body.guess;
    if (typeof ratingGuess == 'string') {
        ratingGuess = parseFloat(ratingGuess);
    }
    ratingGuess = ratingGuess.toFixed(1);

    if (ratingGuess > 10 || ratingGuess < 0) {
        ratingGuess = 0;
    }

    db.getDb().collection('movies').find({ imdbID }).toArray().then(data => {
        let realRating = parseFloat(data[0].imdbRating);
        
        //Add guess to user
        
        res.send(rateGuess(ratingGuess, realRating));
    });
});

app.post('/auth/register', function (req, res) {
    let body = req.body;
    console.log(body);
    
    //Check for wrong data

    if (body.password != body.confirmPassword) {
        //Send error
        res.send('Password and confirm is different');
    }

    db.getDb().collection('users').find({ username: body.username }).toArray().then(data => {
        if (data.length != 0) {
            //Username is used
            res.send('username used');
        }

        if (typeof body.password != 'string') {
            body.password += '';
        }

        body.password = crypto.createHash('sha256').update(body.password).digest('hex');
        delete body.confirmPassword;

        console.log(body);

        db.getDb().collection('users').insertOne(body).then(resp => {
            //Check if added;
        });

    });
});

app.post('/auth/login', function (req, res) {
    let body = req.body;

    if (!body.username || !body.password) {
        //Wrong data
        res.send('Wrong information');
    }

    db.getDb().collection('users').find({ username: body.username }).toArray().then(data => {
        if (data.length == 0) {
            //No user
            res.send('User or password is wrong');
        }

        data = data[0];
        if (typeof body.password != 'string') {
            body.password += '';
        }

        if (data.password != crypto.createHash('sha256').update(body.password).digest('hex')) {
            //Wrong password
            res.send('User or password is wrong');
        }

        auth.createToken(data).then(token => {
            res.cookie('MRGG_COOKIE', token, { httpOnly: true }).end();
            //res.send("Logged"); //?
            console.log("Logged");
        });
    });
})

app.get('/auth/logout', /*auth,*/ (req, res) => {
    res.clearCookie('MRGG_COOKIE');
    res.send();
});

app.get('*', function (req, res) {
    res.status(404).send('PAGE NOT FOUND!');
});

app.use(function (err, req, res, next) {
    if (err.message === 'BAD_REQUEST') {
      res.status(400).send('BAD REQUEST');
      return;
    }
    res.status(500).send('SERVER ERROR');
});

db.connect().then(() => {
    app.listen(config.port, function () {
        console.log(`Server listening on :${config.port}`);
    });
});

function rateGuess(guess, realRating) {
    let result = 10 - Math.abs(realRating - guess);
    return { guess, realRating, result };
}
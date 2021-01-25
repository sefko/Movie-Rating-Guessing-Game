global.__basedir = __dirname;

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config.json');
const db = require('./db');
const api = require('./api');
const { auth, createToken } = require('./auth.js');
const crypto = require('crypto');

const app = express();

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3006');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__basedir, '/public')));

api.connect(app, '/api');

app.get('/', function (req, res) {
    res.sendFile(path.join(__basedir, 'public/index.html'));
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
            res.send('User or password is wrong'); //Send signal that user does not exist
            return;
        }

        console.log(data);

        data = data[0];
        if (typeof body.password != 'string') {
            body.password += '';
        }

        if (data.password != crypto.createHash('sha256').update(body.password).digest('hex')) {
            //Wrong password
            res.send('User or password is wrong');
        }

        createToken(data).then(token => {
            res.cookie('MRGG_COOKIE', token, { httpOnly: true }).end();
        });
    });
})

app.get('/auth/logout', /*auth,*/ (req, res) => {
    res.clearCookie('MRGG_COOKIE');
    res.sendStatus(200);
});

app.get('/auth/logged_in', auth, (req, res) => {
    res.send({ message: "Authorized!" });
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
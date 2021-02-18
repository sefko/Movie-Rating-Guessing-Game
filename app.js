global.__basedir = __dirname;

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config.json');
const db = require('./db');
const api = require('./api');
const auth = require('./auth');

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

auth.connect(app, '/auth');
api.connect(app, '/api');

app.get('/', function (req, res) {
    res.sendFile(path.join(__basedir, 'public/index.html'));
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
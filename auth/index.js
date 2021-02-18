const crypto = require('crypto');
const { Router } = require('express');
const { getDb } = require('../db/index.js');
const { auth, createToken } = require('./auth.js');

module.exports.connect = function (app, path) {
    const router = Router();

    router.post('/register', function (req, res) {
        let body = req.body;
        
        if (!body.username || !body.password || !body.confirmPassword) {
            res.status(400).send({ Error: 'Missing parameters for registration' });
            return;
        }
    
        if (body.password != body.confirmPassword) {
            res.status(400).send({ Error: 'Password and confirm are different' });
            return;
        }
    
        findInCollection({ username: body.username }, 'users').then(data => {
            if (data.length != 0) {
                res.status(400).send({ Error: 'Username used' });
                return;
            }
    
            if (typeof body.password != 'string') {
                body.password = '' + body.password;
            }
    
            body.password = crypto.createHash('sha256').update(body.password).digest('hex');
            delete body.confirmPassword;
    
            try {
                getDb().collection('users').insertOne(body);
                res.sendStatus(200);
            } catch (e) {
                res.status(500).send({ Error: "Server error: Couldn't register" });
            }
        });
    });
    
    router.post('/login', function (req, res) {
        if (req.headers.cookie) {
            res.status(400).send({ Error: 'Already logged in' });
            return;
        }

        let body = req.body;
    
        if (!body.username || !body.password) {
            res.status(400).send({ Error: 'Missing parameters for login'});
            return;
        }
        
        findInCollection({ username: body.username }, 'users').then(data => {
            if (data.length == 0) {
                res.status(400).send({ Error: 'User is not registered' });
                return;
            }
    
            data = data[0];
            if (typeof body.password != 'string') {
                body.password += '';
            }
    
            if (data.password != crypto.createHash('sha256').update(body.password).digest('hex')) {
                res.status(400).send({ Error: 'Username or password is wrong' });
                return;
            }
    
            createToken(data).then(token => {
                res.cookie('MRGG_COOKIE', token, { httpOnly: true }).end();
            });
        });
    })
    
    router.get('/logout', auth, (req, res) => {
        res.clearCookie('MRGG_COOKIE');
        res.sendStatus(200);
    });
    
    router.get('/logged-in', auth, (req, res) => {
        res.sendStatus(200);
    });
    
    app.use(path, router);
};

function findInCollection(toFind, collection) {
    return getDb().collection(collection).find(toFind).toArray();
}
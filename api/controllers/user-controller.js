
const jwt = require('jsonwebtoken');
const util = require('util');
const firebase = require('firebase');
const configFirebase = require('../../config/firebase-config');

if (!firebase.apps.length) {
    firebase.initializeApp(configFirebase);
}

function verifyJWT(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'CJ', function (err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        // se tudo estiver ok, salva no request para uso posterior
        req.userId = decoded.id;
    });
}

const usersDB = firebase.database().ref('users');

const controller = {};

controller.users = (req, res, next) => {

    let valid = verifyJWT(req, res, next);

    if (!util.isNullOrUndefined(valid)) {
        if (!valid.auth) {
            res.status(200).json(valid);
        }
    }

    usersDB.once('value', function (snap) {
        res.status(200).json({ "users": snap.val() });
        usersDB.off("value");
    })
};

controller.login = (req, res) => {

    let consulting = Object;

    usersDB.once('value', function (snap) {
        try {

            consulting = snap.val()['data'].find(a => a.email === req.body.email && a.password === req.body.password);

            if (!util.isNullOrUndefined(consulting)) {

                const id = consulting.id;

                let token = jwt.sign({ id }, 'CJ', {
                    expiresIn: 300 // expires in 5min
                });

                res.status(200).send({ auth: true, token: token, user: { id: id, name: consulting.name } });
            }

            res.status(401).send('Login inválido!');
            usersDB.off("value");
        }

        catch (error) {
            console.log(error);
        }
    })
}

module.exports = controller;
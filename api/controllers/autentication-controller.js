
const jwt = require('jsonwebtoken');
const util = require('util');
const mongo = require('mongodb').MongoClient
const url = "mongodb+srv://classificae-user:Junior381414@cluster0.ahqaj.mongodb.net/classificae?retryWrites=true&w=majority";

function verifyJWT(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'CJ', function (err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        // se tudo estiver ok, salva no request para uso posterior
        req.userId = decoded.id;
    });
}

const controller = {};

controller.login = (req, res) => {

    try {
        mongo.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            if (err) {
                console.error(err)
                return
            } else {
                const db = client.db('classificae')
                const collection = db.collection('company')
                collection.find({ 'contact.email': req.body.email, 'password': req.body.password }).toArray((err, items) => {
                    if (items.length > 0) {                        
                        let id = items[0]._id;

                        let token = jwt.sign({ id }, 'CJ', {
                            expiresIn: 50000 // expires in 5min
                        });

                        res.status(200).send({ auth: true, token: token, user: { id: id, name: items[0].name, logo: items[0].image_logo } });
                    } else {
                        res.status(401).send({ auth: false, message: 'E-mail e/ou senha estão incorretos' });
                    }
                });
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = controller;
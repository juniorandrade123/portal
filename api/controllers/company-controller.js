const jwt = require('jsonwebtoken');
const util = require('util');
const firebase = require('firebase');

const mongo = require('mongodb').MongoClient
const url = "mongodb+srv://classificae-user:Junior381414@cluster0.ahqaj.mongodb.net/classificae?retryWrites=true&w=majority";


const configFirebase = require('../../config/firebase-config');
if (!firebase.apps.length) {
    firebase.initializeApp(configFirebase);
}

function verifyJWT(req, res, next) {
    try {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, 'CJ', function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

            // se tudo estiver ok, salva no request para uso posterior
            req.userId = decoded.id;
        });
    } catch (error) {

    }
}

const usersDB = firebase.database().ref('company');
const controller = {};

controller.setCompany = (req, res, next) => {
    try {

        let valid = verifyJWT(req, res, next);
        if (!util.isNullOrUndefined(valid)) {
            if (!valid.auth) {
                res.status(200).json(valid);
            }
        }

        usersDB.push(
            {
                "id": 2,
                "name": "Pizza 1",
                "description": "Servimos almoço ao peso, jantar a la carte, pizzas, massas, filés, aves e peixes. Ambiente aconchegante com varanda ao ar livre.",
                "contact": {
                    "tel": "1236320908",
                    "cel": "1299989899",
                    "email": "peperone@peperone.com.br"
                },
                "address": {
                    "cep": 1111111,
                    "description": "Rua XV de Novembro, 348 - Centro Taubate/SP"
                },
                "images": [
                    {
                        "id": 1,
                        "base64": ""
                    }
                ],
                "know_more": [
                    {
                        "description": ""
                    }
                ],
                "information": {
                    "schedule": [
                        {
                            "day_week_start": "Segunda",
                            "day_week_end": "Sexta",
                            "hour_start": "11:30",
                            "hour_end": "18:00"
                        },
                        {
                            "day_week_start": "Sábados",
                            "day_week_end": "Sábados",
                            "hour_start": "11:30",
                            "hour_end": "15:00"
                        }
                    ],
                    "redes": {
                        "facebook": "",
                        "instagran": "",
                        "twitter": ""
                    },
                    "payment": {
                        "credit": true,
                        "money": true,
                        "debit": true
                    }
                }
            }
        )

        res.status(200).json(true);

    } catch (error) {

    }
}

controller.companys = (req, res, next) => {

    try {
        let valid = verifyJWT(req, res, next);

        if (!util.isNullOrUndefined(valid)) {
            if (!valid.auth) {
                res.status(200).json(valid);
            }
        }

        usersDB.once('value', function (snap) {
            let result = [];
            snap.forEach(element => {
                result.push(element);
            });
            res.status(200).json({ "company": result });
            usersDB.off("value");
        })
    } catch (error) {

    }
};

controller.listCompanys = (req, res, next) => {
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
            collection.find().toArray((err, items) => {
                res.status(200).json({'company': items});
              });
          }  
        })

    } catch (error) {

    }
}

controller.CreateCompany = (req, res, err) => {
    try {

        mongo.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }, (err, client) => {
          if (err) {
            return  res.status(500).json({message:"Erro ao salvar."});
          } else {
              
            const db = client.db('classificae')
            const collection = db.collection('company')

            collection.insertOne(req.body, function(errorIsent){
                if(errorIsent) {
                    res.status(500).json({message:"Erro ao salvar."});
                    throw errorIsent;
                }
                client.close();
                res.status(200).json({message:"Cadastrado com sucesso."});
            });
          }  
        })
    } catch (err) {
        throw err;
    }
}

module.exports = controller;
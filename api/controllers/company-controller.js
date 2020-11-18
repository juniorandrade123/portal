const jwt = require('jsonwebtoken');

const mongo = require('mongodb').MongoClient
const url = "mongodb+srv://classificae-user:Junior381414@cluster0.ahqaj.mongodb.net/classificae?retryWrites=true&w=majority";

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

const controller = {};

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
            const db = client.db('classificae');
            const collection = db.collection('company');
            collection.find({}, { projection: { password: 0 } }).toArray((err, items) => {
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
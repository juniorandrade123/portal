const jwt = require('jsonwebtoken');
const util = require('util');
const firebase = require('firebase');
const { ObjectID } = require('mongodb');
const objectId = require('mongodb').ObjectId;

const mongo = require('mongodb').MongoClient
const url = "mongodb+srv://classificae-user:Junior381414@cluster0.ahqaj.mongodb.net/classificae?retryWrites=true&w=majority";

// MENSAGENS
const usuarioNaoLogado = "Usuário não Logado.";
const registration_success = "Cadastrado com Sucesso";
const error_changing = "Erro ao alterar.";
const error_saving = "Erro ao salvar.";
const changed_success = "Alterado com sucesso.";

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
            collection.find({}, { projection: { password: 0, image_galeria: 0} }).toArray((err, items) => {
                res.status(200).json({'company': items.filter(x => x.active && !x.gold), 'company_gold': items.filter(x => x.active && x.gold)});
              });
          }  
        })

    } catch (error) {

    }
}

controller.CreateUpdateCompany = (req, res, err) => {
    try {

        mongo.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }, (err, client) => {
          if (err) {
            return  res.status(500).json({message: error_saving});
          } else {
              
            //console.log("req.body.id :" + req.body.id);

            if(typeof req.body.id === 'undefined'){
                insert(req, res, client)
            }
            else{
                update(req, res, client)
            }
          }  
        })
    } catch (err) {
        throw err;
    }
}

controller.GetId = (req, res, err) => {
    try {
        //TODO:DESCOMENTAR CÓDIGO ABAIXO
        // if(!verifyUserLog(req, res)){
        //     return res.status(500).json(usuarioNaoLogado);
        // }

        return GetIdCompany(req, res, err);
        
    }catch (err) {
        throw err;
    }
}

controller.like = (req, res, err_request) => {
    try {

         //TODO:DESCOMENTAR CODIGO A BAIXO
        if(!verifyUserLog(req, res, err_request)){
            console.log("verifyUserLog:");
            return res.status(500).json(usuarioNaoLogado);
        }

        mongo.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }, (err, client) => {
          if (err) {
            return  res.status(500).json({message: error_saving});
          } else {
            if(typeof req.body.id !== 'undefined'){

                const db = client.db('classificae')
                const collection = db.collection('company')       
                
                collection.find({"_id" : new objectId(req.body.id)}).toArray(function(error, result){
                    if(error){
                        return res.json(error);
                    }else{                        

                        if(result !== null && result !== 'undefined'){
                            if (result[0].user_like !== undefined) {
                                let consultingUser = result[0].user_like.filter(a => a.email === req.body.email);
                                if (consultingUser.length === 0) {
                                    result[0].user_like.push({
                                        email: req.body.email,
                                        comments: {
                                            description: '',
                                            status: false
                                        },
                                        rank: 0,
                                        like: 1
                                    });
                                    update(req, res, client, result[0]);
                                } else {
                                    let newvalue = consultingUser[0].like === 1 ? 0 : 1;
                                    if (newvalue === 1) {
                                        consultingUser[0].like = consultingUser[0].like + 1;
                                        update(req, res, client, result[0]);
                                    } else {
                                        consultingUser[0].like = consultingUser[0].like - 1;
                                        update(req, res, client, result[0]);
                                    }
                                }
                            } else {
                                result[0].user_like = [];
                                result[0].user_like.push({
                                    email: req.body.email,
                                    comments: {
                                        description: '',
                                        status: false
                                    },
                                    rank: 0,
                                    like: 1
                                });
                                update(req, res, client, result[0]);
                            }
                        }                   
                    }
                });

            }
            else{
                return  res.status(500).json({message: error_saving});
            }
          }  
        })
    } catch (err) {
        throw err;
    }

}
//### METODOS AUXILIARES

function verifyJWT(req, res, next) {
    try {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, 'CJ', function (err, decoded) { 
            console.log(req.params.id === decoded.id);
            console.log(decoded);
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

            // se tudo estiver ok, salva no request para uso posterior
            return req.params.id === decoded.id;
        });
    } catch (error) {

    }
}

async function verifyUserLog(req, res, err, next){

    if(err){
        console.error(err)
        return
    }

    let valid = await verifyJWT(req, res, next);
    if (!util.isNullOrUndefined(valid)) {
        return valid.auth;
    }
}

async function GetIdCompany(req, res, err) {
    try {
        //console.log("GetIdCompany: ");
        let returnObj;
        //console.log("req.params._id)" + req.params.id);
        await mongo.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            if (err) {
                return res.status(500).json({ message: error_saving });
            } else {
                const db = client.db('classificae')
                const collection = db.collection('company')

                collection.find({ "_id": new objectId(req.params.id) }, { projection: {'_id': 0} }).toArray(function (error, result) {
                    if (error) {
                        return res.json(error);
                    } else {
                        //console.log("RESULT: " + result);                        
                        client.close();
                        return res.json(result);                        
                    }                    
                });
            }
        })
    } catch (err) {
        throw err;
    }
}

function insert(req, res, client){

    const db = client.db('classificae')
    const collection = db.collection('company')

    collection.insertOne(req.body, function(errorIsent){
        if(errorIsent) {
            res.status(500).json({message: error_saving});
            throw errorIsent;
        }
        client.close();
        return res.status(200).json({message: registration_success});
    });
}

async function update(req, res, client, objLike){

    //console.log("valueLike: " + valueLike)
    //TODO:DESCOMENTAR CODIGO A BAIXO
    // if(!verifyUserLog(req, res, err)){
    //     console.log("verifyUserLog:");
    //     return res.status(500).json(usuarioNaoLogado);
    // }

    const db = client.db('classificae')
    const collection = db.collection('company')

    var myquery = { _id: ObjectID(req.body.id) };
    var newvalues = objLike === undefined ? { $set: req.body } : { $set: objLike };

    console.log(newvalues);
    
    collection.updateOne(
        myquery, newvalues,
        function(errorUpdate, result){

        let status = result.result.nModified === 0 ? false : true;        

        if(errorUpdate) {
            res.status(500).json({message: error_changing});
            throw errorUpdate;
        }
        client.close();

        res.status(200).json({message: status ? changed_success : error_changing, status: status});

    });
}



module.exports = controller;

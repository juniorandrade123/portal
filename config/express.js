const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const consign = require('consign');
const cors = require('cors')

module.exports = () => {
    const app = express();

    // SETANDO VARIÁVEIS DA APLICAÇÃO
    app.set('port', process.env.PORT || config.get('server.port'));

    // MIDDLEWARES    
    app.use(bodyParser.json());
    app.use(cors());

    // ENDPOINTS
    consign({ cwd: 'api' })
        .then('data')
        .then('controllers')
        .then('routes')
        .into(app);

    return app;
};
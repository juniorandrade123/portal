module.exports = app => {
    const controller = app.controllers['autentication-controller'];

    app.route('/api/v1/login')
        .post(controller.login);
}
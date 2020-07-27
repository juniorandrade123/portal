module.exports = app => {
    const controller = app.controllers['user-controller'];

    app.route('/api/v1/users')
        .get(controller.users);

    app.route('/api/v1/login')
        .post(controller.login);
}
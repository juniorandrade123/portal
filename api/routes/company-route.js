module.exports = app => {
    const controller = app.controllers['company-controller'];

    app.route('/api/v1/listCompanys')
        .get(controller.listCompanys);
    app.route('/api/v1/CreateUpdateCompany')
        .post(controller.CreateUpdateCompany);
    app.route('/api/v1/GetId/:id')
        .get(controller.GetId);
}
module.exports = app => {
    const controller = app.controllers['company-controller'];

    app.route('/api/v1/companys')
        .get(controller.companys);
    app.route('/api/v1/listCompanys')
        .get(controller.listCompanys);
    app.route('/api/v1/CreateCompany')
        .post(controller.CreateCompany);

}
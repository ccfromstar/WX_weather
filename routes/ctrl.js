module.exports = function (app, routes) {
    //app.post('/uploadImg',routes.uploadImg);
    app.get('/BsReal',routes.BsReal);
    app.get('/Bs7Day',routes.Bs7Day);
    app.get('/BsWarn',routes.BsWarn);
};
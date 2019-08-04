const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 30271;

const passportConfig = require('./config/passport');
passportConfig(passport);

// Middleware
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());

// Routes
const routesList = [
    require('./api/staticRoutes'),
    require('./api/authRoutes'),
    require('./api/eventRoutes'),
];
routesList.forEach((routes) => {
    routes({
        app: app,
        passport: passport,
    });
});

// Main Loop
app.listen(port);
console.log(`Open-O RESTful API server started on: ${port}`);

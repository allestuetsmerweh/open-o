const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const connectFlash = require('connect-flash');

const app = express();
const port = process.env.PORT || 30271;

const passportConfig = require('./config/passport');
passportConfig(passport);

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
    secret: 'wtfwtfwtfwtfwtf',
    resave: true,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(connectFlash());

// Routes
const routesList = [
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

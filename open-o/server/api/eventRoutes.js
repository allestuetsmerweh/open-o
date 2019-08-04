'use strict';

module.exports = ({app, passport}) => {
    const eventController = require('./eventController');

    app.get(
        '/recent_events',
        passport.jwtAuth,
        eventController.list_recent_events,
    );
    app.get(
        '/my_events',
        passport.jwtAuth,
        eventController.list_my_events,
    );
};

module.exports = ({app, passport}) => {
    app.post(
        '/login',
        (req, res) => passport.authenticate(
            'local-login',
            (err, user, info) => {
                if (req.body.remember) {
                    req.session.cookie.maxAge = 1000 * 60 * 3;
                } else {
                    req.session.cookie.expires = false;
                }
                if (user) {
                    res.json({
                        data: {
                            type: 'User',
                            id: `${user.id}`,
                        },
                    });
                    return;
                }
                if (err) {
                    res.json({
                        errors: [
                            {title: err.message},
                        ],
                    });
                    return;
                }
                if (info.message) {
                    res.json({
                        errors: [
                            {title: info.message},
                        ],
                    });
                    return;
                }
                throw new Error('Unhandlable');
            },
        )(req, res),
    );

    app.post(
        '/signup',
        (req, res) => passport.authenticate(
            'local-signup',
            (err, user, info) => {
                if (user) {
                    res.json({
                        data: {
                            type: 'User',
                            id: `${user.id}`,
                        },
                    });
                    return;
                }
                if (err) {
                    res.json({
                        errors: [
                            {title: err.message},
                        ],
                    });
                    return;
                }
                if (info.message) {
                    res.json({
                        errors: [
                            {title: info.message},
                        ],
                    });
                    return;
                }
                throw new Error('Unhandlable');
            },
        )(req, res),
    );

    app.post(
        '/logout',
        (req, res) => {
            req.logout();
            res.redirect('/');
        },
    );
};

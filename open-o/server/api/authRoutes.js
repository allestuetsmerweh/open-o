module.exports = ({app, passport}) => {
    const renderUser = (user) => ({
        type: 'User',
        id: user.id,
        email: user.email,
    });

    const renderTokenWithUser = (token, user) => ({
        data: {
            type: 'Token',
            id: token,
            relationships: {
                user: {
                    data: {
                        type: 'User',
                        id: user.id,
                    },
                },
            },
        },
        included: [
            renderUser(user),
        ],
    });

    app.post(
        '/login',
        (req, res) => passport.authenticate(
            'local-login',
            (err, user, info) => {
                if (info.token && user) {
                    res.json(renderTokenWithUser(info.token, user));
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
                if (info.token && user) {
                    res.json(renderTokenWithUser(info.token, user));
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
            res.json({});
        },
    );

    app.get(
        '/me',
        passport.jwtAuth,
        (req, res) => {
            res.json({
                data: renderUser(req.user),
            });
        },
    );
};

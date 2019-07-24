module.exports = ({app, passport}) => {
    app.post(
        '/login',
        passport.authenticate('local-login', {
            successRedirect: '/profile', // redirect to the secure profile section
            failureRedirect: '/login', // redirect back to the signup page if there is an error
            failureFlash: true, // allow flash messages
        }),
        (req, res) => {
            console.log('hello');

            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        },
    );

    app.post(
        '/signup',
        passport.authenticate('local-signup', {
            successRedirect: '/profile', // redirect to the secure profile section
            failureRedirect: '/signup', // redirect back to the signup page if there is an error
            failureFlash: true, // allow flash messages
        }),
    );

    app.post(
        '/logout',
        (req, res) => {
            req.logout();
            res.redirect('/');
        },
    );
};

const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');

const dbconfig = require('./database');
const connection = mysql.createConnection(dbconfig.connection);
connection.query(`USE ${dbconfig.database};`);

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        connection.query(
            'SELECT * FROM users WHERE id = ?',
            [id],
            (err, rows) => {
                done(err, rows[0]);
            },
        );
    });

    passport.use(
        'local-signup',
        new LocalStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true,
            },
            (_req, username, password, done) => {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                connection.query(
                    'SELECT * FROM users WHERE username = ?',
                    [username],
                    (err, rows) => {
                        if (err) {
                            return done(err);
                        }
                        if (rows.length) {
                            return done(null, false, {message: 'That username is already taken.'});
                        }

                        // create the user
                        const newUserMysql = {
                            username: username,
                            password: bcrypt.hashSync(password, null, null), // use the generateHash function in our user model
                        };

                        connection.query(
                            'INSERT INTO users (username, password) VALUES (?, ?)',
                            [newUserMysql.username, newUserMysql.password],
                            (_insertionErr, insertionRows) => {
                                newUserMysql.id = insertionRows.insertId;
                                return done(null, newUserMysql);
                            },
                        );
                        return null;
                    },
                );
            },
        ),
    );

    passport.use(
        'local-login',
        new LocalStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true,
            },
            (req, username, password, done) => {
                console.log(`Req: ${req}`);
                console.log(`Username: ${username}`);
                console.log(`Password: ${password}`);
                connection.query(
                    'SELECT * FROM users WHERE username = ?',
                    [username],
                    (err, rows) => {
                        if (err) {
                            console.error(`MySQL error: ${err}`);
                            return done(err);
                        }
                        if (!rows.length) {
                            console.warn(`No such user: ${username}`);
                            return done(null, false, {message: 'No user found.'});
                        }

                        // if the user is found but the password is wrong
                        if (!bcrypt.compareSync(password, rows[0].password)) {
                            console.warn(`Wrong password provided for user: ${username}`);
                            return done(null, false, {message: 'Oops! Wrong password.'});
                        }

                        // all is well, return successful user
                        return done(null, rows[0]);
                    },
                );
            },
        ),
    );
};

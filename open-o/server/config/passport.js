const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const passportJwt = require('passport-jwt');

const dbconfig = require('./database');
const connection = mysql.createConnection(dbconfig.connection);
connection.query(`USE ${dbconfig.database};`);

const ExtractJwt = passportJwt.ExtractJwt;
const JwtStrategy = passportJwt.Strategy;
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'tasmanianDevil', // TODO: use actual secret
};

const generateJsonWebToken = (user) => {
    const payload = {id: user.id, email: user.email};
    const token = jwt.sign(payload, jwtOptions.secretOrKey, {expiresIn: '21h'});
    return `Bearer ${token}`;
};

module.exports = (passport) => {
    passport.use(
        'local-signup',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true,
                session: false,
            },
            (_req, email, password, done) => {
                connection.query(
                    'SELECT * FROM users WHERE email = ?',
                    [email],
                    (err, rows) => {
                        if (err) {
                            return done(err);
                        }
                        if (rows.length) {
                            return done(null, false, {message: 'That email is already used.'});
                        }

                        const newUser = {
                            email: email,
                            password: bcrypt.hashSync(password, null, null),
                        };

                        connection.query(
                            'INSERT INTO users (email, password) VALUES (?, ?)',
                            [newUser.email, newUser.password],
                            (_insertionErr, insertionRows) => {
                                newUser.id = insertionRows.insertId;
                                const token = generateJsonWebToken(newUser);
                                return done(null, newUser, {token: token});
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
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true,
                session: false,
            },
            (req, email, password, done) => {
                console.log(`Req: ${req}`);
                console.log(`E-Mail: ${email}`);
                console.log(`Password: ${password}`);
                connection.query(
                    'SELECT * FROM users WHERE email = ?',
                    [email],
                    (err, rows) => {
                        if (err) {
                            console.error(`MySQL error: ${err}`);
                            return done(err);
                        }

                        if (!rows.length) {
                            console.warn(`No such user: ${email}`);
                            return done(null, false, {message: 'No user found.'});
                        }

                        const user = rows[0];

                        if (!bcrypt.compareSync(password, rows[0].password)) {
                            console.warn(`Wrong password provided for user: ${email}`);
                            return done(null, false, {message: 'Oops! Wrong password.'});
                        }

                        const token = generateJsonWebToken(user);
                        return done(null, user, {token: token});
                    },
                );
            },
        ),
    );

    passport.use(
        'jwt-auth',
        new JwtStrategy(jwtOptions, (jwtPayload, done) => {
            connection.query(
                'SELECT * FROM users WHERE id = ? AND email = ?',
                [jwtPayload.id, jwtPayload.email],
                (err, rows) => {
                    if (err) {
                        console.error(`MySQL error: ${err}`);
                        return done(err);
                    }
                    if (!rows.length) {
                        console.warn(`No such user: id:${jwtPayload.id}, email:${jwtPayload.email}`);
                        return done(null, false, {message: 'No such user found.'});
                    }

                    const user = rows[0];

                    return done(null, user, {});
                },
            );
        }),
    );

    passport.jwtAuth = passport.authenticate('jwt-auth', {session: false});
};

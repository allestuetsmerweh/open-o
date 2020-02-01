'use strict';

let dbm;
let type;
let _seed;

exports.setup = (options, seedLink) => {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    _seed = seedLink;
};

exports.up = (db) => (
    db.createTable('users', {
        id: {type: type.INTEGER, primaryKey: true, autoIncrement: true},
        email: type.STRING,
        password: type.STRING,
        person_id: type.INTEGER,
    })
        .then(() => (
            db.createTable('events', {
                id: {type: type.INTEGER, primaryKey: true, autoIncrement: true},
                name: type.STRING,
                starts_at: type.DATETIME,
                ends_at: type.DATETIME,
            })
        ))
        .then(() => (
            db.createTable('people', {
                id: {type: type.INTEGER, primaryKey: true, autoIncrement: true},
                siCardNumber: type.BIGINT,
                firstName: type.STRING,
                lastName: type.STRING,
                gender: {type: type.STRING, length: 1},
                birthday: type.DATE,
                club: type.STRING,
                email: type.STRING,
                phone: type.STRING,
                street: type.STRING,
                city: type.STRING,
                zip: {type: type.STRING, length: 16},
                country: {type: type.STRING, length: 3},
            })
        ))
);

exports.down = (db) => (
    db.dropTable('users')
        .then(() => (
            db.dropTable('events')
        ))
        .then(() => (
            db.dropTable('people')
        ))
);

exports._meta = {
    version: 1,
};

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
    })
        .then(() => (
            db.createTable('events', {
                id: {type: type.INTEGER, primaryKey: true, autoIncrement: true},
                name: type.STRING,
            })
        ))
);

exports.down = (db) => (
    db.dropTable('users')
        .then(() => (
            db.dropTable('events')
        ))
);

exports._meta = {
    version: 1,
};

'use strict';

const MongoClient = require('mongodb').MongoClient;

class Mongo {
    constructor() {
        this.connected = false;
    }

    connect(uri, options, next) {
        if (options instanceof Function) {
            next = options;
            options = {};
        }

        MongoClient.connect(uri, options, (err, database) => {
            if (err) return next(err);

            this.database = database;
            this.connected = true;

            return next();
        });
    }

    db() {
        return this.database;
    }

    close() {
        if (!(this.connected && this.database)) return;
        this.database.close();
    }
}

module.exports = new Mongo();

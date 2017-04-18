'use strict';

const MongoClient = require('mongodb').MongoClient;

class Mongo {
    constructor() {
        this.connected = false;
    }

    createAlertCollection(next){

      console.log('creating alert collection');
      this.database.createCollection('Alert', { capped: true, size: 1000000000, max: 1000000 }, (err, collection) => {
        if(err) return next(err);
        collection.insert({'removed':false, 'type' : 'PUSH', 'deviceId':'cU8xZTWDRwA:APA91bEbHey_DPDK4QrWUevJbJxWfwZL8HdxKOeyF1_wBWOMczsQwVgJetwLvHPahdHZEiOKpVVsMoN448aN9acUBsnFYC5ZVQtd9qNy5pXIq2QBx5LpGwdu8mitmcoIIzF5jKh6_gOy'});
        return next(null, collection);
      });

    }


    existsCollection(collectionName, next) {

      this.database.collection(collectionName, {strict:true}, (err, collection) => {
        if(err) return next(null, false);
        return next(null, true);
      });

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

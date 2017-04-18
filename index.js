'use strict';

const cfgManager = require('node-config-manager');

cfgManager.init({
    configDir: './config',
    env: process.env.NODE_ENV || 'development',
    camelCase: true
});

cfgManager
    .addConfig('mongo')
    .addConfig('firebase')
    .addConfig('api');

const cfgMongo = cfgManager.method.Mongo();
const cfgFirebase = cfgManager.method.Firebase();
const cfgApi = cfgManager.method.Api();

const mongo = require('./lib/mongo');
const AlertScanner = require('./lib/alert-scanner');
const notifier = require('./lib/notifier');

const express = require('express');
const app = express();


app.get('/', require('./lib/status')());
app.get('/status', require('./lib/status')());

cfgApi.port = process.env.PORT || cfgApi.port;

app.listen(cfgApi.port, () => {
    console.log(`Express server run on ${cfgApi.port}`);
});

notifier.init(cfgFirebase.cloudMessaging);

console.log(`< init.MongoDB > Connect to Mongo Database ${cfgMongo.uri}`);

mongo.connect(cfgMongo.uri, cfgMongo.options, (err) => {

    if (err) return callback(err);

    console.log('< init.MongoDB > Status: Connected');

    mongo.existsCollection('Alert', (err, exists) => {

              if(err) {
                console.log('< init.MongoDB > error while trying to test if Alert collection exists');
                return callback(err);
              }

              console.log('< init.MongoDB > Alert collection does exist ? '+exists);

              if(!exists) {
                console.log('< init.MongoDB > Alert collection does not exist');

                mongo.createAlertCollection((err, collection) => {

                  if(err) {
                    console.log('< init.MongoDB > error while trying to create Alert collection')
                    return callback(err);
                  }

                  AlertScanner.scan(cfgMongo.collection, {'removed':false, 'deviceId':{'$exists': true}});

                })
              } else AlertScanner.scan(cfgMongo.collection, {'removed':false, 'deviceId':{'$exists': true}});
    });

});

var CronJob = require('cron').CronJob;
const request = require('request');

var options = {
  url: cfgApi.uri+'/alertComputing',
  headers: {
      'Authorization': 'd28f0e47e200cb57685a2de56d18ce2b64b8a930429df604f9ebd0011929f815dba9fd2d3dff7c4835db7a6a7a9805bcf3e3baa82df1b9d465eb380ed5dc2713'
  }
};

function callback(err, res, body) {
  if (!err && res.statusCode == 200) {
    var info = JSON.parse(body);
    console.log("Send notification");
  }
}

new CronJob('* * * * *', () => {
  request.post(options, callback);
}, null, true, 'Europe/Luxembourg');

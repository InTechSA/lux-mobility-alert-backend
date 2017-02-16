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

notifier.init(cfgFirebase.cloudMessaging);

console.log(`< init.MongoDB > Connect to Mongo Database ${cfgMongo.uri}`);

mongo.connect(cfgMongo.uri, cfgMongo.options, (err) => {

    if (err) return callback(err);

    console.log('< init.MongoDB > Status: Connected');

    AlertScanner.scan(cfgMongo.collection, {'removed':false, 'deviceId':{'$exists': true}});
});

var CronJob = require('cron').CronJob;
const request = require('request');

var options = {
  url: cfgApi.uri+'/alertComputing',
  headers: {
      'Authorization': '9acc7830a4f74b3968c3e7cce75bd14cc6ddd6991832eae0bfaf119e4db6091f1ae0b9d1ca3481b4676cc81b3df62f929cc5315875f6fe195d2f259c85193891'
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

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

new CronJob('* * * * *', () => {
  post(cfgApi.uri+'/alertComputing');
}, null, true, 'Luxembourg');

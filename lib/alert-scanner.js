'use strict';

const Mongo = require('./mongo');
const Notifier = require('./notifier');


class AlertScanner {

  constructor(){

  }

  scan(collection, query){

    Mongo.database.collection(collection, (err, collection) => {
      if(err) console.log(err);
      // open a tailable cursor
      console.log(`< AlertScanner.scan > Open tailable cursor on collection ${collection.collectionName}`);

      collection
        .find(query, {tailable:true, awaitdata:true, numberOfRetries:-1})
        .each((err, doc) => {

          if(err) console.log('err : '+err);

          console.log(`< AlertScanner.scan > Got an alert !`);

          this._send(doc, (err) => {
            if(err) console.log(`< AlertScanner.scan > An error occurred (${err}) during alert (_id : ${doc._id}) sending !`);

            else {
              collection.update({'_id':doc._id},{'$set' : {'removed': true}}, function(err, res){

                if(err) console.log(`< AlertScanner.send > An error occured during alert (_id : ${doc._id}) removal !`);
                else console.log(`< AlertScanner.send > Alert has been Successfully removed from DB !`);

              });
            }
          });

      })

    });
  }

  _send(alert, next){
    if(alert.removed) return next('ADDRESS ALREADY REMOVED');
    switch(alert.type) {
      case 'PUSH':

        console.log(`< AlertScanner.send > Try to send push notification to device id : ${alert.deviceId} !`);

        Notifier.sendPersonalAlert(alert, function() {
          console.log(`< AlertScanner.send > Alert has been Successfully sent to Device : ${alert.deviceId} !`);
          return next();
        });

        break;

      default:
        console.log(`< AlertScanner.send > Unknown alert type (${alert.type}) of alert : ${alert.deviceId} !`);
        return next('UNKWNON TYPE ALERT');
    }
  }

}

module.exports = new AlertScanner();

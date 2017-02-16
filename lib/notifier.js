'use strict';

const FCM = require('fcm-push');

class Notifier {
    constructor() {
        this._init = false;
    }

    init(serverKey) {
        this._fcm = new FCM(serverKey);
        this._init = true;
    }

    _sendNotify(message, next) {
        if (!this._init) return next('Notifier is not initialized');

        this._fcm.send(message, (err, response) => {
            if (err) {
              console.log(err);
              return next(err);
            }

            console.log("< notifier._sendNotify > Successfully sent with response: ", response);

            return next();
        });
    }


    sendPersonalAlert(alert, next) {
        if (!alert.deviceId) return next();

        const fcmAlert = {
          to: alert.deviceId,
          collapse_key: 'new_personal_alert',
          notification: {
              title: alert.title,
              body: alert.content
          }
        }

        console.log(`< notifier.sendPersonalAlert > sending alert : ${JSON.stringify(fcmAlert)}`);

        this._sendNotify(fcmAlert, next);
    }
}

module.exports = new Notifier();

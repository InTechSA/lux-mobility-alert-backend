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
            if (err) return next(err);

            console.log("< notifier._sendNotify > Successfully sent with response: ", response);

            return next();
        });
    }


    sendPersonalAlert(fcmToken, next) {
        if (!fcmToken) return next();

        const alert = {
          to: fcmToken,
          collapse_key: 'new_personal_alert',
          notification: {
              title: 'Alert',
              body: 'Discover its contents now'
          }
        }

        console.log(`< notifier.sendPersonalAlert > sending alert : ${JSON.stringify(alert)}`);

        this._sendNotify(alert, next);
    }
}

module.exports = new Notifier();

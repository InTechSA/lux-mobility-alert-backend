'use strict';

module.exports = function () {
    const started = new Date();

    return (req, res) => {
        const upTime = (Date.now() - Number(started)) / 1000;

        return res.send({started, upTime});
    };
};
var Service;
var Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-abode", "Abode", AbodeAlarmAccessory);
};

function AbodeAlarmAccessory(log, config) {
    this.abode = require('abode-api').abode(config.abodeUsername, config.abodePassword);
    this.log = log;
    this.name = config.name;
}

AbodeAlarmAccessory.prototype.getAlarmStatus = function (callback) {
    this.abode.panel()
        .then(response => {
            if (response.data.mode.area_1) {
                let armed = response.data.mode.area_1 !== 'standby';

                return callback(null, armed);
            }

            return callback(null);
        })
        .catch(() => callback(null));
};

AbodeAlarmAccessory.prototype.setAlarmStatus = function (shouldArm, callback) {
    let operation;
    let status;

    if (shouldArm) {
        operation = this.abode.mode.away();
        status = Characteristic.LockCurrentState.SECURED;
    } else {
        operation = this.abode.mode.standby();
        status = Characteristic.LockCurrentState.UNSECURED;
    }

    return operation
        .then(() => {
            this.lockService.setCharacteristic(Characteristic.LockCurrentState, status);
            return callback(null);
         })
        .catch(() => callback(null));
};

AbodeAlarmAccessory.prototype.getServices = function () {
    let lockService = new Service.LockMechanism(this.name);

   lockService
        .getCharacteristic(Characteristic.LockTargetState)
        .on('get', this.getAlarmStatus.bind(this))
        .on('set', this.setAlarmStatus.bind(this));

   lockService
        .getCharacteristic(Characteristic.LockCurrentState)
        .on('get', this.setAlarmStatus.bind(this));

    return [lockService];
};

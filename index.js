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

    this.lockService = new Service.LockMechanism(this.name);

    this.lockService
        .getCharacteristic(Characteristic.LockTargetState)
        .on('get', this.getAlarmStatus.bind(this))
        .on('set', this.setAlarmStatus.bind(this));

    this.lockService
        .getCharacteristic(Characteristic.LockCurrentState)
        .on('get', this.getAlarmStatus.bind(this));
}

AbodeAlarmAccessory.prototype.getAlarmStatus = function (callback) {
    this.log(`${this.name}: Getting Alarm Status`);

    this.abode.panel()
        .then(response => {
            if (response.data.mode.area_1) {
                let status = response.data.mode.area_1 !== 'standby' ? Characteristic.LockCurrentState.SECURED : Characteristic.LockCurrentState.UNSECURED;

                this.log(`${this.name}: Status is ${status ? 'SECURED' : 'UNSECURED'}`);

                return callback(null, status);
            }

            return callback(null);
        })
        .catch(err => {
            this.log(`${this.name}: ERROR GETTING STATUS ${err}`);
            return callback(null);
        });
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

    this.log(`${this.name}: Setting status status to ${status}`);

    return operation
        .then(() => {
            this.lockservice.setCharacteristic(Characteristic.LockCurrentState, status);
            this.log(`${this.name}: Set status to ${status}`);
            return callback(null);
         })
        .catch(err => {
            this.log(`${this.name}: ERROR SETTING STATUS ${err}`);
            return callback(null);
        });
};

AbodeAlarmAccessory.prototype.getServices = function () {
    this.log(`${this.name}: Getting Services`);
    return [this.lockService];
};

var Service;
var Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-abode", "Abode", FakeBulbAccessory);
};

function FakeBulbAccessory(log, config) {
    this.abode = require('abode-api').abode(this.config.abodeUsername, this.config.abodePassword);
    this.log = log;
    this.name = config.name;
    this.bulbName = config.bulb_name || this.name; // fallback to "name" if you didn't specify an exact "bulb_name"
    this.binaryState = 0; // bulb state, default is OFF
    this.log("WUBA: Starting a fake bulb device with name '" + this.bulbName + "'...");
    //  this.search();
}

FakeBulbAccessory.prototype.getPowerOn = function (callback) {
    this.abode.panel()
        .then(response => {
            if (response.data.mode.area_1) {
                let standbyOff = response.data.area_1 !== 'standby';

                this.log('Alarm Status: ' + response.data.area_1);

                return callback(null, standbyOff);
            }

            return callback(null);
        })
        .catch(() => callback(null));
};

FakeBulbAccessory.prototype.setPowerOn = function (powerOn, callback) {
    let operation;

    if (powerOn) {
        this.log('Setting alarm to away');
        operation = this.abode.mode.away();
    } else {
        this.log('Setting alarm to standby');
        operation = this.mode.standby();
    }

    return operation
        .then(() => callback(null))
        .catch(() => callback(null));
};

FakeBulbAccessory.prototype.getServices = function () {
    var lightbulbService = new Service.Lightbulb(this.name);

    lightbulbService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getPowerOn.bind(this))
        .on('set', this.setPowerOn.bind(this));

    return [lightbulbService];
};

'use strict';

var Service;
var Characteristic;

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory('homebridge-abode', 'AbodeCommand', AbodeCommandAccessory);
};

function AbodeCommandAccessory(log, config) {
	this.log = log;
	this.name = config.name;
}

AbodeCommandAccessory.prototype.setState = function (isClosed, callback) {
	if (!isClosed) {
		this.alarmService.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
		this.open = true;
	} else {
		this.alarmService.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
		this.open = false;
	}

	callback(null);
};

AbodeCommandAccessory.prototype.getState = function (callback) {
	callback(null, this.open ? Characteristic.CurrentDoorState.OPEN : Characteristic.CurrentDoorState.CLOSED);
};

AbodeCommandAccessory.prototype.getServices = function () {
	this.alarmService = new Service.LockMechanism(this.name);

	this.alarmService.getCharacteristic(Characteristic.TargetDoorState)
		.on('set', this.setState.bind(this))
		.on('get', this.getState.bind(this));

	this.alarmService.getCharacteristic(Characteristic.CurrentDoorState)
		.on('get', this.getState.bind(this));

	return [this.alarmService];
};

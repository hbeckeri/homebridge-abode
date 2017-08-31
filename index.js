'use strict';

var Service;
var Characteristic;

function AbodeCommandAccessory(log, config) {
	this.log = log;
	this.name = config.name;
	this.open = true;
}

AbodeCommandAccessory.prototype.setState = function (isClosed, callback) {
	this.log('Hello World');
	if (this.open) {
		this.alarmService.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
		this.open = true;
	} else {
		this.alarmService.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
		this.open = false;
	}

	callback(null);
};

AbodeCommandAccessory.prototype.getState = function (callback) {
	callback(null, Characteristic.CurrentDoorState.open);
};

AbodeCommandAccessory.prototype.getServices = function () {
	this.informationService = new Service.AccessoryInformation();
	this.alarmService = new Service.LockMechanism(this.name);

	this.informationService
	.setCharacteristic(Characteristic.Manufacturer, 'Abode Command')
	.setCharacteristic(Characteristic.Model, 'Homebridge Plugin')
	.setCharacteristic(Characteristic.SerialNumber, '001');

	this.alarmService.getCharacteristic(Characteristic.TargetDoorState)
		.on('set', this.setState.bind(this));

	if (this.stateCommand) {
		this.alarmService.getCharacteristic(Characteristic.CurrentDoorState)
			.on('get', this.getState.bind(this));
		this.alarmService.getCharacteristic(Characteristic.TargetDoorState)
			.on('get', this.getState.bind(this));
	}

	return [this.informationService, this.garageDoorService];
};

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory('homebridge-abode', 'AbodeCommand', AbodeCommandAccessory);
};

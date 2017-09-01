/* 'use strict';

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
*/

var Service;
var Characteristic;

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-abode", "Abode", FakeBulbAccessory);
};

function FakeBulbAccessory(log, config) {
	this.log = log;
	this.name = config.name;
	this.bulbName = config.bulb_name || this.name; // fallback to "name" if you didn't specify an exact "bulb_name"
	this.binaryState = 0; // bulb state, default is OFF
	this.log("Starting a fake bulb device with name '" + this.bulbName + "'...");
	//  this.search();
}

FakeBulbAccessory.prototype.getPowerOn = function (callback) {
	var powerOn = this.binaryState > 0;
	this.log("Power state for the '%s' is %s", this.bulbName, this.binaryState);
	callback(null, powerOn);
};

FakeBulbAccessory.prototype.setPowerOn = function (powerOn, callback) {
	this.binaryState = powerOn ? 1 : 0; // wemo langauge
	this.log("Set power state on the '%s' to %s", this.bulbName, this.binaryState);
	callback(null);
};

FakeBulbAccessory.prototype.getServices = function () {
	var lightbulbService = new Service.Lightbulb(this.name);

	lightbulbService
		.getCharacteristic(Characteristic.On)
		.on('get', this.getPowerOn.bind(this))
		.on('set', this.setPowerOn.bind(this));

	return [lightbulbService];
};



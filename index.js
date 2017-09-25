var Service;
var Characteristic;

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-abode", "Abode", AbodeAlarmAccessory);
};

function AbodeAlarmAccessory(log, config) {
	this.abode = require('abode-api').abode(config.abode.username, config.abode.password);
	this.log = log;
	this.name = config.name;

	this.lockService = new Service.SecuritySystem(this.name);

	this.lockService
		.getCharacteristic(Characteristic.SecuritySystemTargetState)
		.on('get', this.getAlarmStatus.bind(this))
		.on('set', this.setAlarmStatus.bind(this));

	this.lockService
		.getCharacteristic(Characteristic.SecuritySystemCurrentState)
		.on('get', this.getAlarmStatus.bind(this));
}

AbodeAlarmAccessory.prototype.getAlarmStatus = function (callback) {
	this.log(`${this.name}: Getting Alarm Status`);

	this.abode.panel()
		.then(response => {
			if (response.data.mode.area_1) {
				let status = '';

				switch (response.data.mode.area_1) {
					case 'standby':
						status = Characteristic.SecuritySystemCurrentState.DISARMED;
						break;
					case 'home':
						status = Characteristic.SecuritySystemCurrentState.HOME_ARM;
						break;
					case 'away':
						status = Characteristic.SecuritySystemCurrentState.AWAY_ARM;
						break;
				}

				this.log(`${this.name}: Status is ${status}`);

				this.lockService.setCharacteristic(Characteristic.SecuritySystemCurrentState, status);
				return callback(null, status);
			}

			return callback(null);
		})
		.catch(err => {
			this.log(`${this.name}: ERROR GETTING STATUS ${err}`);
			return callback(null);
		});
};

AbodeAlarmAccessory.prototype.setAlarmStatus = function (state, callback) {
	let operation;
	let status;

	switch (state) {
		case Characteristic.SecuritySystemTargetState.STAY_ARM:
			operation = this.abode.mode.home();
			break;
		case Characteristic.SecuritySystemTargetState.AWAY_ARM :
			operation = this.abode.mode.away();
			break;
		case Characteristic.SecuritySystemTargetState.NIGHT_ARM:
			operation = this.abode.mode.home();
			break;
		case Characteristic.SecuritySystemTargetState.DISARM:
			operation = this.abode.mode.standby();
			break;
	}

	this.log(`${this.name}: Setting status status to ${state}`);

	return operation
		.then(() => {
			this.lockservice.setCharacteristic(Characteristic.SecuritySystemCurrentState, state);
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

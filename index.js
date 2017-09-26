var Service, Characteristic;
var request = require('request');


module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-sonoff-tasmota-http-led", "SonoffTasmotaHTTPLED", SonoffTasmotaHTTPLEDAccessory);
}

function SonoffTasmotaHTTPLEDAccessory(log, config) {
  this.log = log;
  this.config = config;
  this.name = config["name"]
  this.hostname = config["hostname"] || "sonoff";

  var informationService = new Service.AccessoryInformation();
  informationService
    .setCharacteristic(Characteristic.Manufacturer, 'Sonoff Tasmota')
    .setCharacteristic(Characteristic.Model, 'homebridge-sonoff-tasmota-http-led')
    .setCharacteristic(Characteristic.SerialNumber, 'HTTP Serial Number')

  this.service = new Service.Lightbulb(this.name);
  this.service
    .getCharacteristic(Characteristic.On)
    .on('get', this.getState.bind(this))
    .on('set', this.setState.bind(this));
  this.service     
    .addCharacteristic(new Characteristic.Brightness())
    .on('get', this.getBrightness.bind(this))
    .on('set', this.setBrightness.bind(this))
  this.service
    .addCharacteristic(new Characteristic.ColorTemperature())
    .on('get', this.getColorTemperature.bind(this))
    .on('set', this.setColorTemperature.bind(this))

  this.log("Sonoff Tasmota HTTP LED Initialized")
}

SonoffTasmotaHTTPLEDAccessory.prototype.getState = function(callback) {
  var that = this
  request("http://" + this.hostname + "/cm?cmnd=Power", function(error, response, body) {
    if (error) return callback(error);
  	var lines = body.split("\n");
  	that.log("Sonoff LED: " + that.hostname + " Get State: " + lines[1]);
  	if (lines[1] == "POWER = OFF") callback(null, 0)
  	else if (lines[1] == "POWER = ON") callback(null, 1)
  })
}

SonoffTasmotaHTTPLEDAccessory.prototype.setState = function(toggle, callback) {
  var newstate = "%20Off"
  if (toggle) newstate = "%20On"
  var that = this
  request("http://" + this.hostname + "/cm?cmnd=Power" + newstate, function(error, response, body) {
    if (error) return callback(error);
  	var lines = body.split("\n");
  	that.log("Sonoff LED: " + that.hostname + " Set State to: " + lines[1]);
  	if (lines[1] == "POWER = OFF") callback()
  	else if (lines[1] == "POWER = ON") callback()
  })
}

SonoffTasmotaHTTPLEDAccessory.prototype.getBrightness = function(callback) {
  var that = this
  request("http://" + this.hostname + "/cm?cmnd=Dimmer", function(error, response, body) {
    if (error) return callback(error);
  	var lines = body.split("=");
  	var jsonreply = JSON.parse(lines[1])
  	that.log("Sonoff LED: " + that.hostname + " Get Brightness: " + jsonreply.Dimmer);
  	callback(null, jsonreply.Dimmer)
  })
}

SonoffTasmotaHTTPLEDAccessory.prototype.setBrightness = function(brightness, callback) {
  var that = this
  request("http://" + this.hostname + "/cm?cmnd=Dimmer%20" + brightness, function(error, response, body) {
    if (error) return callback(error);
  	var lines = body.split("=");
  	var jsonreply = JSON.parse(lines[1])
  	that.log("Sonoff LED: " + that.hostname + " Set Brightness to: " + jsonreply.Dimmer);
  	if (jsonreply.Dimmer == brightness) callback()
  	else { 
  	  that.log("Sonoff LED: " + that.hostname + " ERROR Setting Brightness to: " + brightness) 
  	  callback()
  	}
  })
}

SonoffTasmotaHTTPLEDAccessory.prototype.getColorTemperature = function(callback) {
  var that = this
  request("http://" + this.hostname + "/cm?cmnd=CT", function(error, response, body) {
    if (error) return callback(error);
  	var lines = body.split("=");
  	var jsonreply = JSON.parse(lines[1])
  	that.log("Sonoff LED: " + that.hostname + " Get Color Temperature: " + jsonreply.CT);
  	callback(null, jsonreply.CT)
  })
}

SonoffTasmotaHTTPLEDAccessory.prototype.setColorTemperature = function(CT, callback) {
  var that = this
  if (CT < 153) CT = 153
  if (CT > 499) CT = 499
  request("http://" + this.hostname + "/cm?cmnd=CT%20" + CT, function(error, response, body) {
    if (error) return callback(error);
    that.service.setCharacteristic(Characteristic.On, 1)
  	var lines = body.split("=");
  	var jsonreply = JSON.parse(lines[1])
  	that.log("Sonoff LED: " + that.hostname + " Set Color Temperature to: " + CT);
  	if (jsonreply.Color != undefined) callback()
  	else { 
  	  that.log("Sonoff LED: " + that.hostname + " ERROR Setting Color Temperature to: " + CT) 
  	  callback()
  	}
  })
}

SonoffTasmotaHTTPLEDAccessory.prototype.getServices = function() {
  return [this.service];
}

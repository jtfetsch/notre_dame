var Coral = require('../coral');
var redis = require('then-redis');
var _ = require('underscore');
var util = require('util');

var pollTimeout, pollInterval = 10000;
var inMemoryStore = null;
var redisClient = redis.createClient({
	host: process.env.IP,
	port: parseInt(process.env.REDIS_PORT),
	password: process.env.REDIS_PASSWORD
});

var initialize = function () {
	Coral.findAllEquipment().then(function (equipment) {
		inMemoryStore = equipment;
	}).fail(function (err) {
		console.log(err);
	});
};

var update = function () {
	Coral.findAllEquipment().then(function (equipment) {
		redisClient.publish('equipment-monitor-updates', JSON.stringify(equipment));
	}).fail(function (err) {
		console.log(err);
	});
};

var poll = function () {

  Coral.findAllEquipment().then(function(currEquipment) {

    var oldEquipment = inMemoryStore;

    var oldItem;

    //go through the new equipment
    _.each(currEquipment, function(item) {

      //find previous state of equipment
      oldItem = _.findWhere(oldEquipment, {name: item.name});

      //result found
      if(oldItem !== undefined) {
        //if enabled, problems, or shutdowns states changed
        if(oldItem.running != item.running || oldItem.problems != item.problems || oldItem.shutdowns != item.shutdowns) {

          redisClient.publish('equipment-monitor-events', JSON.stringify({
            timestamp: new Date(),
            user: ((item.badge === undefined) ? null : item.badge),
            name: item.name,
            running: item.running,
            problems: item.problems,
            shutdowns: item.shutdowns
          }));
        }
      }
    });

    //put most recent coral data into memory
    inMemoryStore = currEquipment;

  }).fail(function (err) {
    console.log('Coral connection error: ' + err);
  });
};

redisClient.connect().then(function () {
	update();
	initialize();
	pollTimeout = setInterval(poll, pollInterval);
}, function (err) {
	console.log('equipment-monitor: ' + err);
});

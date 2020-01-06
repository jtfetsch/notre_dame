// LIBRARIES -------------------------------------------------------------------

var express = require('express');
var http = require('http');
var redis = require('then-redis');
var socketio = require('socket.io');
var _ = require('underscore');
var mongoose = require('mongoose');
var util = require('util');
var fs = require('fs');

// INSTANCE VARIABLES ----------------------------------------------------------

// The app instance, handles http requests and so on
var app = express();

// The http server, handled by the app instance
var server = http.createServer(app);

// The socket.io instance, listens on the server socket
var io = socketio.listen(server);

// The redisClient, listens for events on the various redis channels
var redisClient = redis.createClient({
	host: process.env.IP,
	port: parseInt(process.env.REDIS_PORT),
	password: process.env.REDIS_PASSWORD
});

// An array of channels for redis to listen to
var redisChannels = [
	'users-monitor-events',
	'users-monitor-updates',
	'equipment-monitor-events',
	'equipment-monitor-updates'
];

// Custom route handler for push methods, see configuration/routes.js
app._pushers = {};
app.push = function (channel, callback) {
	app._pushers[channel] || (app._pushers[channel] = []);
	app._pushers[channel].push(callback);
};


// CONFIGURATION ---------------------------------------------------------------

// Reduce verbosity for socket.io
io.set('log level', 1);

// Use ejs to build view responses because it has pure HTML syntax
app.engine('html', require('ejs').__express);

// Default configuration
app.configure(function () {
	// The directory of the view html files
	app.set('views', __dirname + '/application/views');

	// The view engine to handle '.html' files
	app.set('view engine', 'html');

	// Middleware to add 'body' object to request object on POST and PUT requests
	app.use(express.bodyParser());
});

// Configuration values for database
var dbConfig = require('./configuration/database');

// Require in model files synchronously because this MUST be done before routes
var models_path = __dirname + '/application/models';
fs.readdirSync(models_path).forEach(function (file) {
	if(~file.indexOf('.js')) require(models_path + '/' + file);
});

// Configures app to map our routes to controller methods
require('./configuration/routes')(app);

// STARTUP ---------------------------------------------------------------------

// Handle socket.io connections and avoid repeated handler registration
// -- _sockets contains all the socket.io connection objects and can be looped
//    or searched to broadcast data to all or some clients
// -- Adds an incoming connection to the _sockets array
// -- When a connection is finished, pluck it from the array
var _sockets = [];
io.sockets.on('connection', function (socket) {
	console.info('Monitoring Services: client with id ' + socket.id + ' connected.');
	_sockets.push(socket);
	socket.on('disconnect', function () {
		_sockets = _.reject(_sockets, function (item) {
			return item.id === socket.id;
		});
	});
});

// Connect mongoose to mongoDB using the config values in dbConfig
mongoose.connect('mongodb://' + dbConfig.host + '/' + dbConfig.dbname);

// Connect to the redis server
redisClient.connect().then(function () {

	// then subscribe to the redis channels
	redisClient.subscribe.apply(redisClient, redisChannels).then(function () {

		// then start accepting messages
		redisClient.on('message', function (channel, data) {

			// convert data from JSON string
			data = JSON.parse(data);

			// broadcast data to the socket.io connection pool
			_.each(_sockets, function (socket) {
				socket.emit(channel, data);
			});

			// broadcast data to any routes registered with app.push
			if(_.has(app._pushers, channel)) {
				_.each(app._pushers[channel], function (pusher) {
					pusher(data);
				});
			}

			// log info
			if(channel === 'users-monitor-events') {
				console.info('[' + data.timestamp + '] Users Monitor Service: user with badge number ' + data.user + ' ' + (data.entering ? 'entering' : 'leaving')  + ' the cleanroom.');
			}
			else if (channel === 'equipment-monitor-events') {
				console.info('[' + data.timestamp + '] Equipment Monitor Service: device with name ' + data.name + ' was turned ' + (data.running ? 'on' : 'off') + ' by user with badge number ' + data.badge + '.');
			}
			else {
				console.info('[' + (new Date()) + '] Unknown event type: ' + channel);
			}
		});
	});
});

// Start listening
server.listen(process.env.NODE_PORT);

// LIBRARIES -------------------------------------------------------------------

var Imap = require('imap');
var inspect = require('util').inspect;
var redis = require('then-redis');
var _ = require('underscore');
var Coral = require('../coral');


// INITIALIZATION --------------------------------------------------------------

var imap = new Imap({
	user: 'cro',
	password: 'c1899RO',
	host: 'mail.esc.nd.edu',
	tls: 'true',
	port: 993,
	tlsOptions: {
		rejectUnauthorized: false,
		secureProtocol: 'SSLv3_method'
	}
});

var redisClient = redis.createClient({
	host: process.env.IP,
	port: parseInt(process.env.REDIS_PORT),
	password: process.env.REDIS_PASSWORD
});

var fields = {
	HEADER_DATE: 'HEADER.FIELDS (DATE)',
	HEADER_SUBJECT: 'HEADER.FIELDS (SUBJECT)',
	TEXT: 'TEXT'
};

var subjectPattern = /Subject: Stinson Remick (Leaving|Entering) Gown Room/;
var directionPattern = 'Leaving';
var leadingTextPattern = /Access Granted Gown Room (Outside|Inside) Reader (Entering|Leaving) the SR Gown Room/;
var dateTimePattern = /\d+:\d+:\d+ (AM|PM) \d+\/\d+\/\d+/;
var idPattern = 'ID # ';

// PARSE -----------------------------------------------------------------------

imap.once('ready', function () {

	imap.openBox('INBOX', true, function (err, box) {
		if(err) throw err;

    //when the inbox receives new mail
		imap.on('mail', function (numNewMessages) {
      //string for fetching the most recent email from the inbox
			var source = (box.messages.total - numNewMessages + 1) + ':*';

      //creates fetch request for date, subject, and text from most recent email
			var fetchRequest = imap.fetch(source, {
				bodies: _.values(fields)
			});

      //when the email is retrieved
			fetchRequest.on('message', function (message, sequenceNumber) {

				var isUserEvent = false;
				var userEventData = {};

				message.on('body', function (stream, info) {
					var buffer = '';

          //stores message body contents in buffer
					stream.on('data', function (block) {
						buffer += block.toString('utf8');
					});

					stream.once('end', function () {
						buffer = buffer.trim();

            //parsing header to get user's direction (entering or leaving cleanroom)
						if(info.which === fields.HEADER_SUBJECT) {
							isUserEvent = subjectPattern.test(buffer);

							if(isUserEvent) {
								userEventData['entering'] = buffer.indexOf(directionPattern) === -1;
							}
						}

            //parsing text to get the timestamp of event and the user's badge number
						else if(info.which === fields.TEXT) {
							buffer.replace(leadingTextPattern, '');

							var timestamp = dateTimePattern.exec(buffer);

							buffer.replace(dateTimePattern, '');

							var bufferSplit = buffer.split(idPattern);

							if(bufferSplit.length !== 2 || timestamp === null || !timestamp.length) return;

							userEventData['user'] = parseInt(bufferSplit[1]);

							userEventData['timestamp'] = new Date(timestamp[0]);
						}
					});
				});

				message.once('end', function () {
					if(isUserEvent) {
						redisClient.publish('users-monitor-events', JSON.stringify(userEventData));
					}
				});
			});
		});
	});
});

imap.on('error', function (err) {
	console.log('users-monitor: ' + err);
});

// RUN -------------------------------------------------------------------------

redisClient.connect().then(function () {
	Coral.findAllUsers().then(function (data) {
		redisClient.publish('users-monitor-updates', JSON.stringify(data));
	});
	imap.connect();
});

var Coral = require('../../../coral')
, EquipmentEventModel = require('mongoose').model('LocalEquipmentEvent')
, EquipmentModel = require('mongoose').model('LocalEquipment')
, _ = require('underscore');

var equipmentController = {

    list: function (request, response) {
        if(request.query.isRunning === '1') {
            Coral.findCurrentlyUsedEquipment().then(function (equipment) {
                response.json(equipment);
            });
        }

        else {
            Coral.findAllEquipment().then(function (equipment) {
                response.json(equipment);
            });
        }
    },

    // Give this function some piece of equipment's name, return
    // total hours used in the past week.
    readHoursUsedByEquipmentName: function (request, response) {
        var eqname = request.params.name;

        // If no name provided, send 'not found' response.
        if (_.isNull(eqname)) response.send(404);

        // Set the date threshold for one week ago.
        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(new Date().getDate() - 7);

        // Get all events for this piece of equipment in the last week.
        EquipmentEventModel.find().where('name').equals(eqname)
                                  .where('timestamp').gt(oneWeekAgo)
                                  .sort('timestamp').exec(function(err, equipment) {
            if (err) return response.send(500);

            var count = 0;
  
            // Add up all the hours for each event.
            // Find most recent false event, add time between it and most recent true event.
            // Keep doing this for each pair. If you find a false event and no corresponding true event, disregard.
            var startTimestamp;
            var endTimestamp;
            var oneEventDuration;
            var totalDuration = 0;
            var eventInProgress = false;

            console.log(equipment);

            _.each(equipment, function (event) {

               if (event.running == false && eventInProgress == false)
               {
                   endTimestamp = event.timestamp;
                   eventInProgress = true;
               }

               if (event.running == true && eventInProgress == true)
               {
                    startTimestamp = event.timestamp;
                    oneEventDuration = startTimestamp - endTimestamp;
                    totalDuration += oneEventDuration;
                    eventInProgress = false;
               }
            });

            // Convert from milliseconds to seconds.
            totalDuration = totalDuration / 1000;

            // Converts from seconds to hours.
            totalDuration = totalDuration / 3600;

            response.json({
              hours: totalDuration
            });
        });
    },

    // Give this function some piece of equipment's name, return
    // all events in the past week. 
    readEventsByEquipmentName: function (request, response) {
        var eqname = request.params.name;

        // If no name provided, send 'not found' response.
        if (_.isNull(eqname)) response.send(404);

        // Set the date threshold for one week ago.
        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(new Date().getDate() - 7);

        // Get all events for this piece of equipment in the last week.
        EquipmentEventModel.find().where('name').equals(eqname)
                                  .where('timestamp').gt(oneWeekAgo)
                                  .sort('timestamp').exec(function(err, equipment) {
            if (err) return response.send(500);
            response.json(equipment);
        });
    },

    // Get all events in the last week.
    readEvents: function(request, response) {
        // Set the date threshold for one week ago.
        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(new Date().getDate() - 7);

        // Get all events for this piece of equipment in the last week.
        EquipmentEventModel.find().where('timestamp').gt(oneWeekAgo)
                                  .sort('timestamp').exec(function(err, equipment) {
            if (err) return response.send(500);
            response.json(equipment);
        });
    },

    // saving a new event to the database
    pushEvent: function (eventData) {
        var newEquipmentEvent = new EquipmentEventModel(eventData);
        newEquipmentEvent.save(function (err) {
            if (err) console.log(err);
        });
    },

    pushUpdate: function (equipmentList) {
        EquipmentModel.remove({}, function (err) {
            if(err) return console.log(err);
            EquipmentModel.create(equipmentList, function (err) {
                if(err) return console.log(err);
            });
        });
    }
};

module.exports = equipmentController;

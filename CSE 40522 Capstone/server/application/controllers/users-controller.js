// IMPORTS ---------------------------------------------------------------------

var Coral = require('../../../coral')
, UserModel = require('mongoose').model('LocalUser')
, UserEventModel = require('mongoose').model('LocalUserEvent')
, EquipmentEventModel = require('mongoose').model('LocalEquipmentEvent')
, _ = require('underscore')
, util = require('util');

// CONTROLLER METHODS ----------------------------------------------------------

var usersController = {

  list: function (request, response) {

    var query = UserModel.find().select('-__v');

    if(request.query.isInRoom === '1') {
      query.where('isInRoom').equals(true);
    }

    query.exec(function (err, users) {
      if(err) return response.send(500);
      response.json(users);
      //response.json({ isInRoom: request.query.isInRoom, data: users });
    });
  },

  // returns all users that are in the cleanroom
  listInRoom: function(request, response) {
    UserModel.find().where('isInRoom').equals(true).select('-__v').exec(function( err, users) {
      if(err) return response.send(500);
      response.json(users);
    });
  },

  readUserByBadgeNumber: function (request, response) {
    var uidString = request.params.user;
    var uid = parseInt(uidString);
    if( isNaN(uid) ) return response.send(404);

    UserModel.find({ badge: uid }).select('-__v').exec(function (err, user) {
      if(err) response.send(500);
      else if(user === null) response.send(404);
      else response.json(user);
    });
  },

  readUserEventsByBadgeNumber: function (request, response) {
    var uidString = request.params.user;
    var uid = parseInt(uidString);
    var days = 7;
    if( isNaN(uid) ) return response.send(404);
    days = parseInt(request.query.days);
    if( isNaN(days) )
    {
      days = 7;
    }
    
    // query user events where user = uid
    //query events by badge number, sort by date and limit by date < days specified in query string
    //if the date specified is null or not a number then the default number of 7 days will be used

    // new Date() is always today
    var oneWeekAgo = new Date();
    oneWeekAgo.setDate(new Date().getDate() - days);

    var userEventsQuery = UserEventModel.find()
                              .where('user').equals(uid)
                              .where('timestamp').gt(oneWeekAgo)
                              .sort('timestamp');

    userEventsQuery.exec(function(err, events){

      if(err) return response.send(500);
      response.json(events);
    });

  },

  readEquipmentEventsByBadgeNumber: function (request, response) {
    var uidString = request.params.user;
    var uid = parseInt(uidString);
    var days = 7;
    if( isNaN(uid) ) return response.send(404);
    days = parseInt(request.query.days);
    if( isNaN(days) )
    {
      days = 7;
    }
    
    // query user events where user = uid
    // query equipment events where user = uid
    // return results of both queries?
    //query events by badge number, sort by date and limit by date < days specified in query string
    //if the date specified is null or not a number then the default number of 7 days will be used

    // new Date() is always today
    var oneWeekAgo = new Date();
    oneWeekAgo.setDate(new Date().getDate() - days);

    var equipEventsQuery = EquipmentEventModel.find()
                                      .where('user').equals(uid)
                                      .where('timestamp').gt(oneWeekAgo)
                                      .sort('timestamp');

    equipEventsQuery.exec(function(err2, equipEvents){
    if(err2) return response.send(500);
        response.json(equipEvents);
    });


  },  

  readHoursWorkedByBadgeNumber: function(request, response) {
    var uidString = request.params.user;
    var uid = parseInt(uidString);
    var days = 7;
    if( isNaN(uid) ) return response.send(404);
    days = parseInt(request.query.days);
    if ( isNaN(days) )
    {
      days = 7;
    }

    //query events by badge number, sort by date and limit by date < days specified in query string
    //if the date specified is null or not a number then the default number of 7 days will be used
    //iterate through the results, SHOULD start with an 'entering' event, store date in var
    //next should be 'leaving', get hour difference between stored and leaving, add to counter

    // new Date() is always today
    var oneWeekAgo = new Date();
    oneWeekAgo.setDate(new Date().getDate() - days);

    var query = UserEventModel.find()
                              .where('user').equals(uid)
                              .where('timestamp').gt(oneWeekAgo)
                              .sort('timestamp');

    query.exec(function(err, events) {
      if(err) return response.send(500);

      var count = 0;
      var startTimestamp;
      var endTimestamp;
      var eventInProgress = 0;
      

      _.each(events, function (event) {
        // Do the summation in here
        // _.each iterates the array in order
        if(event.entering == 1)
        {
          startTimestamp = event.timestamp;
          eventInProgress = 1;
        }
        else
        {
          endTimestamp = event.timestamp;
          if (eventInProgress == 1)
          {
            eventInProgress = 0;
            var timeSpent = endTimestamp - startTimestamp;
            timeSpent = timeSpent/1000; //convert to seconds
            timeSpent = timeSpent/3600; //convert to hours
            count += timeSpent;
          }
        }
      });

      response.json({
        hours: count
      });
    });
  },

  readMostUsedEquipByBadgeNumber: function(request, response) {

    //query events by badge number, sort by date and limit by date < days specified in query string
    //if the date specified is null or not a number then the default number of 7 days will be used

    var uidString = request.params.user;
    var uid = parseInt(uidString);
    var days = 7;
    if( isNaN(uid) ) return response.send(404);
    days = parseInt(request.query.days);
    if( isNaN(days) )
    {
      days = 7;
    }

    // new Date() is always today
    var oneWeekAgo = new Date();
    oneWeekAgo.setDate(new Date().getDate() - days);


    //Get all equipment events in the last week
    var query = EquipmentEventModel.find()
                                   .where('user').equals(uid)
                                   .where('timestamp').gt(oneWeekAgo);

    query.exec(function(err, events) {
      if(err) return response.send(500);

      var equipNames = [];

      _.each(events, function (event) {
         equipNames.push(event.name);
      });      

      //Algorithm below taken from
      //http://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array

      if(equipNames.length == 0)
      {
        return response.json({
          mostUsedEquipment: "No Equipment Information Available"
        });
      }

      var modeMap = {};
      var maxEl = equipNames[0], maxCount = 1;
      for(var i = 0; i < equipNames.length; i++)
      {
        var el = equipNames[i];
        if(modeMap[el] == null)
          modeMap[el] = 1;
        else
          modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
          maxEl = el;
          maxCount = modeMap[el];
        }
      }

      return response.json({
        mostUsedEquipment: maxEl
      });
    });
  },

  pushUpdate: function(data) {

    // Drop all existing user data
    UserModel.remove({}, function (err) {

      // Refill the collection with the new user data transported by the push
      UserModel.create(data, function (err) {
        if(err) return console.log(err);

        // UserModel.create applies all the newly created models as arguments after err
        var userModels = Array.prototype.slice.call(arguments, 1);

        // Iterate every model
        _.each(userModels, function (userModel) {

          // Find all associated event models, sorted by recency
          UserEventModel.find({ user: userModel.badge })
                        .sort('-timestamp')
                        .exec(function (err, eventModels) {
            if(err) return console.log(err);

            // If there are any events for the user
            if(eventModels.length) {

              // Set isInRoom on most recent event
              userModel.isInRoom = _.first(eventModels).entering;
              userModel.lastActivity = _.first(eventModels).timestamp;

              // Save changes
              userModel.save(function (err) {
                if(err) return console.log(err);
              });
            }
          });
        });
      });
    });
  },

  // saves new event to database, adds event to user's event array,
  // updates user's isInRoom attribute based on event's direction
  pushEvent: function (data) {

    // Instantiate new event
    var newUserEvent = new UserEventModel(data);

    // Request user field to be filled
    newUserEvent.populate('user', function (err) {
      if(err) return console.log(err);

      // Set new event isInRoom on event direction
      newUserEvent.user.isInRoom = newUserEvent.entering;

      // Set new event lastActivity on event timestamp
      newUserEvent.user.lastActivity = newUserEvent.timestamp;

      // Save changes
      newUserEvent.user.save(function (err) {
        if(err) return console.log(err);
      });

      newUserEvent.save(function (err) {
        if(err) return console.log(err);
      });
    });
  }
};

module.exports = usersController;

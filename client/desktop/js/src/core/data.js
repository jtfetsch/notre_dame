define([
    'socket.io',
    'src/core/requests',
    'src/core/commands',
    'src/collections/users-collection',
    'src/collections/equipment-collection',
    'src/core/filtered-collection'
], function (
    io,
    requests,
    commands,
    UsersCollection,
    EquipmentCollection,
    filtered_collection
) {

    // Instatiate singleton collections for data management over the whole app,
    // allowing collection views to be rendered without having to request a data
    // update each time the user changes to a different view.
    var users = new UsersCollection();
    var equipment = new EquipmentCollection ();

    // set up collection decorators
    var active_users = filtered_collection(users);
    active_users.where({isInRoom: true});
    var active_equip = filtered_collection(equipment);
    active_equip.where({running: true});

    // Start the socket.io connection at the base url of the site
    var socket = io.connect(window.location.origin);

    socket.on('connecting', function () {
        console.info('Monitoring Services: connecting...');
    });

    socket.on('connect', function () {
        console.info('Monitoring Services: connected.');
    });

    // when receiving user event over socket
    socket.on('users-monitor-events', function (eventArgs) {
        //set the isInRoom property of the user from the event
        //based on the event's entering property
        users.findWhere({
            badge: eventArgs.user
        }).set('isInRoom', eventArgs.entering);
        //resort the users
        users.sort().trigger('reset');
        console.info('Users Monitor Service: user with badge number ' + eventArgs.user + ' ' + (eventArgs.entering ? 'entering' : 'leaving') + ' the cleanroom.');
    });

    // when receiving equipment event over socket
    socket.on('equipment-monitor-events', function (eventArgs) {
        //set the running, problems, and shutdowns properties of the equipment from the event
        //based on the event's respective properties
        equipment.findWhere({
            name: eventArgs.name
        }).set({running: eventArgs.running, problems: eventArgs.problems, shutdowns: eventArgs.shutdowns});
        //resort the equipment
        equipment.sort().trigger('reset');
        console.info('Equipment Monitoring Service: device with name ' + eventArgs.name + ' was turned ' + (eventArgs.running ? 'on' : 'off') + ' by user with netid ' + eventArgs.netid + '.');
    });

    // Requests API
    requests.setHandlers({
        'data:socket': function () {
            return socket;
        },

        'data:users': function () {
            return users;
        },

        'data:equipment': function () {
            return equipment;
        },

        'data:active_users': function() {
            return active_users;
        },

        'data:active_equip': function() {
            return active_equip;
        }
    });

    // Commands API
    commands.setHandlers({
        'data:users:update': function () {
            users.fetch();
        },

        'data:equipment:update': function () {
            equipment.fetch();
        }
    });

    // Direct API
    return {
        users: users,
        equipment: equipment,
        active_users: active_users,
        active_equip: active_equip
    };
});

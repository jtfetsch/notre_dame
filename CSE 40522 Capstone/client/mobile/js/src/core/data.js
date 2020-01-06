define([
    'socket.io',
    'src/core/requests',
    'src/core/commands',
    'src/collections/users-collection',
    'src/collections/equipment-collection'
], function (
    io,
    requests,
    commands,
    UsersCollection,
    EquipmentCollection
) {

    // Instatiate singleton collections for data management over the whole app,
    // allowing collection views to be rendered without having to request a data
    // update each time the user changes to a different view.
    var users = new UsersCollection();
    var equipment = new EquipmentCollection ();

    // Start the socket.io connection at the base url of the site
    // var socket = io.connect(window.location.origin);

    // Requests API
    requests.setHandlers({
        'data:users': function () {
            return users;
        },

        'data:users:by-id': function (id) {
            return users.get(id);
        },

        'data:equipment': function () {
            return equipment;
        },

        'data:equipment:by-id': function (id) {
            return equipment.get(id);
        }
    });

    // Commands API
    commands.setHandlers({
        'data:users:update': function () {
            users.fetch({ data: { isInRoom: 1 }, reset: true });
        },

        'data:equipment:update': function () {
            equipment.fetch({ data: { isRunning: 1 }, reset: true });
        }
    });

    // Direct API
    return {
        users: users,
        equipment: equipment
    };
});

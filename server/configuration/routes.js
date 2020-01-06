var registerRoutes = function (app) {

// HOME CONTROLLER -------------------------------------------------------------

    var homeController = require('../application/controllers/home-controller');
    app.get('/', homeController.desktop);
    app.get('/mobile', homeController.mobile);
    app.get('/sockets-test', homeController.socketsTest);

// USERS CONTROLLER ------------------------------------------------------------

    var usersController = require('../application/controllers/users-controller');
    app.get('/api/v1/users', usersController.list);
    app.get('/api/v1/users-in-room', usersController.listInRoom);
    app.get('/api/v1/users/:user', usersController.readUserByBadgeNumber);
    app.get('/api/v1/users/:user/user-events', usersController.readUserEventsByBadgeNumber);
    app.get('/api/v1/users/:user/equipment-events', usersController.readEquipmentEventsByBadgeNumber);    
    app.get('/api/v1/users/:user/hours', usersController.readHoursWorkedByBadgeNumber);
    app.get('/api/v1/users/:user/most-used-equip', usersController.readMostUsedEquipByBadgeNumber);
    app.push('users-monitor-events', usersController.pushEvent);
    app.push('users-monitor-updates', usersController.pushUpdate);

// EQUIPMENT CONTROLLER --------------------------------------------------------

    var equipmentController = require('../application/controllers/equipment-controller');
    app.get('/api/v1/equipment', equipmentController.list);
    app.get('/api/v1/equipment/events', equipmentController.readEvents);
    app.get('/api/v1/equipment/:name/hours', equipmentController.readHoursUsedByEquipmentName);
    app.get('/api/v1/equipment/:name/events', equipmentController.readEventsByEquipmentName);
    app.push('equipment-monitor-events', equipmentController.pushEvent);
    app.push('equipment-monitor-updates', equipmentController.pushUpdate);
};

module.exports = registerRoutes;

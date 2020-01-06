define([
    'backbone-package',
    'underscore-package',
    'src/core/commands',
    'src/core/requests',
    'src/views/users/users-list',
    'src/views/users/users-detail',
    'src/views/equipment/equipment-list',
    'src/views/equipment/equipment-detail'
], function (Backbone, _, commands, requests, UsersListView, UsersDetailView, EquipmentListView, EquipmentDetailView) {
    
    return Backbone.Router.extend({
        routes: {
            '': 'showLastRoute',
            'users': 'showUsers',
            'users/:id': 'showUserDetail',
            'equipment': 'showEquipment',
            'equipment/:id': 'showEquipmentDetail',
            'news': 'showNews'
        },
        
        initialize: function () {
            _.bindAll(this, '_handleNavigateCommand', '_handleSaveLastRouteCommand', '_handleGetLastRouteRequest');
            commands.setHandler('router:navigate', this._handleNavigateCommand);
            commands.setHandler('router:last-route:set', this._handleSaveLastRouteCommand);
            requests.setHandler('router:last-route:get', this._handleGetLastRouteRequest);
        },

        _handleNavigateCommand: function (route) {
            this.navigate(route, { trigger: true, replace: true });
        },

        _handleSaveLastRouteCommand: function (route) {
            localStorage.setItem('last-route', route);
        },

        _handleGetLastRouteRequest: function () {
            var lastRoute = localStorage.getItem('last-route');
            lastRoute || (lastRoute = 'users');
            return lastRoute;
        },

        showLastRoute: function () {
            var route = requests.request('router:last-route:get');
            commands.execute('router:navigate', route);
        },

        showUsers: function () {
            commands.execute('router:last-route:set', 'users');
            commands.execute('ui:header:clear-left-button');
            commands.execute('ui:header:set-title', 'Users');
            commands.execute('ui:footer:set-active', '#users');
            var usersList = new UsersListView();
            commands.execute('ui:main:show', usersList);
            commands.execute('data:users:update');
        },

        showUserDetail: function (id) {
            var model = requests.request('data:users:by-id', id);
            if(model === undefined) return commands.execute('router:navigate', 'users');
            commands.execute('ui:header:set-title', model.get('firstName'));
            commands.execute('ui:header:set-left-button', {
                icon: 'ion-ios7-arrow-back',
                text: 'Back',
                route: '#users'
            });
            var usersDetail = new UsersDetailView({ model: model });
            commands.execute('ui:main:show', usersDetail);
        },
        
        showEquipment: function () {
            commands.execute('router:last-route:set', 'equipment');
            commands.execute('ui:header:clear-left-button');
            commands.execute('ui:header:set-title', 'Equipment');
            commands.execute('ui:footer:set-active', '#equipment');
            var equipmentList = new EquipmentListView();
            commands.execute('ui:main:show', equipmentList);
            commands.execute('data:equipment:update');
        },

        showEquipmentDetail: function (id) {
            var model = requests.request('data:equipment:by-id', id);
            if(model === undefined) return commands.execute('router:navigate', 'equipment');
            commands.execute('ui:header:set-title', model.get('name'));
            commands.execute('ui:header:set-left-button', {
                icon: 'ion-ios7-arrow-back',
                text: 'Back',
                route: '#equipment'
            });
            var equipmentDetail = new EquipmentDetailView({ model: model });
            commands.execute('ui:main:show', equipmentDetail);
        }
    });
});
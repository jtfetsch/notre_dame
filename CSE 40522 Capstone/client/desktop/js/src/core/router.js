define([
    'backbone-package',
    'src/core/commands',
    'src/core/requests',
    'src/views/users/users-list',
    'src/views/equipment/equipment-list',
    'src/views/users/users-profile',
    'src/views/current/current-layout'
], function (Backbone, commands, requests, UsersListView, EquipmentListView, UsersProfileView, CurrentLayout) {

    return Backbone.Router.extend({
        routes: {
            '': 'showCurrent',
            'users': 'showUsers',
            'equipment': 'showEquipment',
            'news': 'showNews',
            'users/:id': 'showSingleUser'
        },

        initialize: function() {
            var self = this;
            commands.setHandler('router:navigate', function (route) {
                self.navigate(route, { trigger: true });
            });
        },

        showCurrent: function () {
            commands.execute('ui:header:set-active', '');
            var currentLayout = new CurrentLayout();
            commands.execute('ui:main:show', currentLayout);
        },

        showUsers: function () {
            commands.execute('ui:header:set-active', 'users');
            var usersList = new UsersListView();
            commands.execute('ui:main:show', usersList);
        },

        showEquipment: function () {
            commands.execute('ui:header:set-active', 'equipment');
            var equipmentList = new EquipmentListView();
            commands.execute('ui:main:show', equipmentList);
        },

        showNews: function () {
            commands.execute('ui:header:set-active', 'news');
            commands.execute('ui:main:hide');
        },

        showSingleUser: function (id) {
            var user = requests.request("data:users").get(id);
            var userProfile = new UsersProfileView( { model: user} );
            commands.execute('ui:main:show', userProfile);
        }
    });
});

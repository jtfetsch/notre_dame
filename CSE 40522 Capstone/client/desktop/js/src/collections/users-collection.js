define([
    'backbone-package',
    'underscore-package',
    'src/models/user-model'
], function (Backbone, _, UserModel) {

    return Backbone.Collection.extend({
        model: UserModel,
        url: window.location.origin + '/api/v1/users',
        comparator: function (a, b) {
            if(a.get('isInRoom') && !b.get('isInRoom')) return -1;
            else if(!a.get('isInRoom') && b.get('isInRoom')) return 1;
            else {
                var dateA = (new Date(a.get('lastActivity'))).valueOf();
                var dateB = (new Date(b.get('lastActivity'))).valueOf();
                if(dateA > dateB) return -1;
                else if(dateA === dateB) return 0;
                else return 1;
            }
        }
    });
});

define([
    'backbone-package',
    'underscore-package',
    'src/models/user-model'
], function (Backbone, _, UserModel) {
    
    return Backbone.Collection.extend({
        model: UserModel,
        url: window.location.origin + '/api/v1/users',
        comparator: function (a) {
            return [!a.get('isInRoom')];
        }
    });
});
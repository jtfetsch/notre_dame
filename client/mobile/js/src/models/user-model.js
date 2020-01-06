define([
    'backbone-package'
], function (Backbone) {
    return Backbone.Model.extend({
        idAttribute: 'badge',

        defaults: {
        	imageUri: '/dist/img/user-placeholder.jpg'
        },

        getFullName: function () {
        	return this.get('firstName') + ' ' + this.get('lastName');
        }
    });
});
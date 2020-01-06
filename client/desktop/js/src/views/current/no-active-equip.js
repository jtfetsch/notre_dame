define([
    'backbone-package',
    'src/core/data'
], function (Backbone) {

    return Backbone.Marionette.ItemView.extend({
        template: 'current/no-active-equip'
    });
});

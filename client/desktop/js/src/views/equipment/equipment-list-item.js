define([
    'backbone-package'
], function (Backbone) {

    return Backbone.Marionette.ItemView.extend({
        template: 'equipment/equipment-list-item',
        className: function () {
            return 'equipment-list-item' + (this.model.get('running') ? ' active' : '');
        },

        modelEvents: {
        	'change:running': 'onModelRunningChanged'
        },

        onModelRunningChanged: function () {
        	this.$el.toggleClass('active', this.model.get('running'));
        }
    });
});
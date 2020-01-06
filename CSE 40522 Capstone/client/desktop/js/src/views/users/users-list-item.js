define([
    'jquery-package',
    'backbone-package',
    'src/core/commands'
], function ($, Backbone, commands) {

    return Backbone.Marionette.ItemView.extend({
        template: 'users/users-list-item',

        onRender: function () {
            this._setBackgroundImage();
        },

        events:{
            "click div.photo-container" : "showProfile"
        },

        ui: {
            photo: '.photo'
        },

        className: function () {
            return 'users-list-item' + (this.model.get('isInRoom') ? ' active' : '');
        },

        modelEvents: {
        	'change:isInRoom': 'onModelIsInRoomChanged',
            'change:imageUri': 'onModelImageUriChanged'
        },

        onModelIsInRoomChanged: function () {
        	this.$el.toggleClass('active', this.model.get('isInRoom'));
        },

        onModelImageUriChanged: function () {
            this._setBackgroundImage();
        },

        _setBackgroundImage: function () {
            this.ui.photo.css({
                'background-image': 'url(' + this.model.get('imageUri') + ')'
            });
        },

        showProfile: function () {
            commands.execute('router:navigate', 'users/' + this.model.get('badge'));
        }

    });
});
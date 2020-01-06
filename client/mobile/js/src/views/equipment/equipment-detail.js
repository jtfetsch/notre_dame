define([
	'backbone-package',
    'src/core/commands'
], function (Backbone, commands) {

	return Backbone.Marionette.ItemView.extend({

		template: 'equipment/equipment-detail',
        
        onRender: function () {
            this.ui.photo.css({
                'background-image': 'url(dist/img/icon-custom-equipment-active.png)',
                'background-color': 'white'
            });
        },

        ui: {
            photo: '.photo'
        },

        className: 'container detail',

        attributes: {
            'data-scrollable': ''
        },

        events: {
            'touchmove': 'onTouchMove',
            'touchend': 'onTouchEnd'
        },

        onTouchMove: function (ev) {
            if(this.el.scrollTop < 0) {
                this.$el.addClass('dragging').css({ 'background-size': (140 - ev.currentTarget.scrollTop/2) + '%' });
            }

            // else if(this.el.scrollTop > this.el.scrollHeight - this.el.clientHeight) {
            //     this.$el.addClass('no-background');
            // }
        },

        onTouchEnd: function (ev) {
            this.$el.removeClass('dragging').css({ 'background-size': '' });
            // this.$el.removeClass('no-background');
        }
	});
});
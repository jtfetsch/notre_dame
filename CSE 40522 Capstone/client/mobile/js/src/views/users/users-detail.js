define([
	'backbone-package',
    'src/core/commands'
], function (Backbone, commands) {

	return Backbone.Marionette.ItemView.extend({

		template: 'users/users-detail',

        onRender: function () {
            this._loadPhotoImage();
            this._loadStats();
        },

        ui: {
            photo: '.photo',
            hours: '.hours',
            equipment: '.equipment'
        },

        className: 'container detail',

        workerHours: 0,
        mostFreqEquip: 'No Equipment Information Available',

        attributes: {
            'data-scrollable': ''
        },

        _loadPhotoImage: function () {
            var self = this;
            var sourceUri = 'http://anemone.nano.nd.edu/photos/' + self.model.get('netid') + '.jpg';
            self.ui.photo.addClass('loading');
            var loadingImage = new Image();
            loadingImage.onload = function () {
                self.ui.photo.css({
                    'background-image': 'url("' + sourceUri + '")'
                }).removeClass('loading');
            };
            loadingImage.onerror = function () {
                self.ui.photo.css({
                    'background-image': 'url("' + window.location.origin + '/dist/img/user-placeholder.jpg")'
                }).removeClass('loading');
            };
            loadingImage.src = sourceUri;
        },

        _loadStats: function() {
            var userBadgeNumber = this.model.get('badge');
            var self = this;
            var hoursWorked = 0;
            var mostUsedEquip = null;
            $.getJSON("/api/v1/users/" + userBadgeNumber + "/hours?days=7", function(data) {
              hoursWorked = data.hours;
              hoursWorked = hoursWorked.toFixed(2);
              self.workerHours = hoursWorked;
              self.ui.hours.html(hoursWorked);
            });
            $.getJSON("/api/v1/users/" + userBadgeNumber + "/most-used-equip?days=7", function(data) {
              mostUsedEquip = data.mostUsedEquipment;
              self.mostFreqEquip = mostUsedEquip;
              self.ui.equipment.html(mostUsedEquip);
            });
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

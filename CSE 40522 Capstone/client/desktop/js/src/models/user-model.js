define([
    'backbone-package'
], function (Backbone) {
    return Backbone.Model.extend({
        idAttribute: 'badge',

        defaults: {
        	imageUri: '/dist/img/user-placeholder.jpg',
            UserEvents: [],
            EquipmentEvents: []
        },

        initialize: function () {
        	this.preloadImage();
        },

        preloadImage: function () {
        	var self = this;
        	var preloaderImage = new Image();
        	var imageUri = 'http://anemone.nano.nd.edu/photos/' + this.get('netid') + '.jpg';
        	preloaderImage.onload = function () {
        		self.set('imageUri', imageUri);
        	};
        	preloaderImage.src = imageUri;
        },

        getPhotoUrl: function () {
        	return 'http://anemone.nano.nd.edu/photos/' + this.get('netid') + '.jpg';
        }

    });
});
define([
  'jquery-package',
  'backbone-package'
], function( $, Backbone) {

  return Backbone.Marionette.ItemView.extend({
    template: 'current/active-users-item',

    onRender: function () {
      this._setBackgroundImage();
    },

    ui: {
      photo: '.photo'
    },

    className: 'active-user-item',

    modelEvents: {
      'change:imageUri': 'onModelImageUriChanged'
    },

    onModelImageUriChanged: function() {
      this._setBackgroundImage();
    },

    _setBackgroundImage: function() {
      this.ui.photo.css({
        'background-image': 'url(' + this.model.get('imageUri') + ')'
      });
    }

  })

});

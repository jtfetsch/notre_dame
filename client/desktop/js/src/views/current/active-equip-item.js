define([
  'jquery-package',
  'backbone-package'
], function( $, Backbone) {

  return Backbone.Marionette.ItemView.extend({
    template: 'current/active-equip-item',

    className: 'active-equip-item'

  });

});

define([
  'backbone-package',
  'underscore-package',
  'jquery-package',
  'src/core/requests',
  'src/core/events',
  'src/views/current/active-users-module',
  'src/views/current/active-equip-module',
  'src/core/data'
], function(Backbone, _, $, requests, events, ActiveUsersModule, ActiveEquipModule) {

  return Backbone.Marionette.Layout.extend({
    template: 'current/current-layout',
    regions: {
      users: ".users",
      equip: ".equip"
    },

    scrollInterval: 10000,

    _scrollIntervalId: null,

    className: 'current-layout',

    initialize: function () {
      _.bindAll(this, '_executeScroll');
    },

    onRender: function() {
      this.users.show(new ActiveUsersModule() );
      this.equip.show(new ActiveEquipModule() );
      this.ui.timer.css({ '-webkit-animation-duration': this.scrollInterval + 'ms' });
      this._scrollIntervalId = setInterval(this._executeScroll, this.scrollInterval);
    },

    onClose: function () {
      clearInterval(this._scrollIntervalId);
    },

    ui: {
      fullScreenButton: 'button#full-screen',
      timer: '.timer'
    },

    events: {
      'click @ui.fullScreenButton': 'onFullScreenButtonClick'
    },

    onFullScreenButtonClick: function () {
      if(this.$el.isFullScreen()) {
        this.$el.exitFullScreen();
      }
      else {
        this.$el.requestFullScreen();
      }
    },

    _executeScroll: function () {
      this.ui.timer.removeClass('running');
      if(this.$el.isFullScreen()) {
        events.trigger('ui:current:scroll');
        this.ui.timer.addClass('running');
      }
    }

   });
});

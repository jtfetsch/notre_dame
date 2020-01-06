define([
  'jquery-package',
  'backbone-package',
  'src/core/commands',
  'src/core/requests',
  'src/core/router',
  'src/core/app',
  'src/core/data'
], function ($, Backbone, commands, requests, Router, app) {

  commands.setHandler('ui:header:set-active', function (route) {
    if(route.charAt(0) !== '#') route = '#' + route;
    $('header nav a.active').removeClass('active');
    $('header nav a[href=' + route + ']').addClass('active');
  });

  app.addInitializer(function () {
    new Router();
    Backbone.history.start();
  });

  commands.execute('app:preloaders:add', requests.request('data:users').fetch({ reset: true }));
  commands.execute('app:preloaders:add', requests.request('data:equipment').fetch({ reset: true }));

  $(function () {
    commands.execute('app:start');
  });
});
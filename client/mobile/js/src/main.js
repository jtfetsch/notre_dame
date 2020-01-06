define([
  'jquery-package',
  'backbone-package',

  'src/core/commands',
  'src/core/requests',
  'src/core/router',

  'src/core/app',
  'src/core/data'
], function ($, Backbone, commands, requests, Router) {
  
  commands.setHandler('ui:header:set-title', function (title) {
    $('header .title').html(title);
  });

  commands.setHandler('ui:header:set-left-button', function (options) {
    $('header .button').eq(0).find('.icon').removeAttr('class').addClass('icon').addClass(options.icon);
    $('header .button').eq(0).find('.text').html(options.text);
    $('header .button').eq(0).attr('href', options.route || '');
  });

  commands.setHandler('ui:header:clear-left-button', function () {
    $('header .button').eq(0).find('.icon').removeAttr('class').addClass('icon');
    $('header .button').eq(0).find('.text').html('');
    $('header .button').eq(0).attr('href', '');
  });

  commands.setHandler('ui:header:set-right-button', function (options) {
    $('header .button.right').find('.icon').removeAttr('class').addClass('icon').addClass(options.icon);
    $('header .button.right').find('.text').html(options.text);
  });

  commands.setHandler('ui:footer:set-active', function (route) {
    if(route.charAt(0) !== '#') route = '#' + route;
    $('footer a').removeClass('active');
    $('footer a[href="' + route + '"]').addClass('active');
  });

  $('footer a, header a').on('tap', function(ev) {
    commands.execute('router:navigate', $(this).attr('href'));
    ev.preventDefault();
    return false;
  });

  $('footer a, header a').on('click', function (ev) {
    ev.preventDefault();
    return false;
  });

  $('body').on('touchstart', '[data-scrollable]', function (ev) {
    var el = ev.currentTarget;
    if(el.scrollHeight <= el.clientHeight) return;
    if(el.scrollTop === 0) el.scrollTop = 1;
    else if(el.scrollTop === el.scrollHeight - el.clientHeight) el.scrollTop = el.scrollHeight - el.clientHeight - 1;
  });

  $('body').on('touchmove', '[data-scrollable]', function (ev) {
    var el = ev.currentTarget;
    if(el.scrollHeight <= el.clientHeight) return false;
  });

  commands.execute('app:initializers:add', function () {
    new Router();
    Backbone.history.start();
  });

  commands.execute('app:start');
});
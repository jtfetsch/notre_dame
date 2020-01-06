requirejs.config({

  paths: {
    'backbone': '../../bower_components/backbone-amd/backbone',
    'backbone.wreqr': '../../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
    'backbone.babysitter': '../../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',
    'backbone.marionette': '../../bower_components/marionette/lib/core/amd/backbone.marionette',
    'backbone-package': 'lib/backbone-package',
    
    'underscore': '../../bower_components/underscore-amd/underscore',
    'underscore.string': '../../bower_components/underscore.string/lib/underscore.string',
    'underscore-package': 'lib/underscore-package',

    'jquery': '../../bower_components/jquery/dist/jquery',
    'jquery.transit': '../../bower_components/jquery.transit/jquery.transit',
    'jquery.mobile.events': '../../bower_components/jquery-mobile-events/jquery-mobile-events',
    'jquery-package': 'lib/jquery-package',

    'socket.io': '../../bower_components/socket.io-client/dist/socket.io',

    'templates': 'src/templates'
  },

  shim: {
    'jquery.transit': {
      deps: ['jquery'],
      exports: '$'
    },
    'jquery': {
      exports: '$'
    }
  },

  urlArgs: '' + (new Date()).valueOf()
});

require(['src/main']);
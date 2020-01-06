define([
    'backbone-package',
    'jquery-package',
    'src/core/commands'
], function (Backbone, $, commands) {
    
    var app = new Backbone.Marionette.Application();
    
    app.addRegions({
        mainRegion: 'div.content'
    });
    
    commands.setHandler('ui:main:show', function (view) {
        app.mainRegion.show(view);
    });
    
    commands.setHandler('ui:main:hide', function () {
        app.mainRegion.close();
    });

    var preloaders = [];
    
    commands.setHandler('app:preloaders:add', function (preloader) {
        preloaders.push(preloader);
    });
    
    commands.setHandler('app:start', function () {
        $.when.apply(null, preloaders).done(function () {
            app.start();
        });
    });
    
    return app;
});
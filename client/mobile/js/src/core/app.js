define([
    'backbone-package',
    'jquery-package',
    'underscore-package',
    'src/core/commands'
], function (Backbone, $, _, commands) {
    
    var app = new Backbone.Marionette.Application();
    
    app.addRegions({
        mainRegion: 'div.content'
    });

    app.mainRegion.open = function (view) {
        this.$el.append(view.el);
        _.defer(function () {
            view.$el.css({'left': '100%', 'z-index': 2 }).transition({ left: 0 }, 300);
        });
    };
    
    app.mainRegion.close = function(){
        var view = this.currentView;
        if (!view || view.isClosed){ return; }
        
        this.currentView = null;

        _.defer(function () {
            view.$el.css({ 'z-index': 1 }).transition({ left: '-100%' }, 600, function () {
                // call 'close' or 'remove', depending on which is found
                if (view.close) { view.close(); }
                else if (view.remove) { view.remove(); }

                Backbone.Marionette.triggerMethod.call(this, "close", view);
                delete view;
            });
        });
    },

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
    
    commands.setHandler('app:initializers:add', function (initializer) {
        app.addInitializer(initializer);
    });

    commands.setHandler('app:start', function () {
        $.when.apply(null, preloaders).done(function () {
            app.start();
        });
    });
    
    return app;
});
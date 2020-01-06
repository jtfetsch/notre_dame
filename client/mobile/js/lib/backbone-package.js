define([
    'backbone',
    'templates',
    'backbone.wreqr',
    'backbone.babysitter',
    'backbone.marionette'
], function (Backbone, templates) {
    Backbone.Marionette.Renderer.render = function(path, data) {
        return templates[path](data);
    }
    return Backbone;
});
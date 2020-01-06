define([
    'backbone-package'
], function (Backbone) {
    
    var PostModel = Backbone.Model.extend({
        defaults: function () {
            return {
                author: 'Author Name',
                body: '',
                title: 'New Post',
                level: this.INFORMATION,
                created: (new Date()).getTime()
            }
        }
    }, {
        ERROR: 'error',
        WARNING: 'warning',
        INFORMATION: 'information'
    });
    
    return PostModel;
});
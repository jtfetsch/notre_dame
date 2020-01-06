define([
    'backbone-package',
    'src/model/post-model'
], function (Backbone, PostModel) {
    return Backbone.Collection.extend({
        model: PostModel,
        comparator: 'created'
    });
});
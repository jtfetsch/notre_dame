define([
    'backbone-package',
    'underscore-package',
    'src/models/equipment-model'
], function (Backbone, _, EquipmentModel) {
    
    return Backbone.Collection.extend({
        model: EquipmentModel,
        url: window.location.origin + '/api/v1/equipment',
        comparator: function (a) {
            return [!a.get('running'), a.get('name').toLowerCase()];
        }
    });
});
define([
    'backbone-package',
    'underscore-package',
    'src/core/requests',
    'src/views/equipment/equipment-list-item',
    'src/core/data'
], function (Backbone, _, requests, EquipmentListItem) {
    
    return Backbone.Marionette.CompositeView.extend({
        template: 'equipment/equipment-list',
        itemView: EquipmentListItem,
        itemViewContainer: 'div.equipment-list',
        className: 'container equipment',
        collection: requests.request('data:equipment'),
        
        _currentSearchVal: null,
        
        ui: {
            searchInput: 'input[type="search"]'
        },
        
        events: {
            'keyup @ui.searchInput': 'onSearchInputKeyUp'
        },
        
        onSearchInputKeyUp: function () {

        },
        
        onClose: function () {
            this._currentSearchVal = null;
        }
    });
});
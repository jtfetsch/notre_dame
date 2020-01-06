define([
    'backbone-package',
    'underscore-package',
    'src/core/requests',
    'src/views/users/users-list-item',
    'src/core/data'
], function (Backbone, _, requests, UsersListItem) {

    return Backbone.Marionette.CompositeView.extend({
        template: 'users/users-list',
        itemView: UsersListItem,
        itemViewContainer: 'div.users-list',
        className: 'container users',
        collection: requests.request('data:users'),
        
        appendHtml: function(collectionView, itemView, index){
            var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el;
            var children = childrenContainer.children();
            if (children.size() <= index) {
                childrenContainer.append(itemView.el);
            } else {
                children.eq(index).before(itemView.el);
            }
        },

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
define([
  'backbone-package',
  'underscore-package',
  'src/core/events',
  'src/core/requests',
  'src/views/current/active-users-item',
  'src/views/current/no-active-users',
  'src/core/data'
], function(Backbone, _, events, requests, ActiveUsersItem, NoActiveUsersItem) {

  return Backbone.Marionette.CompositeView.extend({
    template: 'current/active-users-module',
    itemView: ActiveUsersItem,
    emptyView: NoActiveUsersItem,
    itemViewContainer: 'div.active-users-module',
    className: 'container active-users',
    collection: requests.request('data:active_users'),

    appendHtml: function(collectionView, itemView, index) {
      var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el;
      var children = childrenContainer.children();
      if(children.size() <= index) {
        childrenContainer.append(itemView.el);
      } else {
        children.eq(index).before(itemView.el);
      }
    },

    ui: {
      activeUsersContainer: '.active-users-module'
    },

    initialize: function () {
      _.bindAll(this, '_executeScroll');
    },

    onRender: function () {
      events.on('ui:current:scroll', this._executeScroll);
    },

    _executeScroll: function () {
      var el = this.ui.activeUsersContainer[0];
      if(el.scrollHeight <= el.clientHeight) return;

      if(el.scrollTop === el.scrollHeight - el.clientHeight) this.ui.activeUsersContainer.animate({ scrollTop: 0 }, 500);
      else this.ui.activeUsersContainer.animate({ scrollTop: el.scrollTop + el.clientHeight }, 500);
    },

    onClose: function () {
      events.off('ui:current:scroll', this._executeScroll);
    }

   });
});

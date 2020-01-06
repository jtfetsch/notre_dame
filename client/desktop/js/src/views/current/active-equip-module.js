define([
  'backbone-package',
  'underscore-package',
  'src/core/requests',
  'src/core/events',
  'src/views/current/active-equip-item',
  'src/views/current/no-active-equip',
  'src/core/data'
], function(Backbone, _, requests, events, ActiveEquipItem, NoActiveEquipItem) {

  return Backbone.Marionette.CompositeView.extend({
    template: 'current/active-equip-module',
    itemView: ActiveEquipItem,
    emptyView: NoActiveEquipItem,
    itemViewContainer: 'div.active-equip-module',
    className: 'container active-equip',
    collection: requests.request('data:active_equip'),

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
      activeEquipContainer: '.active-equip-module'
    },

    initialize: function () {
      _.bindAll(this, '_executeScroll');
    },

    onRender: function () {
      events.on('ui:current:scroll', this._executeScroll);
    },

    _executeScroll: function () {
      var el = this.ui.activeEquipContainer[0];
      if(el.scrollHeight <= el.clientHeight) return;

      if(el.scrollTop === el.scrollHeight - el.clientHeight) this.ui.activeEquipContainer.animate({ scrollTop: 0 }, 500);
      else this.ui.activeEquipContainer.animate({ scrollTop: el.scrollTop + el.clientHeight }, 500);
    },

    onClose: function () {
      events.off('ui:current:scroll', this._executeScroll);
    }

   });
});

define([
	'backbone-package',
	'src/core/requests',
	'src/views/equipment/equipment-list-item',
	'src/core/data'
], function (Backbone, requests, EquipmentListItemView) {
	return Backbone.Marionette.CompositeView.extend({
		className: 'container list',
		itemViewContainer: '.inner-container',
		itemView: EquipmentListItemView,
		collection: requests.request('data:equipment'),
		template: 'equipment/equipment-list',
		attributes: {
			'data-scrollable': ''
		}
	});
});
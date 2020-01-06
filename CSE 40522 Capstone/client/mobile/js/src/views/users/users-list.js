define([
	'backbone-package',
	'src/core/requests',
	'src/views/users/users-list-item',
	'src/core/data'
], function (Backbone, requests, UsersListItemView) {
	return Backbone.Marionette.CompositeView.extend({
		className: 'container list',
		itemView: UsersListItemView,
		itemViewContainer: '.inner-container',
		collection: requests.request('data:users'),
		template: 'users/users-list',
		attributes: {
			'data-scrollable': ''
		}
	});
});
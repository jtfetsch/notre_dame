define([
	'backbone-package',
	'src/core/commands'
], function (Backbone, commands) {
	
	return Backbone.Marionette.ItemView.extend({
		template: 'users/users-list-item',
		tagName: 'a',
		className: 'list-item',

		attributes: function () {
			return {
				'href': '#users/' + this.model.get('badge')
			};
		},

		events: {
			'tap': 'onTap'
		},

		onTap: function () {
			commands.execute('router:navigate', this.$el.attr('href'));
			return false;
		}
	});
});
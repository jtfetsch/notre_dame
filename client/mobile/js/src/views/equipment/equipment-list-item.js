define([
	'backbone-package',
	'src/core/commands'
], function (Backbone, commands) {
	
	return Backbone.Marionette.ItemView.extend({
		template: 'equipment/equipment-list-item',
		tagName: 'a',
		className: 'list-item',

		attributes: function () {
			return {
				'href': '#equipment/' + this.model.get('name')
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
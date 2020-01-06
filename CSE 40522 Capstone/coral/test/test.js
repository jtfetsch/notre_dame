var Coral = require('../index');
var should = require('should');
var _ = require('underscore');

describe('Coral', function () {

	it('should find users by badge number', function (done) {
		Coral.findUserByBadgeNumber(147).then(function (user) {
			user.should.have.property('firstName');
			user.should.have.property('lastName');
			user.should.have.property('netid');
			user.should.have.property('badge', 147);
			done();
		}).fail(function (err) {
			throw err;
		});
	});

	it('should find a user by netid', function (done) {
		Coral.findUserByNetid('pfay').then(function (user) {
			user.should.have.property('firstName');
			user.should.have.property('lastName');
			user.should.have.property('netid', 'pfay');
			user.should.have.property('badge');
			done();
		}).fail(function (err) {
			throw err;
		});
	});

	it('should find all the users', function (done) {
		Coral.findAllUsers().then(function (users) {
			_.each(users, function (user) {
				user.should.have.property('firstName');
				user.should.have.property('lastName');
				user.should.have.property('netid');
				user.should.have.property('badge');
			});
			users.should.have.property('length', 256);
			done();
		}).fail(function (err) {
			throw err;
		});
	});

	it('should find all equipment', function (done) {
		Coral.findAllEquipment().then(function (equipment) {
			_.each(equipment, function (item) {
				item.should.have.property('name');
				item.should.have.property('description');
				item.should.have.property('running');
			});
			done();
		}).fail(function (err) {
			throw err;
		});
	});

	it('should find all equipment currently in use', function (done) {
		Coral.findCurrentlyUsedEquipment().then(function (equipment) {
			_.each(equipment, function (item) {
				item.should.have.property('name');
				item.should.have.property('description');
				item.should.have.property('badge');
				item.should.have.property('running');
			});
			done();
		}).fail(function (err) {
			throw err;
		});
	});
});
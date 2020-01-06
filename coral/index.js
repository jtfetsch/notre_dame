var pg = require('pg')
, sql = require('sql')
, _ = require('underscore')
, Q = require('q');

var dbConfig = require('./configuration/database.js');

var connectionString = 'postgres://' + dbConfig.username + ':' +dbConfig.password + '@' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.dbname;

var usersRenameMap = {
	firstname: 'firstName',
	lastname: 'lastName',
	name: 'netid'
};

var equipmentRenameMap = {
	enabled: 'running',
	creator: 'netid',
	item: 'name'
};

var Coral = {

	findUserByBadgeNumber: function (badgeNumber) {
		var queryString = 'SELECT firstname, lastname, name, badge::int FROM rscmgr.member WHERE badge=$1;';
		var parameters = [badgeNumber];
		return this.executeQuery(queryString, parameters, usersRenameMap);
	},

	findUserByNetid: function (netid) {
		var queryString = 'SELECT firstname, lastname, name, badge::int FROM rscmgr.member WHERE name=$1;';
		var parameters = [netid];
		return this.executeQuery(queryString, parameters, usersRenameMap);
	},

	findAllUsers: function () {
		var queryString = 'SELECT DISTINCT ON (badge) firstname, lastname, name, badge::int FROM rscmgr.member WHERE badge != \'\' AND active = 1;';
		return this.executeQuery(queryString, usersRenameMap);
	},

	findAllEquipment: function () {
    var queryString = 'SELECT DISTINCT equipment.name, equipment.description, equipment.enabled::int::bool, equipment.problems::int::bool, equipment.shutdowns::int::bool, member.badge FROM eqmgr.current_eq RIGHT OUTER JOIN eqmgr.equipment ON current_eq.item = equipment.name LEFT OUTER JOIN rscmgr.member ON current_eq.creator = member.name ORDER BY equipment.name;';
		return this.executeQuery(queryString, equipmentRenameMap);
	},

	findCurrentlyUsedEquipment: function () {
		var queryString = 'SELECT equipment.name, equipment.description, equipment.enabled::int::bool, equipment.problems::int::bool, equipment.shutdowns::int::bool, member.badge FROM eqmgr.current_eq JOIN eqmgr.equipment ON current_eq.item = equipment.name JOIN rscmgr.member ON current_eq.creator = member.name ORDER BY equipment.name;';
		return this.executeQuery(queryString, equipmentRenameMap);
	},

	executeQuery: function () {
		var deferred = Q.defer();
		var queryString, parameters = false, propertyMap = false;

		if(arguments.length < 1 || arguments.length > 3) {
			deferred.reject(new Error('coral.executeQuery: Function takes between 1 and 3 arguments.'));
			return deferred.promise;
		}

		var _queryString = arguments[0];
		if(!_queryString || !_.isString(_queryString)) {
			deferred.reject(new Error('coral.executeQuery: First argument must be a string.'));
			return deferred.promise;
		} else {
			queryString = _queryString;
		}

		if(arguments.length === 2) {
			var _paramsOrProps = arguments[1];
			if(_.isArray(_paramsOrProps)) parameters = _paramsOrProps;
			else if(_.isObject(_paramsOrProps)) propertyMap = _paramsOrProps;
			else {
				deferred.reject(new Error('coral.executeQuery: Second argument must be an object or array.'));
				return deferred.promise;
			}
		}

		else if(arguments.length === 3) {
			var _params = arguments[1];
			if(_.isArray(_params)) parameters = _params;
			else {
				deferred.reject(new Error('coral.executeQuery: Second argument must be an array.'));
				return deferred.promise;
			}

			var _props = arguments[2];
			if(_.isObject(_props)) propertyMap = _props;
			else {
				deferred.reject(new Error('coral.executeQuery: Third argument must be an object.'));
				return deferred.promise;
			}
		}

		pg.connect(connectionString, function(err, client, done) {
			if(err) {
				deferred.reject(new Error(error));
			}

			var query;
			if(parameters) {
				query = client.query(queryString, parameters);
			} else {
				query = client.query(queryString);
			}

			query.on('row', function (row, result) {
				if(propertyMap) {
					var rowResult = {};
					_.each(row, function (value, key) {
						if(_.has(propertyMap, key)) {
							rowResult[propertyMap[key]] = value;
						} else {
							rowResult[key] = value;
						}
					});
					result.addRow(rowResult);
				} else {
					result.addRow(row);
				}
			});

			query.on('error', function (err) {
				deferred.reject(new Error(err));
			});

			query.on('end', function (result) {
				if(result.rowCount === 1) deferred.resolve(result.rows[0]);
				else deferred.resolve(result.rows);
			});

			done();
		});

		return deferred.promise;
	}
};

module.exports = Coral;

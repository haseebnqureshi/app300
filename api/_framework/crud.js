'use strict';

var _ = require('underscore');

module.exports = function(express, app, db) {

	/*
	to keep things simple and easy, we're assuming the name
	of the table is also the path for your data resource.
	*/

	var ensure = function(options) {
		return options = _.extend({ 
			uniqueness: false
		}, options || {});
	};

	//returns a response handler
	var create = function(table, options) {
		var options = ensure(options || null);
		return function(req, res, next) {
			db.insert(table, req.body, function(err, result) {
				var data = null;
				var status = err ? 500 : (result.errors > 0 ? 400 : 200);
				res.status(status).send({ err, result, data });
			}, options.uniqueness === true ? true : false);
		};
	};

	//returns a response handler
	var readAll = function(table, options) {
		var options = ensure(options || null);
		return function(req, res, next) {
			db.all(table, function(err, data) {
				var result = null;
				var status = err ? 500 : (data ? 200 : 404);
				res.status(status).send({ err, result, data });
			});
		};
	};

	//returns a response handler
	var read = function(table, options) {
		var options = ensure(options || null);
		return function(req, res, next) {
			db.getByPrimaryKey(table, req.params.id, function(err, data) {
				var result = null;
				var status = err ? 500 : (data ? 200 : 404);
				res.status(status).send({ err, result, data });
			});
		};
	};

	//returns a response handler
	var update = function(table, options) {
		var options = ensure(options || null);
		return function(req, res, next) {
			db.updateByPrimaryKey(table, req.params.id, req.body, function(err, result) {
				var data = null;
				res.status(err ? 500 : 200).send({ err, result, data });
			});
		};
	};

	//returns a response handler
	var del = function(table, options) {
		var options = ensure(options || null);
		return function(req, res, next) {
			db.deleteByPrimaryKey(table, req.params.id, function(err, result) {
				var data = null;
				res.status(err ? 500 : 200).send({ err, result, data });
			});
		};
	};

	//returns standardized crud router
	var router = function(table, options) {
		var options = ensure(options || null);
		var rtr = express.Router();
		rtr.route(`/${table}`)
			.post(create(table, options))
			.get(readAll(table, options));
		rtr.route(`/${table}/:id`)
			.get(read(table, options))
			.put(update(table, options))
			.delete(del(table, options));
		return rtr;
	};

	//up to you to mount all/any of these handlers/router
	return {
		router,
		create,
		readAll,
		read,
		update,
		delete: del
	};

};

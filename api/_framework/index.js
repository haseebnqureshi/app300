'use strict';

/*
.env variables

process.env.R_HOST
process.env.R_PORT
process.env.R_DATABASE || 'test'
process.env.EXPRESS_PORT
*/

var fs = require('fs-extra');

var path = require('path');

var moment = require('moment');

var _ = require('underscore');

var express = require('express');

var app = express();

var r = require('rethinkdb');

var bodyParser = require('body-parser');


/* CONFIG & INITIAL VARS */

var envPath = path.resolve(__dirname, '..', '.env');

fs.ensureFileSync(envPath);

require('dotenv').config({ path: envPath });










/* EXPORTS */

app.framework = require(path.resolve(__dirname, 'package.json'));

app.info = require(path.resolve(__dirname, '..', 'package.json'));

app.db = {

	/*
	please refer to the rethinkdb documentation. for convenience, here 
	are a few easy links:

	@see https://rethinkdb.com/docs/cookbook/javascript/
	@see https://rethinkdb.com/api/javascript/

	it's good and okay to use these methods when quickly starting out.
	but for projects that will continue in time, highly recommend using
	the actual rethink methods and queries, directly in your data 
	modeling. 

	that will allow for the greatest maintainability and stability
	for your app, without "black-boxing" some essential data logic.
	*/

	connection: null,

	all: function(table, callback) {
		r.table(table)
		  .run(this.connection, function(err, cursor) {
			if (err) {
				console.error(err);
				callback(err, null);
				return;
			}
			cursor.toArray(function(err, result) {
				if (err) {
					console.error(err);
				}
				callback(err, result);
			});
		});
	},

	connect: function(callback) {
		var that = this;
		r.connect({
			host: process.env.R_HOST || 'localhost',
			port: process.env.R_PORT || 28015,
			db: process.env.R_DATABASE || 'test'
		}, function(err, connection) {
			if (err) {
				console.error(err);
			}
			else {
				that.connection = connection;
			}
			callback(err);
		});
	},

	createTable: function(table, callback) {
		r.tableCreate(table)
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	deleteByPrimaryKey: function(table, pk, callback) {
		r.table(table)
		  .get(pk)
		  .delete()
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	deleteWhere: function(table, condition, callback) {
		r.table(table)
		  .filter(condition)
		  .delete()
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	dropTable: function(table, callback) {
		r.tableDrop(table)
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	filter: function(table, condition, callback) {
		r.table(table)
		  .filter(condition)
		  .run(this.connection, function(err, cursor) {
			if (err) {
				console.error(err);
				callback(err, null);
				return;
			}
			cursor.toArray(function(err, result) {
				if (err) {
					console.error(err);
				}
				callback(err, result);
			});
		});
	},

	getByPrimaryKey: function(table, pk, callback) {
		r.table(table)
		  .get(pk)
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			callback(err, result);
		});
	},

	insert: function(table, documents, callback) {
		r.table(table)
		  .insert(documents)
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	run: function(r, callback) {
		r.run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
				callback(err, result);
			}
			else {
				if (result.toArray) {
					result.toArray(function(err, result) {
						if (err) {
							console.error(err);
						}
						callback(err, result);
					});
				}
				else {
					callback(err, result);
				}
			}
		});
	},

	updateAll: function(table, values, callback) {
		r.table(table)
		  .update(values)
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	updateByPrimaryKey: function(table, pk, values, callback) {
		r.table(table)
		  .get(pk)
		  .update(values)
		  .run(this.connection, function(err, result) {
		  	if (err) {
		  		console.error(err);
		  	}
		  	if (callback) {
		  		callback(err, result);
		  	}
		  });
	},

	updateWhere: function(table, condition, values, callback) {
		r.table(table)
		  .filter(condition)
		  .update(values)
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	}

};

app.easyCrud = function(table) {
	var crud = express.Router();
	crud.route(`/${table}`)
		.post(function(req, res, next) {
			app.db.insert(table, req.body, function(err, result) {
				var data = null;
				return res.status(err ? 500 : 200).send({ err, result, data });
			});
		})
		.get(function(req, res, next) {
			app.db.all(table, function(err, data) {
				var result = null;
				return res.status(err ? 500 : 200).send({ err, result, data });
			});
		});
	crud.route(`/${table}/:id`)
		.get(function(req, res, next) {
			app.db.getByPrimaryKey(table, req.params.id, function(err, data) {
				var result = null;
				return res.status(err ? 500 : 200).send({ err, result, data });
			});
		})
		.put(function(req, res, next) {
			app.db.updateByPrimaryKey(table, req.params.id, req.body, function(err, result) {
				var data = null;
				return res.status(err ? 500 : 200).send({ err, result, data });
			});
		})
		.delete(function(req, res, next) {
			app.db.deleteByPrimaryKey(table, req.params.id, function(err, result) {
				var data = null;
				return res.status(err ? 500 : 200).send({ err, result, data });
			});
		});
	app.use('/', crud);
};

app.config = function() {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	return app;
};

app.run = function(callback) {
	app.listen(process.env.EXPRESS_PORT || 3000, function() {
		if (callback) {
			callback();
		}
	});
	return app;
};

module.exports = { app, express, bodyParser };

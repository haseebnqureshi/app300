'use strict';

var fs = require('fs-extra');

var path = require('path');

var moment = require('moment');

var _ = require('underscore');

var express = require('express');

var app = express();

var r = require('rethinkdb');

var uuidv5 = require('uuid/v5');

var bodyParser = require('body-parser');

var passport = require('passport');

var google = require('googleapis').google;

var LocalStrategy = require('passport-local').Strategy;

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


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

	close: function() {
		this.connection.close();
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
			if (callback) {
				callback(err, connection);
			}
		});
	},

	createTable: function(table, options, callback) {
		r.tableCreate(table, options || {})
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

	insert: function(table, documents, callback, uniqueness) {

		/*
		standardizing documents to be an array for easier 
		pre query transformations. 
		*/

		if (_.isObject(documents)) {
			documents = [documents];
		}

		/*
		according to rethinkdb's documentation, this hashes documents
		per their uuid v5 specifications, with their namespace
		91461c99-f89d-49d2-af96-d8e2e14e9b58
		
		@see https://www.rethinkdb.com/api/javascript/uuid/

		WARNING: careful with the uniquness here with updates 
		and maintaining uniquness. the easyCrud scripts do not 
		enforce uniqueness past the insertion point. 

		so for example, if on update the entire document exactly 
		matches another record, the changed document's id will not
		be updated to reflect that change, thereby potentially 
		having exactly matching documents, but with varying 
		primary keys. 

		either accept this or not, but the amount of logic to
		help enforce this, in a clean and less obtrusive way
		was enough to delegate it to the application's logic.
		*/

		if (uniqueness === true) {
			documents = _.map(documents, function(doc) {
				doc.id = uuidv5(
					JSON.stringify(_.omit(doc, 'id')), 
					'91461c99-f89d-49d2-af96-d8e2e14e9b58'
				);
				return doc;
			});	
		}

		r.table(table)
		  .insert(documents, { returnChanges: true })
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
		  .update(values, { returnChanges: true })
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
		  .update(values, { returnChanges: true })
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

app.auth = {

	google: {
		scopes: [
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/userinfo.email',
		]
	},

	config: function(userTable, useGoogle) {
		app.use(passport.initialize());
		app.use(passport.session());
		this.configDeserializeUser(userTable);
		this.configSerializeUser(userTable);
		if (useGoogle) {
			this.configGoogleStrategy(userTable);
		}
	},

	configDeserializeUser: function(userTable) {
		passport.deserializeUser(function(id, done) {
			app.db.getByPrimaryKey(userTable, id, done);
		});
	},

	configGoogleStrategy: function(userTable) {
		passport.use(new GoogleStrategy({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
			passReqToCallback: true
		}, function(req, access_token, refresh_token, profile, done) {

			var dbCallback = function(err, result) {
				if (err) {
					return done(err);
				}
				req.login(req.user, function(err) {
					return done(err || null, err ? null : req.user);
				});
			};
		
			//no pre-existing account to associate, so creating new user...
			if (!req.user) {
				req.user = _.omit(profile, 'id', '_raw', '_json', 'name', 'emails', 'photos');
				req.user.family_name = profile.name.familyName;
				req.user.given_name = profile.name.givenName;
				req.user.google_id = profile.id;
				req.user.google = profile._json;
				req.user.google_token = access_token;
				req.user.google_refresh_token = refresh_token;
				req.user.id = req.user.email = profile.emails[0].value;
				req.user.photo = profile.photos[0].value;
				req.user = _.mapObject(req.user, function(value) {
					if (value === undefined) {
						return null;
					}
					return value;
				});
				app.db.insert(userTable, req.user, dbCallback);
			}

			//need to associate accounts, so let's update our user...
			else {
				var values = {};
				values.google_id = profile.id;
				values.google = profile._json;
				values.google_token = access_token;
				values.google_refresh_token = refresh_token;
				app.db.updateByPrimaryKey(userTable, req.user.id, values, dbCallback);
			}
		}));
	},

	configSerializeUser: function(userTable) {
		passport.serializeUser(function(user, done) {
			console.log(user);
			done(null, user.id);
		});
	},

	isAuthenticated: function(req) {
		return req.isAuthenticated();
	}

};

app.easy = {

	crud: function(table, options) {
		var options = _.extend({ 
			uniqueness: false
		}, options || {});

		var crud = express.Router();
		crud.route(`/${table}`)
			.post(function(req, res, next) {
				app.db.insert(table, req.body, function(err, result) {
					var data = null;
					var status = err ? 500 : (result.errors > 0 ? 400 : 200);
					res.status(status).send({ err, result, data });
				}, options.uniqueness === true ? true : false);
			})
			.get(function(req, res, next) {
				app.db.all(table, function(err, data) {
					var result = null;
					var status = err ? 500 : (data ? 200 : 404);
					res.status(status).send({ err, result, data });
				});
			});
		crud.route(`/${table}/:id`)
			.get(function(req, res, next) {
				app.db.getByPrimaryKey(table, req.params.id, function(err, data) {
					var result = null;
					var status = err ? 500 : (data ? 200 : 404);
					res.status(status).send({ err, result, data });
				});
			})
			.put(function(req, res, next) {
				app.db.updateByPrimaryKey(table, req.params.id, req.body, function(err, result) {
					var data = null;
					res.status(err ? 500 : 200).send({ err, result, data });
				});
			})
			.delete(function(req, res, next) {
				app.db.deleteByPrimaryKey(table, req.params.id, function(err, result) {
					var data = null;
					res.status(err ? 500 : 200).send({ err, result, data });
				});
			});
		app.use('/', crud);
		return crud;
	},

	bearerAuth: function(userTable) {

		var check = function(req, res, next) {
			try {
				var bearer = req.get('Authorization').split('Bearer ')[1];
				req.accessToken = bearer.split(':')[0] || '';
				req.secretToken = bearer.split(':')[1] || '';
			}
			catch (err) {
				return res.status(401).send({ message: 'Authorization failed, potentially missing credentials or expired / invalid credentials!' });
			}

			app.db.filter(userTable, {
				access_token: req.accessToken,
				secret_token: req.secretToken
			}, function(err, result) {
				console.log({ err, result })
				if (err || result.length === 0) {
					return res.status(422).send({ message: 'Authorization failed, credentials seem invalid!' })
				}
				req.user = _.omit(result[0], 'access_token', 'secret_token');
				next();
			});

		};

		return check;
	},

	config: function() {
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: false }));
		return app;
	},

	google: function(userTable, request, callback, detach, successRedirect, failureRedirect) {
		
		//first page that redirects user to google login...
		app.get(request, passport.authenticate('google', {
			scope: app.auth.google.scopes
		}));

		//upon user google login, callback to application...
		// app.get(callback, passport.authenticate('google', {
		// 	successRedirect,
		// 	failureRedirect
		// }));

		app.get(callback, passport.authenticate('google'), function(req, res, next) {
			console.log('received callback!', req);

		});

		/*
		endpoint disconnecting google account from application...
		user doesn't have to actually visit the page, can be done via ajax or 
		serverside, unlike the above two endpoints.
		*/

		app.get(detach, function(req, res, next) {
			return req.isAuthenticated() ? next() : res.status(401).send({ message: 'Sorry, you\'re not logged in!' });
		}, function(req, res, next) {
			
			//if no google accounts linked...
			if (!req.user.google_id) {
				return res.status(200).send({ message: 'No google accounts linked...' });
			}

			app.db.updateByPrimaryKey(userTable, req.user.id, { 
				google: null,
				google_id: null
			}, function(err, result) {
				if (err) {
					return res.status(500).send({ message: 'Something went wrong when detaching your Google account.' });
				}
				return res.status(200).send({ message: 'Successfully detached your Google account!' });
			});
		});
	}

};

app.run = function(callback) {
	app.listen(process.env.EXPRESS_PORT || 3000, function() {
		if (callback) {
			callback();
		}
	});
	return app;
};

module.exports = { app, express, bodyParser, r };

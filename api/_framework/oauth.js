// 'use strict';

// var bodyParser = require('body-parser');

// var _ = require('underscore');

// var passport = require('passport');

// var google = require('googleapis').google;

// var LocalStrategy = require('passport-local').Strategy;

// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// module.exports = function(app, db) {

// 	return {

// 		config: function() {
// 			app.use(bodyParser.json());
// 			app.use(bodyParser.urlencoded({ extended: false }));
// 			return app;
// 		},

// 		google: function(userTable, request, callback, detach, successRedirect, failureRedirect) {
			
// 			//first page that redirects user to google login...
// 			app.get(request, passport.authenticate('google', {
// 				scope: app.auth.google.scopes
// 			}));

// 			//upon user google login, callback to application...
// 			// app.get(callback, passport.authenticate('google', {
// 			// 	successRedirect,
// 			// 	failureRedirect
// 			// }));

// 			app.get(callback, passport.authenticate('google'), function(req, res, next) {
// 				console.log('received callback!', req);

// 			});

// 			/*
// 			endpoint disconnecting google account from application...
// 			user doesn't have to actually visit the page, can be done via ajax or 
// 			serverside, unlike the above two endpoints.
// 			*/

// 			app.get(detach, function(req, res, next) {
// 				return req.isAuthenticated() ? next() : res.status(401).send({ message: 'Sorry, you\'re not logged in!' });
// 			}, function(req, res, next) {
				
// 				//if no google accounts linked...
// 				if (!req.user.google_id) {
// 					return res.status(200).send({ message: 'No google accounts linked...' });
// 				}

// 				db.updateByPrimaryKey(userTable, req.user.id, { 
// 					google: null,
// 					google_id: null
// 				}, function(err, result) {
// 					if (err) {
// 						return res.status(500).send({ message: 'Something went wrong when detaching your Google account.' });
// 					}
// 					return res.status(200).send({ message: 'Successfully detached your Google account!' });
// 				});
// 			});
// 		}

// 	};

// };



// app.auth = {

// 	google: {
// 		scopes: [
// 			'https://www.googleapis.com/auth/plus.login',
// 			'https://www.googleapis.com/auth/userinfo.email',
// 		]
// 	},

// 	config: function(userTable, useGoogle) {
// 		app.use(passport.initialize());
// 		app.use(passport.session());
// 		this.configDeserializeUser(userTable);
// 		this.configSerializeUser(userTable);
// 		if (useGoogle) {
// 			this.configGoogleStrategy(userTable);
// 		}
// 	},

// 	configDeserializeUser: function(userTable) {
// 		passport.deserializeUser(function(id, done) {
// 			app.db.getByPrimaryKey(userTable, id, done);
// 		});
// 	},

// 	configGoogleStrategy: function(userTable) {
// 		passport.use(new GoogleStrategy({
// 			clientID: process.env.GOOGLE_CLIENT_ID,
// 			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// 			callbackURL: process.env.GOOGLE_CALLBACK_URL,
// 			passReqToCallback: true
// 		}, function(req, access_token, refresh_token, profile, done) {

// 			var dbCallback = function(err, result) {
// 				if (err) {
// 					return done(err);
// 				}
// 				req.login(req.user, function(err) {
// 					return done(err || null, err ? null : req.user);
// 				});
// 			};
		
// 			//no pre-existing account to associate, so creating new user...
// 			if (!req.user) {
// 				req.user = _.omit(profile, 'id', '_raw', '_json', 'name', 'emails', 'photos');
// 				req.user.family_name = profile.name.familyName;
// 				req.user.given_name = profile.name.givenName;
// 				req.user.google_id = profile.id;
// 				req.user.google = profile._json;
// 				req.user.google_token = access_token;
// 				req.user.google_refresh_token = refresh_token;
// 				req.user.id = req.user.email = profile.emails[0].value;
// 				req.user.photo = profile.photos[0].value;
// 				req.user = _.mapObject(req.user, function(value) {
// 					if (value === undefined) {
// 						return null;
// 					}
// 					return value;
// 				});
// 				app.db.insert(userTable, req.user, dbCallback);
// 			}

// 			//need to associate accounts, so let's update our user...
// 			else {
// 				var values = {};
// 				values.google_id = profile.id;
// 				values.google = profile._json;
// 				values.google_token = access_token;
// 				values.google_refresh_token = refresh_token;
// 				app.db.updateByPrimaryKey(userTable, req.user.id, values, dbCallback);
// 			}
// 		}));
// 	},

// 	configSerializeUser: function(userTable) {
// 		passport.serializeUser(function(user, done) {
// 			console.log(user);
// 			done(null, user.id);
// 		});
// 	},

// 	isAuthenticated: function(req) {
// 		return req.isAuthenticated();
// 	}

// };
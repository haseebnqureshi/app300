'use strict';

var r = require('rethinkdb');

var _ = require('underscore');

module.exports = function(db) {

	var bearerToken = function(userTable, tokensTable) {

		return function(req, res, next) {

			//ensuring we already have our db connection
			if (!db.connection) {
				return res.status(500).send({ message: 'Somehow not connected to our database!' });
			}

			//safely checking for bearer tokena in authorization header
			try {
				var bearer = req.get('Authorization').split('Bearer ')[1];
				req.access_token = bearer.split(':')[0] || '';
				req.secret_token = bearer.split(':')[1] || '';
			}

			//otherwise we send an informative error
			catch (err) {
				return res.status(401).send({ message: 'Authorization failed, potentially missing credentials or expired / invalid credentials!' });
			}

			//crafting joined query between users and tokens
			var reql = r.table(userTable)
				.eq_join(userTable + '_id', r.table(tokensTable))

				//searching for the joined document with our provided tokens
				.filter({
					access_token: req.access_token,
					secret_token: req.secret_token
				});

			//then executing the query
			db.run(reql, function(err, result) {

				//error'd out or didn't find any matching creds
				if (err || result.length === 0) {
					return res.status(422).send({ message: 'Authorization failed, credentials seem invalid!' })
				}

				//now loading our found user
				req.user = result[0];

				next();

			});

		};

	};

	//returning middleware to be used on any route/router/app
	return {
		bearerToken
	};

};

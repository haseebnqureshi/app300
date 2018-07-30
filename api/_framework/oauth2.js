'use string';

var querystring = require('querystring');

var unirest = require('unirest');

var _ = require('underscore');

var providers = require(__dirname, 'oauth2.json');

//@see https://aaronparecki.com/oauth-2-simplified/
//@see https://github.com/simov/grant/blob/master/lib/flow/oauth2.js

module.exports = function(express, app, db) {


	var loadProvider = function(options) {

		//ensuring we have an object
		var options = options || {};

		//attempting to find an already recognized provider
		var provider = providers[options.provider] || {};

		//setting some defaults
		provider = _.extend(provider, {
			client_id: ''
			response_type: 'code',
			redirect_uri: '',
			state: ''

		})

		//then loading in all of the options as overriding vars
		return _.extend(provider, options);

	};

	var authorize = function(options) {
		var provider = loadProvider(options || null);



	};

	var access = function() {

	};

	var connect = function(options) {
		return function(req, res, next) {
			authorize(options);
		};
	};

	var callback = function() {

	};

	var detach = function() {

	};



	var router = function(providerName, options) {



	};




	var authorizeQuery = function(provider, params redirect_uri, scopes, state, custom_params) {


		var params = _.extend({
			client_id: provider.key,
			response_type: 'code',
			redirect_uri,
			scope: scopes.join(provider.scope_delimeter),
			state
		})


		var params = {
		};






		if (provider.custom_parameters) {
			_.each(provider.custom_parameters, function(param) {
				params[param] = param;
			});		
		}

		var qs = querystring.stringify(params);
		return url + '?' + qs;
	}


	var authorize = function(provider)











	var router = function(provider) {

		var authorizeUrl = 'https://accounts.google.com/o/oauth2/auth';
		var accessUrl = 'https://accounts.google.com/o/oauth2/token';
		var redirect_uri = process.env.GOOGLE_CALLBACK_URL;
		var client_id = process.env.GOOGLE_CLIENT_ID;
		var client_secret = process.env.GOOGLE_CLIENT_SECRET;
		var state = '531be960-f6cc-4ab3-a7bf-e6e6575d9ad4';

		app.get('/connect/google', function(req, res) {
			var url = authorizeUrl + '?' + querystring.stringify({
				response_type: 'code',
				client_id,
				redirect_uri,
				access_type: 'offline',
				scope: [
					'https://www.googleapis.com/auth/plus.login',
					'https://www.googleapis.com/auth/userinfo.profile',
				].join(' '),
				state
			});
			res.status(200).send({ url });
		});


		app.get('/connect/google/callback', function(req, res) {

			if (!req.query) { 
				return res.status(500).send();
			}

			var code = req.query.code;

			if (req.query.state !== state) {
				return res.status(400).send({ message: 'State did not match from oAuth2 request to callback!' });
			}

			var accessArgs = {
				grant_type: 'authorization_code',
				code,
				redirect_uri,
				client_id,
				client_secret
			};

			unirest.post(accessUrl).send(accessArgs).end(function(response) {
				if (response.error) {
					return res.status(500).send({ error: response.error });
				}
				var body = response.body;
				var access_token = body.access_token;
				var expries_in = body.expires_in;
				var scope = body.scope;
				var token_type = body.token_type;

				res.status(200).send(body);

			});

		});




	};



	return {
		router
	}

};

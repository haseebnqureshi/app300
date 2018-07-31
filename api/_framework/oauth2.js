'use string';

var querystring = require('querystring');

var unirest = require('unirest');

var _ = require('underscore');

var providers = require(__dirname, 'oauth2.json');

//@see https://aaronparecki.com/oauth-2-simplified/
//@see https://github.com/simov/grant/blob/master/lib/flow/oauth2.js

module.exports = function(express, app, db) {

	var flowProvider = function(options) {
		var options = options || {};
		var providerName = options.provider;
		var provider = providers[providerName] || {};
		return provider;
	};

	var flowAuthorizeExceptions = function(params) {
		return params;
	};

	var flowAuthorize = function(options) {
		var options = options || {};
		var provider = flowProvider(options);
		var params = _.extend(provider, options);
		params.state = '531be960-f6cc-4ab3-a7bf-e6e6575d9ad4';
		params.response_type = 'code';
		params.scope = params.scopes.join(provider.scope_delimeter);
		params = flowAuthorizeExceptions(params);

		//there may be number of extra params, so we whitelist what we know
		params = _.pick(params, [
			'response_type', 
			'redirect_uri', 
			'scope',
			'state',
			'client_id',
			... provider.custom_parameters || []
		]);
		return provider.authorize_url + '?' + querystring.stringify(params);
	};

	var flowAccess = function(options, callback) {
		var options = options || {};
		var provider = flowProvider(options);

		//only a set of params, statically setting our payload
		unirest.post(provider.access_url).send({
			grant_type: 'authorization_code',
			code: options.code,
			redirect_uri: options.redirect_uri,
			client_id: options.client_id,
			client_secret: options.client_secret
		}).end(function(response) {
			callback(response);
		});
	};

	var connect = function(options) {
		return function(req, res, next) {
			var url = flowAuthorize(options || null);
			res.status(200).send({ url });
		};
	};

	var callback = function(options) {
		var options = options || {};
		return function(req, res, next) {

			//ensuring we have a returned query
			if (!req.query) { 
				return res.status(500).send();
			}

			//next ensuring we have some code provided
			options.code = req.query.code;
			if (!options.code) {
				return res.status(400).send({ message: 'No code provided to callback!' });
			}

			//matching our states, which right now are statically coded
			var state = '531be960-f6cc-4ab3-a7bf-e6e6575d9ad4';
			if (req.query.state !== state) {
				return res.status(400).send({ message: 'State did not match from oAuth2 request to callback!' });
			}

			//finally, posting to receive our access token
			flowAccess(options, function(response) {

				//somehow our access token didn't work out
				if (response.error) {
					return res.status(500).send({ error: response.error });
				}

				//otherwise, persist what we've got back
				var body = response.body;
				var access_token = body.access_token;
				var expries_in = body.expires_in;
				var scope = body.scope;
				var token_type = body.token_type;

				res.status(200).send(body);
			});
		};
	};

	var detach = function(options) {
		return function(req, res, next) {
			res.status(500).send({ message: 'Not finished yet!' });
		};
	};

	var router = function(options) {
		var options = options || {};
		var providerName = options.provider;
		var rtr = express.Router();
		rtr.route(`/connect/${providerName}`)
			.get(connect(options));
		rtr.route(`/connect/${providerName}/callback`)
			.get(callback(options));
		rtr.route(`/connect/${providerName}/detach`)
			.get(detach(options));
		return rtr;
	};

	return {
		router,
		flowProvider,
		flowAuthorize,
		flowAuthorizeExceptions,
		connect,
		callback,
		detach
	};



	// var router = function(provider) {

	// 	var authorizeUrl = 'https://accounts.google.com/o/oauth2/auth';
	// 	var accessUrl = 'https://accounts.google.com/o/oauth2/token';
	// 	var redirect_uri = process.env.GOOGLE_CALLBACK_URL;
	// 	var client_id = process.env.GOOGLE_CLIENT_ID;
	// 	var client_secret = process.env.GOOGLE_CLIENT_SECRET;
	// 	var state = '531be960-f6cc-4ab3-a7bf-e6e6575d9ad4';

	// 	app.get('/connect/google', function(req, res) {
	// 		var url = authorizeUrl + '?' + querystring.stringify({
	// 			response_type: 'code',
	// 			client_id,
	// 			redirect_uri,
	// 			access_type: 'offline',
	// 			scope: [
	// 				'https://www.googleapis.com/auth/plus.login',
	// 				'https://www.googleapis.com/auth/userinfo.profile',
	// 			].join(' '),
	// 			state
	// 		});
	// 		res.status(200).send({ url });
	// 	});


	// 	app.get('/connect/google/callback', function(req, res) {

	// 		if (!req.query) { 
	// 			return res.status(500).send();
	// 		}

	// 		var code = req.query.code;

	// 		if (req.query.state !== state) {
	// 			return res.status(400).send({ message: 'State did not match from oAuth2 request to callback!' });
	// 		}

	// 		var accessArgs = {
	// 			grant_type: 'authorization_code',
	// 			code,
	// 			redirect_uri,
	// 			client_id,
	// 			client_secret
	// 		};

	// 		unirest.post(accessUrl).send(accessArgs).end(function(response) {
	// 			if (response.error) {
	// 				return res.status(500).send({ error: response.error });
	// 			}
	// 			var body = response.body;
	// 			var access_token = body.access_token;
	// 			var expries_in = body.expires_in;
	// 			var scope = body.scope;
	// 			var token_type = body.token_type;

	// 			res.status(200).send(body);

	// 		});

	// 	});

	// };

};

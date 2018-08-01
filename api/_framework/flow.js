'use string';

var request = require('request');

//@see https://aaronparecki.com/oauth-2-simplified/
//@see https://github.com/simov/grant/blob/master/lib/flow/oauth2.js

/*
any options passed through to these callbacks can be passed the following. 
please keep in mind, this only supports oauth2.0:

options = {
	provider: 'slug-or-identifier-for-your-oauth2-connection', //optional, but required for router (this becomes your route paths)
	authorize_url: '', 
	access_url: '',
	client_id: '',
	client_secret: '',
	redirect_uri: '', //url for your callback from oauth2 provider
	scope: '', //typically each scope separated by space
	state: '', //optional
	response_type: '', //optional, defaults to 'code'
	grant_type: '', //optional, defaults to 'authorization_code'
	custom_parameters: [], //optional, whitelisted values for querystring url
	... //optional, other key/value for authorization querystring url
	connect: function(err, data, req, res) {}, //optional for router function
	callback: function(err, data, req, res) {} //optional for router function
};

*/

module.exports = function(express, oauth2, identity) {

	var connect = function(options, callback /* (err, data, req, res) */) {
		var options = options || {};
		return function(req, res) {
			var url = oauth2.authorize(
				options.authorize_url,
				options,
				options.custom_parameters || []
			);
			return callback(null, { url }, req, res);
		};
	};

	var callback = function(options, callback /* (err, data, req, res) */) {
		var options = options || {};
		return function(req, res) {

			//ensuring we have obtained our oauth2 code
			try {
				var query = req.query;
				options.code = query.code;
			}
			catch(err) {
				return callback(err, null, req, res);
			}

			//ensuring our states match
			var state = options.state || '531be960-f6cc-4ab3-a7bf-e6e6575d9ad4';
			if (req.query.state !== state) {
				return callback('State did not match!', null, req, res);
			}

			//posting authorization code against access_url to obtain access_token
			try {
				oauth2.access(
					options.access_url,
					options,
					function(err, json, response) {

						//if access_token didn't work out
						if (err) {
							return callback(err, null, req, res);
						}

						//...otherwise we've got our access_token
						var body = JSON.parse(json);

						//let's see if we've been instructed to get an identity
						if (options.identity) {
							identity.get(options.provider, body.access_token, function(err, profile) {
								if (err) {
									return callback(err, body, req, res);
								}
								body.profile = profile;
								return callback(null, body, req, res);
							});
						}

						//go ahead and callback if we're not async fetching an identity...
						else {
							return callback(null, body, req, res);
						}
					});
			}
			catch(err) {
				return callback(err, null, req, res);
			}

		};
	};

	var router = function(options) {
		var options = options || {};
		var rtr = express.Router();
		rtr.route(`/connect/${options.provider}`)
			.get(connect(options, options.connect || function(err, data, req, res) {
				return res.status(err ? 500 : 200).send(err ? err : data);
			}));
		rtr.route(`/connect/${options.provider}/callback`)
			.get(callback(options, options.callback || function(err, data, req, res) {
				return res.status(err ? 500 : 200).send(err ? err : data);
			}));
		return rtr;
	};

	return {
		connect,
		callback,
		router
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

'use string';

var querystring = require('querystring');

var request = require('request');

var _ = require('underscore');

//@see https://aaronparecki.com/oauth-2-simplified/
//@see https://github.com/simov/grant/blob/master/lib/flow/oauth2.js

module.exports = function() {

	var ensureAuthorizeOptions = function(options, custom_parameters /* arr */) {
		var options = _.pick(options || {}, [
			'response_type',
			'redirect_uri',
			'scope',
			'state',
			'client_id',
			... custom_parameters || []
		]);
		if (!options.response_type) {
			options.response_type = 'code';
		}
		if (!options.state) {
			options.state = '531be960-f6cc-4ab3-a7bf-e6e6575d9ad4';
		}
		return options;
	};

	var authorize = function(url, options, custom_parameters /* arr */) {
		var params = ensureAuthorizeOptions(options, custom_parameters);
		return url + '?' + querystring.stringify(params);
	};

	var ensureAccessOptions = function(options) {
		var options = _.pick(options || {}, [
			'grant_type',
			'code',
			'redirect_uri',
			'client_id',
			'client_secret'
		]);
		if (!options.grant_type) {
			options.grant_type = 'authorization_code';
		}
		return options;
	};

	var access = function(url, options, callback /* (err, body, response) */) {
		var form = ensureAccessOptions(options || {});
		request.post({ url, form }, function(error, httpResponse, body) {
			return callback(error, body, httpResponse);
		});
	};

	return {
		ensureAuthorizeOptions,
		authorize,
		ensureAccessOptions,
		access
	};

};

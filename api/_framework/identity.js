'use string';

var request = require('request');

module.exports = function() {

	var get = function(provider, access_token, callback /* (err, data) */) {

		switch(provider) {
			case 'google':
				var url = 'https://www.googleapis.com/plus/v1/people/me';
				break;
			default:
				return callback('Provider not registered for identity...', null);
		}
		request({ 
			url,
			headers: {
				Authorization: `Bearer ${access_token}`
			}
		}, function(err, httpResponse, json) {
			if (err) {
				return callback(err, null);
			}
			var body = JSON.parse(json);
			return callback(null, body);
		});
	};

	return {
		get
	};

};

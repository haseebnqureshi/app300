'use strict';

var framework = require('./_framework');

var app = framework.app;

framework.config();

app.get('/', function(req, res) {
	res.status(200).send({
		info: {
			app: app.info,
			framework: framework.info
		}
	});
});

module.exports = framework.run(app);

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

var i = 0;
setInterval(function() {
	console.log('app', i);
	i++
}, 10 * 1000);

module.exports = framework.run(app);

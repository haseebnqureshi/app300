'use strict';

var framework = require('./_framework');

var app = framework.app;

app.easyConfig();

app.get('/', function(req, res) {
	var appInfo = app.info;
	var frameworkInfo = app.framework;
	res.status(200).send({ appInfo, frameworkInfo });
});

app.db.connect(function(err) {

	app.easyCrud('users', { uniqueness: true });

	app.easyCrud('items', { uniqueness: true });

});

app.easyAuth();

app.get('/auth-required', function(req, res) {
	var appInfo = app.info;
	var frameworkInfo = app.framework;
	res.status(200).send({ access: req.accessToken, secret: req.secretToken, appInfo, frameworkInfo });
});

app.run();

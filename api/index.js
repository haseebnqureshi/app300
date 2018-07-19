'use strict';

var framework = require('./_framework');

var app = framework.app;

app.config();

app.get('/', function(req, res) {
	var appInfo = app.info;
	var frameworkInfo = app.framework;
	res.status(200).send({ appInfo, frameworkInfo });
});

app.db.connect(function(err) {

	app.easyCrud('users');

	app.easyCrud('items');

});

app.run();

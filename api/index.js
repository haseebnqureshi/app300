'use strict';

var framework = require('./_framework');

var app = framework.app;

app.easy.config();

app.get('/', function(req, res) {
	var appInfo = app.info;
	var frameworkInfo = app.framework;
	res.status(200).send({ appInfo, frameworkInfo });
});

app.db.connect(function(err) {

	app.easy.crud('users', { uniqueness: true });

	app.easy.crud('items', { uniqueness: true });

	app.easy.auth('users');

	app.auth.config('users', true);

	app.easy.google('users', 
		'/auth/google',
		'/auth/google/callback',
		'/auth/google/detach',
		'/',
		'/'
	);

	app.get('/auth-required', function(req, res) {
		var appInfo = app.info;
		var frameworkInfo = app.framework;
		res.status(200).send({ user: req.user, appInfo, frameworkInfo });
	});

});

app.run();

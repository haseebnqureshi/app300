'use strict';

var framework = require('./_framework');

var app = framework.app;

app.db.connect(function(err) {

	console.log({ err });

	app.db.createTable('users');

	app.db.createTable('items');

	app.db.close();

});
'use strict';

var framework = require('./_framework');

var app = framework.app;

framework.db.connect(function(err) {

	console.log({ err });

	framework.db.createTable('users');

	framework.db.createTable('items');

	framework.db.createTable('tokens');

	framework.db.close();

});
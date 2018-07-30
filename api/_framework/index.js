'use strict';

var fs = require('fs-extra');

var path = require('path');

var _ = require('underscore');

var express = require('express');

var app = express();

app.info = require(path.resolve(__dirname, '..', 'package.json'));

var bodyParser = require('body-parser');

var db = require(path.resolve(__dirname, 'db.js'))(
	process.env.R_HOST || 'localhost',
	process.env.R_PORT || 28015,
	process.env.R_DATABASE || 'test'
);


/* CONFIG & INITIAL VARS */

var envPath = path.resolve(__dirname, '..', '.env');

fs.ensureFileSync(envPath);

require('dotenv').config({ path: envPath });


/* EXPORTS */

module.exports = {

	express,

	app,

	db,

	config: function() {
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));
	},

	run: function(callback) {
		app.listen(process.env.EXPRESS_PORT || 3000, function() {
			if (callback) {
				callback();
			}
		})
	},

	info: require(path.resolve(__dirname, 'package.json')),

	crud: require(path.resolve(__dirname, 'crud.js'))(express, app, db),

	auth: require(path.resolve(__dirname, 'auth.js'))(db),

	oauth2: require(path.resolve(__dirname, 'oauth2.js'))(express, app, db)

};

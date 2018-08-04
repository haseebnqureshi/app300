'use strict';

var fs = require('fs-extra');

var path = require('path');

var _ = require('underscore');

var express = require('express');

var session = require('express-session');

var flash = require('connect-flash');

var app = express();

app.info = require(path.resolve(__dirname, '..', 'package.json'));

var bodyParser = require('body-parser');


/* CONFIG & INITIAL VARS */

var envPath = path.resolve(__dirname, '..', '.env');

fs.ensureFileSync(envPath);

require('dotenv').config({ path: envPath });


/* EXPORTS */

module.exports = {

	express,

	app,

	config: function() {
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));
		this.app.set('view engine', 'pug');
		this.app.set('views', path.resolve(__dirname, '..', 'views'));
		this.app.use(express.static(path.resolve(__dirname, '..', 'www')));
		this.app.use(session({
			secret: 'app300',
			resave: false,
			saveUnitialized: true
		}));
		this.app(flash());
	},

	/*
	framework decides whether app will run standalone, or with
	the app on one port and different mounting paths. this is
	useful for running both api and app on port 443, for i.e.
	*/

	run: function(a, callback) {
		if (process.env.EXPRESS_APP_PATH && process.env.EXPRESS_APP_PATH !== '') { 
			return {
				app: a,
				path: process.env.EXPRESS_APP_PATH
			}; 
		}
		a.listen(process.env.EXPRESS_APP_PORT || 8080, function() {
			if (callback) {
				callback();
			}
		});
	},

	info: require(path.resolve(__dirname, 'package.json'))

};


// var paths = {
// 	login: '/login',
// 	register: '/register',
// 	app: '/app',
// 	logout: '/logout',
// 	account: '/account',
// 	authGoogle: '/auth/google',
// 	authLocal: '/auth/local',
// 	detachGoogle: '/detach/google'
// };


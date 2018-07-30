'use strict';

var fs = require('fs-extra');

var path = require('path');

var express = require('express');

var app = express();


/* SUB APPS */

var subApiPath = path.resolve(__dirname, '..', 'api');

var subApi = require(subApiPath);

var subAppPath = path.resolve(__dirname, '..', 'app');

var subApp = require(subAppPath);


/* CONFIG & INITIAL VARS */

var envPath = path.resolve(__dirname, '.env');

fs.ensureFileSync(envPath);

//loading after sub apps to override any potential env vars
require('dotenv').config({ path: envPath });


/* MOUNTING & STARTING */

try {
	app.use(subApi.path, subApi.app);
	app.use(subApp.path, subApp.app);
	app.listen(process.env.EXPRESS_PORT || 443);
}
catch(err) {
	console.error(err);
	console.error(`Whoops! Suspecting either EXPRESS_API_PATH or EXPRESS_APP_PATH weren't set in the api and app sub applications. Easy fix, go add these paths into your .env files. Also if you want the app to run on your root path, simply use / and prefix the api to use /api.`);
}

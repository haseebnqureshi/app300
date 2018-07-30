
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

//if none is provided, defaulted to 443
process.env.EXPRESS_PORT = process.env.EXPRESS_PORT || 443;


/* MOUNTING & STARTING */

try {
	app.use(subApi.path, subApi.app);
	app.use(subApp.path, subApp.app);
}
catch(err) {
	console.error(err);
	console.error(`Whoops! Suspecting either EXPRESS_API_PATH or EXPRESS_APP_PATH weren't set in the api and app sub applications. Easy fix, go add these paths into your .env files. Also if you want the app to run on your root path, simply use / and prefix the api to use /api.`);
}

if (process.env.EXPRESS_PORT === 443) {
	var key = fs.readFileSync(path.resolve(__dirname, 'key.pem')) || null;
	var cert = fs.readFileSync(path.resolve(__dirname, 'cert.pem')) || null;
	require('https').createServer({ key, cert }, app).listen(443);
}
else {
	app.listen(process.env.EXPRESS_PORT);
}

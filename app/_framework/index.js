'use strict';

/*
.env variables

*/

var fs = require('fs-extra');

var path = require('path');

// var exec = require('child_process').exec;

// var moment = require('moment');

// var scheduler = require('node-schedule');

// var aws = require('aws-sdk');

// var _ = require('underscore');


/* CONFIG & INITIAL VARS */

var envPath = path.resolve(__dirname, '..', '.env');

fs.ensureFileSync(envPath);

require('dotenv').config({ path: envPath });

// aws.config.update({ 
// 	accessKeyId: process.env.AWS_ACCESS_KEY,
// 	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
// });

// var s3 = new aws.S3();


/* EXPORTS */

module.exports = {

	// dumpFilepath: path.resolve(__dirname, '..', 'rethinkdb.tar.gz'),

	info: require(path.resolve(__dirname, 'package.json')),

	// restoreFilepath: path.resolve(__dirname, '..', 's3-rethinkdb.tar.gz'),

	// s3Acl: 'private',

	// s3Marker: 'database/',

	// timestamp: moment().format(),

	// download: function(Key, callback) {
	// 	if (this.noCredentials()) { return; }
	// 	var that = this;
	// 	s3.getObject({
	// 		Bucket: process.env.S3_BUCKET_NAME,
	// 		Key
	// 	}, function(err, data) {
	// 		if (err) {
	// 			console.error(err);
	// 		}
	// 		else {
	// 			fs.writeFileSync(that.restoreFilepath, data.Body);
	// 		}
	// 		if (callback) {
	// 			callback(err, data);
	// 		}
	// 	});
	// },

	// dump: function(callback) {
	// 	exec(`rethinkdb dump --file ${this.dumpFilepath} --overwrite-file`, function(err, stdout, stderr) {
	// 		if (err) {
	// 			console.error(err);
	// 		}		
	// 		if (callback) { 
	// 			callback(err, stdout, stderr);
	// 		}
	// 	});
	// },

	// initialDump: function(callback) {
	// 	if (this.noCredentials()) { return; }
	// 	var that = this;
	// 	this.dump(function() {
	// 		that.upload(function() {
	// 			if (callback) {
	// 				callback();
	// 			}
	// 		});
	// 	});
	// },

	// noCredentials: function() {
	// 	if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.S3_BUCKET_NAME) {
	// 		console.error('app300-database: Missing AWS credentials and or S3 bucket name!');
	// 		return true;
	// 	}
	// 	return false;
	// },

	// noRestoreFile: function() {
	// 	if (!fs.pathExistsSync(this.restoreFilepath)) {
	// 		console.error('no file to restore! moving on...');
	// 		return true;
	// 	}
	// 	return false;
	// },

	// periodicDump: function() {
	// 	var that = this;
	// 	if (this.noCredentials()) { return; }
	// 	scheduler.scheduleJob(process.env.S3_BACKUP_SCHEDULE || '* 0 * * *', function() {
	// 		that.dump(function() {
	// 			that.upload();
	// 		});
	// 	});
	// },

	// restore: function(callback) {
	// 	if (this.noRestoreFile()) { return; }
	// 	exec(`rethinkdb restore ${this.restoreFilepath} --force`, function(err, stdout, stderr) {
	// 		if (err) {
	// 			console.error(err);
	// 		}
	// 		if (callback) { 
	// 			callback(err, stdout, stderr);
	// 		}
	// 	});
	// },

	// s3Key: function() {
	// 	return `${this.s3Marker}rethinkdb_${this.timestamp}.tar.gz`;
	// },

	// scan: function(callback) {
	// 	if (this.noCredentials()) { return; }
	// 	s3.listObjects({
	// 		Bucket: process.env.S3_BUCKET_NAME,
	// 		Marker: this.s3Marker
	// 	}, function(err, data) {
	// 		if (err) {
	// 			console.error(err);
	// 		}
	// 		if (callback) {
	// 			callback(err, data);
	// 		}
	// 	});
	// },

	// upload: function(callback) {
	// 	if (this.noCredentials()) { return; }
	// 	var contents = fs.readFileSync(this.dumpFilepath);
	// 	var body = new Buffer(contents, 'binary');
	// 	s3.putObject({
	// 		Bucket: process.env.S3_BUCKET_NAME,
	// 		Key: this.s3Key(),
	// 		Body: body,
	// 		ACL: this.s3Acl
	// 	}, function(err, data) {
	// 		if (err) {
	// 			console.error(err);
	// 		}
	// 		if (callback) {
	// 			callback(err, data);
	// 		}
	// 	});
	// }

};



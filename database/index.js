'use strict';

/*
.env variables

AWS_ACCESS_KEY = 
AWS_SECRET_ACCESS_KEY = 
S3_BACKUP_SCHEDULE = * 0 * * *
S3_BUCKET_NAME = 
*/

require('dotenv').config();

var path = require('path');

var exec = require('child_process').exec;

var moment = require('moment');

var fs = require('fs-extra');

var scheduler = require('node-schedule');

var aws = require('aws-sdk');

var _ = require('underscore');


/* CONFIG & INITIAL VARS */

fs.ensureFileSync(path.resolve(__dirname, '.env'));

var filepath = path.resolve(__dirname, 'rethinkdb.tar.gz');

var timestamp = moment().format();

var key = `database/rethinkdb_${timestamp}.tar.gz`;

aws.config.update({ 
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var s3 = new aws.S3();


/* HELPER FUNCTIONS */

var dump = function(callback) {
	exec(`rethinkdb dump --file ${filepath}`, function(err, stdout, stderr) {
		if (callback) { 
			callback(err, stdout, stderr);
		}
	});
};

var upload = function(callback) {
	var contents = fs.readFileSync(filepath, 'utf8');
	var body = new Buffer(contents, 'binary');
	s3.putObject({
		Bucket: process.env.S3_BUCKET_NAME,
		Key: key,
		Body: body,
		ACL: 'private'
	}, function(err, data) {
		if (callback) {
			callback(err, data);
		}
	});
};


/* START SCHEDULING & UPLOAD FIRST */

if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.S3_BUCKET_NAME) {
	console.error('app300-database: Missing AWS credentials and or S3 bucket name!');
}
else {
	dump(function() {
		upload();
	});

	scheduler.scheduleJob(process.env.S3_BACKUP_SCHEDULE || '* 0 * * *', function() {
		dump(function() {
			upload();
		});
	});
}

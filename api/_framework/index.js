'use strict';

var fs = require('fs-extra');

var path = require('path');

var moment = require('moment');

var _ = require('underscore');

var express = require('express');

var app = express();

var r = require('rethinkdb');

var uuidv5 = require('uuid/v5');

var bodyParser = require('body-parser');

var passport = require('passport');

var google = require('googleapis').google;

var LocalStrategy = require('passport-local').Strategy;

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


/* CONFIG & INITIAL VARS */

var envPath = path.resolve(__dirname, '..', '.env');

fs.ensureFileSync(envPath);

require('dotenv').config({ path: envPath });










/* EXPORTS */

app.framework = require(path.resolve(__dirname, 'package.json'));

app.info = require(path.resolve(__dirname, '..', 'package.json'));

app.db = {

	/*
	please refer to the rethinkdb documentation. for convenience, here 
	are a few easy links:

	@see https://rethinkdb.com/docs/cookbook/javascript/
	@see https://rethinkdb.com/api/javascript/

	it's good and okay to use these methods when quickly starting out.
	but for projects that will continue in time, highly recommend using
	the actual rethink methods and queries, directly in your data 
	modeling. 

	that will allow for the greatest maintainability and stability
	for your app, without "black-boxing" some essential data logic.
	*/

	connection: null,

	all: function(table, callback) {
		r.table(table)
		  .run(this.connection, function(err, cursor) {
			if (err) {
				console.error(err);
				callback(err, null);
				return;
			}
			cursor.toArray(function(err, result) {
				if (err) {
					console.error(err);
				}
				callback(err, result);
			});
		});
	},

	close: function() {
		this.connection.close();
	},

	connect: function(callback) {
		var that = this;
		r.connect({
			host: process.env.R_HOST || 'localhost',
			port: process.env.R_PORT || 28015,
			db: process.env.R_DATABASE || 'test'
		}, function(err, connection) {
			if (err) {
				console.error(err);
			}
			else {
				that.connection = connection;
			}
			if (callback) {
				callback(err, connection);
			}
		});
	},

	createTable: function(table, options, callback) {
		r.tableCreate(table, options || {})
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	deleteByPrimaryKey: function(table, pk, callback) {
		r.table(table)
		  .get(pk)
		  .delete()
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	deleteWhere: function(table, condition, callback) {
		r.table(table)
		  .filter(condition)
		  .delete()
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	dropTable: function(table, callback) {
		r.tableDrop(table)
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	filter: function(table, condition, callback) {
		r.table(table)
		  .filter(condition)
		  .run(this.connection, function(err, cursor) {
			if (err) {
				console.error(err);
				callback(err, null);
				return;
			}
			cursor.toArray(function(err, result) {
				if (err) {
					console.error(err);
				}
				callback(err, result);
			});
		});
	},

	getByPrimaryKey: function(table, pk, callback) {
		r.table(table)
		  .get(pk)
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			callback(err, result);
		});
	},

	insert: function(table, documents, callback, uniqueness) {

		/*
		standardizing documents to be an array for easier 
		pre query transformations. 
		*/

		if (_.isObject(documents)) {
			documents = [documents];
		}

		/*
		according to rethinkdb's documentation, this hashes documents
		per their uuid v5 specifications, with their namespace
		91461c99-f89d-49d2-af96-d8e2e14e9b58
		
		@see https://www.rethinkdb.com/api/javascript/uuid/

		WARNING: careful with the uniquness here with updates 
		and maintaining uniquness. the easyCrud scripts do not 
		enforce uniqueness past the insertion point. 

		so for example, if on update the entire document exactly 
		matches another record, the changed document's id will not
		be updated to reflect that change, thereby potentially 
		having exactly matching documents, but with varying 
		primary keys. 

		either accept this or not, but the amount of logic to
		help enforce this, in a clean and less obtrusive way
		was enough to delegate it to the application's logic.
		*/

		if (uniqueness === true) {
			documents = _.map(documents, function(doc) {
				doc.id = uuidv5(
					JSON.stringify(_.omit(doc, 'id')), 
					'91461c99-f89d-49d2-af96-d8e2e14e9b58'
				);
				return doc;
			});	
		}

		r.table(table)
		  .insert(documents, { returnChanges: true })
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	run: function(r, callback) {
		r.run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
				callback(err, result);
			}
			else {
				if (result.toArray) {
					result.toArray(function(err, result) {
						if (err) {
							console.error(err);
						}
						callback(err, result);
					});
				}
				else {
					callback(err, result);
				}
			}
		});
	},

	updateAll: function(table, values, callback) {
		r.table(table)
		  .update(values)
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	},

	updateByPrimaryKey: function(table, pk, values, callback) {
		r.table(table)
		  .get(pk)
		  .update(values, { returnChanges: true })
		  .run(this.connection, function(err, result) {
		  	if (err) {
		  		console.error(err);
		  	}
		  	if (callback) {
		  		callback(err, result);
		  	}
		  });
	},

	updateWhere: function(table, condition, values, callback) {
		r.table(table)
		  .filter(condition)
		  .update(values, { returnChanges: true })
		  .run(this.connection, function(err, result) {
			if (err) {
				console.error(err);
			}
			if (callback) {
				callback(err, result);
			}
		});
	}

};

app.auth = {

	google: {
		availableScopes: [
			'https://www.googleapis.com/auth/xapi.zoo',
			'https://www.googleapis.com/auth/adexchange.buyer',
			'https://www.googleapis.com/auth/adexchange.buyer',
			'https://www.googleapis.com/auth/adexchange.seller',
			'https://www.googleapis.com/auth/adexchange.seller.readonly',
			'https://www.googleapis.com/auth/xapi.zoo',
			'https://www.googleapis.com/auth/admin.datatransfer',
			'https://www.googleapis.com/auth/admin.datatransfer.readonly',
			'https://www.googleapis.com/auth/admin.directory.customer',
			'https://www.googleapis.com/auth/admin.directory.customer.readonly',
			'https://www.googleapis.com/auth/admin.directory.device.chromeos',
			'https://www.googleapis.com/auth/admin.directory.device.chromeos.readonly',
			'https://www.googleapis.com/auth/admin.directory.device.mobile',
			'https://www.googleapis.com/auth/admin.directory.device.mobile.action',
			'https://www.googleapis.com/auth/admin.directory.device.mobile.readonly',
			'https://www.googleapis.com/auth/admin.directory.domain',
			'https://www.googleapis.com/auth/admin.directory.domain.readonly',
			'https://www.googleapis.com/auth/admin.directory.group',
			'https://www.googleapis.com/auth/admin.directory.group.member',
			'https://www.googleapis.com/auth/admin.directory.group.member.readonly',
			'https://www.googleapis.com/auth/admin.directory.group.readonly',
			'https://www.googleapis.com/auth/admin.directory.notifications',
			'https://www.googleapis.com/auth/admin.directory.orgunit',
			'https://www.googleapis.com/auth/admin.directory.orgunit.readonly',
			'https://www.googleapis.com/auth/admin.directory.resource.calendar',
			'https://www.googleapis.com/auth/admin.directory.resource.calendar.readonly',
			'https://www.googleapis.com/auth/admin.directory.rolemanagement',
			'https://www.googleapis.com/auth/admin.directory.rolemanagement.readonly',
			'https://www.googleapis.com/auth/admin.directory.user',
			'https://www.googleapis.com/auth/admin.directory.user.alias',
			'https://www.googleapis.com/auth/admin.directory.user.alias.readonly',
			'https://www.googleapis.com/auth/admin.directory.user.readonly',
			'https://www.googleapis.com/auth/admin.directory.user.security',
			'https://www.googleapis.com/auth/admin.directory.userschema',
			'https://www.googleapis.com/auth/admin.directory.userschema.readonly',
			'https://www.googleapis.com/auth/admin.reports.audit.readonly',
			'https://www.googleapis.com/auth/admin.reports.usage.readonly',
			'https://www.googleapis.com/auth/adsense',
			'https://www.googleapis.com/auth/adsense.readonly',
			'https://www.googleapis.com/auth/adsensehost',
			'https://www.googleapis.com/auth/analytics',
			'https://www.googleapis.com/auth/analytics.edit',
			'https://www.googleapis.com/auth/analytics.manage.users',
			'https://www.googleapis.com/auth/analytics.manage.users.readonly',
			'https://www.googleapis.com/auth/analytics.provision',
			'https://www.googleapis.com/auth/analytics.readonly',
			'https://www.googleapis.com/auth/analytics.user.deletion',
			'https://www.googleapis.com/auth/analytics',
			'https://www.googleapis.com/auth/analytics.readonly',
			'https://www.googleapis.com/auth/androidenterprise',
			'https://www.googleapis.com/auth/androidmanagement',
			'https://www.googleapis.com/auth/androidpublisher',
			'https://www.googleapis.com/auth/appengine.admin',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/activity',
			'https://www.googleapis.com/auth/appstate',
			'https://www.googleapis.com/auth/bigquery',
			'https://www.googleapis.com/auth/bigquery.insertdata',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/devstorage.full_control',
			'https://www.googleapis.com/auth/devstorage.read_only',
			'https://www.googleapis.com/auth/devstorage.read_write',
			'https://www.googleapis.com/auth/bigquery',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/blogger',
			'https://www.googleapis.com/auth/blogger.readonly',
			'https://www.googleapis.com/auth/books',
			'https://www.googleapis.com/auth/calendar',
			'https://www.googleapis.com/auth/calendar.readonly',
			'https://www.googleapis.com/auth/classroom.announcements',
			'https://www.googleapis.com/auth/classroom.announcements.readonly',
			'https://www.googleapis.com/auth/classroom.courses',
			'https://www.googleapis.com/auth/classroom.courses.readonly',
			'https://www.googleapis.com/auth/classroom.coursework.me',
			'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
			'https://www.googleapis.com/auth/classroom.coursework.students',
			'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
			'https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly',
			'https://www.googleapis.com/auth/classroom.guardianlinks.students',
			'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',
			'https://www.googleapis.com/auth/classroom.profile.emails',
			'https://www.googleapis.com/auth/classroom.profile.photos',
			'https://www.googleapis.com/auth/classroom.push-notifications',
			'https://www.googleapis.com/auth/classroom.rosters',
			'https://www.googleapis.com/auth/classroom.rosters.readonly',
			'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
			'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud_debugger',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloudiot',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/monitoring',
			'https://www.googleapis.com/auth/monitoring.write',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/trace.append',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/compute',
			'https://www.googleapis.com/auth/compute.readonly',
			'https://www.googleapis.com/auth/devstorage.full_control',
			'https://www.googleapis.com/auth/devstorage.read_only',
			'https://www.googleapis.com/auth/devstorage.read_write',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/content',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/compute',
			'https://www.googleapis.com/auth/compute.readonly',
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/datastore',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/ndev.cloudman',
			'https://www.googleapis.com/auth/ndev.cloudman.readonly',
			'https://www.googleapis.com/auth/ddmconversions',
			'https://www.googleapis.com/auth/dfareporting',
			'https://www.googleapis.com/auth/dfatrafficking',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/ndev.clouddns.readonly',
			'https://www.googleapis.com/auth/ndev.clouddns.readwrite',
			'https://www.googleapis.com/auth/doubleclickbidmanager',
			'https://www.googleapis.com/auth/doubleclicksearch',
			'https://www.googleapis.com/auth/drive',
			'https://www.googleapis.com/auth/drive.appdata',
			'https://www.googleapis.com/auth/drive.file',
			'https://www.googleapis.com/auth/drive.metadata',
			'https://www.googleapis.com/auth/drive.metadata.readonly',
			'https://www.googleapis.com/auth/drive.photos.readonly',
			'https://www.googleapis.com/auth/drive.readonly',
			'https://www.googleapis.com/auth/drive.scripts',
			'https://www.googleapis.com/auth/firebase',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/firebase',
			'https://www.googleapis.com/auth/firebase.readonly',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/datastore',
			'https://www.googleapis.com/auth/fitness.activity.read',
			'https://www.googleapis.com/auth/fitness.activity.write',
			'https://www.googleapis.com/auth/fitness.blood_glucose.read',
			'https://www.googleapis.com/auth/fitness.blood_glucose.write',
			'https://www.googleapis.com/auth/fitness.blood_pressure.read',
			'https://www.googleapis.com/auth/fitness.blood_pressure.write',
			'https://www.googleapis.com/auth/fitness.body.read',
			'https://www.googleapis.com/auth/fitness.body.write',
			'https://www.googleapis.com/auth/fitness.body_temperature.read',
			'https://www.googleapis.com/auth/fitness.body_temperature.write',
			'https://www.googleapis.com/auth/fitness.location.read',
			'https://www.googleapis.com/auth/fitness.location.write',
			'https://www.googleapis.com/auth/fitness.nutrition.read',
			'https://www.googleapis.com/auth/fitness.nutrition.write',
			'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
			'https://www.googleapis.com/auth/fitness.oxygen_saturation.write',
			'https://www.googleapis.com/auth/fitness.reproductive_health.read',
			'https://www.googleapis.com/auth/fitness.reproductive_health.write',
			'https://www.googleapis.com/auth/fusiontables',
			'https://www.googleapis.com/auth/fusiontables.readonly',
			'https://www.googleapis.com/auth/drive.appdata',
			'https://www.googleapis.com/auth/games',
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/androidpublisher',
			'https://www.googleapis.com/auth/games',
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/bigquery',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/devstorage.read_write',
			'https://www.googleapis.com/auth/genomics',
			'https://www.googleapis.com/auth/genomics.readonly',
			'https://www.googleapis.com/auth/gmail.compose',
			'https://www.googleapis.com/auth/gmail.insert',
			'https://www.googleapis.com/auth/gmail.labels',
			'https://www.googleapis.com/auth/gmail.metadata',
			'https://www.googleapis.com/auth/gmail.modify',
			'https://www.googleapis.com/auth/gmail.readonly',
			'https://www.googleapis.com/auth/gmail.send',
			'https://www.googleapis.com/auth/gmail.settings.basic',
			'https://www.googleapis.com/auth/gmail.settings.sharing',
			'https://www.googleapis.com/auth/apps.groups.migration',
			'https://www.googleapis.com/auth/apps.groups.settings',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/firebase',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/jobs',
			'https://www.googleapis.com/auth/cloud-language',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/apps.licensing',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/logging.admin',
			'https://www.googleapis.com/auth/logging.read',
			'https://www.googleapis.com/auth/logging.write',
			'https://www.googleapis.com/auth/manufacturercenter',
			'https://www.googleapis.com/auth/glass.location',
			'https://www.googleapis.com/auth/glass.timeline',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/monitoring',
			'https://www.googleapis.com/auth/monitoring.read',
			'https://www.googleapis.com/auth/monitoring.write',
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/plus.me',
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/compute',
			'https://www.googleapis.com/auth/contacts',
			'https://www.googleapis.com/auth/contacts.readonly',
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/user.addresses.read',
			'https://www.googleapis.com/auth/user.birthday.read',
			'https://www.googleapis.com/auth/user.emails.read',
			'https://www.googleapis.com/auth/user.phonenumbers.read',
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/androidpublisher',
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/plus.me',
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/plus.circles.read',
			'https://www.googleapis.com/auth/plus.circles.write',
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/plus.me',
			'https://www.googleapis.com/auth/plus.media.upload',
			'https://www.googleapis.com/auth/plus.profiles.read',
			'https://www.googleapis.com/auth/plus.stream.read',
			'https://www.googleapis.com/auth/plus.stream.write',
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userlocation.beacon.registry',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/pubsub',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/ndev.cloudman',
			'https://www.googleapis.com/auth/ndev.cloudman.readonly',
			'https://www.googleapis.com/auth/replicapool',
			'https://www.googleapis.com/auth/replicapool.readonly',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/replicapool',
			'https://www.googleapis.com/auth/replicapool.readonly',
			'https://www.googleapis.com/auth/apps.order',
			'https://www.googleapis.com/auth/apps.order.readonly',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloudruntimeconfig',
			'https://www.googleapis.com/auth/admin.directory.group',
			'https://www.googleapis.com/auth/admin.directory.user',
			'https://www.googleapis.com/auth/documents',
			'https://www.googleapis.com/auth/drive',
			'https://www.googleapis.com/auth/forms',
			'https://www.googleapis.com/auth/forms.currentonly',
			'https://www.googleapis.com/auth/groups',
			'https://www.googleapis.com/auth/spreadsheets',
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/servicecontrol',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/service.management',
			'https://www.googleapis.com/auth/service.management.readonly',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/service.management',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/service.management',
			'https://www.googleapis.com/auth/drive',
			'https://www.googleapis.com/auth/drive.file',
			'https://www.googleapis.com/auth/drive.readonly',
			'https://www.googleapis.com/auth/spreadsheets',
			'https://www.googleapis.com/auth/spreadsheets.readonly',
			'https://www.googleapis.com/auth/siteverification',
			'https://www.googleapis.com/auth/siteverification.verify_only',
			'https://www.googleapis.com/auth/drive',
			'https://www.googleapis.com/auth/drive.file',
			'https://www.googleapis.com/auth/drive.readonly',
			'https://www.googleapis.com/auth/presentations',
			'https://www.googleapis.com/auth/presentations.readonly',
			'https://www.googleapis.com/auth/spreadsheets',
			'https://www.googleapis.com/auth/spreadsheets.readonly',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/source.full_control',
			'https://www.googleapis.com/auth/source.read_only',
			'https://www.googleapis.com/auth/source.read_write',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/spanner.admin',
			'https://www.googleapis.com/auth/spanner.data',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/sqlservice.admin',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/devstorage.full_control',
			'https://www.googleapis.com/auth/devstorage.read_only',
			'https://www.googleapis.com/auth/devstorage.read_write',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/streetviewpublish',
			'https://www.googleapis.com/auth/tagmanager.delete.containers',
			'https://www.googleapis.com/auth/tagmanager.edit.containers',
			'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
			'https://www.googleapis.com/auth/tagmanager.manage.accounts',
			'https://www.googleapis.com/auth/tagmanager.manage.users',
			'https://www.googleapis.com/auth/tagmanager.publish',
			'https://www.googleapis.com/auth/tagmanager.readonly',
			'https://www.googleapis.com/auth/tasks',
			'https://www.googleapis.com/auth/tasks.readonly',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform.read-only',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-translation',
			'https://www.googleapis.com/auth/urlshortener',
			'https://www.googleapis.com/auth/ediscovery',
			'https://www.googleapis.com/auth/ediscovery.readonly',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/cloud-vision',
			'https://www.googleapis.com/auth/webmasters',
			'https://www.googleapis.com/auth/webmasters.readonly',
			'https://www.googleapis.com/auth/cloud-platform',
			'https://www.googleapis.com/auth/youtube',
			'https://www.googleapis.com/auth/youtube.force-ssl',
			'https://www.googleapis.com/auth/youtube.readonly',
			'https://www.googleapis.com/auth/youtube.upload',
			'https://www.googleapis.com/auth/youtubepartner',
			'https://www.googleapis.com/auth/youtubepartner-channel-audit',
			'https://www.googleapis.com/auth/youtube',
			'https://www.googleapis.com/auth/youtube.readonly',
			'https://www.googleapis.com/auth/youtubepartner',
			'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
			'https://www.googleapis.com/auth/yt-analytics.readonly',
			'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
			'https://www.googleapis.com/auth/yt-analytics.readonly'
		],
		scopes: [
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/userinfo.email',
		]
	},

	config: function(userTable, useGoogle) {
		app.use(passport.initialize());
		app.use(passport.session());
		this.configDeserializeUser(userTable);
		this.configSerializeUser(userTable);
		if (useGoogle) {
			this.configGoogleStrategy(userTable);
		}
	},

	configDeserializeUser: function(userTable) {
		passport.deserializeUser(function(id, done) {
			app.db.getByPrimaryKey(userTable, id, done);
		});
	},

	configGoogleStrategy: function(userTable) {
		passport.use(new GoogleStrategy({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
			passReqToCallback: true
		}, function(req, access_token, refresh_token, profile, done) {

			var dbCallback = function(err, result) {
				if (err) {
					return done(err);
				}
				req.login(req.user, function(err) {
					return done(err || null, err ? null : req.user);
				});
			};
		
			//no pre-existing account to associate, so creating new user...
			if (!req.user) {
				req.user = _.omit(profile, 'id', '_raw', '_json', 'name', 'emails', 'photos');
				req.user.family_name = profile.name.familyName;
				req.user.given_name = profile.name.givenName;
				req.user.google_id = profile.id;
				req.user.google = profile._json;
				req.user.google_token = access_token;
				req.user.google_refresh_token = refresh_token;
				req.user.id = req.user.email = profile.emails[0].value;
				req.user.photo = profile.photos[0].value;
				app.db.create(userTable, req.user, dbCallback);
			}

			//need to associate accounts, so let's update our user...
			else {
				var values = {};
				values.google_id = profile.id;
				values.google = profile._json;
				values.google_token = access_token;
				values.google_refresh_token = refresh_token;
				app.db.updateByPrimaryKey(userTable, req.user.id, values, dbCallback);
			}
		}));
	},

	configSerializeUser: function(userTable) {
		passport.serializeUser(function(user, done) {
			done(null, user.id);
		});
	},

	isAuthenticated: function(req) {
		return req.isAuthenticated();
	}

};

app.easy = {

	crud: function(table, options) {
		var options = _.extend({ 
			uniqueness: false
		}, options || {});

		var crud = express.Router();
		crud.route(`/${table}`)
			.post(function(req, res, next) {
				app.db.insert(table, req.body, function(err, result) {
					var data = null;
					var status = err ? 500 : (result.errors > 0 ? 400 : 200);
					res.status(status).send({ err, result, data });
				}, options.uniqueness === true ? true : false);
			})
			.get(function(req, res, next) {
				app.db.all(table, function(err, data) {
					var result = null;
					var status = err ? 500 : (data ? 200 : 404);
					res.status(status).send({ err, result, data });
				});
			});
		crud.route(`/${table}/:id`)
			.get(function(req, res, next) {
				app.db.getByPrimaryKey(table, req.params.id, function(err, data) {
					var result = null;
					var status = err ? 500 : (data ? 200 : 404);
					res.status(status).send({ err, result, data });
				});
			})
			.put(function(req, res, next) {
				app.db.updateByPrimaryKey(table, req.params.id, req.body, function(err, result) {
					var data = null;
					res.status(err ? 500 : 200).send({ err, result, data });
				});
			})
			.delete(function(req, res, next) {
				app.db.deleteByPrimaryKey(table, req.params.id, function(err, result) {
					var data = null;
					res.status(err ? 500 : 200).send({ err, result, data });
				});
			});
		app.use('/', crud);
		return crud;
	},

	auth: function(userTable, expressRouter) {

		var check = function(req, res, next) {
			try {
				var bearer = req.get('Authorization').split('Bearer ')[1];
				req.accessToken = bearer.split(':')[0] || '';
				req.secretToken = bearer.split(':')[1] || '';
			}
			catch (err) {
				return res.status(401).send({ message: 'Authorization failed, potentially missing credentials or expired / invalid credentials!' });
			}

			app.db.filter(userTable, {
				access_token: req.accessToken,
				secret_token: req.secretToken
			}, function(err, result) {
				console.log({ err, result })
				if (err || result.length === 0) {
					return res.status(422).send({ message: 'Authorization failed, credentials seem invalid!' })
				}
				req.user = _.omit(result[0], 'access_token', 'secret_token');
				next();
			});

		};

		/*
		if expressRouter is passed, attach credentials onto that router
		instead of the app itself.
		*/

		if (expressRouter) {
			expressRouter.use(check);
		}
		else {
			app.use(check);
		}

		return check;
	},

	config: function() {
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: false }));
		return app;
	},

	google: function(userTable, request, callback, detach, successRedirect, failureRedirect) {
		
		//first page that redirects user to google login...
		app.get(request, passport.authenticate('google', {
			scope: app.auth.google.scopes
		}));

		//upon user google login, callback to application...
		app.get(callback, passport.authenticate('google', {
			successRedirect,
			failureRedirect
		});

		/*
		endpoint disconnecting google account from application...
		user doesn't have to actually visit the page, can be done via ajax or 
		serverside, unlike the above two endpoints.
		*/

		app.get(detach, function(req, res, next) {
			return req.isAuthenticated() ? next() : res.status(401).send({ message: 'Sorry, you\'re not logged in!' });
		}, function(req, res, next) {
			
			//if no google accounts linked...
			if (!req.user.google_id) {
				return res.status(200).send({ message: 'No google accounts linked...' });
			}

			app.db.updateByPrimaryKey(userTable, req.user.id, { 
				google: null,
				google_id: null
			}, function(err, result) {
				if (err) {
					return res.status(500).send({ message: 'Something went wrong when detaching your Google account.' });
				}
				return res.status(200).send({ message: 'Successfully detached your Google account!' });
			});
		});
	}

};

app.run = function(callback) {
	app.listen(process.env.EXPRESS_PORT || 3000, function() {
		if (callback) {
			callback();
		}
	});
	return app;
};

module.exports = { app, express, bodyParser, r };

#! /usr/bin/env node

var admin = require('./index.js');

var chalk = require('chalk');

var inquirer = require('inquirer');

var _ = require('underscore');

var prompt = function(objects) {

	console.log(
		  `\n` + chalk.gray(`| `) + chalk.yellow.bold(admin.info.name)
		+ `\n` + chalk.gray(`| `) + chalk.yellow.bold(`s3-database-restore`)
		+ `\n` + chalk.gray(`| `) + chalk.gray(`Version ${admin.info.version}`)
		+ `\n` + chalk.gray(`| `)
		+ `\n` + chalk.gray(`| `) + chalk.white(`crafted by hq (2018)`)
		+ `\n` + chalk.gray(`| `) + chalk.gray(`twitter.com/_hq, github.com/haseebnqureshi`)
		+ `\n` + chalk.gray(`| `) + chalk.gray(`made in knoxville, tennessee`)
		+ `\n` + chalk.gray(`| `)
		+ `\n` + chalk.gray(`| `) + `Already fetched most (if not all) your S3 stored backups.`
		+ `\n` + chalk.gray(`| `) + chalk.gray(`Scroll through, select which backup you wish to restore, and your rethinkdb database will be restored immediately.`)
		+ `\n`
	);

	var questions = [
		{
			type: 'list',
			name: 'key',
			message: `Which S3 database backup would you like to restore? (${objects.length} found, recent -> oldest)`,
			choices: _.map(objects.reverse(), function(obj) {
				return obj.Key;
			})
		}
	];

	inquirer.prompt(questions).then(function(answers) {

		console.log(
			  `\n` + chalk.gray(`| `)
			+ `\n` + chalk.gray(`| `) + chalk.yellow.bold(`First...`)
			+ `\n` + chalk.gray(`| `) + chalk.gray.bold(`Backing up your current database...`)
			+ `\n` + chalk.gray(`| `)
		);

		admin.initialDump(function() {

			console.log(
				  `\n` + chalk.gray(`| `)
				+ `\n` + chalk.gray(`| `) + chalk.yellow.bold(`Now...`)
				+ `\n` + chalk.gray(`| `) + chalk.gray.bold(`Downloading your database snapshot from S3...`)
				+ `\n` + chalk.gray(`| `)
			);

			admin.download(answers.key, function() {

				console.log(
					  `\n` + chalk.gray(`| `)
					+ `\n` + chalk.gray(`| `) + chalk.yellow.bold(`Okay...`)
					+ `\n` + chalk.gray(`| `) + chalk.gray.bold(`Working on restoring your database to ${answers.key}...`)
					+ `\n` + chalk.gray(`| `)
				);

				admin.restore(function() {

					console.log(
						  `\n` + chalk.gray(`| `)
						+ `\n` + chalk.gray(`| `) + chalk.green.bold(`Success! Restored your database to ${answers.key}!`)
						+ `\n` + chalk.gray(`| `)
						+ `\n`
					);

				});

			});

		});

	});

};

admin.scan(function(err, data) {
	if (err) {
		console.error(err);
		return;
	}
	prompt(data.Contents);
});


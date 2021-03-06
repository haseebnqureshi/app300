#! /usr/bin/env node

var fs = require('fs-extra');

var path = require('path');

var chalk = require('chalk');

var inquirer = require('inquirer');

var _ = require('underscore');

var execSync = require('child_process').execSync;

var projectDir = process.cwd();

var packageDir = path.resolve(__dirname, '..');

var info = require(path.resolve(packageDir, 'package.json'));

var ensureKeyDirectories = function() {
	fs.ensureDirSync(path.resolve(projectDir, 'database/_framework'));
	fs.ensureDirSync(path.resolve(projectDir, 'api/_framework'));
	fs.ensureDirSync(path.resolve(projectDir, 'app/_framework'));
	fs.ensureDirSync(path.resolve(projectDir, '_framework'));
};

var copyFrameworkFiles = function() {
	fs.copySync(path.resolve(packageDir, 'database/_framework'), path.resolve(projectDir, 'database/_framework'));
	fs.copySync(path.resolve(packageDir, 'api/_framework'), path.resolve(projectDir, 'api/_framework'));
	fs.copySync(path.resolve(packageDir, 'app/_framework'), path.resolve(projectDir, 'app/_framework'));
	fs.copySync(path.resolve(packageDir, '_framework'), path.resolve(projectDir, '_framework'));
};

var copyVagrantFiles = function() {
	fs.copySync(path.resolve(packageDir, 'Vagrantfile'), path.resolve(projectDir, 'Vagrantfile'));
	fs.copySync(path.resolve(__dirname, 'gitignore'), path.resolve(projectDir, '.gitignore'));
};

var copyStartingFiles = function() {
	fs.copySync(path.resolve(packageDir, 'database/.env.example'), path.resolve(projectDir, 'database/.env.example'));
	fs.copySync(path.resolve(packageDir, 'api/.env.example'), path.resolve(projectDir, 'api/.env.example'));
	fs.copySync(path.resolve(packageDir, 'api/index.js'), path.resolve(projectDir, 'api/index.js'));
	fs.copySync(path.resolve(packageDir, 'api/package.json'), path.resolve(projectDir, 'api/package.json'));
	fs.copySync(path.resolve(packageDir, 'api/tables.js'), path.resolve(projectDir, 'api/tables.js'));
	fs.copySync(path.resolve(packageDir, 'app/.env.example'), path.resolve(projectDir, 'app/.env.example'));
	fs.copySync(path.resolve(packageDir, 'app/index.js'), path.resolve(projectDir, 'app/index.js'));
	fs.copySync(path.resolve(packageDir, 'app/package.json'), path.resolve(projectDir, 'app/package.json'));
};

var copyAppStartingDirectories = function() {
	fs.ensureDirSync(path.resolve(projectDir, 'app/www'));
	fs.ensureDirSync(path.resolve(projectDir, 'app/views'));
	fs.copySync(path.resolve(packageDir, 'app/www'), path.resolve(projectDir, 'app/www'));
	fs.copySync(path.resolve(packageDir, 'app/views'), path.resolve(projectDir, 'app/views'));
};

var installingPackages = function() {
	execSync(`npm install ./database/_framework --loglevel=silent`);
	execSync(`npm install ./api/_framework --loglevel=silent`);
	execSync(`npm install ./api --loglevel=silent`);
	execSync(`npm install ./app/_framework --loglevel=silent`);
	execSync(`npm install ./app --loglevel=silent`);
	execSync(`npm install ./_framework --loglevel=silent`);
};

var prompt = function() {

	console.log(
		  `\n` + chalk.gray(`| `) + chalk.yellow.bold(info.name)
		+ `\n` + chalk.gray(`| `) + chalk.gray(`Version ${info.version}`)
		+ `\n` + chalk.gray(`| `)
		+ `\n` + chalk.gray(`| `) + chalk.white(`crafted by hq (2018)`)
		+ `\n` + chalk.gray(`| `) + chalk.gray(`twitter.com/_hq, github.com/haseebnqureshi`)
		+ `\n` + chalk.gray(`| `) + chalk.gray(`made in knoxville, tennessee`)
		+ `\n` + chalk.gray(`| `)
		+ `\n` + chalk.gray(`| `) + `Quickly scaffold to create (or update) your app300 application.`
		+ `\n` + chalk.gray(`| `) + chalk.gray(`Go through the prompts; it'll be quick.`)
		+ `\n` + chalk.gray(`| `)
		+ `\n` + chalk.gray(`| `) + chalk.green(`Project directory recognized as ${projectDir}`)
		+ `\n` + chalk.gray(`| `)
		+ `\n`
	);

	var questions = [
		{
			type: 'confirm',
			name: 'frameworkFiles',
			message: chalk.white(`\nAre you sure you want to copy all updated app300 framework files into your project? \nAny customizations that you might have done (at your own peril) in the _framework \ndirectories will be lost.\n`)
		},
		{
			type: 'confirm',
			name: 'vagrantFiles',
			message: chalk.white(`\nDo you want us to copy the default app300 Vagrantfile, along with our gitignore file?\n`)
		},
		{
			type: 'confirm',
			name: 'startingFiles',
			message: chalk.white(`\nAre you sure you want to copy all starting app300 framework files into your project? \nFor instance, any .env.example, index.js, package.json or files otherwise will be \ncompletely overwritten and lost forever. (Only do so if you've got everything \ncommitted and versioned.\n`)
		},
		{
			type: 'confirm',
			name: 'startingAppStartingDirectories',
			message: chalk.white(`\nAre you sure you want to copy all starting app300 directories into your project? \n(We're talking about app/www and app/views directories, where your static files \nand pug templates live.\n`)
		}
	];

	inquirer.prompt(questions).then(function(answers) {

		if (answers.frameworkFiles === true) {

			console.log(
				  `\n` + chalk.gray(`| `)
				+ `\n` + chalk.gray(`| `) + chalk.gray.bold(`Copying all framework files from app300 into your project...`)
				+ `\n` + chalk.gray(`| `)
			);

			ensureKeyDirectories();
			copyFrameworkFiles();

		}

		if (answers.vagrantFiles === true) {

			console.log(
				  `\n` + chalk.gray(`| `)
				+ `\n` + chalk.gray(`| `) + chalk.gray.bold(`Copying our app300 Vagrantfile and .gitignore into your project...`)
				+ `\n` + chalk.gray(`| `)
			);

			copyVagrantFiles();

		}

		if (answers.startingFiles === true) {

			console.log(
				  `\n` + chalk.gray(`| `)
				+ `\n` + chalk.gray(`| `) + chalk.gray.bold(`Copying all starting files from app300 into your project...`)
				+ `\n` + chalk.gray(`| `)
			);

			copyStartingFiles();

		}

		if (answers.startingAppStartingDirectories === true) {

			console.log(
				  `\n` + chalk.gray(`| `)
				+ `\n` + chalk.gray(`| `) + chalk.gray.bold(`Copying all starting application directories from app300 into your project...`)
				+ `\n` + chalk.gray(`| `)
			);

			copyAppStartingDirectories();

		}

		console.log(
			  `\n` + chalk.gray(`| `)
			+ `\n` + chalk.gray(`| `) + chalk.gray.bold(`NPM installing each package in the project...`)
			+ `\n` + chalk.gray(`| `) + chalk.gray.bold(`That way, we're not missing any dependency...`)
			+ `\n` + chalk.gray(`| `)
		);

		try {
			installingPackages();
		}
		catch(err) {
			console.error(err);
		}

		console.log(
			  `\n` + chalk.gray(`| `)
			+ `\n` + chalk.gray(`| `) + chalk.green.bold(`Success! Finished scaffolding your app300 project!`)
			+ `\n` + chalk.gray(`| `) + chalk.green.bold(`Make sure to run `) + chalk.yellow.bold(`vagrant up`) + chalk.green.bold(` to quickly get up and running!`)
			+ `\n` + chalk.gray(`| `)
			+ `\n`
		);

	});

};

prompt();

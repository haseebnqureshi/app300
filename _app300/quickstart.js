'use strict';

var inquirer = require('inquirer');

var prompt = inquirer.createPromptModule();

var questions = [
	{
		type: "confirm",
		name: "confirming",
		message: "About to install our database. Continue?"
	}
];

prompt(questions).then(function(answers) {
	console.log(answers);
});

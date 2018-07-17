'use strict';

var framework = require('./_framework');

var i = 0;
setInterval(function() {
	console.log('app', i);
	i++
}, 10 * 1000);

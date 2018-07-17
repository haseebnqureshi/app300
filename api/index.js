'use strict';

var framework = require('./_framework');

var i = 0;
setInterval(function() {
	console.log('api', i);
	i++
}, 10 * 1000);

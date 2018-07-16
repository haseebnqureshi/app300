'use strict'

var i = 0;
setInterval(function() {
	console.log(`another log ${i}`);
	i++;
}, 10 * 1000);

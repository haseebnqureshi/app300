'use strict';

var framework = require('./_framework');

var app = framework.app;

framework.config();

app.get('/', function(req, res) {
	res.status(200).send({
		info: {
			app: app.info,
			framework: framework.info
		}
	});
});

framework.db.connect(function(err) {

	app.use('/users', framework.crud.router('users', { uniqueness: true }));

	app.use('/items', framework.crud.router('items', { uniqueness: true }));

	app.use(framework.oauth2.router({
		provider: 'google',
		client_id: process.env.GOOGLE_CLIENT_ID,
		client_secret: process.env.GOOGLE_CLIENT_SECRET,
		redirect_uri: process.env.GOOGLE_REDIRECT_URI,
		scopes: [
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/userinfo.profile',
		]
	}));

	app.get('/bearer-auth', framework.auth.bearerToken('users', 'tokens'), function(req, res) {
		res.status(200).send({ 
			user: req.user
		});
	});

});

module.exports = framework.run(app);

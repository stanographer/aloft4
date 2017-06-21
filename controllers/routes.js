'use strict';

module.exports = function(app, passport) {
	app.get('/', function (req, res) {
		if (req.user) {
			res.redirect('/dashboard');
		} else {
			res.render('login');
		}
	});

	app.get('/editor', function (req, res) {
		var user = req.query.user;
		var event = req.query.event;
		res.render('editor', {
			user: user,
			event: event
		});
	});

	app.get('/login', function (req, res) {
		res.render('login', {
			message: req.flash('loginMessage')
		});
	});

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('login');
	});

	app.get('/signup', function (req, res) {
		res.render('signup', {
			token: req.params.token,
			message: req.flash('signupMessage')
		});
	});

	app.get('/dashboard', isLoggedIn, function (req, res) {
		res.render('dashboard');
	});

	app.get('/:user/:event', function (req, res) {
		var prefs = {
			fontSize: '35',
			fontFace: 'Inconsolata',
			lineHeight: '130'
		}
		res.render('watch', {
			user: req.params.user,
			event: req.params.event,
			prefs: prefs,
			marker: '≈'
		});
	});

	app.post('/signup', passport.authenticate('signup', {
		successRedirect: '/dashboard',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	function isLoggedIn(req, res, next) {
			if(req.isAuthenticated()) {
				return next();
	  		}
	  		return res.redirect('/login');
		}
}
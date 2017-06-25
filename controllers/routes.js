'use strict';
const async = require('async')
	, crypto = require('crypto')
	, nodemailer = require('nodemailer')
	, mailerConfig = require('../config/mailer.js')
	, User = require('../models/user');

module.exports = function(app, passport) {
	app.get('/', function (req, res) {
		if (req.user) {
			res.redirect('/dashboard');
		} else {
			res.render('login');
		}
	});

	app.get('/admin-only', isLoggedIn, function (req, res) {
		res.render('admin-only', {
			user: req.user.local
		});
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
			token: req.query.token,
			message: req.flash('signupMessage')
		});
	});

	app.get('/dashboard', isLoggedIn, function (req, res) {
		res.render('dashboard', {
			user: req.user.local
		});
	});

	app.get('/invite-user', isLoggedIn, function (req, res) {
		if (req.user.local.role === 'admin') {
			res.render('invite-user');
		} else {
			res.redirect('admin-only');
		}
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

	app.post('/invite-member', function (req, res) {
		async.waterfall([function (done) {
			crypto.randomBytes(20, function (err, buf) {
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function (token, done) {
			var user = new User({
				username: 'newinvite',
				firstname: 'newfirstname',
				lastname: 'newlastname',
				email: req.body.newmemberemail,
				inviteToken: token,
				trialPeriod: req.body.trialperiod,
				role: req.body.role,
				token: token
			});
			user.save (function (err) {
				done(err, token, user);
			});
		},
		function (token, user, done) {
			var transport = nodemailer.createTransport(mailerConfig);
			var mailOptions = {
				to: req.body.newmemberemail,
				from: 'Aloft Support',
				subject: 'Your Aloft Invite Token',
				text: 'Hi there! \n\n' +
				'You\'ve been invited to sign up for Aloft, the super awesome text delivery/captioning system for realtime stenographers! Below you will find the sign-up token use to create your account. Click the link provided to start the registration process. If the link is not clickable, paste the address into your browser or go to aloft.nu/signup and paste the code into the field labeled "token."\n\n' +
				'Your sign-up token: ' + token + '\n' +
				'Your registration link: aloft.nu/signup?token=' + token + '.\n\n' +
				'Please note that your code is only valid for 72 hours (three days). If you do not create your account within that time, you will have to request another token.\n' +
				'Thank you and enjoy using Aloft!\n\n\n' +
				'-Aloft Support'
			};
			transport.sendMail(mailOptions, function (err) {
				req.flash('info', 'A sign-up token has been sent to ' + req.body.newmemberemail + '!');
				done(err, 'done');
			});
		}], function (err) {
			if (err) {
				// req.flash('error', 'The email could not be sent. Please try again.');

				// res.redirect('/');
				return console.log(err);
			} else {
				req.flash('message', 'An email with the link to this event has been sent successfully to ' + req.body.newmemberemail + '.');
				res.redirect('/dashboard');
			}
		});
	});

	app.post('/login', passport.authenticate('login', {
		successRedirect : '/dashboard',
		failureRedirect : '/login',
		failureFlash : true
	}));


	app.post('/signup', passport.authenticate('signup', {
		successRedirect: '/dashboard',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	function isLoggedIn(req, res, next) {
			if(req.isAuthenticated()) {
				return next();
	  		}
	  		req.flash('loginMessage', 'You must be logged in to do that!');
	  		return res.redirect(307, '/login');
		}
}
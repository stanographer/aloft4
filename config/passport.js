var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function (passport) {

	// Required methods for Passport.
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	passport.use('signup', new LocalStrategy({
			// by default, local strategy uses username and password, we will override with email
			usernameField: 'username',
			passwordField: 'password',
			firstnameField: 'firstname',
        	lastnameField: 'lastname',
        	emailField: 'email',
			passReqToCallback: true // allows us to pass back the entire request to the callback
		},
		function (req, username, password, done) {
			let email = req.body.email.trim().toLowerCase();
			let firstname = req.body.firstname;
			let lastname = req.body.lastname;
			// asynchronous
			// User.findOne wont fire unless data is sent back
			process.nextTick(function () {

				// find a user whose email is the same as the forms email
				// we are checking to see if the user trying to login already exists
				User.findOne({
					'local.email': email
				}, function (err, user) {
					// if there are any errors, return the error
					if (err)
						return done(err);

					// check to see if theres already a user with that email
					if (user) {
						return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
					} else {

						// if there is no user with that email
						// create the user
						var newUser = new User();

						// set the user's local credentials
						newUser.local.username = username;
						newUser.local.firstname = firstname;
						newUser.local.lastname = lastname;
						newUser.local.email = email;
						newUser.local.password = newUser.generateHash(password);

						// save the user
						newUser.save(function (err) {
							if (err)
								throw err;
							return done(null, newUser);
						});
					}

				});
			});
		}));

passport.use('login', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},

	function (req, username, password, done) {
		User.findOne({
			'local.username': username.trim().toLowerCase()
		}, function (err, user) {
			if (err)
				return done(err);

			if (!user)
				return done(null, false, req.flash('loginMessage', 'No user found.'));

			if (!user.validPassword(password))
				return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

			return done(null, user);
		});
	}));
}
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function (passport) {

	// Required methods for Passport.
	passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

	passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

passport.use('signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        firstnameField: 'firstname',
        lastnameField: 'lastname',
        emailField: 'email',
        passReqToCallback : true
    },

    function (req, username, password, done) {
    	var email = req.body.email.trim().toLowerCase()
			, firstname = req.body.firstname
			, lastname = req.body.lastname
			, token = req.body.token;

		process.nextTick(function () {
			User.findOne({'inviteToken': token}, function (err, user) {
				if (err) {
					res.flash('signupMessage', 'There was an error retrieving that sign-up token.');
					res.redirect('/signup');
				} else {
					if (user) {
						var foundToken = user;
						User.findOne({'local.email': email.trim().toLowerCase()}, function (err, user) {
							if (err)
								return done(err);
							if (!user) {
								User.findOne({'local.username': username.trim().toLowerCase()}, function (err, user) {
									if (err)
										return done(err);
									if (user) {
										return done(null, false, req.flash('signupMessage', 'Sorry. That username is already taken.'));
									} else {
										foundToken.update({$set: {
												'local.username': username.trim().toLowerCase(),
												'local.password': foundToken.generateHash(password),
												'local.firstname': firstname.trim(),
												'local.lastname': lastname.trim(),
												'local.email': email.trim().toLowerCase(),
												'inviteToken': ''
											}
										}, {upsert: true}, function (err, updatedUser) {
											if (err) {
												throw err;
											} else {
												console.log('Success!! Updated.');
												return updatedUser;
											}
										});

										foundToken.save(function(err) {
											if (err)
												throw err;
											return done(null, foundToken);
										});
									}
								});
							} else {
								return done(null, false, req.flash('signupMessage', 'Sorry. That email address already has an account.'));
							}
						});    
					} else {
						return done(null, false, req.flash('signupMessage', 'Sorry. That sign-up token is invalid.'));
					}
				}
			});
		});
	}));

	passport.use('login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
	},

    function(req, username, password, done) {
        User.findOne({'local.username':  username.trim().toLowerCase()}, function (err, user) {
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